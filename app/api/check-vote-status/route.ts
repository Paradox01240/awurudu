import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database-clean';
import { getVoterIP } from '@/lib/security';

export async function GET(request: NextRequest) {
  try {
    // Get IP address
    const ipAddress = getVoterIP(request);

    if (ipAddress === 'unknown') {
      return NextResponse.json({
        success: false,
        error: 'Unable to determine IP address',
        canVote: false
      }, { status: 400 });
    }

    // Check if IP has already voted
    const existingVote = await query(
      'SELECT COUNT(*) as voteCount, category, timestamp FROM votes WHERE ipAddress = $1 ORDER BY timestamp DESC LIMIT 1',
      [ipAddress]
    );

    const hasVoted = (existingVote.rowCount !== null && existingVote.rowCount > 0) && parseInt(existingVote.rows[0]?.votecount || '0') > 0;

    const response = {
      success: true,
      canVote: !hasVoted,
      ipAddress: ipAddress,
      hasVoted: hasVoted,
      voteInfo: hasVoted ? {
        category: existingVote.rows[0]?.category,
        timestamp: existingVote.rows[0]?.timestamp
      } : null
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error checking vote status:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to check vote status',
      canVote: false
    }, { status: 500 });
  }
}
