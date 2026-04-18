const { Client } = require('pg');

async function setupDatabase() {
  const client = new Client({
    connectionString: process.env.POSTGRES_URL
  });

  try {
    await client.connect();
    console.log('🔧 Setting up Neon database...');
    
    // Create tables
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.candidates (
        id text PRIMARY KEY,
        name text NOT NULL,
        category text NOT NULL CHECK (category IN ('kumara', 'kumari', 'sigithi-kumara', 'sigithi-kumariya')),
        age integer NOT NULL CHECK (age >= 5 AND age <= 30),
        description text,
        image text,
        phone text NOT NULL,
        email text NOT NULL,
        address text,
        registrationdate timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
        status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
        votecount integer DEFAULT 0 CHECK (votecount >= 0),
        UNIQUE(email),
        UNIQUE(phone)
      );
    `);
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.voters (
        id text PRIMARY KEY,
        name text NOT NULL,
        phone text NOT NULL,
        email text NOT NULL,
        nic text NOT NULL,
        hasvoted boolean DEFAULT false,
        votedfor text,
        votedcategory text,
        votetimestamp timestamp without time zone,
        ipaddress text NOT NULL,
        useragent text NOT NULL,
        createdat timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(email),
        UNIQUE(phone),
        UNIQUE(nic)
      );
    `);
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.votes (
        id text PRIMARY KEY,
        voterid text NOT NULL REFERENCES public.voters(id),
        candidateid text NOT NULL REFERENCES public.candidates(id),
        category text NOT NULL,
        "timestamp" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
        ipaddress text NOT NULL,
        verified boolean DEFAULT true
      );
    `);
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.voting_session (
        id text PRIMARY KEY,
        isactive boolean DEFAULT false,
        starttime timestamp without time zone,
        endtime timestamp without time zone,
        totalvotes integer DEFAULT 0,
        maxvotespervoter integer DEFAULT 1,
        createdat timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
        updatedat timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
        sessiontype text DEFAULT 'normal',
        description text,
        settings text
      );
    `);
    
    // Create indexes
    await client.query('CREATE INDEX IF NOT EXISTS idx_candidates_category ON public.candidates(category);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_candidates_status ON public.candidates(status);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_voters_email ON public.voters(email);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_voters_nic ON public.voters(nic);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_voters_phone ON public.voters(phone);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_votes_candidateid ON public.votes(candidateid);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_votes_category ON public.votes(category);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_votes_timestamp ON public.votes("timestamp");');
    await client.query('CREATE INDEX IF NOT EXISTS idx_votes_voterid ON public.votes(voterid);');
    
    console.log('✅ Database setup completed successfully!');
    
    // Verify tables
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('📋 Tables created:', result.rows.map(row => row.table_name).join(', '));
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    throw error;
  } finally {
    await client.end();
  }
}

setupDatabase();
