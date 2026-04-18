import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database-clean';
import { getVoterIP } from '@/lib/security';

export async function GET(request: NextRequest) {
  try {
    // Get IP address
    const ipAddress = getVoterIP(request);

    if (!ipAddress || ipAddress === 'unknown') {
      return NextResponse.json(
        { success: false, error: 'Unable to determine IP address' },
        { status: 400 }
      );
    }

    // Check voting status for this IP address
    const ipVotes = await query(
      'SELECT category, timestamp FROM votes WHERE ipAddress = $1 ORDER BY timestamp',
      [ipAddress]
    );

    const votingStatus = {
      kumaraVoted: false,
      kumariVoted: false,
      sigithiKumaraVoted: false,
      sigithiKumariyaVoted: false,
      totalVotes: ipVotes.rowCount || 0,
      votes: [] as Array<{ category: string; timestamp: string }>
    };

    if (ipVotes.rows && ipVotes.rows.length > 0) {
      votingStatus.votes = ipVotes.rows.map(vote => ({
        category: vote.category,
        timestamp: vote.timestamp
      }));

      // Check each category
      votingStatus.kumaraVoted = ipVotes.rows.some(vote => vote.category === 'kumara');
      votingStatus.kumariVoted = ipVotes.rows.some(vote => vote.category === 'kumari');
      votingStatus.sigithiKumaraVoted = ipVotes.rows.some(vote => vote.category === 'sigithi-kumara');
      votingStatus.sigithiKumariyaVoted = ipVotes.rows.some(vote => vote.category === 'sigithi-kumariya');
    }

    return NextResponse.json({
      success: true,
      ipAddress: ipAddress,
      ...votingStatus
    });

  } catch (error) {
    console.error('Error checking voting status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check voting status' },
      { status: 500 }
    );
  }
}
