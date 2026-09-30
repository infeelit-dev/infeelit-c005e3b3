-- Room assignment for Birds Dubai U Deck venues
ALTER TABLE public.attendees
  ADD COLUMN IF NOT EXISTS room TEXT;

ALTER TABLE public.attendees
  DROP CONSTRAINT IF EXISTS attendees_room_check;

ALTER TABLE public.attendees
  ADD CONSTRAINT attendees_room_check
  CHECK (room IS NULL OR room IN ('GOLDEN_LION', 'CRYSTAL_BAR'));

CREATE INDEX IF NOT EXISTS attendees_event_date_room_idx
  ON public.attendees (event_date, room);
