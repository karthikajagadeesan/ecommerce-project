-- Create payments table if not exists with requested columns
CREATE TABLE IF NOT EXISTS public.payments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES public.profiles(id) ON DELETE CASCADE,
    domain_url TEXT,
    amount DECIMAL(10, 2),
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure licenses table has domain_url column and map it properly
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='licenses' AND column_name='domain') THEN
        ALTER TABLE public.licenses RENAME COLUMN domain TO domain_url;
    ELSIF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='licenses' AND column_name='domain_url') THEN
        ALTER TABLE public.licenses ADD COLUMN domain_url TEXT;
    END IF;
END $$;

-- Step 1: Create user_membership table as a copy of original membership structure
CREATE TABLE IF NOT EXISTS public.user_membership (
    id SERIAL PRIMARY KEY,
    profile_id INTEGER UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    premium_template BOOLEAN DEFAULT FALSE,
    basic_template BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Step 2: Empty membership table (remove existing columns to keep it empty as requested)
-- Drop dependent policies first
DROP POLICY IF EXISTS "Users can manage their own membership" ON public.membership;

ALTER TABLE public.membership DROP COLUMN IF EXISTS premium_template;
ALTER TABLE public.membership DROP COLUMN IF EXISTS basic_template;
ALTER TABLE public.membership DROP COLUMN IF EXISTS profile_id;
ALTER TABLE public.membership DROP COLUMN IF EXISTS updated_at;
ALTER TABLE public.membership DROP COLUMN IF EXISTS created_at;

-- Enable RLS for new tables
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_membership ENABLE ROW LEVEL SECURITY;

-- Policies for payments
DROP POLICY IF EXISTS "Users can view their own payments" ON public.payments;
CREATE POLICY "Users can view their own payments" ON public.payments 
FOR SELECT USING (user_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid()));

-- Policies for user_membership
DROP POLICY IF EXISTS "Users can manage their own user_membership" ON public.user_membership;
CREATE POLICY "Users can manage their own user_membership" ON public.user_membership 
FOR ALL USING (profile_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid()))
WITH CHECK (profile_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid()));
