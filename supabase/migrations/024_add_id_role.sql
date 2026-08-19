-- Tambahkan kolom id_role untuk menyimpan ID karyawan/Role kustom
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS id_role TEXT;
