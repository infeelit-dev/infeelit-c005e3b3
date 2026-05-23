
CREATE TABLE public.circles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  invite_code text NOT NULL UNIQUE,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.circle_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id uuid NOT NULL REFERENCES public.circles(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role text NOT NULL DEFAULT 'member',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (circle_id, user_id)
);

ALTER TABLE public.circles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circle_members ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_circle_member(_circle_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.circle_members WHERE circle_id = _circle_id AND user_id = _user_id);
$$;

CREATE OR REPLACE FUNCTION public.is_circle_admin(_circle_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.circle_members WHERE circle_id = _circle_id AND user_id = _user_id AND role = 'admin');
$$;

CREATE POLICY "Members can view their circles" ON public.circles
  FOR SELECT TO authenticated USING (public.is_circle_member(id, auth.uid()));

CREATE POLICY "Authenticated users can create circles" ON public.circles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Admins can update circles" ON public.circles
  FOR UPDATE TO authenticated USING (public.is_circle_admin(id, auth.uid()));

CREATE POLICY "Admins can delete circles" ON public.circles
  FOR DELETE TO authenticated USING (public.is_circle_admin(id, auth.uid()));

CREATE POLICY "Members can view circle members" ON public.circle_members
  FOR SELECT TO authenticated USING (public.is_circle_member(circle_id, auth.uid()));

CREATE POLICY "Users can join via insert" ON public.circle_members
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update members" ON public.circle_members
  FOR UPDATE TO authenticated USING (public.is_circle_admin(circle_id, auth.uid()));

CREATE POLICY "Admins or self can delete members" ON public.circle_members
  FOR DELETE TO authenticated USING (public.is_circle_admin(circle_id, auth.uid()) OR auth.uid() = user_id);

CREATE TRIGGER update_circles_updated_at BEFORE UPDATE ON public.circles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
