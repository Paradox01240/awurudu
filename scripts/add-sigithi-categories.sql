-- Migration script to add Sigithi Awurudu categories
-- This script updates the database schema to support the new Sigithi categories

-- Update the candidates table to include new categories
-- Note: SQLite doesn't support ALTER COLUMN with CHECK constraints directly
-- We need to recreate the table with the new schema

-- Backup existing data
CREATE TABLE candidates_backup AS SELECT * FROM candidates;

-- Drop the old table
DROP TABLE candidates;

-- Recreate with new schema including all four categories
CREATE TABLE candidates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT CHECK(category IN ('kumara', 'kumari', 'sigithi-kumara', 'sigithi-kumariya')) NOT NULL,
  age INTEGER NOT NULL,
  description TEXT,
  image TEXT,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  address TEXT,
  registrationDate DATETIME DEFAULT CURRENT_TIMESTAMP,
  status TEXT CHECK(status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  voteCount INTEGER DEFAULT 0
);

-- Restore data from backup
INSERT INTO candidates SELECT * FROM candidates_backup;

-- Drop backup table
DROP TABLE candidates_backup;

-- Update votes table to include new categories
CREATE TABLE votes_backup AS SELECT * FROM votes;
DROP TABLE votes;

CREATE TABLE votes (
  id TEXT PRIMARY KEY,
  voterId TEXT NOT NULL,
  candidateId TEXT NOT NULL,
  category TEXT CHECK(category IN ('kumara', 'kumari', 'sigithi-kumara', 'sigithi-kumariya')) NOT NULL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  ipAddress TEXT NOT NULL,
  verified BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (voterId) REFERENCES voters(id),
  FOREIGN KEY (candidateId) REFERENCES candidates(id),
  UNIQUE(voterId, category) -- Ensures one vote per category per voter
);

INSERT INTO votes SELECT * FROM votes_backup;
DROP TABLE votes_backup;

-- Update voters table to include new categories
CREATE TABLE voters_backup AS SELECT * FROM voters;
DROP TABLE voters;

CREATE TABLE voters (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  nic TEXT NOT NULL UNIQUE,
  hasVoted BOOLEAN DEFAULT FALSE,
  votedFor TEXT,
  votedCategory TEXT CHECK(votedCategory IN ('kumara', 'kumari', 'sigithi-kumara', 'sigithi-kumariya')),
  voteTimestamp DATETIME,
  ipAddress TEXT NOT NULL,
  userAgent TEXT NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO voters SELECT * FROM voters_backup;
DROP TABLE voters_backup;

-- Add some sample Sigithi category candidates (optional)
-- Uncomment and modify these INSERT statements if you want to add sample data

/*
INSERT INTO candidates (
  id, name, category, age, description, image, phone, email, address, registrationDate, status, voteCount
) VALUES 
  (
    'candidate_sigithi_kumara_1',
    'Sample Sigithi Kumara',
    'sigithi-kumara',
    8,
    'A talented young boy participating in the Sigithi Awurudu Kumara competition.',
    '/images/default-sigithi-kumara.jpg',
    '+94 11 234 5678',
    'sigithi.kumara@example.com',
    'Colombo, Sri Lanka',
    CURRENT_TIMESTAMP,
    'pending',
    0
  ),
  (
    'candidate_sigithi_kumariya_1',
    'Sample Sigithi Kumariya',
    'sigithi-kumariya',
    7,
    'A talented young girl participating in the Sigithi Awurudu Kumariya competition.',
    '/images/default-sigithi-kumariya.jpg',
    '+94 11 234 5679',
    'sigithi.kumariya@example.com',
    'Colombo, Sri Lanka',
    CURRENT_TIMESTAMP,
    'pending',
    0
  );
*/

-- Verify the migration
SELECT 'Migration completed successfully!' as status;

-- Show category distribution
SELECT 
  category,
  COUNT(*) as candidate_count,
  SUM(voteCount) as total_votes
FROM candidates 
GROUP BY category 
ORDER BY category;
