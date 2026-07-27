import { createClient } from '@supabase/supabase-js';
const SUPABASE_URL = "https://rynnnhxfrcebdandsbjn.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5bm5uaHhmcmNlYmRhbmRzYmpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxOTgwODEsImV4cCI6MjA5MDc3NDA4MX0.l58jEH3s6ZBDILqU9qMXM4AzahxNvo4tlfCTiuddZ70";
export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
