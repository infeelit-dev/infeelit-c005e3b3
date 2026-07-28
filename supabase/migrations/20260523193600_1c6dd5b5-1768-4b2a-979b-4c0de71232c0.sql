ALTER TABLE public.memories
  ADD COLUMN IF NOT EXISTS background_image_url TEXT,
  ADD COLUMN IF NOT EXISTS aura_intensity INTEGER DEFAULT 35,
  ADD COLUMN IF NOT EXISTS spark_reward INTEGER DEFAULT 0;

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  circle_id UUID NOT NULL REFERENCES public.circles(id) ON DELETE CASCADE,
  from_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  memory_id UUID REFERENCES public.memories(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_circle_created
  ON public.notifications (circle_id, created_at DESC);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Circle members can view notifications" ON public.notifications;
CREATE POLICY "Circle members can view notifications"
  ON public.notifications
  FOR SELECT
  TO authenticated
  USING (public.is_circle_member(circle_id, auth.uid()));

DROP POLICY IF EXISTS "Members can post notifications to their circles" ON public.notifications;
CREATE POLICY "Members can post notifications to their circles"
  ON public.notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = from_user_id
    AND public.is_circle_member(circle_id, auth.uid())
  );

DROP POLICY IF EXISTS "Circle members can mark notifications read" ON public.notifications;
CREATE POLICY "Circle members can mark notifications read"
  ON public.notifications
  FOR UPDATE
  TO authenticated
  USING (public.is_circle_member(circle_id, auth.uid()));