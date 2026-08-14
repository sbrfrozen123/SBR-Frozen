-- 1. Pastikan tabel bisa di-INSERT oleh admin (jika data kosong)
CREATE POLICY "store_settings_insert_admin"
  ON public.store_settings FOR INSERT
  WITH CHECK (public.get_my_role() = 'super_admin');

-- 2. Pastikan ada minimal 1 baris pengaturan toko
INSERT INTO public.store_settings (store_name)
SELECT 'SBR Frozen'
WHERE NOT EXISTS (SELECT 1 FROM public.store_settings);
