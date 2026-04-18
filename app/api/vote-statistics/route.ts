import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database-clean';

export async function GET(request: NextRequest) {
  try {
    // Get vote statistics for charts
    const statistics = await query(`
      SELECT 
        c.category,
        COUNT(v.id) as vote_count,
        COUNT(DISTINCT v.voterid) as unique_voters,
        c.name as category_name
      FROM candidates c
      LEFT JOIN votes v ON c.id = v.candidateid
      WHERE c.status = 'approved'
      GROUP BY c.category, c.name
      ORDER BY c.category
    `);

    // Get top candidates per category
    const topCandidates = await query(`
      SELECT DISTINCT ON (c.category)
        c.id,
        c.name,
        c.category,
        c.image,
        COALESCE(v.vote_count, 0) as votes,
        c.category
      FROM candidates c
      LEFT JOIN (
        SELECT candidateid, COUNT(*) as vote_count
        FROM votes
        GROUP BY candidateid
      ) v ON c.id = v.candidateid
      WHERE c.status = 'approved'
      ORDER BY c.category, v.vote_count DESC
    `);

    // Get voting trends by hour (last 24 hours)
    const votingTrends = await query(`
      SELECT 
        DATE_TRUNC('hour', "timestamp") as hour,
        COUNT(*) as votes_per_hour
      FROM votes
      WHERE "timestamp" >= NOW() - INTERVAL '24 hours'
      GROUP BY DATE_TRUNC('hour', "timestamp")
      ORDER BY hour
    `);

    // Get total voting statistics
    const totalStats = await query(`
      SELECT 
        COUNT(DISTINCT v.id) as total_votes,
        COUNT(DISTINCT v.voterid) as unique_voters,
        COUNT(DISTINCT c.id) as total_candidates,
        COUNT(DISTINCT c.category) as categories
      FROM votes v
      FULL OUTER JOIN candidates c ON v.candidateid = c.id
      WHERE c.status = 'approved' OR c.status IS NULL
    `);

    return NextResponse.json({
      success: true,
      data: {
        statistics: statistics.rows,
        topCandidates: topCandidates.rows,
        votingTrends: votingTrends.rows,
        totalStats: totalStats.rows[0] || {
          total_votes: 0,
          unique_voters: 0,
          total_candidates: 0,
          categories: 0
        }
      }
    });

  } catch (error) {
    console.error('Error fetching vote statistics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
