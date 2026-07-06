import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/manifesto")({
  component: ManifestoPage,
  ssr: false,
});

function ManifestoPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAccept = async () => {
    setLoading(true);
    setError("");
    const email = localStorage.getItem("gg_email");
    if (!email) {
      window.location.assign("/checkin");
      return;
    }

    try {
      const { error: fnError } = await supabase.functions.invoke("manage-attendee", {
        body: { action: "update", email, manifesto_accepted: true },
      });
      if (fnError) throw fnError;
      window.location.assign("/onboarding");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  };

  return (
  <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
    <div className="w-full max-w-[420px]">
      <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-2 text-center">Grit & Growl</p>
      <h1 className="text-2xl font-bold text-foreground mb-6 text-center">The Manifesto</h1>

      <div className="space-y-4 text-sm text-muted-foreground leading-relaxed mb-8">
        <p>1. <strong className="text-foreground">Show up.</strong> Half the battle is being here.</p>
        <p>2. <strong className="text-foreground">Be curious.</strong> Ask questions. Listen more than you talk.</p>
        <p>3. <strong className="text-foreground">Give first.</strong> Offer value before asking for anything.</p>
        <p>4. <strong className="text-foreground">No pitch decks.</strong> This isn't a conference booth.</p>
        <p>5. <strong className="text-foreground">Follow up.</strong> A great conversation dies without action.</p>
      </div>

      <button
        onClick={handleAccept}
        disabled={loading}
        className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold text-sm tracking-widest uppercase hover:opacity-90 transition-opacity disabled:opacity-50 min-h-[44px]"
      >
        {loading ? "Saving..." : "I Accept"}
      </button>

      {error && <p className="text-sm text-destructive mt-4 text-center">{error}</p>}
    </div>
  </div>
  );
}
