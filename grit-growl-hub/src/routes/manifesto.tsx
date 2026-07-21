import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { createFileRoute } from "@tanstack/react-router";

function ManifestoPage() {
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleEnter = async () => {
    if (!accepted) return;
    setLoading(true);

    const email = localStorage.getItem("gg_email");

    if (email) {
      const { data, error } = await supabase.functions.invoke("manage-attendee", {
        body: { action: "update", email, manifesto_accepted: true },
      });
      if (error || !data?.success) {
        console.error("❌ Manifesto error:", error || data?.error);
        setLoading(false);
        return;
      }
    }


    navigate({ to: "/onboarding" });
  };

  const rules = [
    {
      num: "01",
      body: "Come to give, not to get. The best connections happen when you stop thinking about what you need and start thinking about what you can offer.",
    },
    {
      num: "02",
      body: "No unsolicited pitch. No harvesting numbers. You can talk to anyone, any industry, any background, but only if they want to hear it. One genuine conversation beats twenty business cards collected.",
    },
    {
      num: "03",
      body: "If you work in real estate, recruitment, crypto, MLM, insurance, or are currently looking for a job, we kindly ask you to try listening mode tonight. Don't push. Don't sell. Just connect as a human first. You might find exactly what you need without asking for it.",
    },
    {
      num: "04",
      body: "Friends and couples: if you chose Lounge together, enjoy your evening as you are. If you came to build, separate at the door. The most valuable conversations happen outside your comfort circle.",
    },
    {
      num: "05",
      body: "Talk to anyone you want. The app suggests, you decide. No obligation. No script. No algorithm forcing your evening. The handshake is yours.",
    },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0A0A0A",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "360px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <p
          style={{
            fontSize: "11px",
            color: "#444",
            textAlign: "center",
            letterSpacing: "2.5px",
            textTransform: "uppercase",
            marginBottom: "16px",
          }}
        >
          Before you enter
        </p>

        <h1
          style={{
            fontSize: "28px",
            fontWeight: "600",
            color: "#ffffff",
            textAlign: "center",
            lineHeight: "1.15",
            marginBottom: "6px",
          }}
        >
          Tonight's contract.
        </h1>

        <p
          style={{
            fontSize: "14px",
            color: "#555",
            textAlign: "center",
            fontWeight: "300",
            marginBottom: "28px",
            lineHeight: "1.6",
          }}
        >
          5 principles. Non-negotiable.
        </p>

        <div
          style={{
            background: "#111111",
            border: "1px solid #1E1E1E",
            borderRadius: "16px",
            padding: "4px 20px",
            marginBottom: "14px",
          }}
        >
          {rules.map((rule, i) => (
            <div
              key={rule.num}
              style={{
                display: "flex",
                gap: "16px",
                alignItems: "flex-start",
                padding: "16px 0",
                borderBottom: i < rules.length - 1 ? "1px solid #161616" : "none",
              }}
            >
              <span
                style={{
                  fontSize: "10px",
                  color: "#D85A30",
                  fontWeight: "600",
                  flexShrink: 0,
                  marginTop: "3px",
                  width: "18px",
                }}
              >
                {rule.num}
              </span>
              <p
                style={{
                  fontSize: "13px",
                  color: "#777",
                  lineHeight: "1.7",
                  margin: 0,
                  fontWeight: "300",
                }}
              >
                {rule.body}
              </p>
            </div>
          ))}
        </div>

        <div
          onClick={() => setAccepted(!accepted)}
          style={{
            display: "flex",
            gap: "12px",
            alignItems: "center",
            background: "#111111",
            border: `1px solid ${accepted ? "#D85A30" : "#2A2A2A"}`,
            borderRadius: "12px",
            padding: "14px 16px",
            marginBottom: "12px",
            cursor: "pointer",
            transition: "border-color 0.2s",
          }}
        >
          <div
            style={{
              width: "18px",
              height: "18px",
              borderRadius: "5px",
              background: accepted ? "#D85A30" : "transparent",
              border: `1px solid ${accepted ? "#D85A30" : "#333"}`,
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s",
            }}
          >
            {accepted && (
              <span
                style={{
                  color: "#fff",
                  fontSize: "11px",
                  fontWeight: "700",
                }}
              >
                ✓
              </span>
            )}
          </div>
          <p
            style={{
              fontSize: "13px",
              color: accepted ? "#ccc" : "#555",
              lineHeight: "1.5",
              margin: 0,
              transition: "color 0.2s",
            }}
          >
            I commit to these principles tonight.
          </p>
        </div>

        <button
          onClick={handleEnter}
          disabled={!accepted || loading}
          style={{
            background: accepted ? "#D85A30" : "#161616",
            borderRadius: "12px",
            padding: "15px",
            color: accepted ? "#ffffff" : "#333",
            fontSize: "15px",
            fontWeight: "600",
            width: "100%",
            border: "none",
            cursor: accepted ? "pointer" : "not-allowed",
            fontFamily: "'Inter', sans-serif",
            transition: "all 0.2s",
          }}
        >
          {loading ? "One moment..." : "Enter the evening →"}
        </button>

        <p
          style={{
            fontSize: "11px",
            color: "#2A2A2A",
            textAlign: "center",
            marginTop: "14px",
          }}
        >
          Grit & Growl · Birds Dubai · 63F
        </p>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/manifesto")({
  component: ManifestoPage,
});