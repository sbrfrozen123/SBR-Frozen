-- Migration: Add logo and social media to store settings

ALTER TABLE public.store_settings
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS social_instagram TEXT,
ADD COLUMN IF NOT EXISTS store_website TEXT;
