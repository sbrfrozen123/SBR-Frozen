-- Menambahkan warehouse_id ke stock_adjustments untuk pelacakan per gudang
ALTER TABLE public.stock_adjustments 
ADD COLUMN IF NOT EXISTS warehouse_id UUID REFERENCES public.warehouses(id);

-- Migrasi data awal (opsional jika dibutuhkan, asumsikan default warehouse untuk setiap branch)
-- UPDATE public.stock_adjustments sa
-- SET warehouse_id = (SELECT w.id FROM public.warehouses w WHERE w.branch_id = sa.branch_id LIMIT 1)
-- WHERE sa.warehouse_id IS NULL AND sa.branch_id IS NOT NULL;
