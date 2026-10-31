CREATE TABLE IF NOT EXISTS follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(follower_id, following_id)
);
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "users_manage_own_follows" ON follows;
CREATE POLICY "users_manage_own_follows" ON follows FOR ALL TO authenticated USING (follower_id = auth.uid()) WITH CHECK (follower_id = auth.uid());
DROP POLICY IF EXISTS "anyone_can_read_follows" ON follows;
CREATE POLICY "anyone_can_read_follows" ON follows FOR SELECT TO anon, authenticated USING (true);
GRANT SELECT ON follows TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON follows TO authenticated;
