-- Add avatar_url column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';
