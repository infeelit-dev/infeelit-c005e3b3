
-- 1. Tighten storage SELECT for 'memories' bucket
DROP POLICY IF EXISTS "Anyone can view memories" ON storage.objects;

CREATE POLICY "Public memory files are viewable"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'memories'
  AND EXISTS (
    SELECT 1 FROM public.memories m
    WHERE m.is_public = true
      AND (m.file_url LIKE '%' || name OR m.thumbnail_url LIKE '%' || name)
  )
);

CREATE POLICY "Users can view their own memory files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'memories'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

-- 2. Add UPDATE / DELETE policies for owners on storage
CREATE POLICY "Users can update their own memory files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'memories'
  AND (auth.uid())::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'memories'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own memory files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'memories'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

-- 3. Revoke EXECUTE on internal SECURITY DEFINER trigger functions from anon/authenticated
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon, authenticated, PUBLIC;
