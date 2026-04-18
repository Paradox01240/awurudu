-- PostgreSQL migration script to add Sigithi Awurudu categories
-- This script updates the PostgreSQL database schema to support the new Sigithi categories

-- Drop existing CHECK constraints on candidates table
ALTER TABLE candidates DROP CONSTRAINT IF EXISTS candidates_category_check;

-- Add new CHECK constraint with all four categories
ALTER TABLE candidates ADD CONSTRAINT candidates_category_check 
  CHECK (category IN ('kumara', 'kumari', 'sigithi-kumara', 'sigithi-kumariya'));

-- Drop existing CHECK constraints on votes table
ALTER TABLE votes DROP CONSTRAINT IF EXISTS votes_category_check;

-- Add new CHECK constraint with all four categories
ALTER TABLE votes ADD CONSTRAINT votes_category_check 
  CHECK (category IN ('kumara', 'kumari', 'sigithi-kumara', 'sigithi-kumariya'));

-- Update voters table constraint (if it exists)
ALTER TABLE voters DROP CONSTRAINT IF EXISTS voters_votedcategory_check;

-- Add new CHECK constraint for voters table
ALTER TABLE voters ADD CONSTRAINT voters_votedcategory_check 
  CHECK (votedCategory IN ('kumara', 'kumari', 'sigithi-kumara', 'sigithi-kumariya'));

-- Verify the migration was successful
SELECT 'Migration completed successfully!' as status;

-- Show current category distribution
SELECT 
  category,
  COUNT(*) as candidate_count,
  COALESCE(SUM(voteCount), 0) as total_votes
FROM candidates 
GROUP BY category 
ORDER BY category;

-- Show vote distribution by category
SELECT 
  category,
  COUNT(*) as vote_count
FROM votes 
GROUP BY category 
ORDER BY category;
