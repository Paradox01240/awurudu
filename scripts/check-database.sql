-- Check database status and tables
-- This script helps diagnose any database issues

-- Check if vote_visibility_settings table exists
SELECT 
    'vote_visibility_settings table exists' as status,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'vote_visibility_settings'
        ) THEN 'YES'
        ELSE 'NO'
    END as table_exists;

-- Show current data in vote_visibility_settings table if it exists
SELECT 
    'Current vote visibility settings' as description,
    id,
    showVoteCharts,
    showVoteNumbers,
    lastUpdated,
    updatedBy
FROM vote_visibility_settings 
WHERE id = 'main_settings';

-- Check if other required tables exist
SELECT 
    table_name as table_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = table_name
        ) THEN 'EXISTS'
        ELSE 'MISSING'
    END as status
FROM (VALUES 
    ('candidates'), 
    ('voters'), 
    ('votes'), 
    ('voting_session'), 
    ('vote_visibility_settings')
) AS tables(table_name);
