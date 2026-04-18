import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database-clean';

export async function GET(request: NextRequest) {
  try {
    // Get voting session data (public info only)
    const sessionResult = await query(`
      SELECT id, isactive, starttime, endtime, totalvotes 
      FROM voting_session 
      WHERE id = 'main_session'
    `);

    // Get detailed vote statistics
    const [candidatesResult, votesResult, votersResult] = await Promise.all([
      query('SELECT COUNT(*) as total FROM candidates WHERE status = $1', ['approved']),
      query('SELECT COUNT(*) as total FROM votes'),
      query('SELECT COUNT(DISTINCT voterId) as total FROM votes WHERE verified = $1', [true])
    ]);

    // Get category-wise votes
    const kumaraVotesResult = await query(`
      SELECT COUNT(*) as count FROM votes WHERE category = $1 AND verified = $2
    `, ['kumara', true]);

    const kumariVotesResult = await query(`
      SELECT COUNT(*) as count FROM votes WHERE category = $1 AND verified = $2
    `, ['kumari', true]);

    const sigithiKumaraVotesResult = await query(`
      SELECT COUNT(*) as count FROM votes WHERE category = $1 AND verified = $2
    `, ['sigithi-kumara', true]);

    const sigithiKumariyaVotesResult = await query(`
      SELECT COUNT(*) as count FROM votes WHERE category = $1 AND verified = $2
    `, ['sigithi-kumariya', true]);

    // Get top candidates from votes table (accurate)
    const topKumaraVotesResult = await query(`
      SELECT c.id, c.name, c.image, COUNT(v.id) as voteCount, c.category
      FROM candidates c
      LEFT JOIN votes v ON c.id = v.candidateId AND v.verified = $1
      WHERE c.status = $2 AND c.category = $3
      GROUP BY c.id, c.name, c.image, c.category
      ORDER BY voteCount DESC
    `, [true, 'approved', 'kumara']);

    const topKumariVotesResult = await query(`
      SELECT c.id, c.name, c.image, COUNT(v.id) as voteCount, c.category
      FROM candidates c
      LEFT JOIN votes v ON c.id = v.candidateId AND v.verified = $1
      WHERE c.status = $2 AND c.category = $3
      GROUP BY c.id, c.name, c.image, c.category
      ORDER BY voteCount DESC
    `, [true, 'approved', 'kumari']);

    const topSigithiKumaraVotesResult = await query(`
      SELECT c.id, c.name, c.image, COUNT(v.id) as voteCount, c.category
      FROM candidates c
      LEFT JOIN votes v ON c.id = v.candidateId AND v.verified = $1
      WHERE c.status = $2 AND c.category = $3
      GROUP BY c.id, c.name, c.image, c.category
      ORDER BY voteCount DESC
    `, [true, 'approved', 'sigithi-kumara']);

    const topSigithiKumariyaVotesResult = await query(`
      SELECT c.id, c.name, c.image, COUNT(v.id) as voteCount, c.category
      FROM candidates c
      LEFT JOIN votes v ON c.id = v.candidateId AND v.verified = $1
      WHERE c.status = $2 AND c.category = $3
      GROUP BY c.id, c.name, c.image, c.category
      ORDER BY voteCount DESC
    `, [true, 'approved', 'sigithi-kumariya']);

    // Get votes by hour for chart (last 24 hours)
    const votesByHourResult = await query(`
      SELECT EXTRACT(HOUR FROM timestamp) as hour, COUNT(*) as count
      FROM votes 
      WHERE timestamp >= NOW() - INTERVAL '24 hours' AND verified = $1
      GROUP BY EXTRACT(HOUR FROM timestamp)
      ORDER BY hour
    `, [true]);

    const session = sessionResult.rows[0];
    const candidates = parseInt(candidatesResult.rows[0].total);
    const votes = parseInt(votesResult.rows[0].total);
    const voters = parseInt(votersResult.rows[0].total);
    const kumaraVotes = parseInt(kumaraVotesResult.rows[0].count);
    const kumariVotes = parseInt(kumariVotesResult.rows[0].count);
    const sigithiKumaraVotes = parseInt(sigithiKumaraVotesResult.rows[0].count);
    const sigithiKumariyaVotes = parseInt(sigithiKumariyaVotesResult.rows[0].count);

    // Initialize votes by hour with all hours set to 0
    const votesByHour: { [hour: string]: number } = {};
    for (let i = 0; i < 24; i++) {
      votesByHour[i.toString().padStart(2, '0')] = 0;
    }
    
    // Fill with actual data
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
          totalVotes: session?.totalvotes || 0
        },
        statistics: {
          totalCandidates: candidates,
          totalVotes: votes,
          totalVoters: voters,
          kumaraVotes,
          kumariVotes,
          sigithiKumaraVotes,
          sigithiKumariyaVotes
        },
        topCandidates: {
          kumara: topKumaraVotesResult.rows,
          kumari: topKumariVotesResult.rows,
          sigithiKumara: topSigithiKumaraVotesResult.rows,
          sigithiKumariya: topSigithiKumariyaVotesResult.rows
        },
        votesByHour
      }
    });

  } catch (error) {
    console.error('Error fetching public voting statistics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch voting statistics' },
      { status: 500 }
    );
  }
}
