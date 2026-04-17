-- Add status column to website_access table
ALTER TABLE website_access ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
