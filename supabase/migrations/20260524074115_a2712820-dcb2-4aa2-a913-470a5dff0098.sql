
-- Safe profile lookup for circle members (excludes phone and other sensitive fields)
CREATE OR REPLACE FUNCTION public.get_circle_member_profiles(_circle_id uuid)
RETURNS TABLE(user_id uuid, display_name text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.user_id, p.display_name
  FROM public.profiles p
  WHERE EXISTS (
    SELECT 1 FROM public.circle_members m
    WHERE m.circle_id = _circle_id AND m.user_id = p.user_id
  )
  AND public.is_circle_member(_circle_id, auth.uid());
$$;

REVOKE EXECUTE ON FUNCTION public.get_circle_member_profiles(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_circle_member_profiles(uuid) TO authenticated;

-- Storage SELECT policy for community memory files
CREATE POLICY "Community memory files are viewable"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'memories'
  AND EXISTS (
    SELECT 1 FROM public.memories m
    WHERE m.is_community = true
      AND (m.file_url = storage.objects.name OR m.thumbnail_url = storage.objects.name)
  )
);
