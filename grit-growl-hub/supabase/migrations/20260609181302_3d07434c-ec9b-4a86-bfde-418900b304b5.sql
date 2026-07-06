CREATE INDEX IF NOT EXISTS idx_matches_from_attendee ON public.matches(from_attendee_id);
CREATE INDEX IF NOT EXISTS idx_matches_to_attendee ON public.matches(to_attendee_id);
CREATE INDEX IF NOT EXISTS idx_matches_event_date ON public.matches(event_date);
CREATE INDEX IF NOT EXISTS idx_notifications_to_attendee ON public.notifications(to_attendee_id);
CREATE INDEX IF NOT EXISTS idx_notifications_event_date ON public.notifications(event_date);