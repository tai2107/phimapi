-- Create table for global SEO settings
CREATE TABLE public.seo_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key text NOT NULL UNIQUE,
  setting_value text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.seo_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "SEO settings are viewable by everyone" 
ON public.seo_settings 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can insert seo settings" 
ON public.seo_settings 
FOR INSERT 
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update seo settings" 
ON public.seo_settings 
FOR UPDATE 
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete seo settings" 
ON public.seo_settings 
FOR DELETE 
USING (is_admin(auth.uid()));

-- Create trigger for updated_at
CREATE TRIGGER update_seo_settings_updated_at
BEFORE UPDATE ON public.seo_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create table for media SEO metadata
CREATE TABLE public.media_seo (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  file_path text NOT NULL UNIQUE,
  alt_text text,
  title text,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.media_seo ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Media SEO is viewable by everyone" 
ON public.media_seo 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can insert media seo" 
ON public.media_seo 
FOR INSERT 
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update media seo" 
ON public.media_seo 
FOR UPDATE 
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete media seo" 
ON public.media_seo 
FOR DELETE 
USING (is_admin(auth.uid()));