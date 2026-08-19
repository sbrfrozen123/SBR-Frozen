-- ============================================================
-- SBR POS SYSTEM — Database Migration v1.6.0
-- Advanced Inventory: Warehouses, Batches, Transfers, Barcode
-- ============================================================

-- 1. Add Barcode to Products & Reset Data
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS barcode TEXT UNIQUE;

-- As requested, TRUNCATE products to reset data for Barcode input
-- This will CASCADE and delete transaction items and product_stocks!
TRUNCATE TABLE public.products CASCADE;

-- 2. Add Logo URL to Branches
ALTER TABLE public.branches ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- 3. Create Warehouses Table
CREATE TABLE IF NOT EXISTS public.warehouses (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id   UUID REFERENCES public.branches(id) ON DELETE SET NULL, -- Can be null if it's a central standalone warehouse
  name        TEXT NOT NULL,
  address     TEXT,
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger for updated_at
CREATE OR REPLACE TRIGGER trg_warehouses_updated_at
  BEFORE UPDATE ON public.warehouses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS for Warehouses
ALTER TABLE public.warehouses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "warehouses_select_auth" ON public.warehouses FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "warehouses_all_admin" ON public.warehouses FOR ALL USING (public.get_my_role() IN ('super_admin', 'admin_gudang'));

-- Create Default Warehouses for existing Branches
DO $$
DECLARE
  branch_record RECORD;
  new_warehouse_id UUID;
BEGIN
  FOR branch_record IN SELECT id, name FROM public.branches LOOP
    IF NOT EXISTS (SELECT 1 FROM public.warehouses WHERE branch_id = branch_record.id) THEN
      INSERT INTO public.warehouses (branch_id, name)
      VALUES (branch_record.id, 'Gudang ' || branch_record.name)
      RETURNING id INTO new_warehouse_id;
    END IF;
  END LOOP;
END $$;

-- 4. Update Product Stocks to use Warehouse instead of Branch
-- We will add warehouse_id, update it, drop branch_id, and recreate the unique constraint.
ALTER TABLE public.product_stocks ADD COLUMN IF NOT EXISTS warehouse_id UUID REFERENCES public.warehouses(id) ON DELETE CASCADE;

-- Migrate existing stock to the default warehouse of that branch
UPDATE public.product_stocks ps
SET warehouse_id = (SELECT id FROM public.warehouses w WHERE w.branch_id = ps.branch_id LIMIT 1)
WHERE ps.warehouse_id IS NULL;

-- Make warehouse_id NOT NULL
ALTER TABLE public.product_stocks ALTER COLUMN warehouse_id SET NOT NULL;

-- Drop old constraint and column
ALTER TABLE public.product_stocks DROP CONSTRAINT IF EXISTS product_stocks_product_id_branch_id_key;
ALTER TABLE public.product_stocks DROP COLUMN IF EXISTS branch_id;

-- Add new constraint
ALTER TABLE public.product_stocks ADD CONSTRAINT product_stocks_product_id_warehouse_id_key UNIQUE(product_id, warehouse_id);


-- 5. Product Batches (For Expiration Date & FIFO Tracking)
CREATE TABLE IF NOT EXISTS public.product_batches (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id      UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  warehouse_id    UUID NOT NULL REFERENCES public.warehouses(id) ON DELETE CASCADE,
  batch_number    TEXT,
  stock_quantity  NUMERIC(15,3) NOT NULL DEFAULT 0,
  production_date DATE,
  exp_date        DATE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE TRIGGER trg_product_batches_updated_at
  BEFORE UPDATE ON public.product_batches
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.product_batches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "product_batches_select_auth" ON public.product_batches FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "product_batches_all_admin" ON public.product_batches FOR ALL USING (public.get_my_role() IN ('super_admin', 'admin_gudang'));


-- 6. Stock Transfers (Antar Gudang)
CREATE TABLE IF NOT EXISTS public.stock_transfers (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_number    TEXT UNIQUE NOT NULL,
  from_warehouse_id   UUID NOT NULL REFERENCES public.warehouses(id),
  to_warehouse_id     UUID NOT NULL REFERENCES public.warehouses(id),
  user_id             UUID NOT NULL REFERENCES public.profiles(id), -- Creator
  received_by         UUID REFERENCES public.profiles(id), -- Receiver
  status              TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_transit', 'completed', 'cancelled')),
  transfer_date       TIMESTAMPTZ DEFAULT NOW(),
  receive_date        TIMESTAMPTZ,
  notes               TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE TRIGGER trg_stock_transfers_updated_at
  BEFORE UPDATE ON public.stock_transfers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.stock_transfers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "stock_transfers_select_auth" ON public.stock_transfers FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "stock_transfers_all_admin" ON public.stock_transfers FOR ALL USING (public.get_my_role() IN ('super_admin', 'admin_gudang'));

-- 7. Stock Transfer Items
CREATE TABLE IF NOT EXISTS public.stock_transfer_items (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transfer_id         UUID NOT NULL REFERENCES public.stock_transfers(id) ON DELETE CASCADE,
  product_id          UUID NOT NULL REFERENCES public.products(id),
  batch_id            UUID REFERENCES public.product_batches(id), -- Optional: specific batch transferred
  qty_sent            NUMERIC(15,3) NOT NULL,
  qty_received        NUMERIC(15,3) DEFAULT 0,
  notes               TEXT
);

ALTER TABLE public.stock_transfer_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "stock_transfer_items_select_auth" ON public.stock_transfer_items FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "stock_transfer_items_all_admin" ON public.stock_transfer_items FOR ALL USING (public.get_my_role() IN ('super_admin', 'admin_gudang'));
