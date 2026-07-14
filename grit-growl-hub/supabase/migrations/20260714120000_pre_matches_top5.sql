-- Allow multiple precomputed matches per attendee (top 5)
CREATE TABLE IF NOT EXISTS public.pre_matches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  attendee_id UUID NOT NULL,
  match_id UUID NOT NULL,
  event_date DATE NOT NULL,
  confidence NUMERIC,
  bond_type TEXT,
  resonance TEXT,
  ice_breaker TEXT,
  for_match TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.pre_matches
  DROP CONSTRAINT IF EXISTS pre_matches_attendee_id_event_date_key;

ALTER TABLE public.pre_matches
  DROP CONSTRAINT IF EXISTS pre_matches_unique;

ALTER TABLE public.pre_matches
  ADD CONSTRAINT pre_matches_unique UNIQUE (attendee_id, match_id, event_date);

CREATE INDEX IF NOT EXISTS pre_matches_attendee_event_idx
  ON public.pre_matches (attendee_id, event_date);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.pre_matches TO anon, authenticated, service_role;
