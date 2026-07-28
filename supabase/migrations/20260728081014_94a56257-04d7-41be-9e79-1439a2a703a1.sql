
-- 1. Fix circle_members INSERT policy (admin promotion bug)
DROP POLICY IF EXISTS "Admins can promote members" ON public.circle_members;
CREATE POLICY "Admins can promote members"
ON public.circle_members
FOR INSERT
TO authenticated
WITH CHECK (
  role = 'admin'
  AND EXISTS (
    SELECT 1 FROM public.circle_members cm
    WHERE cm.circle_id = circle_members.circle_id
      AND cm.user_id = auth.uid()
      AND cm.role = 'admin'
  )
);

-- 2. Fix circles SELECT policy (self-reference bug)
DROP POLICY IF EXISTS "Members can read their circles" ON public.circles;
CREATE POLICY "Members can read their circles"
ON public.circles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.circle_members cm
    WHERE cm.circle_id = circles.id
      AND cm.user_id = auth.uid()
  )
);

-- 3. Profiles: remove overly permissive public policy
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- 4. Memory reports: restrict SELECT
DROP POLICY IF EXISTS "Anyone can view reports" ON public.memory_reports;
CREATE POLICY "Reporters can view their own reports"
ON public.memory_reports
FOR SELECT
TO authenticated
USING (reporter_name = (auth.uid())::text);

-- 5. memory_sparks & memory_bookmarks: bind to auth.uid()
ALTER TABLE public.memory_sparks ADD COLUMN IF NOT EXISTS user_id uuid DEFAULT auth.uid();
ALTER TABLE public.memory_bookmarks ADD COLUMN IF NOT EXISTS user_id uuid DEFAULT auth.uid();

DROP POLICY IF EXISTS "Authenticated users can insert sparks" ON public.memory_sparks;
DROP POLICY IF EXISTS "Users can delete their own spark" ON public.memory_sparks;
DROP POLICY IF EXISTS "Anyone can view sparks" ON public.memory_sparks;

CREATE POLICY "sparks_select_public"
ON public.memory_sparks FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "sparks_insert_own"
ON public.memory_sparks FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "sparks_delete_own"
ON public.memory_sparks FOR DELETE
TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Authenticated users can insert bookmarks" ON public.memory_bookmarks;
DROP POLICY IF EXISTS "Users can delete their own bookmark" ON public.memory_bookmarks;
DROP POLICY IF EXISTS "Users can view their own bookmarks" ON public.memory_bookmarks;

CREATE POLICY "bookmarks_select_own"
ON public.memory_bookmarks FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "bookmarks_insert_own"
ON public.memory_bookmarks FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "bookmarks_delete_own"
ON public.memory_bookmarks FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- 6. circles_safe view: SECURITY INVOKER
DROP VIEW IF EXISTS public.circles_safe;
CREATE VIEW public.circles_safe
WITH (security_invoker = true) AS
SELECT id, name, created_by, created_at FROM public.circles;
GRANT SELECT ON public.circles_safe TO authenticated;

-- 7. Functions: fix search_path and revoke public execute
ALTER FUNCTION public.increment_likes(uuid, integer) SET search_path = public;
ALTER FUNCTION public.increment_saves(uuid, integer) SET search_path = public;
ALTER FUNCTION public.increment_shares(uuid) SET search_path = public;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_circle_invite_code(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.lookup_circle_by_invite_code(text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.increment_likes(uuid, integer) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.increment_saves(uuid, integer) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.increment_shares(uuid) FROM PUBLIC, anon;

-- Drop unused/spoofable helper
DROP FUNCTION IF EXISTS public.set_app_user_name(text);

-- 8. Storage RLS: scope to owner folder
DROP POLICY IF EXISTS allow_insert_memories ON storage.objects;
DROP POLICY IF EXISTS allow_select_memories ON storage.objects;

CREATE POLICY "memories_insert_own_folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'memories'
  AND (storage.foldername(name))[1] = (auth.uid())::text
);

CREATE POLICY "memories_select_own_or_public"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (
  bucket_id = 'memories'
  AND (
    (auth.uid() IS NOT NULL AND (storage.foldername(name))[1] = (auth.uid())::text)
    OR EXISTS (
      SELECT 1 FROM public.memories m
      WHERE m.is_public = true
        AND (m.file_url LIKE '%' || storage.objects.name
             OR m.thumbnail_url LIKE '%' || storage.objects.name
             OR m.background_image_url LIKE '%' || storage.objects.name)
    )
  )
);

CREATE POLICY "memories_update_own"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'memories'
  AND (storage.foldername(name))[1] = (auth.uid())::text
);

CREATE POLICY "memories_delete_own"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'memories'
  AND (storage.foldername(name))[1] = (auth.uid())::text
);
