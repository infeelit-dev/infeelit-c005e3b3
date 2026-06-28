ALTER TABLE public.attendees ADD COLUMN IF NOT EXISTS last_name text;
ALTER TABLE public.attendees ADD COLUMN IF NOT EXISTS phone text;
CREATE UNIQUE INDEX IF NOT EXISTS attendees_email_unique ON public.attendees (lower(email)) WHERE email IS NOT NULL;