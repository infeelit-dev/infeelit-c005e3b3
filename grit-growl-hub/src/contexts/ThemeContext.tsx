import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

export type AppMode = "lounge" | "builder";

interface ThemeContextValue {
  mode: AppMode;
  setMode: (mode: AppMode) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = "gg_mode";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<AppMode>("lounge");

  // Load from supabase session metadata or localStorage
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const sessionMode = data.session?.user?.user_metadata?.mode as AppMode | undefined;
        if (sessionMode && !cancelled) {
          setModeState(sessionMode);
          return;
        }
      } catch {
        // ignore — fall through to local storage
      }
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem(STORAGE_KEY) as AppMode | null;
        if (stored && !cancelled) setModeState(stored);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Apply to root element
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-mode", mode);
    }
  }, [mode]);

  const setMode = async (next: AppMode) => {
    setModeState(next);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, next);
    }
    try {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        await supabase.auth.updateUser({ data: { mode: next } });
      }
    } catch {
      // No session — fine, persisted locally.
    }
  };

  return (
    <ThemeContext.Provider value={{ mode, setMode }}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}