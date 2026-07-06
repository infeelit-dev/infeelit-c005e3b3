CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

CREATE OR REPLACE FUNCTION public.trigger_pulse()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  IF NEW.onboarding_complete = true
     AND (OLD.onboarding_complete IS DISTINCT FROM true) THEN
    PERFORM net.http_post(
      url := 'https://uezqiibyzdmzulqnemzu.supabase.co/functions/v1/pulse-engine',
      headers := jsonb_build_object('Content-Type', 'application/json'),
      body := jsonb_build_object(
        'newcomer_id', NEW.id,
        'event_date', NEW.event_date
      )
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_onboarding_complete ON public.attendees;

CREATE TRIGGER on_onboarding_complete
AFTER UPDATE ON public.attendees
FOR EACH ROW
EXECUTE FUNCTION public.trigger_pulse();