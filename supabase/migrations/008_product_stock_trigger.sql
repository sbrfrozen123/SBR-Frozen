-- ============================================================
-- SBR POS SYSTEM — Database Migration v1.4.0
-- Auto-sync Product Stocks to all branches
-- ============================================================

-- Create a function to auto-populate product_stocks for all branches
CREATE OR REPLACE FUNCTION public.auto_create_product_stocks()
RETURNS trigger AS $$
DECLARE
  branch_record RECORD;
BEGIN
  -- Loop through all existing branches
  FOR branch_record IN SELECT id FROM public.branches LOOP
    INSERT INTO public.product_stocks (product_id, branch_id, stock_quantity, min_stock_alert)
    VALUES (NEW.id, branch_record.id, 0, COALESCE(NEW.min_stock_alert, 5))
    ON CONFLICT (product_id, branch_id) DO NOTHING;
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger on the products table
DROP TRIGGER IF EXISTS trg_auto_create_product_stocks ON public.products;
CREATE TRIGGER trg_auto_create_product_stocks
  AFTER INSERT ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_create_product_stocks();
