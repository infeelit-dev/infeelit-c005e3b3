ALTER TABLE public.attendees ADD COLUMN IF NOT EXISTS data_consent BOOLEAN NOT NULL DEFAULT FALSE;

DELETE FROM public.attendees a
USING public.attendees b
WHERE a.email IS NOT NULL
  AND a.email = b.email
  AND (a.created_at < b.created_at
    OR (a.created_at = b.created_at AND a.id < b.id));

CREATE UNIQUE INDEX IF NOT EXISTS attendees_email_unique ON public.attendees (email) WHERE email IS NOT NULL;