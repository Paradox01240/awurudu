import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database-clean';
import { verifyAdminAuth } from '@/lib/security';

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    if (!verifyAdminAuth(request)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get voting session data
    const sessionResult = await query(`
      SELECT * FROM voting_session WHERE id = 'main_session'
    `);

    // Get detailed vote statistics
    const [candidatesResult, votesResult, votersResult] = await Promise.all([
      query('SELECT COUNT(*) as total FROM candidates WHERE status = $1', ['approved']),
      query('SELECT COUNT(*) as total FROM votes'),
      query('SELECT COUNT(*) as total FROM voters WHERE hasVoted = $1', [true])
    ]);

    // Get category-wise votes
    const kumaraVotesResult = await query(`
      SELECT COUNT(*) as count FROM votes WHERE category = $1
    `, ['kumara']);

    const kumariVotesResult = await query(`
      SELECT COUNT(*) as count FROM votes WHERE category = $1
    `, ['kumari']);

    // Get top candidates from candidates table (fast)
    const topKumaraResult = await query(`
      SELECT c.id, c.name, c.voteCount, c.category 
      FROM candidates c 
      WHERE c.status = $1 AND c.category = $2 
      ORDER BY c.voteCount DESC 
    `, ['approved', 'kumara']);

    const topKumariResult = await query(`
      SELECT c.id, c.name, c.voteCount, c.category 
      FROM candidates c 
      WHERE c.status = $1 AND c.category = $2 
      ORDER BY c.voteCount DESC 
    `, ['approved', 'kumari']);

    // Get top candidates from votes table (accurate)
    const topKumaraVotesResult = await query(`
      SELECT c.id, c.name, COUNT(v.id) as voteCount, c.category
      FROM candidates c
      LEFT JOIN votes v ON c.id = v.candidateId
      WHERE c.status = $1 AND c.category = $2
      GROUP BY c.id, c.name, c.category
      ORDER BY voteCount DESC
    `, ['approved', 'kumara']);

    const topKumariVotesResult = await query(`
      SELECT c.id, c.name, COUNT(v.id) as voteCount, c.category
      FROM candidates c
      LEFT JOIN votes v ON c.id = v.candidateId
      WHERE c.status = $1 AND c.category = $2
      GROUP BY c.id, c.name, c.category
      ORDER BY voteCount DESC
    `, ['approved', 'kumari']);

    // Get votes by hour for chart
    const votesByHourResult = await query(`
      SELECT EXTRACT(HOUR FROM timestamp) as hour, COUNT(*) as count
      FROM votes 
      WHERE timestamp >= CURRENT_DATE
      GROUP BY EXTRACT(HOUR FROM timestamp)
      ORDER BY hour
    `);

    const session = sessionResult.rows[0];
    const candidates = parseInt(candidatesResult.rows[0].total);
    const votes = parseInt(votesResult.rows[0].total);
    const voters = parseInt(votersResult.rows[0].total);
    const kumaraVotes = parseInt(kumaraVotesResult.rows[0].count);
    const kumariVotes = parseInt(kumariVotesResult.rows[0].count);

    const votesByHour: { [hour: string]: number } = {};
    votesByHourResult.rows.forEach((row: any) => {
      const hour = row.hour.toString().padStart(2, '0');
      votesByHour[hour] = row.count;
    });

    return NextResponse.json({
      success: true,
      data: {
        session: {
          id: session?.id,
          isActive: session?.isactive,
          startTime: session?.starttime,
          endTime: session?.endtime,
          totalVotes: session?.totalvotes || 0,
          maxVotesPerVoter: session?.maxvotespervoter
        },
        statistics: {
          totalCandidates: candidates,
          totalVotes: votes,
          totalVoters: voters,
          kumaraVotes,
          kumariVotes
        },
        topCandidates: {
          kumara: topKumaraResult.rows,
          kumari: topKumariResult.rows
        },
        topCandidatesFromVotes: {
          kumara: topKumaraVotesResult.rows,
          kumari: topKumariVotesResult.rows
        },
        votesByHour
      }
    });

  } catch (error) {
    console.error('Error fetching voting session:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch voting session data' },
      { status: 500 }
    );
  }
}
