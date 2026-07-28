
-- 1. circle_members: prevent self-escalation to admin on insert
DROP POLICY IF EXISTS "Users can join via insert" ON public.circle_members;
CREATE POLICY "Users can join as member"
ON public.circle_members
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id AND role = 'member');

-- Allow circle admins to add members with any role
CREATE POLICY "Admins can add members"
ON public.circle_members
FOR INSERT
TO authenticated
WITH CHECK (public.is_circle_admin(circle_id, auth.uid()));

-- Prevent non-admins from changing their own role via UPDATE
-- (existing "Admins can update members" policy already requires admin)

-- 2. profiles: restrict insert/update policies to authenticated role only
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 3. circles: hide invite_code from member-facing SELECT
REVOKE SELECT (invite_code) ON public.circles FROM anon, authenticated;

-- Admin-only function to retrieve a circle's invite code
CREATE OR REPLACE FUNCTION public.get_circle_invite_code(_circle_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT invite_code
  FROM public.circles
  WHERE id = _circle_id
    AND public.is_circle_admin(_circle_id, auth.uid())
$$;

-- Public lookup function so prospective joiners can resolve a circle by code
-- without exposing the invite_code column directly via RLS.
CREATE OR REPLACE FUNCTION public.lookup_circle_by_invite_code(_code text)
RETURNS TABLE (id uuid, name text, member_count bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT c.id, c.name,
    (SELECT count(*) FROM public.circle_members m WHERE m.circle_id = c.id) AS member_count
  FROM public.circles c
  WHERE c.invite_code = _code
$$;
