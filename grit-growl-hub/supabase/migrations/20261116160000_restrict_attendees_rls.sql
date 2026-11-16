-- Close public attendee PII leak: no anon SELECT; own-row UPDATE must match JWT email.

DROP POLICY IF EXISTS "Anyone can read attendees" ON public.attendees;
DROP POLICY IF EXISTS "Anyone can view attendees" ON public.attendees;

REVOKE SELECT ON public.attendees FROM anon;

CREATE POLICY "Authenticated can read attendees"
  ON public.attendees
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Public can update own check-in row" ON public.attendees;

CREATE POLICY "Public can update own check-in row"
  ON public.attendees
  FOR UPDATE
  TO authenticated
  USING (email IS NOT NULL AND email = auth.jwt() ->> 'email')
  WITH CHECK (email IS NOT NULL AND email = auth.jwt() ->> 'email');
