-- Community carpooling board for Grit & Growl evenings
CREATE TABLE IF NOT EXISTS public.carpool_offers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  type TEXT NOT NULL CHECK (type IN ('driver', 'rider')),
  name TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  zone TEXT NOT NULL,
  departure_time TEXT NOT NULL,
  seats INTEGER,
  bio TEXT,
  event_date DATE NOT NULL DEFAULT CURRENT_DATE
);

CREATE INDEX IF NOT EXISTS carpool_offers_event_date_idx
  ON public.carpool_offers (event_date, created_at DESC);

ALTER TABLE public.carpool_offers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon can insert" ON public.carpool_offers;
CREATE POLICY "anon can insert" ON public.carpool_offers
  FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS "anon can select" ON public.carpool_offers;
CREATE POLICY "anon can select" ON public.carpool_offers
  FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "authenticated can insert" ON public.carpool_offers;
CREATE POLICY "authenticated can insert" ON public.carpool_offers
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated can select" ON public.carpool_offers;
CREATE POLICY "authenticated can select" ON public.carpool_offers
  FOR SELECT TO authenticated USING (true);

GRANT SELECT, INSERT ON public.carpool_offers TO anon, authenticated;

-- Realtime: new cards without refresh
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.carpool_offers;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN undefined_object THEN NULL;
END $$;
