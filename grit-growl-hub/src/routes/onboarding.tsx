import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getDubaiEventDate, getEventId } from "@/lib/eventDate";
import { createFileRoute } from "@tanstack/react-router";

function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [building, setBuilding] = useState("");
  const [needs, setNeeds] = useState("");
  const [passion, setPassion] = useState("");
  const [loading, setLoading] = useState(false);
  const [prefilling, setPrefilling] = useState(true);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<{ stop: () => void } | null>(null);

  useEffect(() => {
    const email = localStorage.getItem("gg_email");
    if (!email) {
      window.location.assign("/checkin");
      return;
    }

    const prefill = async () => {
      const eventDate = getDubaiEventDate();
      try {
        const { data: profileRes } = await supabase.functions.invoke("manage-attendee", {
          body: { action: "get-profile", email, event_date: eventDate },
        });
        const participant = profileRes?.participant;
        if (participant?.q1) setBuilding(participant.q1);
        if (participant?.q2) setNeeds(participant.q2);
        if (participant?.q3) setPassion(participant.q3);
        if (!participant?.q1) {
          const { data: attendeeRes } = await supabase.functions.invoke("manage-attendee", {
            body: { action: "get", email, event_date: eventDate },
          });
          const a = attendeeRes?.data;
          if (a?.q1) setBuilding(a.q1);
          if (a?.q2) setNeeds(a.q2);
          if (a?.q3) setPassion(a.q3);
        }
      } catch {
        // continue with empty form
      } finally {
        setPrefilling(false);
      }
    };

    prefill();
  }, []);

  const handleSubmit = async () => {
    setLoading(true);
    const email = localStorage.getItem("gg_email");

    if (!email) {
      window.location.assign("/checkin");
      return;
    }

    const eventDate = getDubaiEventDate();
    const payload = {
      q1: building,
      q2: needs,
      q3: passion,
      onboarding_complete: true,
      event_date: eventDate,
    };

    await supabase.functions.invoke("manage-attendee", {
      body: { action: "upsert-participant", email, event_id: getEventId(eventDate), ...payload },
    });

    const { error: fnError } = await supabase.functions.invoke("manage-attendee", {
      body: { action: "update", email, ...payload },
    });

    if (fnError) {
      console.error("Onboarding error:", fnError);
      setLoading(false);
      return;
    }

    window.location.assign("/match");
  };

  const getCurrentSetter = () => {
    if (step === 1) return setBuilding;
    if (step === 2) return setNeeds;
    return setPassion;
  };

  const getCurrentValue = () => {
    if (step === 1) return building;
    if (step === 2) return needs;
    return passion;
  };

  const startListening = () => {
    const win = window as unknown as {
      SpeechRecognition?: new () => {
        lang: string;
        interimResults: boolean;
        continuous: boolean;
        onstart: (() => void) | null;
        onresult: ((event: { results: Iterable<{ 0: { transcript: string } }> }) => void) | null;
        onend: (() => void) | null;
        onerror: (() => void) | null;
        start: () => void;
        stop: () => void;
      };
      webkitSpeechRecognition?: new () => {
        lang: string;
        interimResults: boolean;
        continuous: boolean;
        onstart: (() => void) | null;
        onresult: ((event: { results: Iterable<{ 0: { transcript: string } }> }) => void) | null;
        onend: (() => void) | null;
        onerror: (() => void) | null;
        start: () => void;
        stop: () => void;
      };
    };
    const SpeechRecognitionCtor = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRecognitionCtor) {
      alert("Voice input is not supported on this browser. Please type your answer.");
      return;
    }

    const recognition = new SpeechRecognitionCtor();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = false;
    recognitionRef.current = recognition;

    const setter = getCurrentSetter();
    const currentVal = getCurrentValue();

    recognition.onstart = () => setListening(true);

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((r) => r[0].transcript)
        .join("");
      setter(currentVal ? `${currentVal} ${transcript}` : transcript);
    };

    recognition.onend = () => setListening(false);

    recognition.onerror = () => {
      setListening(false);
      alert("Could not capture audio. Please try again or type your answer.");
    };

    recognition.start();
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  const questions = [
    {
      step: 1,
      label: "STEP 1 / 3",
      question: "What are you in the middle of right now, in work or in life?",
      sub: "A project, a transition, a decision. Whatever is most alive for you.",
      value: building,
      onChange: setBuilding,
      placeholder: "I just closed my first funding round and now I have to build the team...",
      next: () => setStep(2),
    },
    {
      step: 2,
      label: "STEP 2 / 3",
      question: "What kind of conversation would make tonight worth it for you?",
      sub: "Be honest. The more specific, the better your match.",
      value: needs,
      onChange: setNeeds,
      placeholder: "Someone who has scaled a team in the Gulf and can share what they wish they knew...",
      next: () => setStep(3),
    },
    {
      step: 3,
      label: "STEP 3 / 3",
      question: "What do people always end up coming to you for?",
      sub: "Not what you think you offer. What others actually seek in you.",
      value: passion,
      onChange: setPassion,
      placeholder: "Honest feedback on ideas. I tell people what I actually think...",
      next: handleSubmit,
    },
  ];

  if (prefilling) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0A0A0A",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <p style={{ fontSize: "14px", color: "#666" }}>Loading your answers...</p>
      </div>
    );
  }

  const current = questions[step - 1];
  const progressWidth = `${(step / 3) * 100}%`;

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
      <div style={{ width: "100%", maxWidth: "420px", display: "flex", flexDirection: "column" }}>
        <p
          style={{
            fontSize: "10px",
            color: "#444",
            textAlign: "center",
            letterSpacing: "2px",
            textTransform: "uppercase",
            marginBottom: "12px",
          }}
        >
          {current.label}
        </p>

        <div
          style={{
            width: "100%",
            height: "2px",
            background: "#1A1A1A",
            borderRadius: "2px",
            marginBottom: "40px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: progressWidth,
              height: "100%",
              background: "#D85A30",
              borderRadius: "2px",
              transition: "width 0.4s ease",
            }}
          />
        </div>

        <h1 style={{ fontSize: "24px", fontWeight: "600", color: "#ffffff", lineHeight: "1.3", marginBottom: "8px" }}>
          {current.question}
        </h1>

        <p style={{ fontSize: "14px", color: "#444", fontWeight: "300", marginBottom: "24px", lineHeight: "1.6" }}>
          {current.sub}
        </p>

        <textarea
          value={current.value}
          onChange={(e) => current.onChange(e.target.value)}
          placeholder={current.placeholder}
          rows={4}
          style={{
            background: "#111111",
            border: `1px solid ${listening ? "#D85A30" : "#2A2A2A"}`,
            borderRadius: "12px",
            padding: "16px",
            color: "#ffffff",
            fontSize: "15px",
            width: "100%",
            outline: "none",
            fontFamily: "'Inter', sans-serif",
            resize: "none",
            lineHeight: "1.6",
            marginBottom: "8px",
            transition: "border-color 0.2s",
          }}
        />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
          }}
        >
          <button
            onClick={listening ? stopListening : startListening}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: listening ? "#1A0800" : "#111111",
              border: `1px solid ${listening ? "#D85A30" : "#2A2A2A"}`,
              borderRadius: "20px",
              padding: "8px 16px",
              color: listening ? "#D85A30" : "#555",
              fontSize: "12px",
              fontFamily: "'Inter', sans-serif",
              cursor: "pointer",
              minHeight: "44px",
            }}
          >
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: listening ? "#D85A30" : "#333",
                flexShrink: 0,
                animation: listening ? "pulse 1s infinite" : "none",
              }}
            />
            {listening ? "Listening... tap to stop" : "Tap to speak"}
          </button>

          <p style={{ fontSize: "12px", color: "#2A2A2A" }}>{current.value.length} / 300</p>
        </div>

        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.3; }
          }
        `}</style>

        <button
          onClick={current.next}
          disabled={!current.value.trim() || loading}
          style={{
            background: current.value.trim() ? "#D85A30" : "#161616",
            borderRadius: "12px",
            padding: "15px",
            color: current.value.trim() ? "#ffffff" : "#333",
            fontSize: "15px",
            fontWeight: "600",
            width: "100%",
            border: "none",
            cursor: current.value.trim() ? "pointer" : "not-allowed",
            fontFamily: "'Inter', sans-serif",
            minHeight: "44px",
          }}
        >
          {loading ? "One moment..." : step === 3 ? "Find my matches →" : "Next →"}
        </button>

        {step > 1 && (
          <button
            onClick={() => setStep(step - 1)}
            style={{
              background: "transparent",
              border: "none",
              color: "#333",
              fontSize: "14px",
              marginTop: "14px",
              cursor: "pointer",
              fontFamily: "'Inter', sans-serif",
              textAlign: "center",
              width: "100%",
              minHeight: "44px",
            }}
          >
            ← Back
          </button>
        )}
      </div>
    </div>
  );
}

export const Route = createFileRoute("/onboarding")({
  component: OnboardingPage,
  ssr: false,
});
