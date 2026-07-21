import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { hasProfileData, setMatchSource, storeEmail } from "@/lib/matchFlow";
import { getDubaiEventDate } from "@/lib/eventDate";

export const Route = createFileRoute("/checkin")({
  component: CheckinPage,
});

function CheckinPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !trimmed.includes("@")) {
      setError("Please enter a valid email.");
      return;
    }

    setLoading(true);
    try {
      storeEmail(trimmed);

      await supabase.functions.invoke("manage-attendee", {
        body: { action: "upsert", email: trimmed, event_date: getDubaiEventDate() },
      });

      const { data: profileData, error: profileErr } = await supabase.functions.invoke(
        "manage-attendee",
        { body: { action: "get-profile", email: trimmed } },
      );
      if (profileErr) throw profileErr;

      const profile = profileData?.profile;
      const attendeeId = profile?.id as string | undefined;

      if (attendeeId) {
        const { data: preData } = await supabase.functions.invoke("manage-attendee", {
          body: {
            action: "get-pre-matches",
            attendee_id: attendeeId,
            event_date: getDubaiEventDate(),
          },
        });

        if (preData?.pre_matches?.length > 0) {
          setMatchSource("precomputed");
          navigate({ to: "/match" });
          return;
        }
      }

      if (hasProfileData(profile)) {
        setMatchSource("oracle");
        navigate({ to: "/match" });
        return;
      }

      navigate({ to: "/quick-question" });
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell title="Check in" subtitle="Enter your email to find your matches.">
      <div className="flex flex-col items-center justify-center min-h-[40vh] px-4">
        <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              autoFocus
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Finding your matches…" : "Find my matches"}
          </Button>
        </form>
      </div>
    </PageShell>
  );
}
