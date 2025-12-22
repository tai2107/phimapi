-- Create a helper function to check whether a user has ANY permission (or is admin)
-- Uses SECURITY DEFINER to avoid RLS recursion/visibility issues for non-admin users.
CREATE OR REPLACE FUNCTION public.has_any_permission(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_permissions
    WHERE user_id = _user_id
    LIMIT 1
  ) OR public.is_admin(_user_id)
$$;
