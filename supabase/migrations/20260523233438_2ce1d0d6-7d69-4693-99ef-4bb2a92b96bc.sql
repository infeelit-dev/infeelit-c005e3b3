
-- 1. Tighten storage INSERT policy to authenticated only
DROP POLICY IF EXISTS "Users can upload their own memories" ON storage.objects;
CREATE POLICY "Users can upload their own memories"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'memories' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 2. Revoke EXECUTE from anon/public on SECURITY DEFINER functions that should not be exposed
REVOKE EXECUTE ON FUNCTION public.is_circle_member(uuid, uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_circle_admin(uuid, uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;

-- 3. Restrict invite-related lookup functions to authenticated users
REVOKE EXECUTE ON FUNCTION public.get_circle_invite_code(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.lookup_circle_by_invite_code(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_circle_invite_code(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.lookup_circle_by_invite_code(text) TO authenticated;
