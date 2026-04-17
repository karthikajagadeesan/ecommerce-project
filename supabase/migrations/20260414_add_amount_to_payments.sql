-- Add amount column to payments table
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS amount DECIMAL(10, 2);

-- COMMENT explaining the column usage
COMMENT ON COLUMN public.payments.amount IS 'The actual amount paid by the user upon successful transaction.';
