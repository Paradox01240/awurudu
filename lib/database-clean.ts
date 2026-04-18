import { Pool } from 'pg';

// Cloudflare-compatible database connection
const postgresUrl = process.env.DATABASE_URL ;

console.log('Database URL:', postgresUrl);

// Cloudflare Pages environment detection
const isCloudflare = typeof globalThis !== 'undefined' &&
  (globalThis as any).Request &&
  (globalThis as any).Response;

const isLocalhost = postgresUrl?.includes('localhost') ||
    postgresUrl?.includes('127.0.0.1') ||
    process.env.NODE_ENV === 'development';

const pool = new Pool({
    connectionString: postgresUrl,

    ssl: {
        rejectUnauthorized: false, // 🔥 REQUIRED for Aiven
    },

    // Cloudflare optimizations
    max: isCloudflare ? 5 : 10,
    idleTimeoutMillis: isCloudflare ? 10000 : 30000,
    connectionTimeoutMillis: isCloudflare ? 5000 : 10000,
});

// Database connection helper
export async function query(text: string, params?: any[]) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
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

// Initialize database tables
export async function initDatabase() {
  try {
    // Test connection first
    await testConnection();
    
    // Create tables first (in both development and production)
    console.log('Creating database tables...');
    
    // Create candidates table
    await query(`
      CREATE TABLE IF NOT EXISTS candidates (
                                              id TEXT PRIMARY KEY,
                                              name TEXT NOT NULL,
                                              category TEXT CHECK(category IN ('kumara', 'kumari', 'sigithi-kumara', 'sigithi-kumariya')) NOT NULL,
        age INTEGER NOT NULL CHECK(
          (category IN ('kumara', 'kumari') AND age >= 14 AND age <= 29) OR
          (category IN ('sigithi-kumara', 'sigithi-kumariya') AND age >= 5 AND age <= 10)
        ),
        description TEXT,
        image TEXT,
        phone TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        address TEXT,
        registrationDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status TEXT CHECK(status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
        voteCount INTEGER DEFAULT 0 CHECK(voteCount >= 0)
        )
    `);

    // Create voters table
    await query(`
      CREATE TABLE IF NOT EXISTS voters (
                                          id TEXT PRIMARY KEY,
                                          name TEXT NOT NULL,
                                          phone TEXT NOT NULL,
                                          email TEXT NOT NULL,
                                          nic TEXT NOT NULL,
                                          hasVoted BOOLEAN DEFAULT FALSE,
                                          votedFor TEXT,
                                          votedCategory TEXT,
                                          voteTimestamp TIMESTAMP,
                                          ipAddress TEXT NOT NULL,
                                          userAgent TEXT NOT NULL,
                                          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Remove UNIQUE constraint on nic if it exists (for existing databases)
    try {
      await query(`ALTER TABLE voters DROP CONSTRAINT IF EXISTS voters_nic_key`);
      console.log('Removed UNIQUE constraint on nic field');
    } catch (error) {
      // Constraint might not exist, which is fine
      console.log('No UNIQUE constraint on nic to remove (or already removed)');
    }

    // Create votes table
    await query(`
      CREATE TABLE IF NOT EXISTS votes (
                                         id TEXT PRIMARY KEY,
                                         voterId TEXT NOT NULL,
                                         candidateId TEXT NOT NULL,
                                         category TEXT NOT NULL,
                                         timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                         ipAddress TEXT NOT NULL,
                                         verified BOOLEAN DEFAULT TRUE,
                                         FOREIGN KEY (voterId) REFERENCES voters(id) ON DELETE CASCADE,
        FOREIGN KEY (candidateId) REFERENCES candidates(id) ON DELETE CASCADE,
        UNIQUE(voterId, category)
        )
    `);

    // Create voting session table
    await query(`
      CREATE TABLE IF NOT EXISTS voting_session (
                                                  id TEXT PRIMARY KEY DEFAULT 'main_session',
                                                  isActive BOOLEAN DEFAULT TRUE,
                                                  startTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                                  endTime TIMESTAMP,
                                                  totalVotes INTEGER DEFAULT 0,
                                                  maxVotesPerVoter INTEGER DEFAULT 1
      )
    `);

    // Create vote visibility settings table
    await query(`
      CREATE TABLE IF NOT EXISTS vote_visibility_settings (
        id TEXT PRIMARY KEY DEFAULT 'main_settings',
        showVoteCharts BOOLEAN DEFAULT true,
        showVoteNumbers BOOLEAN DEFAULT false,
        lastUpdated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedBy TEXT,
        CONSTRAINT vote_visibility_settings_id_check CHECK (id = 'main_settings')
      )
    `);

    // Insert default settings if table is empty
    await query(`
      INSERT INTO vote_visibility_settings (id, showVoteCharts, showVoteNumbers, lastUpdated)
      SELECT 'main_settings', true, false, NOW()
      WHERE NOT EXISTS (SELECT 1 FROM vote_visibility_settings WHERE id = 'main_settings')
    `);

    // Create indexes for better performance
    await query(`CREATE INDEX IF NOT EXISTS idx_candidates_category ON candidates(category)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_candidates_status ON candidates(status)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_voters_nic ON voters(nic)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_voters_phone ON voters(phone)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_voters_email ON voters(email)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_votes_voterId ON votes(voterId)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_votes_candidateId ON votes(candidateId)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_votes_category ON votes(category)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_votes_timestamp ON votes(timestamp)`);

    console.log('Database tables created successfully');
    
    console.log('Database initialized successfully - tables created, no test data seeded');
  } catch (error) {
    console.error('Database initialization error:', error);
    
    // Don't throw error if it's just a connection issue
    const errorCode = (error as any).code;
    if (errorCode === 'ECONNREFUSED' || errorCode === 'ENOTFOUND') {
      console.warn('Database not available - some features may not work');
      return;
    }
    
    throw error;
  }
}

export default pool;
