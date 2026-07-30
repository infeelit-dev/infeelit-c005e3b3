-- Restore circle invite functions for authenticated users
GRANT EXECUTE ON FUNCTION public.get_circle_invite_code(uuid)
TO authenticated;

GRANT EXECUTE ON FUNCTION public.lookup_circle_by_invite_code(text)
TO anon, authenticated;

-- Allow any circle member (not only admin) to retrieve the invite code
CREATE OR REPLACE FUNCTION public.get_circle_invite_code(_circle_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT invite_code
  FROM public.circles
  WHERE id = _circle_id
    AND public.is_circle_member(_circle_id, auth.uid())
$$;

-- Fix circle creator becoming member (admin) on create
CREATE OR REPLACE FUNCTION public.handle_circle_created()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.circle_members (circle_id, user_id, role)
  VALUES (NEW.id, NEW.created_by, 'admin')
  ON CONFLICT (circle_id, user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_circle_created ON public.circles;
CREATE TRIGGER on_circle_created
  AFTER INSERT ON public.circles
  FOR EACH ROW EXECUTE FUNCTION public.handle_circle_created();
