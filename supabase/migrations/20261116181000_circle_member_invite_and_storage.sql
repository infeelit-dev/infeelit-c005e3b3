-- Members (not only admins) can read the invite code.
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
    AND public.is_circle_member(_circle_id, auth.uid())
$$;

REVOKE ALL ON FUNCTION public.get_circle_invite_code(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_circle_invite_code(uuid) TO authenticated;

-- Family media: circle members can sign/read files for memories they may SELECT.
DROP POLICY IF EXISTS "memories_select_circle_members" ON storage.objects;
CREATE POLICY "memories_select_circle_members"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'memories'
  AND EXISTS (
    SELECT 1 FROM public.memories m
    WHERE m.circle_id IS NOT NULL
      AND public.is_circle_member(m.circle_id, auth.uid())
      AND (
        m.file_url = name
        OR m.file_url LIKE '%' || name
        OR m.thumbnail_url = name
        OR m.thumbnail_url LIKE '%' || name
        OR coalesce(m.background_image_url, '') LIKE '%' || name
      )
  )
);
