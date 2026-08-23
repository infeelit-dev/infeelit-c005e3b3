-- Allow public read access to memories bucket for public files
INSERT INTO storage.buckets (id, name, public)
VALUES ('memories', 'memories', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Update RLS to allow anon read on public memories storage
DROP POLICY IF EXISTS "memories_select_public" ON storage.objects;
CREATE POLICY "memories_select_public"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (
  bucket_id = 'memories'
  AND EXISTS (
    SELECT 1 FROM public.memories m
    WHERE m.is_public = true
    AND (
      m.file_url LIKE '%' || name || '%'
      OR m.thumbnail_url LIKE '%' || name || '%'
    )
  )
);
