import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database-clean';
import { verifyAdminAuthWithFallback } from '@/lib/security';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin authentication
    if (!verifyAdminAuthWithFallback(request)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Check if candidate exists
    const candidateResult = await query(
      'SELECT * FROM candidates WHERE id = $1',
      [id]
    );

    if (candidateResult.rowCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Candidate not found' },
        { status: 404 }
      );
    }

    // Update candidate status
    const result = await query(
      'UPDATE candidates SET status = $1 WHERE id = $2 RETURNING *',
      ['rejected', id]
    );

    return NextResponse.json({
      success: true,
      message: 'Candidate rejected successfully',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error rejecting candidate:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to reject candidate' },
      { status: 500 }
    );
  }
}
