-- Update website_access table to include site_name and user name
ALTER TABLE website_access ADD COLUMN IF NOT EXISTS site_name TEXT;
ALTER TABLE website_access ADD COLUMN IF NOT EXISTS name TEXT;
