import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

function LoungePage() {
  const [view, setView] = useState<"interests" | "ready">("interests");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const interestsList = [
    "Tech & startups",
    "Art & design",
    "Music",
    "Food & restaurants",
    "Travel",
    "Sports & fitness",
    "Finance & investing",
    "Photography",
    "Books & writing",
    "Film & series",
    "Fashion",
    "Wellness",
    "Gaming",
    "Architecture",
    "Philosophy",
    "Other",
  ];

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const saveInterests = async () => {
    if (selectedInterests.length === 0) return;

    setLoading(true);
    const email = localStorage.getItem("gg_email");

    if (email) {
      await supabase
        .from("attendees")
        .update({
          lounge_interests: selectedInterests.join(","),
          onboarding_complete: true,
          mode: "lounge",
        })
        .eq("email", email);
    }

    setView("ready");
    setLoading(false);
  };

  useEffect(() => {
    const email = localStorage.getItem("gg_email");
    if (!email) {
      window.location.href = "/checkin";
    }
  }, []);

  if (view === "interests") {
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
            margin: "auto",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <p
            style={{
              fontSize: "11px",
              color: "#444",
              letterSpacing: "2.5px",
              textTransform: "uppercase",
              textAlign: "center",
              marginBottom: "16px",
            }}
          >
            CHILL MODE
          </p>

          <h1
            style={{
              fontSize: "26px",
              fontWeight: "600",
              color: "#ffffff",
              textAlign: "center",
              lineHeight: "1.2",
              marginBottom: "8px",
            }}
          >
            Tonight is yours.
          </h1>

          <p
            style={{
              fontSize: "14px",
              color: "#555",
              fontWeight: "300",
              textAlign: "center",
              lineHeight: "1.6",
              marginBottom: "32px",
            }}
          >
            No agenda. No pressure.
            <br />
            Just good people and good conversations.
          </p>

          <p
            style={{
              fontSize: "12px",
              color: "#888",
              marginBottom: "12px",
            }}
          >
            What are you into? Pick a few.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "8px",
              marginBottom: "28px",
            }}
          >
            {interestsList.map((interest) => {
              const isSelected = selectedInterests.includes(interest);
              return (
                <button
                  key={interest}
                  onClick={() => toggleInterest(interest)}
                  style={{
                    background: isSelected ? "#0E0900" : "#111111",
                    border: isSelected ? "1px solid #F5A62360" : "1px solid #2A2A2A",
                    borderRadius: "20px",
                    padding: "10px 14px",
                    color: isSelected ? "#F5A623" : "#666",
                    fontSize: "13px",
                    textAlign: "center",
                    cursor: "pointer",
                    fontFamily: "'Inter', sans-serif",
                    transition: "all 0.2s",
                  }}
                >
                  {interest}
                </button>
              );
            })}
          </div>

          <button
            onClick={saveInterests}
            disabled={selectedInterests.length === 0 || loading}
            style={{
              background: selectedInterests.length > 0 ? "#F5A623" : "#161616",
              borderRadius: "12px",
              padding: "15px",
              color: selectedInterests.length > 0 ? "#ffffff" : "#333",
              fontSize: "15px",
              fontWeight: "600",
              width: "100%",
              border: "none",
              cursor: selectedInterests.length > 0 ? "pointer" : "not-allowed",
              fontFamily: "'Inter', sans-serif",
              transition: "all 0.2s",
            }}
          >
            {loading ? "Saving..." : "I'm ready →"}
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
          padding: "24px",
        }}
      >
        <p
          style={{
            fontSize: "11px",
            color: "#444",
            letterSpacing: "2.5px",
            textTransform: "uppercase",
            textAlign: "center",
            marginBottom: "16px",
          }}
        >
          YOU'RE IN
        </p>

        <h1
          style={{
            fontSize: "26px",
            fontWeight: "600",
            color: "#ffffff",
            textAlign: "center",
            lineHeight: "1.2",
            marginBottom: "8px",
          }}
        >
          Enjoy your evening.
        </h1>

        <p
          style={{
            fontSize: "14px",
            color: "#555",
            fontWeight: "300",
            textAlign: "center",
            lineHeight: "1.6",
            marginBottom: "32px",
          }}
        >
          The best conversations happen by accident.
          <br />
          Be open. Be present.
        </p>

        <div
          style={{
            background: "#111111",
            border: "1px solid #1E1E1E",
            borderRadius: "16px",
            padding: "20px",
            marginBottom: "16px",
          }}
        >
          <div style={{ marginBottom: "16px" }}>
            <p
              style={{
                fontSize: "10px",
                color: "#444",
                letterSpacing: "1px",
                textTransform: "uppercase",
                marginBottom: "4px",
              }}
            >
              TONIGHT
            </p>
            <p
              style={{
                fontSize: "14px",
                color: "#ffffff",
              }}
            >
              Edition 35 · Birds Dubai · 63F
            </p>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <p
              style={{
                fontSize: "10px",
                color: "#444",
                letterSpacing: "1px",
                textTransform: "uppercase",
                marginBottom: "4px",
              }}
            >
              VIBE
            </p>
            <p
              style={{
                fontSize: "14px",
                color: "#ffffff",
              }}
            >
              Chill — no agenda, no matching
            </p>
          </div>

          <div>
            <p
              style={{
                fontSize: "10px",
                color: "#444",
                letterSpacing: "1px",
                textTransform: "uppercase",
                marginBottom: "4px",
              }}
            >
              ONE THING
            </p>
            <p
              style={{
                fontSize: "14px",
                color: "#ffffff",
              }}
            >
              Talk to someone you wouldn't normally approach.
            </p>
          </div>
        </div>

        <div
          style={{
            background: "#0E0900",
            border: "1px solid #F5A62330",
            borderRadius: "12px",
            padding: "16px",
            marginBottom: "24px",
          }}
        >
          <p
            style={{
              color: "#F5A623",
              fontSize: "13px",
              lineHeight: "1.7",
              fontWeight: "300",
              margin: 0,
            }}
          >
            Friends and couples — you're welcome together. If someone approaches you, be open. Give before you expect to
            receive.
          </p>
        </div>

        <p
          style={{
            fontSize: "11px",
            color: "#2A2A2A",
            textAlign: "center",
          }}
        >
          Grit & Growl · Every Wednesday · Birds Dubai
        </p>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/lounge")({
  component: LoungePage,
});