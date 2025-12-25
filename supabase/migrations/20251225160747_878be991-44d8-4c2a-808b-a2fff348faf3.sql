-- Movie Ratings table
CREATE TABLE public.movie_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  movie_id UUID NOT NULL REFERENCES public.movies(id) ON DELETE CASCADE,
  ip_hash TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(movie_id, ip_hash)
);

-- Enable RLS
ALTER TABLE public.movie_ratings ENABLE ROW LEVEL SECURITY;

-- Everyone can view ratings
CREATE POLICY "Ratings are viewable by everyone" ON public.movie_ratings FOR SELECT USING (true);

-- Everyone can insert ratings (anonymous)
CREATE POLICY "Anyone can rate movies" ON public.movie_ratings FOR INSERT WITH CHECK (true);

-- Update for existing user
CREATE POLICY "Anyone can update their rating" ON public.movie_ratings FOR UPDATE USING (true);

-- Advertisements table
CREATE TABLE public.advertisements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  ad_type TEXT NOT NULL DEFAULT 'banner', -- banner, popup, popunder
  position TEXT NOT NULL DEFAULT 'header', -- header, footer, sidebar, player
  content TEXT NOT NULL, -- script or iframe code
  is_active BOOLEAN NOT NULL DEFAULT true,
  pages TEXT[] DEFAULT ARRAY['all'], -- all, home, movie, tv, search
  display_order INTEGER NOT NULL DEFAULT 0,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.advertisements ENABLE ROW LEVEL SECURITY;

-- Ads viewable by everyone (for display)
CREATE POLICY "Ads are viewable by everyone" ON public.advertisements FOR SELECT USING (true);

-- Admins can manage ads
CREATE POLICY "Admins can insert ads" ON public.advertisements FOR INSERT WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "Admins can update ads" ON public.advertisements FOR UPDATE USING (is_admin(auth.uid()));
CREATE POLICY "Admins can delete ads" ON public.advertisements FOR DELETE USING (is_admin(auth.uid()));

-- Movie Subtitles table
CREATE TABLE public.movie_subtitles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  movie_id UUID NOT NULL REFERENCES public.movies(id) ON DELETE CASCADE,
  episode_id UUID REFERENCES public.episodes(id) ON DELETE CASCADE,
  language TEXT NOT NULL DEFAULT 'vi',
  label TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL DEFAULT 'vtt', -- vtt, srt
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.movie_subtitles ENABLE ROW LEVEL SECURITY;

-- Subtitles viewable by everyone
CREATE POLICY "Subtitles are viewable by everyone" ON public.movie_subtitles FOR SELECT USING (true);

-- Admins can manage subtitles
CREATE POLICY "Admins can insert subtitles" ON public.movie_subtitles FOR INSERT WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "Admins can update subtitles" ON public.movie_subtitles FOR UPDATE USING (is_admin(auth.uid()));
CREATE POLICY "Admins can delete subtitles" ON public.movie_subtitles FOR DELETE USING (is_admin(auth.uid()));

-- Add theme settings
INSERT INTO site_settings (setting_key, setting_value, setting_type) VALUES
  ('theme_primary_color', '#e11d48', 'text'),
  ('theme_font_family', 'Be Vietnam Pro', 'text'),
  ('site_language', 'vi', 'text')
ON CONFLICT (setting_key) DO NOTHING;

-- Create trigger for updated_at
CREATE TRIGGER update_advertisements_updated_at
  BEFORE UPDATE ON public.advertisements
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();