ALTER TABLE layout_submissions
ADD COLUMN videos JSONB DEFAULT '[]'::jsonb;
