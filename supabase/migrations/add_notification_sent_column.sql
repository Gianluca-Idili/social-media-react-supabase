-- Add notification_sent column to lists table
ALTER TABLE lists ADD COLUMN IF NOT EXISTS notification_sent BOOLEAN DEFAULT FALSE;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_lists_notification_sent ON lists(notification_sent, expires_at, is_completed);
