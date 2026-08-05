-- Migration: Add missing columns and keywords to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS fabric_details JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS seo_details JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS keywords TEXT[] DEFAULT '{}'::text[];
