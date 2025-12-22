-- Create posts table for blog articles
CREATE TABLE public.posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT,
  excerpt TEXT,
  thumbnail_url TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  seo_title TEXT,
  seo_description TEXT,
  seo_keyword TEXT,
  schema_json TEXT,
  author_id UUID REFERENCES auth.users(id),
  deleted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Posts are viewable by everyone" 
ON public.posts 
FOR SELECT 
USING (deleted_at IS NULL);

CREATE POLICY "Admins can insert posts" 
ON public.posts 
FOR INSERT 
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update posts" 
ON public.posts 
FOR UPDATE 
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete posts" 
ON public.posts 
FOR DELETE 
USING (is_admin(auth.uid()));

-- Create trigger for updated_at
CREATE TRIGGER update_posts_updated_at
BEFORE UPDATE ON public.posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add deleted_at column to existing tables for soft delete
ALTER TABLE public.movies ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.genres ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.countries ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.years ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.tags ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.directors ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.actors ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- Update RLS policies for movies to exclude soft deleted
DROP POLICY IF EXISTS "Movies are viewable by everyone" ON public.movies;
CREATE POLICY "Movies are viewable by everyone" 
ON public.movies 
FOR SELECT 
USING (deleted_at IS NULL OR is_admin(auth.uid()));

-- Update RLS policies for genres
DROP POLICY IF EXISTS "Genres are viewable by everyone" ON public.genres;
CREATE POLICY "Genres are viewable by everyone" 
ON public.genres 
FOR SELECT 
USING (deleted_at IS NULL OR is_admin(auth.uid()));

-- Update RLS policies for countries
DROP POLICY IF EXISTS "Countries are viewable by everyone" ON public.countries;
CREATE POLICY "Countries are viewable by everyone" 
ON public.countries 
FOR SELECT 
USING (deleted_at IS NULL OR is_admin(auth.uid()));

-- Update RLS policies for years
DROP POLICY IF EXISTS "Years are viewable by everyone" ON public.years;
CREATE POLICY "Years are viewable by everyone" 
ON public.years 
FOR SELECT 
USING (deleted_at IS NULL OR is_admin(auth.uid()));

-- Update RLS policies for tags
DROP POLICY IF EXISTS "Tags are viewable by everyone" ON public.tags;
CREATE POLICY "Tags are viewable by everyone" 
ON public.tags 
FOR SELECT 
USING (deleted_at IS NULL OR is_admin(auth.uid()));

-- Update RLS policies for directors
DROP POLICY IF EXISTS "Directors are viewable by everyone" ON public.directors;
CREATE POLICY "Directors are viewable by everyone" 
ON public.directors 
FOR SELECT 
USING (deleted_at IS NULL OR is_admin(auth.uid()));

-- Update RLS policies for actors
DROP POLICY IF EXISTS "Actors are viewable by everyone" ON public.actors;
CREATE POLICY "Actors are viewable by everyone" 
ON public.actors 
FOR SELECT 
USING (deleted_at IS NULL OR is_admin(auth.uid()));