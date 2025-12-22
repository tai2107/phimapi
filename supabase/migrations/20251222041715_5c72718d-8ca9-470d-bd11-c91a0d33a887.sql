-- Create enum for specific permissions
CREATE TYPE public.user_permission AS ENUM (
  'crawl_movies',
  'manage_movies', 
  'manage_categories',
  'manage_menus',
  'access_settings'
);

-- Create user_permissions table
CREATE TABLE public.user_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  permission user_permission NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, permission)
);

-- Enable RLS
ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;

-- Security definer function to check permission
CREATE OR REPLACE FUNCTION public.has_permission(_user_id uuid, _permission user_permission)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_permissions
    WHERE user_id = _user_id AND permission = _permission
  ) OR public.is_admin(_user_id)
$$;

-- RLS policies for user_permissions
CREATE POLICY "Admins can view all permissions"
ON public.user_permissions FOR SELECT
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert permissions"
ON public.user_permissions FOR INSERT
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete permissions"
ON public.user_permissions FOR DELETE
USING (public.is_admin(auth.uid()));

-- Update profiles table policies to allow admins to view all profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update all profiles"
ON public.profiles FOR UPDATE
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete profiles"
ON public.profiles FOR DELETE
USING (public.is_admin(auth.uid()));