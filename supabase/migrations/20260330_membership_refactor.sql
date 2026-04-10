-- Migration: Refactor membership and user_membership tables
-- Date: 2026-03-30
-- Description: Implement a dynamic membership plan system with snapshots.

-- Drop existing tables/policies to start fresh as requested
DROP TABLE IF EXISTS public.user_membership CASCADE;
DROP TABLE IF EXISTS public.membership CASCADE;

-- Create membership master plan table
CREATE TABLE public.membership (
    id SERIAL PRIMARY KEY,
    org_id INTEGER, -- Organization ID (multi-tenant support)
    plan_name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10, 2),
    validity_days INTEGER,
    features JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    plan_limit INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create user_membership table
CREATE TABLE public.user_membership (
    id SERIAL PRIMARY KEY,
    profile_id INTEGER UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    membership_id INTEGER REFERENCES public.membership(id) ON DELETE SET NULL,
    plan_name TEXT,
    price DECIMAL(10, 2),
    validity_days INTEGER,
    start_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    end_date TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'active', -- status: active / expired / cancelled
    membership_json JSONB, -- Full membership data snapshot at purchase
    plan_limit INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure a unique index exists on profile_id for upsert conflict resolution
CREATE UNIQUE INDEX IF NOT EXISTS user_membership_profile_id_idx ON public.user_membership (profile_id);

-- Update licenses table to remove hardcoded plan constraints if any
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM information_schema.constraint_column_usage WHERE table_name = 'licenses' AND constraint_name = 'licenses_plan_check') THEN
        ALTER TABLE public.licenses DROP CONSTRAINT licenses_plan_check;
    END IF;
END $$;

-- RLS for membership
ALTER TABLE public.membership ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view active plans" ON public.membership;
CREATE POLICY "Anyone can view active plans" ON public.membership FOR SELECT USING (is_active = true);

-- RLS for user_membership
ALTER TABLE public.user_membership ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own membership" ON public.user_membership;
CREATE POLICY "Users can view their own membership" ON public.user_membership 
FOR SELECT USING (profile_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can insert their own membership" ON public.user_membership;
CREATE POLICY "Users can insert their own membership" ON public.user_membership
FOR INSERT WITH CHECK (profile_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can update their own membership" ON public.user_membership;
CREATE POLICY "Users can update their own membership" ON public.user_membership
FOR UPDATE USING (profile_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid()));

-- Trigger for updated_at (assuming handle_updated_at already exists from previous migrations)
CREATE TRIGGER update_membership_updated_at
BEFORE UPDATE ON public.membership
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_user_membership_updated_at
BEFORE UPDATE ON public.user_membership
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Seed initial plans as requested (Basic, Premium)
INSERT INTO public.membership (plan_name, description, price, validity_days, features, plan_limit)
VALUES 
('Basic', 'Perfect for small projects and personal use.', 29.00, 30, '["Layout 1 access", "Standard transitions", "Limited API calls", "Email support"]', 1),
('Premium', 'Advanced features for scaling businesses.', 79.00, 365, '["All Layouts (1-4)", "Advanced transitions", "Unlimited API calls", "Priority support"]', 2);
