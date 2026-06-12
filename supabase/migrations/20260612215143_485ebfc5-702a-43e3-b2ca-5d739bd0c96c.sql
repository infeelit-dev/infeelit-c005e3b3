-- Clear any pre-existing anonymous rows (tables are new) so the NOT NULL owner column can be added
DELETE FROM public.memory_sparks;
DELETE FROM public.memory_bookmarks;

ALTER TABLE public.memory_sparks ADD COLUMN user_id uuid NOT NULL DEFAULT auth.uid();
ALTER TABLE public.memory_bookmarks ADD COLUMN user_id uuid NOT NULL DEFAULT auth.uid();

-- Replace permissive write policies on memory_sparks
DROP POLICY IF EXISTS "Anyone can add sparks" ON public.memory_sparks;
DROP POLICY IF EXISTS "Anyone can remove sparks" ON public.memory_sparks;

CREATE POLICY "Users can add their own sparks" ON public.memory_sparks
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own sparks" ON public.memory_sparks
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Replace permissive write policies on memory_bookmarks
DROP POLICY IF EXISTS "Anyone can add bookmarks" ON public.memory_bookmarks;
DROP POLICY IF EXISTS "Anyone can remove bookmarks" ON public.memory_bookmarks;

CREATE POLICY "Users can add their own bookmarks" ON public.memory_bookmarks
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own bookmarks" ON public.memory_bookmarks
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Drop unnecessary anon grants now that writes require authentication
REVOKE INSERT, UPDATE, DELETE ON public.memory_sparks FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.memory_bookmarks FROM anon;