-- Create movie_categories table
CREATE TABLE public.movie_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  seo_title TEXT,
  seo_description TEXT,
  seo_keyword TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.movie_categories ENABLE ROW LEVEL SECURITY;

-- RLS policies for movie_categories
CREATE POLICY "Movie categories are viewable by everyone" 
ON public.movie_categories FOR SELECT 
USING ((deleted_at IS NULL) OR is_admin(auth.uid()));

CREATE POLICY "Admins can insert movie categories" 
ON public.movie_categories FOR INSERT 
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update movie categories" 
ON public.movie_categories FOR UPDATE 
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete movie categories" 
ON public.movie_categories FOR DELETE 
USING (is_admin(auth.uid()));

-- Create movie_category_map junction table
CREATE TABLE public.movie_category_map (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  movie_id UUID NOT NULL REFERENCES public.movies(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.movie_categories(id) ON DELETE CASCADE,
  UNIQUE(movie_id, category_id)
);

-- Enable RLS
ALTER TABLE public.movie_category_map ENABLE ROW LEVEL SECURITY;

-- RLS policies for movie_category_map
CREATE POLICY "Movie category map is viewable by everyone" 
ON public.movie_category_map FOR SELECT 
USING (true);

CREATE POLICY "Admins can insert movie category map" 
ON public.movie_category_map FOR INSERT 
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can delete movie category map" 
ON public.movie_category_map FOR DELETE 
USING (is_admin(auth.uid()));

-- Insert default movie categories
INSERT INTO public.movie_categories (name, slug) VALUES 
  ('Phim bộ', 'phim-bo'),
  ('Phim lẻ', 'phim-le'),
  ('Phim hoạt hình', 'phim-hoat-hinh');

-- Create tv_channel_categories table
CREATE TABLE public.tv_channel_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.tv_channel_categories ENABLE ROW LEVEL SECURITY;

-- RLS policies for tv_channel_categories
CREATE POLICY "TV channel categories are viewable by everyone" 
ON public.tv_channel_categories FOR SELECT 
USING ((deleted_at IS NULL) OR is_admin(auth.uid()));

CREATE POLICY "Admins can insert tv channel categories" 
ON public.tv_channel_categories FOR INSERT 
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update tv channel categories" 
ON public.tv_channel_categories FOR UPDATE 
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete tv channel categories" 
ON public.tv_channel_categories FOR DELETE 
USING (is_admin(auth.uid()));

-- Create tv_channels table
CREATE TABLE public.tv_channels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  logo_url TEXT,
  category_id UUID REFERENCES public.tv_channel_categories(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  schedule_code TEXT,
  streaming_sources JSONB NOT NULL DEFAULT '[]'::jsonb,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.tv_channels ENABLE ROW LEVEL SECURITY;

-- RLS policies for tv_channels
CREATE POLICY "TV channels are viewable by everyone" 
ON public.tv_channels FOR SELECT 
USING ((deleted_at IS NULL AND is_active = true) OR is_admin(auth.uid()));

CREATE POLICY "Admins can insert tv channels" 
ON public.tv_channels FOR INSERT 
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update tv channels" 
ON public.tv_channels FOR UPDATE 
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete tv channels" 
ON public.tv_channels FOR DELETE 
USING (is_admin(auth.uid()));

-- Create trigger for tv_channels updated_at
CREATE TRIGGER update_tv_channels_updated_at
BEFORE UPDATE ON public.tv_channels
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();