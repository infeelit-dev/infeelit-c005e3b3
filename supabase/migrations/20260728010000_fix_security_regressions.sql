-- Fix 1: Restore public profile readability for feed
CREATE POLICY "Public profiles are viewable by everyone"
ON public.profiles
FOR SELECT
USING (true);

-- Fix 2: Fix existing NULL user_id in sparks and bookmarks
UPDATE public.memory_sparks
SET user_id = (
  SELECT user_id FROM public.memories
  WHERE memories.id = memory_sparks.memory_id
  LIMIT 1
)
WHERE user_id IS NULL;

UPDATE public.memory_bookmarks
SET user_id = (
  SELECT id FROM auth.users LIMIT 1
)
WHERE user_id IS NULL;

-- Fix 3: Keep storage bucket readable for public memories
-- Storage policy: allow public read if memory is public
DROP POLICY IF EXISTS "memories_select_own_or_public" ON storage.objects;
CREATE POLICY "memories_select_public"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (
  bucket_id = 'memories'
  AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR EXISTS (
      SELECT 1 FROM public.memories m
      WHERE m.is_public = true
      AND (m.file_url = name OR m.thumbnail_url = name)
    )
  )
);
