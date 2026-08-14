-- ============================================================
-- SBR FROZEN POS - UNITS MIGRATION
-- ============================================================

-- 1. Create Units Table
CREATE TABLE IF NOT EXISTS public.units (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;

-- 2. Create RLS Policies
-- Everyone can read units
CREATE POLICY "units_select_all"
  ON public.units FOR SELECT
  USING (true);

-- Only Super Admin and Admin Gudang can insert/update/delete units
CREATE POLICY "units_insert_admin"
  ON public.units FOR INSERT
  WITH CHECK (public.get_my_role() IN ('super_admin', 'admin_gudang'));

CREATE POLICY "units_update_admin"
  ON public.units FOR UPDATE
  USING (public.get_my_role() IN ('super_admin', 'admin_gudang'));

CREATE POLICY "units_delete_admin"
  ON public.units FOR DELETE
  USING (public.get_my_role() IN ('super_admin', 'admin_gudang'));

-- 3. Insert Default Units
INSERT INTO public.units (name, description) VALUES
  ('Pcs', 'Pieces / Satuan Terkecil'),
  ('Kg', 'Kilogram'),
  ('Gram', 'Gram'),
  ('Pack', 'Kemasan Pack'),
  ('Dus', 'Kemasan Kardus/Karton')
ON CONFLICT (name) DO NOTHING;
