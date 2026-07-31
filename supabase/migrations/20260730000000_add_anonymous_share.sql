-- Allow memories to opt into anonymous brand/teaser sharing
ALTER TABLE public.memories
ADD COLUMN IF NOT EXISTS allow_anonymous_share
BOOLEAN DEFAULT false;
