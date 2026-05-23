
-- Ensure memories bucket exists and is private
INSERT INTO storage.buckets (id, name, public)
VALUES ('memories', 'memories', false)
ON CONFLICT (id) DO UPDATE SET public = false;

-- Replace weak LIKE-based public file policy with exact path equality
DROP POLICY IF EXISTS "Public memory files are viewable" ON storage.objects;

CREATE POLICY "Public memory files are viewable"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'memories'
  AND EXISTS (
    SELECT 1 FROM public.memories m
    WHERE m.is_public = true
      AND (m.file_url = storage.objects.name OR m.thumbnail_url = storage.objects.name)
  )
);
