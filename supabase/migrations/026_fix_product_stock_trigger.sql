-- Update the trigger function to use warehouses instead of branches
CREATE OR REPLACE FUNCTION public.auto_create_product_stocks()
RETURNS trigger AS $$
DECLARE
  warehouse_record RECORD;
BEGIN
  -- Loop through all existing warehouses
  FOR warehouse_record IN SELECT id FROM public.warehouses LOOP
    INSERT INTO public.product_stocks (product_id, warehouse_id, stock_quantity)
    VALUES (NEW.id, warehouse_record.id, 0)
    ON CONFLICT (product_id, warehouse_id) DO NOTHING;
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
