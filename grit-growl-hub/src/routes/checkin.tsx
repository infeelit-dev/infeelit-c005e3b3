import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { createFileRoute } from "@tanstack/react-router";

type CheckinView = "email" | "sent";

function CheckinPage() {
  const [view, setView] = useState<CheckinView>("email");
  const [email, setEmail] = useState("");
  const [sentEmail, setSentEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendMagicLink = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      setError("Please enter your email address.");
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
      setError("Could not send magic link. Please try again.");
      setLoading(false);
      return;
    }

    setSentEmail(normalizedEmail);
    setView("sent");
    setLoading(false);
  };

  const buttonStyle = (enabled: boolean): React.CSSProperties => ({
    background: enabled ? "#D85A30" : "#161616",
    borderRadius: "12px",
    height: "52px",
    color: enabled ? "#ffffff" : "#555",
    fontSize: "15px",
    fontWeight: 600,
    width: "100%",
    border: "none",
    cursor: enabled ? "pointer" : "not-allowed",
    fontFamily: "'Inter', sans-serif",
  });

  const inputStyle: React.CSSProperties = {
    background: "#1A1A1A",
    border: "1px solid #2A2A2A",
    borderRadius: "12px",
    padding: "14px 16px",
    color: "#ffffff",
    fontSize: "14px",
    fontFamily: "'Inter', sans-serif",
    width: "100%",
    outline: "none",
    height: "52px",
    boxSizing: "border-box",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0A0A0A",
        fontFamily: "'Inter', sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "24px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "48px", marginTop: "32px" }}>
          <div
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "48px",
              color: "#ffffff",
              letterSpacing: "3px",
              lineHeight: 1,
            }}
          >
            GRIT <span style={{ color: "#D85A30" }}>&</span> GROWL
          </div>
        </div>

        {view === "email" ? (
          <div style={{ flex: 1 }}>
            <h1
              style={{
                fontSize: "24px",
                fontWeight: 600,
                color: "#ffffff",
                marginBottom: "12px",
                lineHeight: 1.3,
              }}
            >
              Your profile. Your matches.
            </h1>
            <p style={{ fontSize: "14px", color: "#666", lineHeight: 1.6, marginBottom: "32px" }}>
              Enter your email to access the app. We'll send you a secure link.
            </p>

            <input
              type="email"
              placeholder="you@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMagicLink()}
              style={{ ...inputStyle, marginBottom: error ? "8px" : "16px" }}
            />
            {error && (
              <p style={{ color: "#D85A30", fontSize: "12px", marginBottom: "16px" }}>{error}</p>
            )}

            <button
              onClick={handleSendMagicLink}
              disabled={!email.trim() || loading}
              style={buttonStyle(!!email.trim() && !loading)}
            >
              {loading ? "Sending..." : "Send me a magic link →"}
            </button>

            <p style={{ fontSize: "12px", color: "#444", textAlign: "center", marginTop: "16px", lineHeight: 1.5 }}>
              First time? Your profile will be created in 2 minutes.
            </p>
          </div>
        ) : (
          <div style={{ flex: 1, textAlign: "center" }}>
            <div style={{ fontSize: "48px", marginBottom: "24px" }}>📧</div>
            <h1 style={{ fontSize: "24px", fontWeight: 600, color: "#ffffff", marginBottom: "16px" }}>
              Check your email
            </h1>
            <p style={{ fontSize: "14px", color: "#666", lineHeight: 1.6, marginBottom: "16px" }}>
              We sent a magic link to <strong style={{ color: "#ccc" }}>{sentEmail}</strong>. Click it to access your
              profile and find who you should meet tonight.
            </p>
            <p style={{ fontSize: "12px", color: "#444", lineHeight: 1.5, marginBottom: "32px" }}>
              Didn't receive it? Check your spam folder.
            </p>

            <button
              onClick={() => {
                setView("email");
                setError("");
              }}
              style={{
                ...buttonStyle(true),
                background: "transparent",
                border: "1px solid #2A2A2A",
                color: "#888",
              }}
            >
              Try a different email
            </button>
          </div>
        )}

        <p
          style={{
            fontSize: "12px",
            color: "#333",
            textAlign: "center",
            marginTop: "auto",
            paddingTop: "48px",
            paddingBottom: "16px",
          }}
        >
          Every Wednesday · Birds Dubai · 63F · 7PM
        </p>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/checkin")({
  component: CheckinPage,
  ssr: false,
});
