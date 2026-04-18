import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database-clean';

export async function GET(request: NextRequest) {
  try {
    // Debug: Check if candidates have age data
    const candidateAgeCheck = await query(`
      SELECT id, name, age, category FROM candidates WHERE status = 'approved' LIMIT 5
    `);
    console.log('Candidate age check:', candidateAgeCheck.rows);

    // Get detailed voting data joining votes, voters, and candidates
    const votingData = await query(`
      SELECT 
        v.id as vote_id,
        v.timestamp as vote_timestamp,
        v.ipAddress,
        v.verified,
        vt.id as voter_id,
        vt.name as voter_name,
        vt.phone as voter_phone,
        vt.email as voter_email,
        vt.nic as voter_nic,
        c.id as candidate_id,
        c.name as candidate_name,
        c.category as candidate_category,
        c.age as candidate_age,
        c.image as candidate_image
      FROM votes v
      INNER JOIN voters vt ON v.voterId = vt.id
      INNER JOIN candidates c ON v.candidateId = c.id
      WHERE v.verified = TRUE
      ORDER BY v.timestamp DESC
    `);

    // Get summary statistics
    const summaryStats = await query(`
      SELECT 
        COUNT(*) as total_votes,
        COUNT(DISTINCT v.voterId) as unique_voters,
        COUNT(DISTINCT v.candidateId) as candidates_voted_for,
        COUNT(DISTINCT c.category) as categories_voted
      FROM votes v
      INNER JOIN candidates c ON v.candidateId = c.id
      WHERE v.verified = TRUE
    `);

    // Debug: Log the first few rows to check age data
    console.log('Voting data sample:', votingData.rows.slice(0, 3));
    console.log('Age field check:', votingData.rows.map(row => ({
      candidate_name: row.candidate_name,
      candidate_age: row.candidate_age,
      age_type: typeof row.candidate_age
    })));

    return NextResponse.json({
      success: true,
      data: {
        votingData: votingData.rows,
        summaryStats: summaryStats.rows[0] || {
          total_votes: 0,
          unique_voters: 0,
          candidates_voted_for: 0,
          categories_voted: 0
        }
      }
    });

  } catch (error) {
    console.error('Error fetching voting data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch voting data' },
      { status: 500 }
    );
  }
}
