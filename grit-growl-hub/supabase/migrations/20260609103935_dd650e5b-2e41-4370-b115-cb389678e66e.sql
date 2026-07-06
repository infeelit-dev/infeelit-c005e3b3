CREATE TYPE public.attendee_mode AS ENUM ('lounge', 'builder');

CREATE TABLE public.attendees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID,
  name TEXT NOT NULL,
  mode public.attendee_mode,
  checked_in_at TIMESTAMPTZ DEFAULT now(),
  manifesto_accepted BOOLEAN NOT NULL DEFAULT false,
  match_count INTEGER NOT NULL DEFAULT 0,
  no_push_flag BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.attendees TO authenticated;
GRANT SELECT, INSERT ON public.attendees TO anon;
GRANT ALL ON public.attendees TO service_role;

ALTER TABLE public.attendees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view attendees" ON public.attendees FOR SELECT USING (true);
CREATE POLICY "Anyone can create attendee" ON public.attendees FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated can update attendees" ON public.attendees FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated can delete attendees" ON public.attendees FOR DELETE TO authenticated USING (true);