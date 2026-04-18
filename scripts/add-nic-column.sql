-- Database Migration Script: Add NIC Column to Candidates Table
-- This script adds the NIC column to the candidates table with proper constraints
-- Run this script to update your database schema

-- Step 1: Add NIC column to candidates table
ALTER TABLE candidates 
ADD COLUMN IF NOT EXISTS nic TEXT;

-- Step 2: Add comment to describe the column
COMMENT ON COLUMN candidates.nic IS 'Sri Lankan National Identity Card number - required for all candidates';

-- Step 3: Create index for better performance on NIC searches
CREATE INDEX IF NOT EXISTS idx_candidates_nic ON candidates(nic);

-- Step 4: For existing records, set a temporary NIC value if null
-- This prevents issues with the NOT NULL constraint later
UPDATE candidates 
SET nic = 'TEMP_' || id 
WHERE nic IS NULL;

-- Step 5: Add NOT NULL constraint after ensuring all records have values
ALTER TABLE candidates 
ALTER COLUMN nic SET NOT NULL;

-- Step 6: Add check constraint for NIC format (basic validation)
-- This is a basic constraint - the application handles detailed validation
ALTER TABLE candidates 
ADD CONSTRAINT candidates_nic_format 
CHECK (nic IS NOT NULL AND LENGTH(TRIM(nic)) >= 9);

-- Step 7: Update existing candidates table age constraints to match new requirements
-- Drop existing age constraint if it exists
ALTER TABLE candidates 
DROP CONSTRAINT IF EXISTS candidates_age_check;

-- Add new comprehensive age constraint
ALTER TABLE candidates 
ADD CONSTRAINT candidates_age_check 
CHECK (
  (category IN ('kumara', 'kumari') AND age >= 14 AND age <= 29) OR
  (category IN ('sigithi-kumara', 'sigithi-kumariya') AND age >= 5 AND age <= 10)
);

-- Step 8: Verify the migration
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'candidates' AND column_name = 'nic';

-- Step 9: Show table constraints to verify everything is properly set up
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'candidates'::regclass 
ORDER BY conname;

-- Migration completed successfully!
-- The candidates table now has:
-- 1. NIC column with NOT NULL constraint
-- 2. Index for performance
-- 3. Basic format validation
-- 4. Updated age constraints matching new requirements (14-29, 5-10)
