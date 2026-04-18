import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database-clean';
import { validateVoterInfo, validateSriLankanNIC, validateSriLankanPhone, validateEmail } from '@/lib/validation';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { voterInfo } = body;

    // Validate voter information
    const validation = validateVoterInfo(voterInfo);
    
    if (!validation.isValid) {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        details: validation.errors,
        field: 'voterInfo'
      }, { status: 400 });
    }

    // Check if voter already exists with same phone (primary identifier)
    let queryConditions = ['phone = $1'];
    let queryParams = [voterInfo.phone];
    
    // Only include NIC in search if it's provided
    if (voterInfo.nic && voterInfo.nic.trim()) {
      queryConditions.push('nic = $2');
      queryParams.push(voterInfo.nic);
    }
    
    // Only include email in search if it's provided
    if (voterInfo.email && voterInfo.email.trim()) {
      queryConditions.push('email = $' + (queryParams.length + 1));
      queryParams.push(voterInfo.email);
    }
    
    const existingVoter = await query(
      `SELECT * FROM voters WHERE ${queryConditions.join(' OR ')}`,
      queryParams
    );

    if (existingVoter.rowCount && existingVoter.rowCount > 0) {
      return NextResponse.json({
        success: false,
        error: 'Voter already exists',
        details: 'A voter with this phone number has already registered',
        field: 'voterInfo'
      }, { status: 409 });
    }

    // Check if voter has already voted in this category
    let voteQueryConditions = ['phone = $1'];
    let voteQueryParams = [voterInfo.phone];
    
    // Only include NIC in search if it's provided
    if (voterInfo.nic && voterInfo.nic.trim()) {
      voteQueryConditions.push('nic = $2');
      voteQueryParams.push(voterInfo.nic);
    }
    
    // Only include email in search if it's provided
    if (voterInfo.email && voterInfo.email.trim()) {
      voteQueryConditions.push('email = $' + (voteQueryParams.length + 1));
      voteQueryParams.push(voterInfo.email);
    }
    
    const existingVote = await query(
      `SELECT v.*, c.category FROM votes v INNER JOIN candidates c ON v.candidateId = c.id WHERE v.voterId IN (SELECT id FROM voters WHERE ${voteQueryConditions.join(' OR ')})`,
      voteQueryParams
    );

    const votedCategories = existingVote.rows.map(vote => vote.category);
    
    return NextResponse.json({
      success: true,
      message: 'Voter validation successful',
      data: {
        isValid: true,
        hasVoted: votedCategories.length > 0,
        votedCategories: [...new Set(votedCategories)]
      }
    });

  } catch (error) {
    console.error('Voter validation error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error during validation',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const search = new URL(request.url).searchParams.get('search');
    
    if (!search) {
      return NextResponse.json({
        success: false,
        error: 'Search parameter is required'
      }, { status: 400 });
    }

    // Search for voters by NIC, email, or phone
    const searchResults = await query(`
      SELECT id, name, nic, email, phone, hasVoted, votedCategory, voteTimestamp, createdAt
      FROM voters 
      WHERE nic ILIKE $1 OR email ILIKE $2 OR phone ILIKE $3
      ORDER BY createdAt DESC
      LIMIT 10
    `, [`%${search}%`, `%${search}%`, `%${search}%`]);

    return NextResponse.json({
      success: true,
      data: searchResults.rows,
      count: searchResults.rowCount
    });

  } catch (error) {
    console.error('Voter search error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to search voters' },
      { status: 500 }
    );
  }
}
