-- Add summary_failed field to meetings table
-- This flag indicates when summary generation failed but the meeting was still saved
-- Allows users to regenerate summary later

ALTER TABLE meetings ADD COLUMN IF NOT EXISTS summary_failed BOOLEAN DEFAULT FALSE;

-- Create index for quick lookup of meetings needing summary regeneration
CREATE INDEX IF NOT EXISTS idx_meetings_summary_failed ON meetings(summary_failed) WHERE summary_failed = TRUE;

COMMENT ON COLUMN meetings.summary_failed IS 'Indicates if the summary generation failed. Users can regenerate summary from meeting details.';
