ALTER TABLE public.memories
ADD COLUMN IF NOT EXISTS location_visibility text DEFAULT 'family';
