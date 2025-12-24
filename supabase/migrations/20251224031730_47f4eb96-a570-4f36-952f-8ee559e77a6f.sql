-- Create table for homepage widgets
CREATE TABLE public.homepage_widgets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  static_path TEXT,
  widget_type TEXT NOT NULL DEFAULT 'carousel', -- 'carousel' or 'slider'
  status_filter TEXT[] DEFAULT ARRAY['all'], -- 'all', 'ongoing', 'completed'
  category_ids UUID[] DEFAULT '{}',
  category_exclude BOOLEAN DEFAULT false,
  genre_ids UUID[] DEFAULT '{}',
  genre_exclude BOOLEAN DEFAULT false,
  country_ids UUID[] DEFAULT '{}',
  country_exclude BOOLEAN DEFAULT false,
  year_ids UUID[] DEFAULT '{}',
  year_exclude BOOLEAN DEFAULT false,
  sort_by TEXT NOT NULL DEFAULT 'updated_at', -- 'created_at', 'updated_at', 'view_count', 'rating', 'random'
  posts_count INTEGER NOT NULL DEFAULT 12,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for site settings
CREATE TABLE public.site_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value TEXT,
  setting_type TEXT NOT NULL DEFAULT 'text', -- 'text', 'html', 'image', 'json'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.homepage_widgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for homepage_widgets
CREATE POLICY "Widgets are viewable by everyone"
ON public.homepage_widgets
FOR SELECT
USING (is_active = true OR is_admin(auth.uid()));

CREATE POLICY "Admins can insert widgets"
ON public.homepage_widgets
FOR INSERT
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update widgets"
ON public.homepage_widgets
FOR UPDATE
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete widgets"
ON public.homepage_widgets
FOR DELETE
USING (is_admin(auth.uid()));

-- RLS Policies for site_settings
CREATE POLICY "Site settings are viewable by everyone"
ON public.site_settings
FOR SELECT
USING (true);

CREATE POLICY "Admins can insert site settings"
ON public.site_settings
FOR INSERT
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update site settings"
ON public.site_settings
FOR UPDATE
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete site settings"
ON public.site_settings
FOR DELETE
USING (is_admin(auth.uid()));

-- Create trigger for updated_at
CREATE TRIGGER update_homepage_widgets_updated_at
BEFORE UPDATE ON public.homepage_widgets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_site_settings_updated_at
BEFORE UPDATE ON public.site_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default site settings
INSERT INTO public.site_settings (setting_key, setting_value, setting_type) VALUES
('logo_url', NULL, 'image'),
('favicon_url', NULL, 'image'),
('head_html', NULL, 'html'),
('footer_html', NULL, 'html');