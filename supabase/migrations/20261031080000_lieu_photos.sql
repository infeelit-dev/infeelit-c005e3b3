-- Lieu: place of birth of memories (owner photo behind the profile feed)

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS lieu_photo_url TEXT;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'lieu-photos',
  'lieu-photos',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880;

DROP POLICY IF EXISTS "Anyone can view lieu photos" ON storage.objects;
CREATE POLICY "Anyone can view lieu photos"
ON storage.objects
FOR SELECT
USING (bucket_id = 'lieu-photos');

DROP POLICY IF EXISTS "Users upload own lieu photos" ON storage.objects;
CREATE POLICY "Users upload own lieu photos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'lieu-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Users update own lieu photos" ON storage.objects;
CREATE POLICY "Users update own lieu photos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'lieu-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'lieu-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
