-- ============================================================
-- SBR POS SYSTEM — Database Migration v1.3.1
-- Fixes RLS policies to allow admin_gudang to manage categories
-- ============================================================

DROP POLICY IF EXISTS "categories_all_admin" ON public.categories;

CREATE POLICY "categories_all_admin"
  ON public.categories FOR ALL
  USING (public.get_my_role() IN ('super_admin', 'admin_gudang'));
