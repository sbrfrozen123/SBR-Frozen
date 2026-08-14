-- ============================================================
-- SBR POS SYSTEM — Database Migration v1.3.0
-- Feature: Multi-Branch Support
-- ============================================================

-- 1. Create branches table
CREATE TABLE IF NOT EXISTS public.branches (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  address     TEXT,
  phone       TEXT,
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Insert Default Branch
INSERT INTO public.branches (name, address, phone)
VALUES ('Cabang Pusat', 'Alamat Pusat', '081234567890')
ON CONFLICT DO NOTHING;

-- Trigger for branches updated_at
CREATE OR REPLACE TRIGGER trg_branches_updated_at
  BEFORE UPDATE ON public.branches
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS on branches
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "branches_select_auth"
  ON public.branches FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "branches_all_admin"
  ON public.branches FOR ALL
  USING (public.get_my_role() = 'super_admin');

-- ============================================================
-- 2. Add branch_id to existing tables
-- ============================================================

DO $$
DECLARE
  default_branch_id UUID;
BEGIN
  -- Get the default branch id
  SELECT id INTO default_branch_id FROM public.branches LIMIT 1;

  -- Add branch_id to profiles (users)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='branch_id') THEN
    ALTER TABLE public.profiles ADD COLUMN branch_id UUID REFERENCES public.branches(id);
    UPDATE public.profiles SET branch_id = default_branch_id WHERE branch_id IS NULL;
  END IF;

  -- Add branch_id to transactions
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='transactions' AND column_name='branch_id') THEN
    ALTER TABLE public.transactions ADD COLUMN branch_id UUID REFERENCES public.branches(id);
    UPDATE public.transactions SET branch_id = default_branch_id WHERE branch_id IS NULL;
    ALTER TABLE public.transactions ALTER COLUMN branch_id SET NOT NULL;
  END IF;

  -- Add branch_id to expenses
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='expenses' AND column_name='branch_id') THEN
    ALTER TABLE public.expenses ADD COLUMN branch_id UUID REFERENCES public.branches(id);
    UPDATE public.expenses SET branch_id = default_branch_id WHERE branch_id IS NULL;
    ALTER TABLE public.expenses ALTER COLUMN branch_id SET NOT NULL;
  END IF;

  -- Add branch_id to stock_adjustments
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='stock_adjustments' AND column_name='branch_id') THEN
    ALTER TABLE public.stock_adjustments ADD COLUMN branch_id UUID REFERENCES public.branches(id);
    UPDATE public.stock_adjustments SET branch_id = default_branch_id WHERE branch_id IS NULL;
    ALTER TABLE public.stock_adjustments ALTER COLUMN branch_id SET NOT NULL;
  END IF;
  
  -- Add branch_id to debt_payments
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='debt_payments' AND column_name='branch_id') THEN
    ALTER TABLE public.debt_payments ADD COLUMN branch_id UUID REFERENCES public.branches(id);
    UPDATE public.debt_payments SET branch_id = default_branch_id WHERE branch_id IS NULL;
    ALTER TABLE public.debt_payments ALTER COLUMN branch_id SET NOT NULL;
  END IF;
END $$;

-- ============================================================
-- 3. Product Stocks (Inventory per branch)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.product_stocks (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id      UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  branch_id       UUID NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  stock_quantity  NUMERIC(15,3) NOT NULL DEFAULT 0,
  min_stock_alert NUMERIC(15,3) DEFAULT 5,
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, branch_id)
);

CREATE OR REPLACE TRIGGER trg_product_stocks_updated_at
  BEFORE UPDATE ON public.product_stocks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS
ALTER TABLE public.product_stocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "product_stocks_select"
  ON public.product_stocks FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "product_stocks_all"
  ON public.product_stocks FOR ALL
  USING (public.get_my_role() IN ('super_admin', 'admin_gudang', 'kasir'));

-- Migrate existing stock from products to product_stocks
DO $$
DECLARE
  default_branch_id UUID;
BEGIN
  SELECT id INTO default_branch_id FROM public.branches LIMIT 1;
  
  INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity, min_stock_alert)
  SELECT id, default_branch_id, stock_quantity, min_stock_alert
  FROM public.products
  ON CONFLICT (product_id, branch_id) DO NOTHING;
END $$;

-- ============================================================
-- 4. Supplier branches (Optional: Purchases to branches)
-- ============================================================
-- Note: Assuming purchases table exists, add branch_id to it if applicable
DO $$
DECLARE
  default_branch_id UUID;
BEGIN
  SELECT id INTO default_branch_id FROM public.branches LIMIT 1;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'purchases') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='purchases' AND column_name='branch_id') THEN
      ALTER TABLE public.purchases ADD COLUMN branch_id UUID REFERENCES public.branches(id);
      UPDATE public.purchases SET branch_id = default_branch_id WHERE branch_id IS NULL;
      ALTER TABLE public.purchases ALTER COLUMN branch_id SET NOT NULL;
    END IF;
  END IF;
END $$;
