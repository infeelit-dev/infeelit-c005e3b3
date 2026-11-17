-- Keep memories.sparks_count in sync with memory_sparks.
-- Client updates fail for non-owners because memories UPDATE is owner-only RLS.
-- SECURITY DEFINER lets the trigger write the counter regardless of who sparked.

CREATE OR REPLACE FUNCTION public.sync_memory_sparks_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.memories
       SET sparks_count = COALESCE(sparks_count, 0) + 1
     WHERE id = NEW.memory_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.memories
       SET sparks_count = GREATEST(COALESCE(sparks_count, 0) - 1, 0)
     WHERE id = OLD.memory_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_memory_sparks_count ON public.memory_sparks;
CREATE TRIGGER trg_sync_memory_sparks_count
AFTER INSERT OR DELETE ON public.memory_sparks
FOR EACH ROW
EXECUTE FUNCTION public.sync_memory_sparks_count();

UPDATE public.memories m
SET sparks_count = (
  SELECT COUNT(*)::int FROM public.memory_sparks s WHERE s.memory_id = m.id
);
