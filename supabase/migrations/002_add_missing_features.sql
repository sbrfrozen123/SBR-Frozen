-- ============================================================
-- SBR POS SYSTEM — Database Migration v1.0.1
-- Add Missing Features: Categories, Suppliers, Purchases, Shifts
-- ============================================================

-- ============================================================
-- TABLE: categories
-- ============================================================
CREATE TABLE IF NOT EXISTS public.categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: suppliers
-- ============================================================
CREATE TABLE IF NOT EXISTS public.suppliers (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name           TEXT NOT NULL,
  contact_person TEXT,
  phone          TEXT,
  address        TEXT,
  is_active      BOOLEAN DEFAULT TRUE,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: purchases (Restock/Pembelian)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.purchases (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT UNIQUE NOT NULL,
  supplier_id    UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
  user_id        UUID NOT NULL REFERENCES public.profiles(id),
  total_amount   NUMERIC(15,2) NOT NULL DEFAULT 0,
  payment_status TEXT NOT NULL DEFAULT 'lunas'
                 CHECK (payment_status IN ('lunas', 'tempo')),
  purchase_date  DATE DEFAULT CURRENT_DATE,
  notes          TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: purchase_items (Detail Pembelian)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.purchase_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_id UUID NOT NULL REFERENCES public.purchases(id) ON DELETE CASCADE,
  product_id  UUID NOT NULL REFERENCES public.products(id),
  qty         NUMERIC(15,3) NOT NULL,
  unit_price  NUMERIC(15,2) NOT NULL,
  subtotal    NUMERIC(15,2) NOT NULL
);

-- ============================================================
-- TABLE: cashier_shifts
-- ============================================================
CREATE TABLE IF NOT EXISTS public.cashier_shifts (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID NOT NULL REFERENCES public.profiles(id),
  start_time         TIMESTAMPTZ DEFAULT NOW(),
  end_time           TIMESTAMPTZ,
  starting_cash      NUMERIC(15,2) NOT NULL DEFAULT 0,
  ending_cash_system NUMERIC(15,2),
  ending_cash_actual NUMERIC(15,2),
  status             TEXT NOT NULL DEFAULT 'open'
                     CHECK (status IN ('open', 'closed')),
  notes              TEXT,
  created_at         TIMESTAMPTZ DEFAULT NOW(),
  updated_at         TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TRIGGERS: auto-update updated_at
-- ============================================================
CREATE OR REPLACE TRIGGER trg_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER trg_suppliers_updated_at
  BEFORE UPDATE ON public.suppliers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER trg_purchases_updated_at
  BEFORE UPDATE ON public.purchases
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER trg_cashier_shifts_updated_at
  BEFORE UPDATE ON public.cashier_shifts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE public.categories     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cashier_shifts ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS POLICIES: categories
-- ============================================================
CREATE POLICY "categories_select_authenticated"
  ON public.categories FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "categories_all_admin"
  ON public.categories FOR ALL
  USING (public.get_my_role() = 'super_admin');

-- ============================================================
-- RLS POLICIES: suppliers
-- ============================================================
CREATE POLICY "suppliers_select_authenticated"
  ON public.suppliers FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "suppliers_all_admin"
  ON public.suppliers FOR ALL
  USING (public.get_my_role() IN ('super_admin', 'admin_gudang'));

-- ============================================================
-- RLS POLICIES: purchases
-- ============================================================
CREATE POLICY "purchases_select_authenticated"
  ON public.purchases FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "purchases_insert_admin_gudang"
  ON public.purchases FOR INSERT
  WITH CHECK (public.get_my_role() IN ('super_admin', 'admin_gudang'));

CREATE POLICY "purchases_update_admin_gudang"
  ON public.purchases FOR UPDATE
  USING (public.get_my_role() IN ('super_admin', 'admin_gudang'));

-- ============================================================
-- RLS POLICIES: purchase_items
-- ============================================================
CREATE POLICY "purchase_items_select_authenticated"
  ON public.purchase_items FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "purchase_items_insert_admin_gudang"
  ON public.purchase_items FOR INSERT
  WITH CHECK (public.get_my_role() IN ('super_admin', 'admin_gudang'));

CREATE POLICY "purchase_items_update_admin_gudang"
  ON public.purchase_items FOR UPDATE
  USING (public.get_my_role() IN ('super_admin', 'admin_gudang'));

-- ============================================================
-- RLS POLICIES: cashier_shifts
-- ============================================================
CREATE POLICY "shifts_select_admin"
  ON public.cashier_shifts FOR SELECT
  USING (public.get_my_role() = 'super_admin');

CREATE POLICY "shifts_select_kasir_own"
  ON public.cashier_shifts FOR SELECT
  USING (public.get_my_role() = 'kasir' AND user_id = auth.uid());

CREATE POLICY "shifts_insert_kasir"
  ON public.cashier_shifts FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "shifts_update_kasir_own"
  ON public.cashier_shifts FOR UPDATE
  USING (user_id = auth.uid());
