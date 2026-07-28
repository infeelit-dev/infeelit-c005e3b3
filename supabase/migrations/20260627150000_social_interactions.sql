-- Commentaires
CREATE TABLE IF NOT EXISTS public.memory_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  memory_id UUID REFERENCES public.memories(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.memory_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read comments" ON public.memory_comments;
CREATE POLICY "Anyone can read comments"
  ON public.memory_comments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can insert comments" ON public.memory_comments;
CREATE POLICY "Anyone can insert comments"
  ON public.memory_comments FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users delete own comments" ON public.memory_comments;
CREATE POLICY "Users delete own comments"
  ON public.memory_comments FOR DELETE USING (true);

GRANT SELECT, INSERT, DELETE ON public.memory_comments TO authenticated, anon;
GRANT ALL ON public.memory_comments TO service_role;

-- Sparks & bookmarks : contrainte unique par utilisateur
CREATE UNIQUE INDEX IF NOT EXISTS memory_sparks_memory_user_name_unique
  ON public.memory_sparks (memory_id, user_name);

CREATE UNIQUE INDEX IF NOT EXISTS memory_bookmarks_memory_user_name_unique
  ON public.memory_bookmarks (memory_id, user_name);

-- Assouplir user_id pour les interactions via user_name (localStorage)
ALTER TABLE public.memory_sparks ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.memory_bookmarks ALTER COLUMN user_id DROP NOT NULL;

DROP POLICY IF EXISTS "Users can add their own sparks" ON public.memory_sparks;
DROP POLICY IF EXISTS "Users can remove their own sparks" ON public.memory_sparks;
DROP POLICY IF EXISTS "Anyone can view sparks" ON public.memory_sparks;
DROP POLICY IF EXISTS "Anyone can add sparks" ON public.memory_sparks;
DROP POLICY IF EXISTS "Anyone can remove sparks" ON public.memory_sparks;
DROP POLICY IF EXISTS "Anyone can read sparks" ON public.memory_sparks;
DROP POLICY IF EXISTS "Anyone can insert sparks" ON public.memory_sparks;

CREATE POLICY "Anyone can read sparks"
  ON public.memory_sparks FOR SELECT USING (true);

CREATE POLICY "Anyone can insert sparks"
  ON public.memory_sparks FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can remove sparks"
  ON public.memory_sparks FOR DELETE USING (true);

DROP POLICY IF EXISTS "Users can add their own bookmarks" ON public.memory_bookmarks;
DROP POLICY IF EXISTS "Users can remove their own bookmarks" ON public.memory_bookmarks;
DROP POLICY IF EXISTS "Anyone can view bookmarks" ON public.memory_bookmarks;
DROP POLICY IF EXISTS "Anyone can add bookmarks" ON public.memory_bookmarks;
DROP POLICY IF EXISTS "Anyone can remove bookmarks" ON public.memory_bookmarks;
DROP POLICY IF EXISTS "Anyone can read bookmarks" ON public.memory_bookmarks;
DROP POLICY IF EXISTS "Anyone can insert bookmarks" ON public.memory_bookmarks;

CREATE POLICY "Anyone can read bookmarks"
  ON public.memory_bookmarks FOR SELECT USING (true);

CREATE POLICY "Anyone can insert bookmarks"
  ON public.memory_bookmarks FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can remove bookmarks"
  ON public.memory_bookmarks FOR DELETE USING (true);

GRANT SELECT, INSERT, DELETE ON public.memory_sparks TO authenticated, anon;
GRANT SELECT, INSERT, DELETE ON public.memory_bookmarks TO authenticated, anon;

-- Compteurs dans memories
ALTER TABLE public.memories
ADD COLUMN IF NOT EXISTS comments_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0;
