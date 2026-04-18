const { Client } = require('pg');

async function testConnection() {
  const client = new Client({
    connectionString: process.env.POSTGRES_URL
  });

  try {
    await client.connect();
    console.log('✅ Successfully connected to Neon database!');
    
    // Test a simple query
    const result = await client.query('SELECT NOW() as current_time, version() as version');
    console.log('📊 Database Info:');
    console.log('   Time:', result.rows[0].current_time);
    console.log('   Version:', result.rows[0].version);
    
    // Test if tables exist
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('📋 Tables found:', tables.rows.map(row => row.table_name).join(', '));
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

testConnection();
