-- Allow circle members to see memories shared with family
DROP POLICY IF EXISTS "Circle members can see family memories"
ON public.memories;

CREATE POLICY "Circle members can see family memories"
ON public.memories
FOR SELECT
USING (
  is_public = true
  OR auth.uid() = user_id
  OR (
    is_community = false
    AND auth.uid() IN (
      SELECT cm.user_id
      FROM circle_members cm
      WHERE cm.circle_id IN (
        SELECT cm2.circle_id
        FROM circle_members cm2
        WHERE cm2.user_id = memories.user_id
      )
    )
  )
);
