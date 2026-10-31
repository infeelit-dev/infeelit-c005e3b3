CREATE TABLE IF NOT EXISTS public.entreprise_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  logo_url text,
  sector text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.entreprise_follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  entreprise_id uuid REFERENCES public.entreprise_profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE (follower_id, entreprise_id)
);

ALTER TABLE public.entreprise_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entreprise_follows ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anyone_can_read_entreprise_profiles" ON public.entreprise_profiles;
CREATE POLICY "anyone_can_read_entreprise_profiles"
ON public.entreprise_profiles FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "owners_manage_entreprise_profiles" ON public.entreprise_profiles;
CREATE POLICY "owners_manage_entreprise_profiles"
ON public.entreprise_profiles FOR ALL TO authenticated
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "anyone_can_read_entreprise_follows" ON public.entreprise_follows;
CREATE POLICY "anyone_can_read_entreprise_follows"
ON public.entreprise_follows FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "users_manage_own_entreprise_follows" ON public.entreprise_follows;
CREATE POLICY "users_manage_own_entreprise_follows"
ON public.entreprise_follows FOR ALL TO authenticated
USING (follower_id = auth.uid())
WITH CHECK (follower_id = auth.uid());

GRANT SELECT ON public.entreprise_profiles TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.entreprise_profiles TO authenticated;
GRANT SELECT ON public.entreprise_follows TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.entreprise_follows TO authenticated;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'entreprise-logos',
  'entreprise-logos',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880;

DROP POLICY IF EXISTS "Anyone can view entreprise logos" ON storage.objects;
CREATE POLICY "Anyone can view entreprise logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'entreprise-logos');

DROP POLICY IF EXISTS "Users upload own entreprise logos" ON storage.objects;
CREATE POLICY "Users upload own entreprise logos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'entreprise-logos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
