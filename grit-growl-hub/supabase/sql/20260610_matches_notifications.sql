CREATE TABLE IF NOT EXISTS matches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  from_attendee_id UUID REFERENCES attendees(id) ON DELETE CASCADE,
  to_attendee_id UUID REFERENCES attendees(id) ON DELETE CASCADE,
  event_date DATE,
  oracle_resonance TEXT,
  accepted BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  to_attendee_id UUID REFERENCES attendees(id) ON DELETE CASCADE,
  from_first_name TEXT,
  message TEXT,
  location TEXT,
  description TEXT,
  event_date DATE,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);