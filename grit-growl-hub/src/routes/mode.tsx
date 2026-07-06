import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getDubaiEventDate, getEventId } from "@/lib/eventDate";

export const Route = createFileRoute("/mode")({
  component: ModePage,
  ssr: false,
});

function ModePage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSelect = async (choice: "builder" | "lounge") => {
    setLoading(true);
    setError("");
    const email = localStorage.getItem("gg_email");
    if (!email) {
      window.location.assign("/checkin");
      return;
    }

    try {
      const { error: fnError } = await supabase.functions.invoke("manage-attendee", {
        body: {
          action: "upsert-participant",
          email,
          event_id: getEventId(),
          event_date: getDubaiEventDate(),
          mode: choice,
        },
      });
      if (fnError) throw fnError;

      await supabase.functions.invoke("manage-attendee", {
        body: { action: "update", email, mode: choice, event_date: getDubaiEventDate() },
      });

      if (choice === "lounge") {
        window.location.assign("/lounge");
      } else {
        window.location.assign("/onboarding");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  };

  return (
  <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
    <div className="w-full max-w-[420px] text-center">
      <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-2">Grit & Growl</p>
      <h1 className="text-2xl font-bold text-foreground mb-2">Choose your mode</h1>
      <p className="text-sm text-muted-foreground mb-8">How do you want to show up tonight?</p>

      <div className="space-y-4">
        <button
          onClick={() => handleSelect("builder")}
          disabled={loading}
          className="w-full py-5 rounded-xl bg-primary text-primary-foreground font-bold text-lg tracking-wide hover:opacity-90 transition-opacity disabled:opacity-50 min-h-[44px]"
        >
          🎯 HUNT
        </button>
        <p className="text-xs text-muted-foreground -mt-2">Get matched. Make connections.</p>

        <button
          onClick={() => handleSelect("lounge")}
          disabled={loading}
          className="w-full py-5 rounded-xl border border-border text-foreground font-bold text-lg tracking-wide hover:bg-muted transition-colors disabled:opacity-50 min-h-[44px]"
        >
          ☕ CHILL
        </button>
        <p className="text-xs text-muted-foreground -mt-2">No pressure. Just vibes.</p>
      </div>

      {error && <p className="text-sm text-destructive mt-4">{error}</p>}
    </div>
  </div>
  );
}
