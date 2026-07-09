import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://veznmwzhlvnpjhrwdmcm.supabase.co";
const SUPABASE_PUBLISHABLE_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlem5td3pobHZucGpocndkbWNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzNzQ0NDAsImV4cCI6MjA4OTk1MDQ0MH0.I6gIdKkY10r64kLgtxeIE4secG-9y1TwwRCBhIhE4zM";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});
