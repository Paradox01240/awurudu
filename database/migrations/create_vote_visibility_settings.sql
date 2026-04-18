-- Create vote_visibility_settings table
CREATE TABLE IF NOT EXISTS "vote_visibility_settings" (
	"id" TEXT NOT NULL DEFAULT 'main_settings',
	"showvotecharts" BOOLEAN NULL DEFAULT true,
	"showvotenumbers" BOOLEAN NULL DEFAULT false,
	"lastupdated" TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
	"updatedby" TEXT NULL DEFAULT NULL,
	PRIMARY KEY ("id"),
	CONSTRAINT "vote_visibility_settings_id_check" CHECK ((id = 'main_settings'::text))
);

-- Insert default settings if table is empty
INSERT INTO "vote_visibility_settings" ("id", "showvotecharts", "showvotenumbers", "lastupdated", "updatedby")
SELECT 
    'main_settings',
    true,  -- Show charts by default
    false, -- Hide vote numbers by default
    CURRENT_TIMESTAMP,
    'system'
WHERE NOT EXISTS (SELECT 1 FROM "vote_visibility_settings" WHERE id = 'main_settings');

-- Add comments
COMMENT ON TABLE "vote_visibility_settings" IS 'Settings for controlling visibility of voting statistics on main page';
COMMENT ON COLUMN "vote_visibility_settings"."id" IS 'Primary key identifier for settings record';
COMMENT ON COLUMN "vote_visibility_settings"."showvotecharts" IS 'Whether to show voting charts on main page';
COMMENT ON COLUMN "vote_visibility_settings"."showvotenumbers" IS 'Whether to show actual vote numbers or just percentages';
COMMENT ON COLUMN "vote_visibility_settings"."lastupdated" IS 'Timestamp when settings were last updated';
COMMENT ON COLUMN "vote_visibility_settings"."updatedby" IS 'User or system that last updated the settings';
