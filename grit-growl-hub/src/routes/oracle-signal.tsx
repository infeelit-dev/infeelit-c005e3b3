import { useEffect, useState, type CSSProperties } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { getStoredEmail, setMatchSource } from "@/lib/matchFlow";
import { getDubaiEventDate } from "@/lib/eventDate";

export const Route = createFileRoute("/oracle-signal")({
  component: OracleSignalPage,
  ssr: false,
});

const Q1_OPTIONS = [
  {
    id: "close_deal",
    label: "Close a deal",
    subtitle: "A specific client, partner or contract",
  },
  {
    id: "cofounder",
    label: "Find a co-founder",
    subtitle: "Technical, commercial or operational",
  },
  {
    id: "investors",
    label: "Meet investors",
    subtitle: "Angel, VC, family office, strategic",
  },
  {
    id: "introduced",
    label: "Get introduced",
    subtitle: "To someone specific I can't reach alone",
  },
] as const;

const MAX_CHARS = 100;

function OracleSignalPage() {
  const navigate = useNavigate();
  const [screen, setScreen] = useState(1);
  const [q1Option, setQ1Option] = useState<string | null>(null);
  const [q1Custom, setQ1Custom] = useState("");
  const [showSomethingElse, setShowSomethingElse] = useState(false);
  const [q2, setQ2] = useState("");
  const [q3, setQ3] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!getStoredEmail()) {
      navigate({ to: "/checkin" });
    }
  }, [navigate]);

  useEffect(() => {
    if (screen !== 1) return;
    const id = window.setTimeout(() => setScreen(2), 3000);
    return () => window.clearTimeout(id);
  }, [screen]);

  const resolveQ1 = () => {
    if (showSomethingElse) return q1Custom.trim();
    const opt = Q1_OPTIONS.find((o) => o.id === q1Option);
    return opt ? `${opt.label} — ${opt.subtitle}` : "";
  };

  const canContinueQ1 = showSomethingElse
    ? q1Custom.trim().length > 0
    : q1Option !== null;

  const handleFinish = async () => {
    const email = getStoredEmail();
    if (!email) {
      navigate({ to: "/checkin" });
      return;
    }

    const q1Value = resolveQ1();
    if (!q1Value || !q2.trim() || !q3.trim()) {
      setError("Please complete all three signals.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { error: updateErr } = await supabase.functions.invoke("manage-attendee", {
        body: {
          action: "update",
          email,
          q1: q1Value,
          q2: q2.trim(),
          q3: q3.trim(),
          onboarding_complete: true,
          event_date: getDubaiEventDate(),
        },
      });
      if (updateErr) throw updateErr;
      setMatchSource("oracle");
      navigate({ to: "/match" });
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  if (screen === 1) {
    return (
      <div style={shellStyle}>
        <style>{pulseStyles}</style>
        <p
          style={{
            fontSize: "11px",
            color: "#D85A30",
            letterSpacing: "3px",
            textTransform: "uppercase",
            marginBottom: "28px",
          }}
        >
          Oracle Signal
        </p>
        <div
          aria-hidden
          style={{
            fontSize: "56px",
            lineHeight: 1,
            marginBottom: "24px",
            animation: "pawPulse 1.4s ease-in-out infinite",
          }}
        >
          🐾
        </div>
        <h1
          style={{
            fontSize: "22px",
            fontWeight: 600,
            color: "#fff",
            textAlign: "center",
            maxWidth: "280px",
            lineHeight: 1.35,
            marginBottom: "12px",
          }}
        >
          Calibrating your signal
        </h1>
        <p
          style={{
            fontSize: "13px",
            color: "#555",
            textAlign: "center",
            maxWidth: "260px",
            lineHeight: 1.5,
          }}
        >
          Three precise signals. Five matches. One evening.
        </p>
      </div>
    );
  }

  return (
    <div style={{ ...shellStyle, justifyContent: "flex-start", paddingTop: "48px" }}>
      <style>{pulseStyles}</style>
      <div style={{ width: "100%", maxWidth: "400px" }}>
        <p
          style={{
            fontSize: "10px",
            color: "#444",
            letterSpacing: "2px",
            textTransform: "uppercase",
            textAlign: "center",
            marginBottom: "12px",
          }}
        >
          Signal {screen - 1} / 3
        </p>
        <div
          style={{
            width: "100%",
            height: "2px",
            background: "#1A1A1A",
            borderRadius: 2,
            marginBottom: "36px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${((screen - 1) / 3) * 100}%`,
              height: "100%",
              background: "#D85A30",
              transition: "width 0.35s ease",
            }}
          />
        </div>

        {screen === 2 && (
          <>
            <h1 style={titleStyle}>What would make tonight worth it?</h1>
            <p style={subStyle}>Pick one. Be honest — the oracle needs a sharp target.</p>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" }}>
              {Q1_OPTIONS.map((opt) => {
                const selected = !showSomethingElse && q1Option === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setShowSomethingElse(false);
                      setQ1Option(opt.id);
                    }}
                    style={{
                      textAlign: "left",
                      background: selected ? "#1A0800" : "#111",
                      border: `1px solid ${selected ? "#D85A30" : "#1E1E1E"}`,
                      borderRadius: "14px",
                      padding: "16px 18px",
                      cursor: "pointer",
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    <div style={{ fontSize: "15px", fontWeight: 600, color: "#fff", marginBottom: "4px" }}>
                      {opt.label}
                    </div>
                    <div style={{ fontSize: "12px", color: "#666", lineHeight: 1.4 }}>· {opt.subtitle}</div>
                  </button>
                );
              })}
            </div>

            {!showSomethingElse ? (
              <button
                type="button"
                onClick={() => {
                  setShowSomethingElse(true);
                  setQ1Option(null);
                }}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#555",
                  fontSize: "13px",
                  textDecoration: "underline",
                  cursor: "pointer",
                  fontFamily: "'Inter', sans-serif",
                  padding: "8px 0",
                  marginBottom: "20px",
                  width: "100%",
                  textAlign: "center",
                }}
              >
                Something else
              </button>
            ) : (
              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "11px",
                    color: "#888",
                    marginBottom: "8px",
                  }}
                >
                  Be specific — what exactly?
                </label>
                <textarea
                  value={q1Custom}
                  onChange={(e) => setQ1Custom(e.target.value.slice(0, MAX_CHARS))}
                  placeholder="e.g. Find a CFO who knows SaaS metrics, available part-time in Dubai"
                  rows={3}
                  autoFocus
                  style={textareaStyle}
                />
                <button
                  type="button"
                  onClick={() => {
                    setShowSomethingElse(false);
                    setQ1Custom("");
                  }}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#444",
                    fontSize: "12px",
                    cursor: "pointer",
                    marginTop: "8px",
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  ← Back to options
                </button>
              </div>
            )}

            <PrimaryButton
              disabled={!canContinueQ1}
              onClick={() => setScreen(3)}
              label="Next →"
            />
          </>
        )}

        {screen === 3 && (
          <>
            <label style={oracleLabelStyle}>
              NOT YOUR JOB TITLE.
              <br />
              WHAT YOU HAVE THAT OTHERS DON'T.
            </label>
            <textarea
              value={q2}
              onChange={(e) => setQ2(e.target.value.slice(0, MAX_CHARS))}
              placeholder="e.g. Warm intro to 3 family offices deploying in MENA right now — I close in 48h or I don't pitch"
              rows={4}
              autoFocus
              style={{ ...textareaStyle, marginTop: "16px" }}
            />
            {q2.length > 0 && <CharCounter count={q2.length} max={MAX_CHARS} />}
            <div style={{ height: "24px" }} />
            <PrimaryButton
              disabled={!q2.trim()}
              onClick={() => setScreen(4)}
              label="Next →"
            />
            <BackLink onClick={() => setScreen(2)} />
          </>
        )}

        {screen === 4 && (
          <>
            <label style={oracleLabelStyle}>
              A NUMBER. A REALITY. A STRONG SIGNAL.
            </label>
            <textarea
              value={q3}
              onChange={(e) => setQ3(e.target.value.slice(0, MAX_CHARS))}
              placeholder="e.g. 12 paying clients, closing $200K pre-seed in 6 weeks, shipped 3 SaaS products this year"
              rows={4}
              autoFocus
              style={{ ...textareaStyle, marginTop: "16px" }}
            />
            {q3.length > 0 && <CharCounter count={q3.length} max={MAX_CHARS} />}
            <p
              style={{
                fontSize: "11px",
                color: "#444",
                lineHeight: 1.5,
                marginTop: "10px",
                marginBottom: "24px",
              }}
            >
              Titles and industries don't count here. The oracle needs something concrete.
            </p>
            {error && (
              <p style={{ color: "#D85A30", fontSize: "13px", marginBottom: "12px" }}>{error}</p>
            )}
            <PrimaryButton
              disabled={!q3.trim() || loading}
              onClick={() => void handleFinish()}
              label={loading ? "Finding your matches…" : "Find my matches →"}
            />
            <BackLink onClick={() => setScreen(3)} />
          </>
        )}
      </div>
    </div>
  );
}

function PrimaryButton({
  disabled,
  onClick,
  label,
}: {
  disabled: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      style={{
        width: "100%",
        minHeight: "52px",
        background: disabled ? "#161616" : "#D85A30",
        color: disabled ? "#444" : "#fff",
        border: "none",
        borderRadius: "12px",
        fontSize: "15px",
        fontWeight: 600,
        fontFamily: "'Inter', sans-serif",
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      {label}
    </button>
  );
}

function BackLink({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "block",
        width: "100%",
        marginTop: "14px",
        background: "transparent",
        border: "none",
        color: "#444",
        fontSize: "13px",
        cursor: "pointer",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      ← Back
    </button>
  );
}

function CharCounter({ count, max }: { count: number; max: number }) {
  return (
    <p
      style={{
        fontSize: "11px",
        color: count >= max ? "#D85A30" : "#555",
        textAlign: "right",
        marginTop: "6px",
      }}
    >
      {count} / {max}
    </p>
  );
}

const shellStyle: CSSProperties = {
  minHeight: "100vh",
  background: "#0A0A0A",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: "24px",
  fontFamily: "'Inter', sans-serif",
};

const titleStyle: CSSProperties = {
  fontSize: "22px",
  fontWeight: 600,
  color: "#fff",
  lineHeight: 1.3,
  marginBottom: "8px",
};

const subStyle: CSSProperties = {
  fontSize: "13px",
  color: "#555",
  lineHeight: 1.5,
  marginBottom: "24px",
};

const oracleLabelStyle: CSSProperties = {
  display: "block",
  fontSize: "11px",
  color: "#D85A30",
  letterSpacing: "1.5px",
  textTransform: "uppercase",
  fontWeight: 600,
  lineHeight: 1.5,
};

const textareaStyle: CSSProperties = {
  width: "100%",
  background: "#111",
  border: "1px solid #2A2A2A",
  borderRadius: "12px",
  padding: "16px",
  color: "#fff",
  fontSize: "15px",
  fontFamily: "'Inter', sans-serif",
  lineHeight: 1.5,
  resize: "none",
  outline: "none",
  boxSizing: "border-box",
};

const pulseStyles = `
  @keyframes pawPulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.55; transform: scale(0.92); }
  }
`;
