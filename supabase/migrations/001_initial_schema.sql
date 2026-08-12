-- ============================================================
-- SBR POS SYSTEM — Database Migration v1.0.0
-- Supabase / PostgreSQL
-- Run this in Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLE: profiles (extends auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT NOT NULL,
  role        TEXT NOT NULL DEFAULT 'kasir'
              CHECK (role IN ('super_admin', 'kasir', 'admin_gudang')),
  status      TEXT NOT NULL DEFAULT 'active'
              CHECK (status IN ('active', 'inactive')),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: store_settings (singleton row)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.store_settings (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_name          TEXT NOT NULL DEFAULT 'Toko Saya',
  store_address       TEXT,
  store_phone         TEXT,
  receipt_footer_text TEXT DEFAULT 'Terima kasih atas kepercayaan Anda!',
  tax_percentage      NUMERIC(5,2) DEFAULT 0,
  payment_cash        BOOLEAN DEFAULT TRUE,
  payment_transfer    BOOLEAN DEFAULT TRUE,
  payment_qris        BOOLEAN DEFAULT TRUE,
  payment_tempo       BOOLEAN DEFAULT TRUE,
  bank_name           TEXT,
  bank_account_number TEXT,
  bank_account_name   TEXT,
  qris_image_url      TEXT,
  logo_url            TEXT,
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default store settings (run once)
INSERT INTO public.store_settings (store_name)
VALUES ('SBR Frozen')
ON CONFLICT DO NOTHING;

-- ============================================================
-- TABLE: products
-- ============================================================
CREATE TABLE IF NOT EXISTS public.products (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name             TEXT NOT NULL,
  category         TEXT DEFAULT 'Umum',
  sku              TEXT UNIQUE NOT NULL,
  unit             TEXT NOT NULL DEFAULT 'Pcs',
  hpp              NUMERIC(15,2) NOT NULL DEFAULT 0,
  price_retail     NUMERIC(15,2) NOT NULL DEFAULT 0,
  price_grosir     NUMERIC(15,2),
  price_horeca     NUMERIC(15,2),
  stock_quantity   NUMERIC(15,3) NOT NULL DEFAULT 0,
  min_stock_alert  NUMERIC(15,3) DEFAULT 5,
  image_url        TEXT,
  is_active        BOOLEAN DEFAULT TRUE,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: customers
-- ============================================================
CREATE TABLE IF NOT EXISTS public.customers (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  phone         TEXT,
  address       TEXT,
  category      TEXT DEFAULT 'retail'
                CHECK (category IN ('retail', 'grosir', 'horeca')),
  credit_limit  NUMERIC(15,2) DEFAULT 0,
  current_debt  NUMERIC(15,2) DEFAULT 0,
  is_active     BOOLEAN DEFAULT TRUE,
  notes         TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: transactions (header)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.transactions (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number          TEXT UNIQUE NOT NULL,
  customer_id             UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  user_id                 UUID NOT NULL REFERENCES public.profiles(id),
  subtotal                NUMERIC(15,2) NOT NULL DEFAULT 0,
  discount_amount         NUMERIC(15,2) DEFAULT 0,
  tax_amount              NUMERIC(15,2) DEFAULT 0,
  total_amount            NUMERIC(15,2) NOT NULL,
  payment_method          TEXT NOT NULL
                          CHECK (payment_method IN ('tunai', 'transfer', 'qris', 'tempo')),
  payment_status          TEXT NOT NULL DEFAULT 'lunas'
                          CHECK (payment_status IN ('lunas', 'piutang')),
  due_date                DATE,
  amount_paid             NUMERIC(15,2) DEFAULT 0,
  notes                   TEXT,
  transaction_type        TEXT DEFAULT 'sale'
                          CHECK (transaction_type IN ('sale', 'retur')),
  original_transaction_id UUID REFERENCES public.transactions(id) ON DELETE SET NULL,
  created_at              TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: transaction_items (detail)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.transaction_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id  UUID NOT NULL REFERENCES public.transactions(id) ON DELETE CASCADE,
  product_id      UUID NOT NULL REFERENCES public.products(id),
  product_name    TEXT NOT NULL,       -- snapshot
  product_sku     TEXT NOT NULL,       -- snapshot
  qty             NUMERIC(15,3) NOT NULL,
  unit            TEXT NOT NULL,
  unit_price      NUMERIC(15,2) NOT NULL,
  hpp_snapshot    NUMERIC(15,2) NOT NULL,  -- CRITICAL: HPP at time of sale
  discount_amount NUMERIC(15,2) DEFAULT 0,
  subtotal        NUMERIC(15,2) NOT NULL
);

-- ============================================================
-- TABLE: expenses
-- ============================================================
CREATE TABLE IF NOT EXISTS public.expenses (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES public.profiles(id),
  category     TEXT NOT NULL DEFAULT 'operasional'
               CHECK (category IN ('operasional', 'logistik', 'sdm', 'lain-lain')),
  amount       NUMERIC(15,2) NOT NULL,
  description  TEXT,
  receipt_url  TEXT,
  expense_date DATE DEFAULT CURRENT_DATE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: stock_adjustments (audit log)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.stock_adjustments (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id   UUID NOT NULL REFERENCES public.products(id),
  user_id      UUID NOT NULL REFERENCES public.profiles(id),
  type         TEXT NOT NULL
               CHECK (type IN ('tambah', 'kurang', 'opname', 'retur_masuk')),
  qty_before   NUMERIC(15,3) NOT NULL,
  qty_change   NUMERIC(15,3) NOT NULL,
  qty_after    NUMERIC(15,3) NOT NULL,
  reason       TEXT,
  reference_id UUID,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: debt_payments (cicilan piutang)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.debt_payments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id  UUID NOT NULL REFERENCES public.transactions(id),
  customer_id     UUID NOT NULL REFERENCES public.customers(id),
  user_id         UUID NOT NULL REFERENCES public.profiles(id),
  amount          NUMERIC(15,2) NOT NULL,
  payment_method  TEXT NOT NULL
                  CHECK (payment_method IN ('tunai', 'transfer', 'qris')),
  notes           TEXT,
  payment_date    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PERFORMANCE INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_transactions_created_at    ON public.transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_customer_id   ON public.transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id       ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_payment_status ON public.transactions(payment_status);
CREATE INDEX IF NOT EXISTS idx_transactions_due_date      ON public.transactions(due_date);
CREATE INDEX IF NOT EXISTS idx_txn_items_transaction_id   ON public.transaction_items(transaction_id);
CREATE INDEX IF NOT EXISTS idx_txn_items_product_id       ON public.transaction_items(product_id);
CREATE INDEX IF NOT EXISTS idx_products_sku               ON public.products(sku);
CREATE INDEX IF NOT EXISTS idx_products_category          ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_is_active         ON public.products(is_active);
CREATE INDEX IF NOT EXISTS idx_expenses_expense_date      ON public.expenses(expense_date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_category          ON public.expenses(category);
CREATE INDEX IF NOT EXISTS idx_stock_adj_product_id       ON public.stock_adjustments(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_adj_created_at       ON public.stock_adjustments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_debt_payments_txn_id       ON public.debt_payments(transaction_id);
CREATE INDEX IF NOT EXISTS idx_debt_payments_customer_id  ON public.debt_payments(customer_id);

-- ============================================================
-- TRIGGERS: auto-update updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER trg_customers_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER trg_store_settings_updated_at
  BEFORE UPDATE ON public.store_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- TRIGGER: auto-create profile on Supabase Auth signup
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, status)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'kasir'),
    'active'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER trg_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE public.profiles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debt_payments    ENABLE ROW LEVEL SECURITY;

-- Helper: get current user's role (stable, cached per query)
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT
LANGUAGE sql SECURITY DEFINER STABLE
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- ============================================================
-- RLS POLICIES: profiles
-- ============================================================
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "profiles_select_admin"
  ON public.profiles FOR SELECT
  USING (public.get_my_role() = 'super_admin');

CREATE POLICY "profiles_insert_admin"
  ON public.profiles FOR INSERT
  WITH CHECK (public.get_my_role() = 'super_admin');

CREATE POLICY "profiles_update_admin"
  ON public.profiles FOR UPDATE
  USING (public.get_my_role() = 'super_admin');

-- ============================================================
-- RLS POLICIES: store_settings
-- ============================================================
CREATE POLICY "store_settings_select_authenticated"
  ON public.store_settings FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "store_settings_update_admin"
  ON public.store_settings FOR UPDATE
  USING (public.get_my_role() = 'super_admin');

-- ============================================================
-- RLS POLICIES: products
-- ============================================================
CREATE POLICY "products_select_authenticated"
  ON public.products FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "products_insert_gudang_admin"
  ON public.products FOR INSERT
  WITH CHECK (public.get_my_role() IN ('super_admin', 'admin_gudang'));

CREATE POLICY "products_update_gudang_admin"
  ON public.products FOR UPDATE
  USING (public.get_my_role() IN ('super_admin', 'admin_gudang'));

CREATE POLICY "products_delete_admin"
  ON public.products FOR DELETE
  USING (public.get_my_role() = 'super_admin');

-- ============================================================
-- RLS POLICIES: customers
-- ============================================================
CREATE POLICY "customers_select_authenticated"
  ON public.customers FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "customers_insert_kasir_admin"
  ON public.customers FOR INSERT
  WITH CHECK (public.get_my_role() IN ('super_admin', 'kasir'));

CREATE POLICY "customers_update_kasir_admin"
  ON public.customers FOR UPDATE
  USING (public.get_my_role() IN ('super_admin', 'kasir'));

CREATE POLICY "customers_delete_admin"
  ON public.customers FOR DELETE
  USING (public.get_my_role() = 'super_admin');

-- ============================================================
-- RLS POLICIES: transactions
-- ============================================================
CREATE POLICY "transactions_select_admin"
  ON public.transactions FOR SELECT
  USING (public.get_my_role() = 'super_admin');

CREATE POLICY "transactions_select_kasir_own"
  ON public.transactions FOR SELECT
  USING (public.get_my_role() = 'kasir' AND user_id = auth.uid());

CREATE POLICY "transactions_select_gudang"
  ON public.transactions FOR SELECT
  USING (public.get_my_role() = 'admin_gudang');

CREATE POLICY "transactions_insert_kasir_admin"
  ON public.transactions FOR INSERT
  WITH CHECK (public.get_my_role() IN ('super_admin', 'kasir') AND user_id = auth.uid());

CREATE POLICY "transactions_update_admin"
  ON public.transactions FOR UPDATE
  USING (public.get_my_role() = 'super_admin');

-- ============================================================
-- RLS POLICIES: transaction_items
-- ============================================================
CREATE POLICY "txn_items_select_admin"
  ON public.transaction_items FOR SELECT
  USING (public.get_my_role() = 'super_admin');

CREATE POLICY "txn_items_select_kasir_own"
  ON public.transaction_items FOR SELECT
  USING (
    public.get_my_role() = 'kasir' AND
    EXISTS (
      SELECT 1 FROM public.transactions t
      WHERE t.id = transaction_id AND t.user_id = auth.uid()
    )
  );

CREATE POLICY "txn_items_insert_kasir_admin"
  ON public.transaction_items FOR INSERT
  WITH CHECK (public.get_my_role() IN ('super_admin', 'kasir'));

-- ============================================================
-- RLS POLICIES: expenses
-- ============================================================
CREATE POLICY "expenses_all_admin"
  ON public.expenses FOR ALL
  USING (public.get_my_role() = 'super_admin');

-- ============================================================
-- RLS POLICIES: stock_adjustments
-- ============================================================
CREATE POLICY "stock_adj_all_gudang_admin"
  ON public.stock_adjustments FOR ALL
  USING (public.get_my_role() IN ('super_admin', 'admin_gudang'));

-- ============================================================
-- RLS POLICIES: debt_payments
-- ============================================================
CREATE POLICY "debt_payments_all_admin"
  ON public.debt_payments FOR ALL
  USING (public.get_my_role() = 'super_admin');

CREATE POLICY "debt_payments_select_kasir"
  ON public.debt_payments FOR SELECT
  USING (public.get_my_role() = 'kasir');

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================
-- Run in Supabase Dashboard > Storage, or via SQL:
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('receipts', 'receipts', false),
  ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "receipts_upload_admin"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'receipts' AND auth.role() = 'authenticated');

CREATE POLICY "receipts_read_admin"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'receipts' AND auth.role() = 'authenticated');

CREATE POLICY "products_upload_gudang"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'products' AND auth.role() = 'authenticated');

CREATE POLICY "products_read_public"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'products');
