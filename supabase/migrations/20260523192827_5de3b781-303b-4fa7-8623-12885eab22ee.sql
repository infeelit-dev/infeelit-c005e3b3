ALTER TABLE public.memories
  ADD COLUMN IF NOT EXISTS is_community boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_anonymous boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_memories_is_community
  ON public.memories (is_community)
  WHERE is_community = true;

DROP POLICY IF EXISTS "Community memories are viewable by everyone" ON public.memories;
CREATE POLICY "Community memories are viewable by everyone"
  ON public.memories
  FOR SELECT
  USING (is_community = true);

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_user_id_key'
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_user_id_key UNIQUE (user_id);
  END IF;
END $$;