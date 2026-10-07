import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { getStoredEmail } from "@/lib/matchFlow";
import { getDubaiEventDate } from "@/lib/eventDate";
import {
  clampPassionWords,
  countPassionWords,
  normalizePassionCluster,
} from "@/lib/passion";

export const Route = createFileRoute("/passion")({
  component: PassionPage,
  ssr: false,
});

const ACCENT = "#E07B3A";

function PassionPage() {
  const navigate = useNavigate();
  const [passion, setPassion] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const email = getStoredEmail();
    if (!email) {
      navigate({ to: "/checkin" });
      return;
    }

    void (async () => {
      const { data } = await supabase.functions.invoke("manage-attendee", {
        body: { action: "get-profile", email },
      });
      const profile = data?.profile;
      if (profile?.passion?.trim() && profile?.passion_cluster?.trim()) {
        navigate({ to: "/match" });
        return;
      }
      setChecking(false);
    })();
  }, [navigate]);

  const wordCount = countPassionWords(passion);
  const canSubmit = wordCount > 0 && wordCount <= 5 && !loading;

  const handleChange = (value: string) => {
    setPassion(clampPassionWords(value, 5));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    const email = getStoredEmail();
    if (!email) {
      navigate({ to: "/checkin" });
      return;
    }

    const trimmed = passion.trim();
    const cluster = normalizePassionCluster(trimmed);

    setLoading(true);
    setError(null);
    try {
      const { error: updateErr } = await supabase.functions.invoke("manage-attendee", {
        body: {
          action: "update",
          email,
          passion: trimmed,
          passion_cluster: cluster,
          event_date: getDubaiEventDate(),
        },
      });
      if (updateErr) throw updateErr;
      navigate({ to: "/match" });
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0A0A0A",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Inter, sans-serif",
        }}
      >
        <p style={{ color: "#555", fontSize: "14px" }}>One moment…</p>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0A0A0A",
        padding: "32px 20px 48px",
        fontFamily: "Inter, sans-serif",
        color: "#fff",
      }}
    >
      <div style={{ maxWidth: "420px", margin: "0 auto" }}>
        <p
          style={{
            fontSize: "11px",
            color: ACCENT,
            letterSpacing: "2px",
            textTransform: "uppercase",
            marginBottom: "20px",
          }}
        >
          Before we show you your matches
        </p>

        <p style={{ fontSize: "16px", lineHeight: 1.55, color: "#ccc", marginBottom: "16px" }}>
          Business is why you're here. But it's not who you are.
        </p>

        <p style={{ fontSize: "18px", fontWeight: 600, lineHeight: 1.4, marginBottom: "20px" }}>
          What's the thing that makes you forget time exists?
        </p>

        <div
          style={{
            background: "#111",
            border: "1px solid #1E1E1E",
            borderLeft: `3px solid ${ACCENT}`,
            borderRadius: "12px",
            padding: "16px",
            marginBottom: "20px",
          }}
        >
          <p style={{ fontSize: "12px", color: ACCENT, marginBottom: "8px", letterSpacing: "1px" }}>
            MALIK'S ANSWER
          </p>
          <p style={{ fontSize: "14px", color: "#aaa", lineHeight: 1.55, fontStyle: "italic", margin: 0 }}>
            Cinema. Since I was 6 years old. I'd give everything for a great story, which is why I spent
            years producing short films.
          </p>
          <p style={{ fontSize: "13px", color: "#666", lineHeight: 1.5, margin: "12px 0 0" }}>
            You may have noticed the rose in his blazer pocket. A different color every week. Because at
            Grit & Growl, we believe the best business relationships are built with love.
          </p>
        </div>

        <p style={{ fontSize: "15px", color: "#ccc", marginBottom: "8px" }}>Now it's your turn.</p>
        <p style={{ fontSize: "18px", fontWeight: 600, marginBottom: "16px" }}>What's your passion?</p>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={passion}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="e.g. Cinema, sailing, jazz…"
            autoFocus
            autoComplete="off"
            style={{
              width: "100%",
              boxSizing: "border-box",
              background: "#111",
              border: `1px solid ${passion ? ACCENT : "#2A2A2A"}`,
              borderRadius: "12px",
              padding: "16px",
              color: "#fff",
              fontSize: "16px",
              fontFamily: "Inter, sans-serif",
              outline: "none",
              marginBottom: "8px",
            }}
          />
          <p
            style={{
              fontSize: "11px",
              color: wordCount >= 5 ? ACCENT : "#555",
              textAlign: "right",
              marginBottom: "20px",
            }}
          >
            {wordCount} / 5 words
          </p>

          {error && (
            <p style={{ color: ACCENT, fontSize: "13px", marginBottom: "12px" }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={!canSubmit}
            style={{
              width: "100%",
              minHeight: "52px",
              background: canSubmit ? ACCENT : "#161616",
              color: canSubmit ? "#fff" : "#444",
              border: "none",
              borderRadius: "12px",
              fontSize: "15px",
              fontWeight: 600,
              fontFamily: "Inter, sans-serif",
              cursor: canSubmit ? "pointer" : "not-allowed",
            }}
          >
            {loading ? "Saving…" : "Show me my matches →"}
          </button>
        </form>
      </div>
    </div>
  );
}
