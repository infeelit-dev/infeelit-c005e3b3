CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  linkedin_url TEXT,
  whatsapp TEXT,
  linkedin_summary TEXT,
  avatar_url TEXT,
  q1 TEXT,
  q2 TEXT,
  q3 TEXT,
  total_events_attended INTEGER DEFAULT 0,
  member_since TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.event_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_id TEXT NOT NULL,
  event_date DATE NOT NULL,
  mode TEXT CHECK (mode IN ('lounge', 'builder')),
  q1 TEXT,
  q2 TEXT,
  q3 TEXT,
  luma_bio TEXT,
  suggestions_shown INTEGER DEFAULT 0,
  match_count INTEGER DEFAULT 0,
  onboarding_complete BOOLEAN DEFAULT FALSE,
  checked_in_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profile_id, event_date)
);

CREATE INDEX IF NOT EXISTS event_participants_event_date_idx ON public.event_participants (event_date);
CREATE INDEX IF NOT EXISTS profiles_email_idx ON public.profiles (lower(email));

GRANT SELECT, INSERT, UPDATE ON public.profiles TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.event_participants TO anon, authenticated;
GRANT ALL ON public.profiles TO service_role;
GRANT ALL ON public.event_participants TO service_role;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Public insert profiles" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update profiles" ON public.profiles FOR UPDATE USING (true);
CREATE POLICY "Public read participants" ON public.event_participants FOR SELECT USING (true);
CREATE POLICY "Public insert participants" ON public.event_participants FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update participants" ON public.event_participants FOR UPDATE USING (true);
