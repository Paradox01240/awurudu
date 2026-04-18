import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database-clean';
import { verifyAdminAuth } from '@/lib/security';

// GET: Get current vote visibility status
export async function GET(request: NextRequest) {
  try {
    // For development/testing, allow access with a simple query parameter
    const url = new URL(request.url);
    const devToken = url.searchParams.get('dev_token');
    
    // Allow access in development or with dev token
    const isDevMode = process.env.NODE_ENV === 'development' || devToken === 'awurudu_admin_2024';
    
    if (!isDevMode && !verifyAdminAuth(request)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized access' },
        { status: 401 }
      );
    }

    // Get vote visibility settings from database
    const result = await query(`
      SELECT * FROM vote_visibility_settings 
      WHERE id = 'main_settings'
    `);

    if (result.rows.length === 0) {
      // Create default settings if none exist
      await query(`
        INSERT INTO vote_visibility_settings (id, showvotecharts, showvotenumbers, lastupdated)
        VALUES ('main_settings', true, false, NOW())
      `);
      
      return NextResponse.json({
        success: true,
        data: {
          showvotecharts: true,
          showvotenumbers: false,
          lastupdated: new Date().toISOString()
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error getting vote visibility settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get settings' },
      { status: 500 }
    );
  }
}

// POST: Update vote visibility settings
export async function POST(request: NextRequest) {
  try {
    // For development/testing, allow access with a simple query parameter
    const url = new URL(request.url);
    const devToken = url.searchParams.get('dev_token');
    
    // Allow access in development or with dev token
    const isDevMode = process.env.NODE_ENV === 'development' || devToken === 'awurudu_admin_2024';
    
    if (!isDevMode && !verifyAdminAuth(request)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized access' },
        { status: 401 }
      );
    }

    const { showVoteCharts, showVoteNumbers } = await request.json();
    console.log('POST request received with settings:', { showVoteCharts, showVoteNumbers });

    // Update or insert settings
    const result = await query(`
      INSERT INTO vote_visibility_settings (id, showvotecharts, showvotenumbers, lastupdated, updatedby)
      VALUES ('main_settings', $1, $2, NOW(), 'admin')
      ON CONFLICT (id) 
      DO UPDATE SET 
        showvotecharts = $1,
        showvotenumbers = $2,
        lastupdated = NOW(),
        updatedby = 'admin'
      RETURNING *
    `, [showVoteCharts, showVoteNumbers]);

    console.log('Database update result:', result.rows);

    // Verify the update by immediately fetching
    const verifyResult = await query(`
      SELECT * FROM vote_visibility_settings WHERE id = 'main_settings'
    `);
    console.log('Verification query result:', verifyResult.rows);

    return NextResponse.json({
      success: true,
      message: 'Vote visibility settings updated successfully',
      data: verifyResult.rows[0] || {
        showvotecharts: showVoteCharts,
        showvotenumbers: showVoteNumbers,
        lastupdated: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error updating vote visibility settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
