import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { getStoredEmail, setMatchSource } from "@/lib/matchFlow";
import { getDubaiEventDate } from "@/lib/eventDate";

export const Route = createFileRoute("/quick-question")({
  component: QuickQuestionPage,
});

function QuickQuestionPage() {
  const navigate = useNavigate();
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = answer.trim();
    if (!trimmed) {
      setError("Please share a quick answer so we can find your matches.");
      return;
    }

    const email = getStoredEmail();
    if (!email) {
      navigate({ to: "/checkin" });
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { error: updateErr } = await supabase.functions.invoke("manage-attendee", {
        body: {
          action: "update",
          email,
          q1: trimmed,
          event_date: getDubaiEventDate(),
        },
      });
      if (updateErr) throw updateErr;

      setMatchSource("oracle");
      navigate({ to: "/match" });
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell
      title="One quick question"
      subtitle="What are you working on right now, and what would make tonight worth it?"
    >
      <div className="flex flex-col items-center justify-center min-h-[40vh] px-4">
        <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
          <Textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Tell us in a sentence or two…"
            rows={4}
            required
            autoFocus
            className="resize-none"
          />

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Finding your matches…" : "Find my matches"}
          </Button>
        </form>
      </div>
    </PageShell>
  );
}
