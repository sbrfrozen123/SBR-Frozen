-- ============================================================
-- SBR POS SYSTEM — Database Migration v1.0.3
-- Add 'saldo_awal' type to cash_transactions
-- ============================================================

-- Drop the old constraint and add new one that includes 'saldo_awal'
ALTER TABLE public.cash_transactions 
  DROP CONSTRAINT IF EXISTS cash_transactions_type_check;

ALTER TABLE public.cash_transactions 
  ADD CONSTRAINT cash_transactions_type_check 
  CHECK (type IN ('setor_kas', 'tarik_kas', 'mutasi_ke_bank', 'mutasi_ke_kas', 'saldo_awal'));
