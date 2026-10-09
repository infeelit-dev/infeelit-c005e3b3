-- Fix 1: Circle admin privilege escalation
DROP POLICY IF EXISTS "Admins can promote members" ON circle_members;
CREATE POLICY "Admins can promote members"
ON circle_members
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM circle_members cm
    WHERE cm.circle_id = circle_members.circle_id
    AND cm.user_id = auth.uid()
    AND cm.role = 'admin'
  )
);

-- Fix 2: Circle membership read policy broken logic
DROP POLICY IF EXISTS "Members can read their circles" ON circles;
CREATE POLICY "Members can read their circles"
ON circles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM circle_members cm
    WHERE cm.circle_id = circles.id
    AND cm.user_id = auth.uid()
  )
);

-- Fix 3: memory_bookmarks - use auth.uid() not session variable
DROP POLICY IF EXISTS "Users can manage their bookmarks" ON memory_bookmarks;
CREATE POLICY "Users can manage their bookmarks"
ON memory_bookmarks
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Fix 4: memory_sparks - use auth.uid() not session variable  
DROP POLICY IF EXISTS "Users can manage their sparks" ON memory_sparks;
CREATE POLICY "Users can manage their sparks"
ON memory_sparks
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Fix 5: memory_reports - remove public read access
DROP POLICY IF EXISTS "Anyone can view reports" ON memory_reports;
CREATE POLICY "Only admins can view reports"
ON memory_reports
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role = 'admin'
  )
);
