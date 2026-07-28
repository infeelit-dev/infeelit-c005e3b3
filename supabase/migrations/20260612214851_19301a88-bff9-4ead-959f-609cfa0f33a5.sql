ALTER TABLE public.memories ADD COLUMN IF NOT EXISTS sparks_count integer NOT NULL DEFAULT 0;

CREATE TABLE public.memory_sparks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  memory_id uuid NOT NULL REFERENCES public.memories(id) ON DELETE CASCADE,
  user_name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.memory_sparks TO authenticated, anon;
GRANT ALL ON public.memory_sparks TO service_role;
ALTER TABLE public.memory_sparks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view sparks" ON public.memory_sparks FOR SELECT USING (true);
CREATE POLICY "Anyone can add sparks" ON public.memory_sparks FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can remove sparks" ON public.memory_sparks FOR DELETE USING (true);

CREATE TABLE public.memory_bookmarks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  memory_id uuid NOT NULL REFERENCES public.memories(id) ON DELETE CASCADE,
  user_name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.memory_bookmarks TO authenticated, anon;
GRANT ALL ON public.memory_bookmarks TO service_role;
ALTER TABLE public.memory_bookmarks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view bookmarks" ON public.memory_bookmarks FOR SELECT USING (true);
CREATE POLICY "Anyone can add bookmarks" ON public.memory_bookmarks FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can remove bookmarks" ON public.memory_bookmarks FOR DELETE USING (true);