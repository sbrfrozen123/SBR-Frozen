-- ============================================================
-- Sync Auth Users to Profiles
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Create or replace the function to handle new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS 
BEGIN
  INSERT INTO public.profiles (id, full_name, role, email)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', 'User Baru'),
    COALESCE(new.raw_user_meta_data->>'role', 'kasir'),
    new.email
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name;
  RETURN new;
END;
;

-- 2. Create the trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Sync existing users that are in auth.users but missing from public.profiles
INSERT INTO public.profiles (id, full_name, role, email)
SELECT 
  id, 
  COALESCE(raw_user_meta_data->>'full_name', 'User Baru'), 
  COALESCE(raw_user_meta_data->>'role', 'kasir'), 
  email
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;

-- 4. Update emails for existing profiles just in case
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id AND p.email IS NULL;
