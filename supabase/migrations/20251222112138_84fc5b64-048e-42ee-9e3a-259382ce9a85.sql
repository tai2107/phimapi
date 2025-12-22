-- Add SEO columns to movies table
ALTER TABLE public.movies ADD COLUMN IF NOT EXISTS seo_title text NULL;
ALTER TABLE public.movies ADD COLUMN IF NOT EXISTS seo_description text NULL;
ALTER TABLE public.movies ADD COLUMN IF NOT EXISTS seo_keyword text NULL;
ALTER TABLE public.movies ADD COLUMN IF NOT EXISTS schema_json text NULL;

-- Add SEO columns to genres table
ALTER TABLE public.genres ADD COLUMN IF NOT EXISTS seo_title text NULL;
ALTER TABLE public.genres ADD COLUMN IF NOT EXISTS seo_description text NULL;
ALTER TABLE public.genres ADD COLUMN IF NOT EXISTS seo_keyword text NULL;

-- Add SEO columns to countries table
ALTER TABLE public.countries ADD COLUMN IF NOT EXISTS seo_title text NULL;
ALTER TABLE public.countries ADD COLUMN IF NOT EXISTS seo_description text NULL;
ALTER TABLE public.countries ADD COLUMN IF NOT EXISTS seo_keyword text NULL;

-- Add SEO columns to tags table
ALTER TABLE public.tags ADD COLUMN IF NOT EXISTS seo_title text NULL;
ALTER TABLE public.tags ADD COLUMN IF NOT EXISTS seo_description text NULL;
ALTER TABLE public.tags ADD COLUMN IF NOT EXISTS seo_keyword text NULL;

-- Add SEO columns to directors table
ALTER TABLE public.directors ADD COLUMN IF NOT EXISTS seo_title text NULL;
ALTER TABLE public.directors ADD COLUMN IF NOT EXISTS seo_description text NULL;
ALTER TABLE public.directors ADD COLUMN IF NOT EXISTS seo_keyword text NULL;

-- Add SEO columns to actors table
ALTER TABLE public.actors ADD COLUMN IF NOT EXISTS seo_title text NULL;
ALTER TABLE public.actors ADD COLUMN IF NOT EXISTS seo_description text NULL;
ALTER TABLE public.actors ADD COLUMN IF NOT EXISTS seo_keyword text NULL;