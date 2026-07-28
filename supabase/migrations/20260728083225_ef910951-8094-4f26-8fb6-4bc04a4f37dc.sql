ALTER TABLE public.memory_reports ADD COLUMN IF NOT EXISTS user_id uuid;

UPDATE public.memory_reports
SET user_id = reporter_name::uuid
WHERE reporter_name ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
  AND user_id IS NULL;

ALTER TABLE public.memory_reports ALTER COLUMN user_id SET DEFAULT auth.uid();

ALTER TABLE public.memory_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Reporters can view their own reports" ON public.memory_reports;
DROP POLICY IF EXISTS "Authenticated users can insert reports" ON public.memory_reports;

CREATE POLICY "Reporters can view their own reports"
  ON public.memory_reports
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Authenticated users can insert reports"
  ON public.memory_reports
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());