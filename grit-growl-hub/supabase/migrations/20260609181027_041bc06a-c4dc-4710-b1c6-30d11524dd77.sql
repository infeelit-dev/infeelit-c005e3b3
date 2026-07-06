-- 1. Add missing columns to attendees
ALTER TABLE public.attendees
  ADD COLUMN IF NOT EXISTS full_name TEXT,
  ADD COLUMN IF NOT EXISTS visits INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS q1 TEXT,
  ADD COLUMN IF NOT EXISTS q2 TEXT,
  ADD COLUMN IF NOT EXISTS q3 TEXT,
  ADD COLUMN IF NOT EXISTS luma_bio TEXT,
  ADD COLUMN IF NOT EXISTS linkedin_summary TEXT,
  ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp TEXT,
  ADD COLUMN IF NOT EXISTS suggestions_shown INTEGER NOT NULL DEFAULT 0;

-- 2. matches table
CREATE TABLE IF NOT EXISTS public.matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  from_attendee_id UUID REFERENCES public.attendees(id) ON DELETE CASCADE,
  to_attendee_id UUID REFERENCES public.attendees(id) ON DELETE CASCADE,
  event_date DATE,
  oracle_resonance TEXT,
  accepted BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

GRANT SELECT, INSERT, UPDATE ON public.matches TO anon, authenticated;
GRANT ALL ON public.matches TO service_role;

ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read matches"
  ON public.matches FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert matches"
  ON public.matches FOR INSERT
  TO anon, authenticated
  WITH CHECK (from_attendee_id IS NOT NULL AND to_attendee_id IS NOT NULL);

-- 3. notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  to_attendee_id UUID REFERENCES public.attendees(id) ON DELETE CASCADE,
  from_first_name TEXT,
  message TEXT,
  location TEXT,
  description TEXT,
  event_date DATE,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

GRANT SELECT, INSERT, UPDATE ON public.notifications TO anon, authenticated;
GRANT ALL ON public.notifications TO service_role;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read notifications"
  ON public.notifications FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert notifications"
  ON public.notifications FOR INSERT
  TO anon, authenticated
  WITH CHECK (to_attendee_id IS NOT NULL);

CREATE POLICY "Anyone can update notifications"
  ON public.notifications FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);