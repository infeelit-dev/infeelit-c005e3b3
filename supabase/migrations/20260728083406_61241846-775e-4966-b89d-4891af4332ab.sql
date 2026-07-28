DROP POLICY IF EXISTS "sparks_select_public" ON public.memory_sparks;

CREATE POLICY "sparks_select_own"
  ON public.memory_sparks
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());