CREATE POLICY "Anyone can read attendees" ON public.attendees FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Anyone can read pulses" ON public.pulses FOR SELECT TO anon, authenticated USING (true);

GRANT SELECT ON public.attendees TO anon, authenticated;
GRANT SELECT ON public.pulses TO anon, authenticated;