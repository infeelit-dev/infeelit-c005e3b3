
ALTER FUNCTION public.handle_new_user() SET search_path = public;
ALTER FUNCTION public.get_circle_invite_code(uuid) SET search_path = public;
ALTER FUNCTION public.lookup_circle_by_invite_code(text) SET search_path = public;

REVOKE EXECUTE ON FUNCTION public.get_circle_invite_code(uuid) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.lookup_circle_by_invite_code(text) FROM authenticated;

DROP POLICY IF EXISTS "Anyone can insert reports" ON public.memory_reports;
CREATE POLICY "Authenticated users can insert reports"
ON public.memory_reports
FOR INSERT
TO authenticated
WITH CHECK (reporter_name = (auth.uid())::text);
