-- ============================================================
-- SBR POS SYSTEM — Database Migration v1.7.0
-- Fix Inventory & Branch triggers
-- ============================================================

-- 1. Create trigger to auto-create a default warehouse when a new branch is created
CREATE OR REPLACE FUNCTION public.auto_create_warehouse_for_branch()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.warehouses (branch_id, name)
  VALUES (NEW.id, 'Gudang ' || NEW.name);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_auto_create_warehouse ON public.branches;
CREATE TRIGGER trg_auto_create_warehouse
  AFTER INSERT ON public.branches
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_create_warehouse_for_branch();

-- 2. Fix the product_stocks trigger to use warehouses instead of branches
CREATE OR REPLACE FUNCTION public.auto_create_product_stocks()
RETURNS trigger AS $$
DECLARE
  wh_record RECORD;
BEGIN
  -- Loop through all existing warehouses
  FOR wh_record IN SELECT id FROM public.warehouses LOOP
    INSERT INTO public.product_stocks (product_id, warehouse_id, stock_quantity, min_stock_alert)
    VALUES (NEW.id, wh_record.id, 0, COALESCE(NEW.min_stock_alert, 5))
    ON CONFLICT (product_id, warehouse_id) DO NOTHING;
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- The trigger definition itself remains the same, but the function body is now correct.
-- DROP TRIGGER IF EXISTS trg_auto_create_product_stocks ON public.products;
-- CREATE TRIGGER trg_auto_create_product_stocks
--   AFTER INSERT ON public.products
--   FOR EACH ROW
--   EXECUTE FUNCTION public.auto_create_product_stocks();

-- 3. Data cleanup / Auto-fix missing default warehouses for existing branches
DO $$
DECLARE
  branch_record RECORD;
BEGIN
  FOR branch_record IN SELECT id, name FROM public.branches LOOP
    IF NOT EXISTS (SELECT 1 FROM public.warehouses WHERE branch_id = branch_record.id) THEN
      INSERT INTO public.warehouses (branch_id, name)
      VALUES (branch_record.id, 'Gudang ' || branch_record.name);
    END IF;
  END LOOP;
END $$;

-- 4. Data cleanup / Auto-fix missing product_stocks for existing products and warehouses
DO $$
DECLARE
  product_record RECORD;
  wh_record RECORD;
BEGIN
  FOR product_record IN SELECT id, min_stock_alert FROM public.products LOOP
    FOR wh_record IN SELECT id FROM public.warehouses LOOP
      INSERT INTO public.product_stocks (product_id, warehouse_id, stock_quantity, min_stock_alert)
      VALUES (product_record.id, wh_record.id, 0, COALESCE(product_record.min_stock_alert, 5))
      ON CONFLICT (product_id, warehouse_id) DO NOTHING;
    END LOOP;
  END LOOP;
END $$;
