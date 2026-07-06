CREATE TABLE public.pulses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id uuid NOT NULL REFERENCES public.attendees(id) ON DELETE CASCADE,
  newcomer_id uuid NOT NULL REFERENCES public.attendees(id) ON DELETE CASCADE,
  event_date date NOT NULL,
  confidence numeric NOT NULL,
  resonance text,
  why_now text,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX pulses_recipient_event_idx ON public.pulses (recipient_id, event_date);
CREATE INDEX pulses_newcomer_event_idx ON public.pulses (newcomer_id, event_date);
CREATE UNIQUE INDEX pulses_dedup_idx ON public.pulses (recipient_id, newcomer_id, event_date);

GRANT ALL ON public.pulses TO service_role;

ALTER TABLE public.pulses ENABLE ROW LEVEL SECURITY;
-- No policies: only service_role (which bypasses RLS) can access.