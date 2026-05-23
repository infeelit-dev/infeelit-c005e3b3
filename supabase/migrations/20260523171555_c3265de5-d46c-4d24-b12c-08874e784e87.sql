
REVOKE EXECUTE ON FUNCTION public.is_circle_member(uuid, uuid) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.is_circle_admin(uuid, uuid) FROM anon, authenticated, public;
