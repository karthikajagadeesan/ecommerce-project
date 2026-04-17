-- Add site_access to membership table
ALTER TABLE membership ADD COLUMN IF NOT EXISTS site_access INTEGER DEFAULT 1;

-- Create website_access table
CREATE TABLE IF NOT EXISTS website_access (
    id BIGSERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES profiles(id),
    plan_name TEXT NOT NULL,
    domain_url TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE website_access ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Users can view their own website access"
ON website_access FOR SELECT
USING (auth.uid() IN (SELECT auth_user_id FROM profiles WHERE id = website_access.user_id));

CREATE POLICY "Users can insert their own website access"
ON website_access FOR INSERT
WITH CHECK (auth.uid() IN (SELECT auth_user_id FROM profiles WHERE id = website_access.user_id));
