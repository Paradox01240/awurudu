import { NextRequest, NextResponse } from 'next/server';
import { cleanTestData, hasTestData, getDatabaseStats } from '@/lib/clean-test-data';

export async function GET(request: NextRequest) {
  try {
    const stats = await getDatabaseStats();
    const testDataInfo = await hasTestData();

    return NextResponse.json({
      success: true,
      data: {
        stats,
        hasTestData: testDataInfo.hasData,
        message: testDataInfo.hasData ? 'Database contains test data' : 'Database is clean'
      }
    });
  } catch (error) {
    console.error('Error getting cleanup info:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get cleanup info' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Check if there's test data before cleaning
    const testDataInfo = await hasTestData();
    
    if (!testDataInfo.hasData) {
      return NextResponse.json({
        success: true,
        message: 'No test data to clean',
        data: {
          cleaned: false,
          reason: 'Database is already clean'
        }
      });
    }

    // Clean the test data
    await cleanTestData();

    // Get final stats
    const finalStats = await getDatabaseStats();

    return NextResponse.json({
      success: true,
      message: 'Test data cleaned successfully',
      data: {
        cleaned: true,
        beforeCleanup: {
          candidates: testDataInfo.candidateCount,
          voters: testDataInfo.voterCount,
          votes: testDataInfo.voteCount
        },
        afterCleanup: finalStats
      }
    });
  } catch (error) {
    console.error('Error cleaning test data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to clean test data' },
      { status: 500 }
    );
  }
}
