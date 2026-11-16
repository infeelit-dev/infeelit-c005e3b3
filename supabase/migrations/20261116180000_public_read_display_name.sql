-- Public feed needs display names. Anon may only read user_id + display_name.

DROP POLICY IF EXISTS "public_read_display_name" ON public.profiles;
CREATE POLICY "public_read_display_name"
ON public.profiles
FOR SELECT
TO anon, authenticated
USING (true);

REVOKE SELECT ON TABLE public.profiles FROM anon;
GRANT SELECT (user_id, display_name) ON public.profiles TO anon, authenticated;
