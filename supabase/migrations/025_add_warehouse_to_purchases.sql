-- Add warehouse_id to purchases table
ALTER TABLE public.purchases ADD COLUMN IF NOT EXISTS warehouse_id UUID REFERENCES public.warehouses(id);

-- Optional: if you want to set a default warehouse based on branch_id for existing rows
-- UPDATE public.purchases p SET warehouse_id = (SELECT w.id FROM public.warehouses w WHERE w.branch_id = p.branch_id LIMIT 1) WHERE p.warehouse_id IS NULL;

-- If we enforce NOT NULL in the future, we need to ensure all rows have warehouse_id. 
-- For now, we leave it nullable so it doesn't break existing data without warehouses.
