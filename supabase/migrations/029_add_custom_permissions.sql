-- Add custom_permissions to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS custom_permissions text[] DEFAULT '{}'::text[];
