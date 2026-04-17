-- Update schema as per user request: add name column to several tables and rename profile_id in user_membership
-- Add name to user_membership, payments, and licenses tables
ALTER TABLE user_membership ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE licenses ADD COLUMN IF NOT EXISTS name TEXT;

-- Add user_id to profiles table 
-- (Assuming user_id is a text field, potentially for auth.uid() or a custom ID)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS user_id TEXT;

-- Rename profile_id to user_id in user_membership for consistency
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_membership' AND column_name = 'profile_id') THEN
        ALTER TABLE user_membership RENAME COLUMN profile_id TO user_id;
    END IF;
END $$;
