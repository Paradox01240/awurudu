-- Create vote visibility settings table
CREATE TABLE IF NOT EXISTS vote_visibility_settings (
    id TEXT PRIMARY KEY DEFAULT 'main_settings',
    showVoteCharts BOOLEAN DEFAULT true,
    showVoteNumbers BOOLEAN DEFAULT false,
    lastUpdated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedBy TEXT,
    CONSTRAINT vote_visibility_settings_id_check CHECK (id = 'main_settings')
);

-- Insert default settings if table is empty
INSERT INTO vote_visibility_settings (id, showVoteCharts, showVoteNumbers, lastUpdated)
SELECT 'main_settings', true, false, NOW()
WHERE NOT EXISTS (SELECT 1 FROM vote_visibility_settings WHERE id = 'main_settings');
