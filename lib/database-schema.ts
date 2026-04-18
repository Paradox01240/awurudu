// Database schema for Awurudu voting system

export interface Candidate {
  id: string;
  name: string;
  category: 'kumara' | 'kumari' | 'sigithi-kumara' | 'sigithi-kumariya';
  age: number;
  description: string;
  image: string;
  phone: string;
  email: string;
  address: string;
  registrationDate: Date;
  status: 'pending' | 'approved' | 'rejected';
  voteCount: number;
  votecount?: number; // Database returns lowercase, optional for TypeScript
}

export interface Voter {
  id: string;
  name: string;
  phone: string;
  email: string;
  nic: string;
  hasVoted: boolean;
  votedFor?: string;
  votedCategory?: 'kumara' | 'kumari' | 'sigithi-kumara' | 'sigithi-kumariya';
  voteTimestamp?: Date;
  ipAddress: string;
  userAgent: string;
}

export interface Vote {
  id: string;
  voterId: string;
  candidateId: string;
  category: 'kumara' | 'kumari' | 'sigithi-kumara' | 'sigithi-kumariya';
  timestamp: Date;
  ipAddress: string;
  verified: boolean;
}

export interface VotingSession {
  id: string;
  isActive: boolean;
  startTime: Date;
  endTime: Date;
  totalVotes: number;
  maxVotesPerVoter: number;
}

// Database tables structure
export const DATABASE_SCHEMA = {
  candidates: `
    CREATE TABLE IF NOT EXISTS candidates (
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
    )
  `,
  
  voters: `
    CREATE TABLE IF NOT EXISTS voters (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT NOT NULL,
      nic TEXT NOT NULL UNIQUE,
      hasVoted BOOLEAN DEFAULT FALSE,
      votedFor TEXT,
      votedCategory TEXT,
      voteTimestamp DATETIME,
      ipAddress TEXT NOT NULL,
      userAgent TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `,
  
  votes: `
    CREATE TABLE IF NOT EXISTS votes (
      id TEXT PRIMARY KEY,
      voterId TEXT NOT NULL,
      candidateId TEXT NOT NULL,
      category TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      ipAddress TEXT NOT NULL,
      verified BOOLEAN DEFAULT TRUE,
      FOREIGN KEY (voterId) REFERENCES voters(id),
      FOREIGN KEY (candidateId) REFERENCES candidates(id),
      UNIQUE(voterId, category) -- Ensures one vote per category per voter
    )
  `,
  
  voting_session: `
    CREATE TABLE IF NOT EXISTS voting_session (
      id TEXT PRIMARY KEY,
      isActive BOOLEAN DEFAULT TRUE,
      startTime DATETIME DEFAULT CURRENT_TIMESTAMP,
      endTime DATETIME,
      totalVotes INTEGER DEFAULT 0,
      maxVotesPerVoter INTEGER DEFAULT 1
    )
  `
};
