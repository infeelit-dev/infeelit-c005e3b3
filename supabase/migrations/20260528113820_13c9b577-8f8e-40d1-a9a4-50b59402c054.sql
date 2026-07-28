REVOKE EXECUTE ON FUNCTION public.is_circle_admin(uuid, uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_circle_member(uuid, uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.lookup_circle_by_invite_code(text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_circle_invite_code(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_circle_member_profiles(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.is_circle_admin(uuid, uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_circle_member(uuid, uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.lookup_circle_by_invite_code(text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_circle_invite_code(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_circle_member_profiles(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;