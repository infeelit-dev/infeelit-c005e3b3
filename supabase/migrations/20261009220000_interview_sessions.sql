-- À voix haute: guided interview sessions + private media

CREATE TABLE IF NOT EXISTS public.interview_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.pro_imported_profiles(id) ON DELETE SET NULL,
  token TEXT UNIQUE NOT NULL,
  locale TEXT DEFAULT 'fr',
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'complete', 'published')),
  slug TEXT UNIQUE,
  mode_pref TEXT DEFAULT 'video' CHECK (mode_pref IN ('audio', 'video')),
  featured_question_ids INTEGER[],
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.interview_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.interview_sessions(id) ON DELETE CASCADE,
  question_id INTEGER NOT NULL,
  take_no INTEGER NOT NULL CHECK (take_no IN (1, 2)),
  media_url TEXT,
  duration_s INTEGER,
  transcript TEXT,
  transcript_status TEXT DEFAULT 'pending' CHECK (transcript_status IN ('pending', 'done', 'failed')),
  strong_sentence TEXT,
  retired_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (session_id, question_id, take_no)
);

CREATE INDEX IF NOT EXISTS interview_sessions_token_idx ON public.interview_sessions (token);
CREATE INDEX IF NOT EXISTS interview_sessions_slug_idx ON public.interview_sessions (slug);
CREATE INDEX IF NOT EXISTS interview_answers_session_idx ON public.interview_answers (session_id, question_id);

ALTER TABLE public.interview_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_answers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Guest interview sessions" ON public.interview_sessions;
CREATE POLICY "Guest interview sessions"
ON public.interview_sessions FOR ALL
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Guest interview answers" ON public.interview_answers;
CREATE POLICY "Guest interview answers"
ON public.interview_answers FOR ALL
USING (true)
WITH CHECK (true);

INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('interview-media', 'interview-media', false, 83886080)
ON CONFLICT (id) DO UPDATE SET public = false, file_size_limit = 83886080;

GRANT ALL ON public.interview_sessions TO anon, authenticated;
GRANT ALL ON public.interview_answers TO anon, authenticated;

DROP POLICY IF EXISTS "Anyone can upload interview media" ON storage.objects;
CREATE POLICY "Anyone can upload interview media"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'interview-media');

DROP POLICY IF EXISTS "Anyone can read interview media" ON storage.objects;
CREATE POLICY "Anyone can read interview media"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'interview-media');

DROP POLICY IF EXISTS "Anyone can update interview media" ON storage.objects;
CREATE POLICY "Anyone can update interview media"
ON storage.objects FOR UPDATE
TO anon, authenticated
USING (bucket_id = 'interview-media');
