-- Extend notifications for user-centric spark/comment alerts
ALTER TABLE public.notifications
  ALTER COLUMN circle_id DROP NOT NULL;

ALTER TABLE public.notifications
  ALTER COLUMN message DROP NOT NULL;

ALTER TABLE public.notifications
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS type TEXT;

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
  ON public.notifications (user_id, read, created_at DESC);

DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications"
  ON public.notifications
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR (circle_id IS NOT NULL AND public.is_circle_member(circle_id, auth.uid()))
  );

DROP POLICY IF EXISTS "Users can insert user notifications" ON public.notifications;
CREATE POLICY "Users can insert user notifications"
  ON public.notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = from_user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications"
  ON public.notifications
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() OR (circle_id IS NOT NULL AND public.is_circle_member(circle_id, auth.uid())));
