import { Pool } from 'pg';

// Cloudflare-compatible database connection
const postgresUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL;

// Cloudflare Pages environment detection
const isCloudflare = typeof globalThis !== 'undefined' && 
  (globalThis as any).Request && 
  (globalThis as any).Response;

const pool = new Pool({
  connectionString: postgresUrl,
  ssl: {
    rejectUnauthorized: false // Required for most cloud providers
  },
  // Additional Cloudflare optimizations
  max: isCloudflare ? 5 : 10,
  idleTimeoutMillis: isCloudflare ? 10000 : 30000,
  connectionTimeoutMillis: isCloudflare ? 5000 : 10000,
});

// Database connection helper
export async function query(text: string, params?: any[]) {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Query executed', { text, duration, rows: result.rowCount });
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Test database connection
export async function testConnection() {
  try {
    const result = await query('SELECT NOW()');
    console.log('Database connected successfully:', result.rows[0]);
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  await pool.end();
  console.log('Database pool closed');
  process.exit(0);
});

export default pool;
