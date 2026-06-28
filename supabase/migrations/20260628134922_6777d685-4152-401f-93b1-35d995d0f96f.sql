-- 1. Add missing columns to memories
ALTER TABLE public.memories
  ADD COLUMN IF NOT EXISTS views_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS comments_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS moderation_status text NOT NULL DEFAULT 'approved',
  ADD COLUMN IF NOT EXISTS translation_status text DEFAULT 'pending';

-- 2. memory_comments table
CREATE TABLE public.memory_comments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  memory_id uuid NOT NULL REFERENCES public.memories(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name text NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.memory_comments TO authenticated;
GRANT SELECT ON public.memory_comments TO anon;
GRANT ALL ON public.memory_comments TO service_role;

ALTER TABLE public.memory_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Comments are viewable by everyone"
  ON public.memory_comments FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create their own comments"
  ON public.memory_comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
  ON public.memory_comments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
  ON public.memory_comments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 3. memory_reports table
CREATE TABLE public.memory_reports (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  memory_id uuid NOT NULL REFERENCES public.memories(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  reason text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.memory_reports TO authenticated;
GRANT ALL ON public.memory_reports TO service_role;

ALTER TABLE public.memory_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can create their own reports"
  ON public.memory_reports FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view reports"
  ON public.memory_reports FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete reports"
  ON public.memory_reports FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));