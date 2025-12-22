-- Drop function first, then table, then type
DROP FUNCTION IF EXISTS public.has_permission(uuid, user_permission);
DROP TABLE IF EXISTS public.user_permissions;
DROP TYPE IF EXISTS public.user_permission;

-- Create new detailed permission type
CREATE TYPE public.user_permission AS ENUM (
  'crawl_movies',
  'movies_add',
  'movies_edit', 
  'movies_delete',
  'categories_add',
  'categories_edit',
  'categories_delete',
  'menus_add',
  'menus_edit',
  'menus_delete',
  'access_settings'
);

-- Recreate user_permissions table
CREATE TABLE public.user_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  permission user_permission NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, permission)
);

-- Enable RLS
ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;

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

-- Recreate has_permission function
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