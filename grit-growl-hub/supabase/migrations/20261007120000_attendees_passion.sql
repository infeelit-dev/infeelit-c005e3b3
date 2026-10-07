-- Passion signals for human tribe framing before business matches
ALTER TABLE public.attendees
  ADD COLUMN IF NOT EXISTS passion TEXT;

ALTER TABLE public.attendees
  ADD COLUMN IF NOT EXISTS passion_cluster TEXT;

CREATE INDEX IF NOT EXISTS attendees_event_passion_cluster_idx
  ON public.attendees (event_date, passion_cluster);
