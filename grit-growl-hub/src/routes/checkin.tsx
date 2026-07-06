import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getDubaiEventDate } from "@/lib/eventDate";
import { createFileRoute } from "@tanstack/react-router";

type CheckinView = "magic" | "walkin" | "sent";

function CheckinPage() {
  const [view, setView] = useState<CheckinView>("magic");
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const normalizedEmail = email.trim().toLowerCase();
  const isMagicValid = normalizedEmail && consent;
  const isWalkinValid = firstName.trim() && normalizedEmail && consent;

  const handleMagicLink = async () => {
    if (!isMagicValid) {
      setError("Please enter your email and accept the terms.");
      return;
    }

    setLoading(true);
    setError("");
    localStorage.setItem("gg_email", normalizedEmail);

    const { error: authError } = await supabase.auth.signInWithOtp({
      email: normalizedEmail,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (authError) {
      console.error("Magic link error:", authError);
      setError("Could not send magic link. Try walk-in check-in below.");
      setLoading(false);
      return;
    }

    setView("sent");
    setLoading(false);
  };

  const handleWalkIn = async () => {
    if (!isWalkinValid) {
      setError("Please fill in all fields and accept the terms.");
      return;
    }

    setLoading(true);
    setError("");

    const { error: fnError } = await supabase.functions.invoke("manage-attendee", {
      body: {
        action: "upsert",
        email: normalizedEmail,
        first_name: firstName.trim(),
        data_consent: consent,
        checked_in_at: new Date().toISOString(),
        event_date: getDubaiEventDate(),
      },
    });

    if (fnError) {
      console.error("Edge function error:", fnError);
      setError("Something went wrong. Please try again.");
      setLoading(false);
      return;
    }

    localStorage.setItem("gg_email", normalizedEmail);
    window.location.assign("/mode");
  };

  if (view === "sent") {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0A0A0A",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <div style={{ width: "100%", maxWidth: "420px", textAlign: "center" }}>
          <h1 style={{ fontSize: "22px", fontWeight: 600, color: "#fff", marginBottom: "12px" }}>Check your email</h1>
          <p style={{ fontSize: "14px", color: "#666", lineHeight: 1.6, marginBottom: "24px" }}>
            We sent a magic link to <strong style={{ color: "#ccc" }}>{normalizedEmail}</strong>. Tap it on your phone to
            continue check-in.
          </p>
          <button
            onClick={() => setView("walkin")}
            style={{
              background: "transparent",
              border: "1px solid #2A2A2A",
              borderRadius: "11px",
              padding: "14px",
              color: "#888",
              fontSize: "14px",
              width: "100%",
              cursor: "pointer",
              minHeight: "44px",
            }}
          >
            Use walk-in form instead
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0A0A0A",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div
        style={{
          height: "280px",
          background: "#0A0A0A",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(ellipse at 50% 60%, rgba(216,90,48,0.08) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            fontSize: "10px",
            color: "#D85A30",
            letterSpacing: "3px",
            textTransform: "uppercase",
            border: "1px solid rgba(216,90,48,0.2)",
            padding: "4px 14px",
            borderRadius: "20px",
            background: "#1A0800",
            marginBottom: "18px",
          }}
        >
          EDITION 35 · TONIGHT
        </div>

        <div
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "52px",
            color: "#ffffff",
            letterSpacing: "3px",
            lineHeight: 1,
            textAlign: "center",
            marginBottom: "6px",
          }}
        >
          GRIT <span style={{ color: "#D85A30" }}>&</span> GROWL
        </div>

        <div style={{ fontSize: "10px", color: "#333", textAlign: "center", letterSpacing: "1px", marginBottom: "22px" }}>
          powered by Infeelit Pro
        </div>

        <div style={{ display: "flex", gap: "20px", alignItems: "center", justifyContent: "center" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "16px", fontWeight: "600", color: "#ffffff" }}>200+</div>
            <div style={{ fontSize: "9px", color: "#333", textTransform: "uppercase", letterSpacing: "1px" }}>TONIGHT</div>
          </div>
          <div style={{ width: "1px", height: "24px", background: "#1E1E1E" }} />
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "16px", fontWeight: "600", color: "#ffffff" }}>35</div>
            <div style={{ fontSize: "9px", color: "#333", textTransform: "uppercase", letterSpacing: "1px" }}>EDITIONS</div>
          </div>
          <div style={{ width: "1px", height: "24px", background: "#1E1E1E" }} />
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "16px", fontWeight: "600", color: "#ffffff" }}>63F</div>
            <div style={{ fontSize: "9px", color: "#333", textTransform: "uppercase", letterSpacing: "1px" }}>BIRDS DUBAI</div>
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "1px",
            background: "linear-gradient(90deg, transparent, rgba(216,90,48,0.3), transparent)",
          }}
        />
      </div>

      <div style={{ background: "#0A0A0A", padding: "20px 24px 32px" }}>
        <div style={{ width: "100%", maxWidth: "420px", margin: "0 auto" }}>
          <div
            style={{
              background: "#111111",
              border: "1px solid #1E1E1E",
              borderRadius: "14px",
              padding: "16px",
              marginBottom: "12px",
            }}
          >
            {view === "walkin" && (
              <input
                type="text"
                placeholder="Your first name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                style={{
                  background: "#1A1A1A",
                  border: "1px solid #2A2A2A",
                  borderRadius: "9px",
                  padding: "12px 14px",
                  color: "#ffffff",
                  fontSize: "14px",
                  fontFamily: "'Inter', sans-serif",
                  width: "100%",
                  outline: "none",
                  marginBottom: "8px",
                  minHeight: "44px",
                }}
              />
            )}
            <input
              type="email"
              placeholder="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                background: "#1A1A1A",
                border: "1px solid #2A2A2A",
                borderRadius: "9px",
                padding: "12px 14px",
                color: "#ffffff",
                fontSize: "14px",
                fontFamily: "'Inter', sans-serif",
                width: "100%",
                outline: "none",
                minHeight: "44px",
              }}
            />
            {error && <p style={{ color: "#D85A30", fontSize: "12px", margin: "8px 0 0 0" }}>{error}</p>}
          </div>

          <div
            onClick={() => setConsent(!consent)}
            style={{
              display: "flex",
              gap: "10px",
              alignItems: "flex-start",
              background: "#111111",
              border: `1px solid ${consent ? "#D85A30" : "#2A2A2A"}`,
              borderRadius: "10px",
              padding: "12px 14px",
              marginBottom: "12px",
              cursor: "pointer",
            }}
          >
            <div
              style={{
                width: "18px",
                height: "18px",
                borderRadius: "5px",
                background: consent ? "#D85A30" : "transparent",
                border: `1px solid ${consent ? "#D85A30" : "#2A2A2A"}`,
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "18px",
              }}
            >
              {consent && <span style={{ color: "#fff", fontSize: "11px", fontWeight: "700" }}>✓</span>}
            </div>
            <p style={{ fontSize: "12px", color: consent ? "#ccc" : "#777", lineHeight: "1.6", margin: 0 }}>
              I agree my information is used only to match me with the right people tonight. No data is shared or kept
              after this event.
            </p>
          </div>

          {view === "magic" ? (
            <>
              <button
                onClick={handleMagicLink}
                disabled={!isMagicValid || loading}
                style={{
                  background: isMagicValid && !loading ? "#D85A30" : "#161616",
                  borderRadius: "11px",
                  padding: "15px",
                  color: isMagicValid && !loading ? "#ffffff" : "#555",
                  fontSize: "15px",
                  fontWeight: "600",
                  width: "100%",
                  border: "none",
                  cursor: isMagicValid && !loading ? "pointer" : "not-allowed",
                  fontFamily: "'Inter', sans-serif",
                  minHeight: "44px",
                }}
              >
                {loading ? "Sending link..." : "Send magic link →"}
              </button>
              <button
                onClick={() => {
                  setView("walkin");
                  setError("");
                }}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#555",
                  fontSize: "14px",
                  marginTop: "14px",
                  width: "100%",
                  cursor: "pointer",
                  minHeight: "44px",
                }}
              >
                Walk-in check-in (no email link)
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleWalkIn}
                disabled={!isWalkinValid || loading}
                style={{
                  background: isWalkinValid && !loading ? "#D85A30" : "#161616",
                  borderRadius: "11px",
                  padding: "15px",
                  color: isWalkinValid && !loading ? "#ffffff" : "#555",
                  fontSize: "15px",
                  fontWeight: "600",
                  width: "100%",
                  border: "none",
                  cursor: isWalkinValid && !loading ? "pointer" : "not-allowed",
                  fontFamily: "'Inter', sans-serif",
                  minHeight: "44px",
                }}
              >
                {loading ? "One moment..." : "Join the evening →"}
              </button>
              <button
                onClick={() => {
                  setView("magic");
                  setError("");
                }}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#555",
                  fontSize: "14px",
                  marginTop: "14px",
                  width: "100%",
                  cursor: "pointer",
                  minHeight: "44px",
                }}
              >
                ← Use magic link instead
              </button>
            </>
          )}

          <p style={{ fontSize: "10px", color: "#222", textAlign: "center", marginTop: "10px" }}>
            Wednesday · Birds Dubai · 63rd floor
          </p>
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/checkin")({
  component: CheckinPage,
  ssr: false,
});
