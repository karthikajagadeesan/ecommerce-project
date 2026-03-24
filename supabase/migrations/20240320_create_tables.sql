-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id SERIAL PRIMARY KEY,
  auth_user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Membership table
CREATE TABLE IF NOT EXISTS public.membership (
  id SERIAL PRIMARY KEY,
  profile_id INTEGER UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  premium_template BOOLEAN DEFAULT FALSE,
  basic_template BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Licenses table
CREATE TABLE IF NOT EXISTS public.licenses (
  id SERIAL PRIMARY KEY,
  uuid UUID DEFAULT gen_random_uuid() UNIQUE,
  license_key TEXT UNIQUE NOT NULL,
  status TEXT CHECK (status IN ('active', 'inactive', 'expired')) DEFAULT 'active',
  version TEXT,
  validity_period INTEGER, -- days remaining or fixed duration
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  payment_status TEXT CHECK (payment_status IN ('pending', 'completed', 'failed')) DEFAULT 'pending',
  domain TEXT,
  user_id INTEGER REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan TEXT CHECK (plan IN ('basic', 'pro', 'enterprise')),
  displayed_once BOOLEAN DEFAULT FALSE
);

-- API Usage table
CREATE TABLE IF NOT EXISTS public.api_usage (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES public.profiles(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  called_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.membership ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_usage ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = auth_user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = auth_user_id);

-- Membership Policies
CREATE POLICY "Users can manage their own membership" ON public.membership 
FOR ALL USING (
  profile_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid())
) WITH CHECK (
  profile_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid())
);

-- Licenses Policies
CREATE POLICY "Users can view their own licenses" ON public.licenses FOR SELECT USING (
  user_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid())
);

-- API Usage Policies
CREATE POLICY "Users can view their own usage" ON public.api_usage FOR SELECT USING (
  user_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid())
);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_membership_updated_at
BEFORE UPDATE ON public.membership
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
