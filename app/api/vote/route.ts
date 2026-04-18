import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { query } from '@/lib/database-clean';

/**
 * VOTING SYSTEM ARCHITECTURE
 * 
 * This voting system implements a secure, multi-category voting platform with the following design principles:
 * 
 * SECURITY FEATURES:
 * - IP-based voting limits (1 vote per category per device)
 * - Total vote limits (max 4 votes per device across all categories)
 * - Identity verification through NIC/Phone/Email tracking
 * - Duplicate prevention across multiple voting methods
 * - Comprehensive security logging for audit trails
 * 
 * VOTING CATEGORIES:
 * - kumara: Main Awurudu Prince competition (14-29 years)
 * - kumari: Main Awurudu Princess competition (14-29 years) 
 * - sigithi-kumara: Children's Prince competition (5-10 years)
 * - sigithi-kumariya: Children's Princess competition (5-10 years)
 * 
 * WORKFLOW DESIGN:
 * 1. Session-based voting with start/end time controls
 * 2. Transaction-based database operations for data integrity
 * 3. Progressive validation with user-friendly error messages
 * 4. Real-time vote counting and statistics
 * 
 * FAIRNESS MEASURES:
 * - Each device can vote once per category
 * - Existing voter identity reused for additional categories
 * - Automatic vote counting and public statistics
 * - Time-based voting windows
 */

// Security logging
async function logSecurityEvent(eventType: string, details: any, request: NextRequest) {
  const userAgent = request.headers.get('user-agent') || 'Unknown';
  const timestamp = new Date().toISOString();
  
  await query(`
    INSERT INTO security_logs (eventType, details, ipAddress, userAgent, timestamp)
    VALUES ($1, $2, $3, $4, $5)
  `, [eventType, JSON.stringify(details), getClientIP(request) || 'Unknown', userAgent, timestamp]);
}

// Get client IP address
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const real = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (real) {
    return real.trim();
  }
  
  return getClientIP(request) || 'unknown';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { candidateId, category, voterInfo } = body;

    // INPUT VALIDATION LAYER
    // ====================
    // First layer: Basic field validation
    if (!candidateId || !category || !voterInfo) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Second layer: Category validation against allowed competition types
    const validCategories = ['kumara', 'kumari', 'sigithi-kumara', 'sigithi-kumariya'];
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { success: false, error: 'Invalid category' },
        { status: 400 }
      );
    }

    // Get client IP for security tracking
    const ipAddress = getClientIP(request);
    
    // VOTING SESSION VALIDATION
    // ====================
    // Check if voting session exists and is within valid time window
    // This ensures voting only happens during designated festival period
    const votingSession = await query('SELECT * FROM voting_session WHERE id = $1', ['main_session']);
    if (votingSession.rowCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Voting session not found' },
        { status: 404 }
      );
    }

    const session = votingSession.rows[0];
    const now = new Date();
    const startTime = new Date(session.startTime);
    const endTime = new Date(session.endTime);

    // TIME-BASED ACCESS CONTROL
    // ====================
    // Prevent voting before festival starts or after it ends
    // This creates urgency and ensures fair participation window
    if (now < startTime) {
      return NextResponse.json(
        { success: false, error: 'Voting has not started yet' },
        { status: 403 }
      );
    }

    if (now > endTime) {
      return NextResponse.json(
        { success: false, error: 'Voting has ended' },
        { status: 403 }
      );
    }

    // INPUT VALIDATION LAYER
    // ====================
    // Import validation functions
    const { validateVoterInfo, validateSriLankanNIC, validateSriLankanPhone, validateEmail } = require('@/lib/validation');
    
    // Validate all voter information before processing
    const validation = validateVoterInfo(voterInfo);
    
    if (!validation.isValid) {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        details: validation.errors,
        field: 'voterInfo'
      }, { status: 400 });
    }

    // INPUT SANITIZATION LAYER
    // ====================
    // Remove potentially harmful characters and normalize input data
    // This prevents XSS attacks and ensures data consistency
    const sanitizedNIC = voterInfo.nic.trim().replace(/[^a-zA-Z0-9VX]/g, '');
    const sanitizedPhone = voterInfo.phone.trim().replace(/[^0-9+]/g, '');
    const sanitizedEmail = voterInfo.email.trim().toLowerCase();

    // DEVICE-BASED VOTING LIMITS
    // ====================
    // First security layer: Check if IP address has already voted in this specific category
    // This prevents multiple votes from same device for same competition
    const existingIPVote = await query(
      'SELECT * FROM votes WHERE ipAddress = $1 AND category = $2',
      [ipAddress, category]
    );

    if (existingIPVote.rowCount && existingIPVote.rowCount > 0) {
      logSecurityEvent('DUPLICATE_IP_CATEGORY_VOTE_ATTEMPT', { 
        ip: ipAddress, 
        category,
        existingVotes: existingIPVote.rowCount 
      }, request);
      
      const getCategoryName = (cat: string) => {
        switch(cat) {
          case 'kumara': return 'Awurudu Kumara';
          case 'kumari': return 'Awurudu Kumari';
          case 'sigithi-kumara': return 'Sigithi Awurudu Kumara';
          case 'sigithi-kumariya': return 'Sigithi Awurudu Kumariya';
          default: return cat;
        }
      };
      
      return NextResponse.json(
        { success: false, error: `This device has already voted for ${getCategoryName(category)}. Each device can only vote once per category.` },
        { status: 403 }
      );
    }

    // SYSTEM-WIDE VOTING LIMITS
    // ====================
    // Check total votes per IP (should not exceed 4 - one per category)
    // This implements the "one person, one vote per category" fairness principle
    const totalIPVotes = await query(
      'SELECT COUNT(*) as total_votes FROM votes WHERE ipAddress = $1',
      [ipAddress]
    );

    const totalVotesCount = parseInt(totalIPVotes.rows[0]?.total_votes || '0');
    if (totalVotesCount >= 4) {
      logSecurityEvent('IP_VOTE_LIMIT_EXCEEDED', { 
        ip: ipAddress, 
        totalVotes: totalVotesCount 
      }, request);
      return NextResponse.json(
        { success: false, error: 'This device has already voted for All categories. Voting limit reached.' },
        { status: 403 }
      );
    }

    // IDENTITY VERIFICATION & VOTING HISTORY
    // ====================================
    // Check if voter identity exists and has voting history
    // This allows existing voters to vote in additional categories without re-registering
    // Build query conditions dynamically based on provided optional fields
    let queryConditions = ['phone = $1'];
    let queryParams = [sanitizedPhone];
    
    // Only include NIC in search if it's provided
    if (sanitizedNIC) {
      queryConditions.push('nic = $2');
      queryParams.push(sanitizedNIC);
    }
    
    // Only include email in search if it's provided
    if (sanitizedEmail) {
      queryConditions.push('email = $' + (queryParams.length + 1));
      queryParams.push(sanitizedEmail);
    }
    
    const existingVoter = await query(
      `SELECT * FROM voters WHERE ${queryConditions.join(' OR ')}`,
      queryParams
    );

    if (existingVoter.rowCount && existingVoter.rowCount > 0) {
      const voter = existingVoter.rows[0];
      
      // CATEGORY-SPECIFIC DUPLICATE PREVENTION
      // Check if this voter has already voted in this specific category
      const existingVote = await query(
        'SELECT * FROM votes WHERE voterId = $1 AND category = $2',
        [voter.id, category]
      );

      if (existingVote.rowCount && existingVote.rowCount > 0) {
        logSecurityEvent('DUPLICATE_CATEGORY_VOTE_ATTEMPT', { 
          voterId: voter.id, 
          category, 
          ip: ipAddress,
          nic: sanitizedNIC,
          phone: sanitizedPhone
        }, request);
        
        const getCategoryName = (cat: string) => {
          switch(cat) {
            case 'kumara': return 'Awurudu Kumara';
            case 'kumari': return 'Awurudu Kumari';
            case 'sigithi-kumara': return 'Sigithi Awurudu Kumara';
            case 'sigithi-kumariya': return 'Sigithi Awurudu Kumariya';
            default: return cat;
          }
        };
        
        return NextResponse.json(
          { success: false, error: `You have already voted for ${getCategoryName(category)} using your identity details. Each person can vote once per category.` },
          { status: 409 }
        );
      }

      // Use same voter record for additional category votes
      const voteId = `vote_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Start transaction for data integrity
      await query('BEGIN');
      
      try {
        // Create vote record using existing voter ID
        await query(`
          INSERT INTO votes (id, voterId, candidateId, category, timestamp, ipAddress, verified)
            VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, $5, TRUE)
        `, [voteId, voter.id, candidateId, category, ipAddress]);
        
        // Update candidate vote count
        await query(`
          UPDATE candidates 
          SET voteCount = voteCount + 1 
          WHERE id = $1
        `, [candidateId]);
        
        // Update voting session
        await query(`
          UPDATE voting_session 
          SET totalVotes = totalVotes + 1 
          WHERE id = 'main_session'
        `);
        
        await query('COMMIT');
        
      } catch (error) {
        await query('ROLLBACK');
        throw error;
      }

      logSecurityEvent('ADDITIONAL_CATEGORY_VOTE_CAST', { 
        voterId: voter.id, 
        candidateId, 
        category, 
        ip: ipAddress 
      }, request);

      return NextResponse.json({
        success: true,
        message: 'Additional category vote cast successfully',
        data: { voteId, voterId: voter.id, isAdditionalVote: true }
      });
    }

    // First category vote - create new voter record
    const voterId = `voter_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const voteId = `vote_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Start transaction for data integrity
    await query('BEGIN');
    
    try {
      // Create voter record
      await query(`
        INSERT INTO voters (id, name, phone, email, nic, hasVoted, votedFor, votedCategory, voteTimestamp, ipAddress, userAgent, createdAt)
          VALUES ($1, $2, $3, $4, $5, TRUE, $6, $7, CURRENT_TIMESTAMP, $8, $9, CURRENT_TIMESTAMP)
      `, [voterId, voterInfo.name, voterInfo.phone, voterInfo.email, voterInfo.nic, candidateId, category, ipAddress, request.headers.get('user-agent') || 'Unknown']);
      
      // Create vote record
      await query(`
        INSERT INTO votes (id, voterId, candidateId, category, timestamp, ipAddress, verified)
          VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, $5, TRUE)
      `, [voteId, voterId, candidateId, category, ipAddress]);
      
      // Update candidate vote count
      await query(`
        UPDATE candidates 
        SET voteCount = voteCount + 1 
        WHERE id = $1
      `, [candidateId]);
      
      // Update voting session
      await query(`
        UPDATE voting_session 
        SET totalVotes = totalVotes + 1 
        WHERE id = 'main_session'
      `);
      
      await query('COMMIT');
      
    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }

    logSecurityEvent('FIRST_CATEGORY_VOTE_CAST', { 
      voterId, 
      candidateId, 
      category, 
      ip: ipAddress 
    }, request);

    return NextResponse.json({
      success: true,
      message: 'Vote cast successfully',
      data: { voteId, voterId, isFirstVote: true }
    });

  } catch (error) {
    console.error('Voting error:', error);
    logSecurityEvent('VOTING_ERROR', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, request);
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get voting statistics
    const stats = await query(`
      SELECT 
        category,
        COUNT(*) as totalVotes,
        COUNT(DISTINCT voterId) as uniqueVoters
      FROM votes 
      WHERE verified = TRUE
      GROUP BY category
      ORDER BY category
    `);

    // Get top candidates per category
    const topCandidates = await query(`
      SELECT 
        c.category,
        c.name,
        c.voteCount,
        c.image
      FROM candidates c
      WHERE c.category IN ('kumara', 'kumari', 'sigithi-kumara', 'sigithi-kumariya')
      ORDER BY c.category, c.voteCount DESC
    `);

    // Group candidates by category
    const candidatesByCategory: { [key: string]: any[] } = {
      kumara: [],
      kumari: [],
      'sigithi-kumara': [],
      'sigithi-kumariya': []
    };

    topCandidates.rows.forEach((candidate: any) => {
      if (candidatesByCategory[candidate.category]) {
        candidatesByCategory[candidate.category].push(candidate);
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        votingStats: stats.rows,
        candidatesByCategory,
        totalVoters: await query('SELECT COUNT(DISTINCT voterId) as count FROM votes WHERE verified = TRUE'),
        totalVotes: await query('SELECT COUNT(*) as count FROM votes WHERE verified = TRUE')
      }
    });

  } catch (error) {
    console.error('Error fetching voting statistics:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
