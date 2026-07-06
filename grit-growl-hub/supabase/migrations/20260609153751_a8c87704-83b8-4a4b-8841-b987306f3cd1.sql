-- Drop overly permissive policies
DROP POLICY IF EXISTS "Anyone can view attendees" ON public.attendees;
DROP POLICY IF EXISTS "Anyone can create attendee" ON public.attendees;
DROP POLICY IF EXISTS "Authenticated can update attendees" ON public.attendees;
DROP POLICY IF EXISTS "Authenticated can delete attendees" ON public.attendees;

-- No SELECT policy = no one can read via the Data API (service role bypasses RLS).
-- This protects emails and personal profile fields from public scraping.

-- Public INSERT, but require the basic identifying fields the app collects.
CREATE POLICY "Public can self check-in"
  ON public.attendees
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    first_name IS NOT NULL
    AND email IS NOT NULL
    AND length(trim(email)) > 3
    AND event_date IS NOT NULL
  );

-- Public UPDATE limited to rows that already have an email set
-- (the onboarding/manifesto flow updates by email).
CREATE POLICY "Public can update own check-in row"
  ON public.attendees
  FOR UPDATE
  TO anon, authenticated
  USING (email IS NOT NULL)
  WITH CHECK (email IS NOT NULL);

-- No DELETE policy: only the service role (backend) can delete.