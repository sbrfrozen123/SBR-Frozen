-- ============================================================
-- SBR POS SYSTEM — Database Migration v1.0.2
-- Add Cashflow module (payment_method on expenses and purchases)
-- ============================================================

-- Add payment_method to expenses
ALTER TABLE public.expenses 
  ADD COLUMN IF NOT EXISTS payment_method TEXT NOT NULL DEFAULT 'tunai'
  CHECK (payment_method IN ('tunai', 'transfer', 'qris'));

-- Add payment_method to purchases
ALTER TABLE public.purchases 
  ADD COLUMN IF NOT EXISTS payment_method TEXT NOT NULL DEFAULT 'tunai'
  CHECK (payment_method IN ('tunai', 'transfer', 'qris', 'tempo'));

-- ============================================================
-- TABLE: cash_transactions (mutasi kas)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.cash_transactions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES public.profiles(id),
  type             TEXT NOT NULL 
                   CHECK (type IN ('setor_kas', 'tarik_kas', 'mutasi_ke_bank', 'mutasi_ke_kas')),
  amount           NUMERIC(15,2) NOT NULL,
  payment_method   TEXT NOT NULL 
                   CHECK (payment_method IN ('tunai', 'transfer', 'qris')),
  description      TEXT,
  transaction_date TIMESTAMPTZ DEFAULT NOW(),
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE public.cash_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cash_txns_select_authenticated"
  ON public.cash_transactions FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "cash_txns_insert_admin"
  ON public.cash_transactions FOR INSERT
  WITH CHECK (public.get_my_role() IN ('super_admin', 'kasir'));

-- ============================================================
-- TRIGGERS: auto-update updated_at
-- ============================================================
CREATE OR REPLACE TRIGGER trg_cash_txns_updated_at
  BEFORE UPDATE ON public.cash_transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
