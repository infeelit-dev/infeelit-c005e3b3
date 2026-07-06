ALTER TABLE public.attendees
  ADD COLUMN IF NOT EXISTS first_name text,
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS event_date date,
  ADD COLUMN IF NOT EXISTS building text,
  ADD COLUMN IF NOT EXISTS needs text,
  ADD COLUMN IF NOT EXISTS passion text,
  ADD COLUMN IF NOT EXISTS onboarding_complete boolean NOT NULL DEFAULT false;

ALTER TABLE public.attendees ALTER COLUMN name DROP NOT NULL;

CREATE INDEX IF NOT EXISTS attendees_email_idx ON public.attendees (email);