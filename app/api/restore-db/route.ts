import { NextRequest, NextResponse } from 'next/server';
import { Client } from 'pg';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication (you should implement proper auth)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.ADMIN_SECRET || 'admin-secret-key'}`) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const client = new Client({
      connectionString: process.env.POSTGRES_URL
    });

    await client.connect();
    console.log('🔄 Starting database restoration...');

    // Read the backup file
    const sqlContent = fs.readFileSync(
      path.join(process.cwd(), 'backup_plain.sql'), 
      'utf8'
    );
    console.log('📄 Read backup file successfully');

    // Split by semicolons and execute each statement
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--') && !stmt.startsWith('SET'));

    console.log(`📝 Found ${statements.length} SQL statements to execute`);

    let successCount = 0;
    let errorCount = 0;

    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await client.query(statement);
          successCount++;
          if (successCount % 10 === 0) {
            console.log(`✅ Processed ${successCount} statements...`);
          }
        } catch (error: any) {
          errorCount++;
          console.log(`⚠️  Error in statement: ${statement.substring(0, 100)}...`);
          console.log(`   Error: ${error.message}`);
          // Continue with next statement
        }
      }
    }

    await client.end();

    console.log(`\n🎉 Database restoration completed!`);
    console.log(`✅ Successful statements: ${successCount}`);
    console.log(`⚠️  Failed statements: ${errorCount}`);

    return NextResponse.json({
      success: true,
      message: 'Database restoration completed',
      stats: {
        totalStatements: statements.length,
        successful: successCount,
        failed: errorCount
      }
    });

  } catch (error: any) {
    console.error('❌ Database restoration failed:', error);
    return NextResponse.json(
      { success: false, error: 'Database restoration failed' },
      { status: 500 }
    );
  }
}
