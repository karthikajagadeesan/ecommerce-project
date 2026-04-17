-- Update payments table to add plan_name and replace amount with price
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS plan_name TEXT;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS price DECIMAL(10, 2);
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS validity_days INTEGER;

-- Transfer data from amount to price if exists
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='payments' AND column_name='amount') THEN
        UPDATE public.payments SET price = amount WHERE price IS NULL;
        ALTER TABLE public.payments DROP COLUMN amount;
    END IF;
END $$;
