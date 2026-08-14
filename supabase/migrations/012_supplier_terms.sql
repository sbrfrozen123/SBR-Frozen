-- ============================================================
-- SBR POS SYSTEM — Database Migration v1.6.0
-- Add payment_terms to suppliers table
-- ============================================================

ALTER TABLE public.suppliers 
ADD COLUMN IF NOT EXISTS payment_terms VARCHAR(20) NOT NULL DEFAULT 'COD';

-- Update existing suppliers to have COD
UPDATE public.suppliers SET payment_terms = 'COD' WHERE payment_terms IS NULL;
