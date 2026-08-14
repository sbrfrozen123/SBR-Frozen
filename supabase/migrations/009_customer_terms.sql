-- ============================================================
-- SBR POS SYSTEM — Database Migration v1.5.0
-- Add payment_terms to customers table
-- ============================================================

ALTER TABLE public.customers 
ADD COLUMN IF NOT EXISTS payment_terms VARCHAR(20) NOT NULL DEFAULT 'COD';

-- Update existing customers to have COD (although default handles it, it's good practice)
UPDATE public.customers SET payment_terms = 'COD' WHERE payment_terms IS NULL;
