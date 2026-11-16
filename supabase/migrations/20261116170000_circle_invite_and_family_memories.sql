-- Guest invite lookup (id + name + count only) and family-memory circle_id RLS.

DROP FUNCTION IF EXISTS public.lookup_circle_by_invite_code(text);

CREATE FUNCTION public.lookup_circle_by_invite_code(_code text)
RETURNS TABLE (id uuid, name text, member_count bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT c.id, c.name,
    (SELECT count(*)::bigint FROM public.circle_members m WHERE m.circle_id = c.id) AS member_count
  FROM public.circles c
  WHERE c.invite_code = trim(_code)
    AND length(trim(coalesce(_code, ''))) > 0
$$;

REVOKE ALL ON FUNCTION public.lookup_circle_by_invite_code(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.lookup_circle_by_invite_code(text) TO anon, authenticated;

ALTER TABLE public.memories
  ADD COLUMN IF NOT EXISTS circle_id uuid REFERENCES public.circles(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS memories_circle_id_idx ON public.memories (circle_id)
  WHERE circle_id IS NOT NULL;

DROP POLICY IF EXISTS "Circle members can see family memories" ON public.memories;
DROP POLICY IF EXISTS "Circle members can read memories by circle_id" ON public.memories;
CREATE POLICY "Circle members can read memories by circle_id"
ON public.memories
FOR SELECT
TO authenticated
USING (
  circle_id IS NOT NULL
  AND public.is_circle_member(circle_id, auth.uid())
);

DROP POLICY IF EXISTS "Users can insert their own memories" ON public.memories;
CREATE POLICY "Users can insert their own memories"
ON public.memories
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND (circle_id IS NULL OR public.is_circle_member(circle_id, auth.uid()))
);

DROP POLICY IF EXISTS "Users can update their own memories" ON public.memories;
CREATE POLICY "Users can update their own memories"
ON public.memories
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  AND (circle_id IS NULL OR public.is_circle_member(circle_id, auth.uid()))
);
