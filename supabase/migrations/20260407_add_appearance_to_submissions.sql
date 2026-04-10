
-- Add appearance column to layout_submissions table if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='layout_submissions' AND column_name='appearance') THEN
        ALTER TABLE public.layout_submissions ADD COLUMN appearance JSONB DEFAULT '{}';
    END IF;
END $$;

-- Update comment
COMMENT ON COLUMN public.layout_submissions.appearance IS 'Stores structured appearance data including layout titles, descriptions, and separate image titles/descriptions.';
