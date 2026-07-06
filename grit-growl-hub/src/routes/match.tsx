import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { findBestMatch } from "@/lib/matchingOracle";
import { getDubaiEventDate } from "@/lib/eventDate";
import {
  normalizeLinkedInUrl,
  normalizeWhatsAppPhone,
  openWhatsApp,
} from "@/lib/contacts";
import { createFileRoute } from "@tanstack/react-router";

type MatchResult = {
  match_id: string | null;
  confidence: number;
  bond_type: string | null;
  resonance: string | null;
  ice_breaker: string | null;
  for_match: string | null;
  reasoning: string;
};

type AttendeeRow = {
  id: string;
  email?: string;
  first_name?: string | null;
  full_name?: string | null;
  mode?: string | null;
  visits?: number | null;
  q1?: string | null;
  q2?: string | null;
  q3?: string | null;
  luma_bio?: string | null;
  linkedin_summary?: string | null;
  linkedin_url?: string | null;
  whatsapp?: string | null;
  suggestions_shown?: number | null;
  match_count?: number | null;
  onboarding_complete?: boolean | null;
  event_date?: string | null;
};

type MatchProfile = {
  id: string;
  firstName: string;
  mode: string;
  visits: number;
  q1: string;
  q2: string;
  q3: string;
  lumaBio?: string;
  linkedinSummary?: string;
  whatsapp?: string;
  linkedin_url?: string;
};

function toMatchProfile(row: AttendeeRow): MatchProfile {
  return {
    id: row.id,
    firstName: row.first_name || row.full_name?.split(" ")[0] || "Guest",
    mode: row.mode || "lounge",
    visits: row.visits || 1,
    q1: row.q1 || "",
    q2: row.q2 || "",
    q3: row.q3 || "",
    lumaBio: row.luma_bio ?? undefined,
    linkedinSummary: row.linkedin_summary ?? undefined,
    whatsapp: row.whatsapp ?? undefined,
    linkedin_url: normalizeLinkedInUrl(row.linkedin_url) ?? undefined,
  };
}

function toOracleProfile(row: AttendeeRow) {
  const profile = toMatchProfile(row);
  return {
    id: profile.id,
    firstName: profile.firstName,
    mode: profile.mode as "lounge" | "builder",
    visits: profile.visits,
    q1: profile.q1,
    q2: profile.q2,
    q3: profile.q3,
    lumaBio: profile.lumaBio,
    linkedinSummary: profile.linkedinSummary,
  };
}

function MatchPage() {
  const [view, setView] = useState<"loading" | "suggestion" | "connect" | "waiting" | "done">("loading");
  const [currentUser, setCurrentUser] = useState<AttendeeRow | null>(null);
  const [matchedPerson, setMatchedPerson] = useState<MatchProfile | null>(null);
  const [oracleResult, setOracleResult] = useState<MatchResult | null>(null);
  const [suggestionsShown, setSuggestionsShown] = useState(0);
  const [peopleCount, setPeopleCount] = useState(0);
  const [selectedZone, setSelectedZone] = useState("");
  const [description, setDescription] = useState("");
  const [excludedIds, setExcludedIds] = useState<string[]>([]);
  const [pulse, setPulse] = useState<{
    newcomer_first_name: string;
    resonance: string;
    why_now: string;
    pulse_id: string;
  } | null>(null);
  const [showPulse, setShowPulse] = useState(false);

  const eventDate = getDubaiEventDate();
  const zones = ["Bar — right", "Bar — left", "Terrace", "Lounge area", "Entrance", "Other"];

  const fetchPeopleCount = async () => {
    const { data } = await supabase.functions.invoke("manage-attendee", {
      body: { action: "count", event_date: eventDate },
    });
    setPeopleCount(data?.count || 0);
  };

  const incrementSuggestionsShown = async (current: number) => {
    const next = current + 1;
    setSuggestionsShown(next);
    setCurrentUser((prev) => (prev ? { ...prev, suggestions_shown: next } : prev));
    await supabase.functions.invoke("manage-attendee", {
      body: {
        action: "update",
        email: localStorage.getItem("gg_email"),
        suggestions_shown: next,
        event_date: eventDate,
      },
    });
  };

  const runMatching = useCallback(
    async (skipIds: string[] = []) => {
      setView("loading");

      const email = localStorage.getItem("gg_email");
      if (!email) {
        setView("waiting");
        return;
      }

      const { data: userRes, error: userError } = await supabase.functions.invoke("manage-attendee", {
        body: { action: "get", email },
      });

      const userData = userRes?.data as AttendeeRow | null;
      if (userError || !userData) {
        setView("waiting");
        return;
      }

      setCurrentUser(userData);
      const shown = userData.suggestions_shown || 0;
      setSuggestionsShown(shown);

      if (shown >= 5) {
        setView("done");
        return;
      }

      if (!userData.onboarding_complete) {
        window.location.assign("/onboarding");
        return;
      }

      const { data: activeRes, error: activeError } = await supabase.functions.invoke("manage-attendee", {
        body: { action: "get-active-participants", event_date: eventDate },
      });

      if (activeError) {
        setView("waiting");
        await fetchPeopleCount();
        return;
      }

      const allActive = (activeRes?.data as AttendeeRow[] | null) || [];
      const activeProfiles = allActive.filter(
        (p) => p.id !== userData.id && !skipIds.includes(p.id),
      );

      if (activeProfiles.length === 0) {
        setView("waiting");
        await fetchPeopleCount();
        return;
      }

      const profilesForMatch = activeProfiles.map(toOracleProfile);

      const result = await findBestMatch(toOracleProfile(userData), profilesForMatch);

      if (!result || !result.match_id) {
        setView("waiting");
        await fetchPeopleCount();
        return;
      }

      const matchedRow = activeProfiles.find((p) => p.id === result.match_id);
      if (matchedRow) {
        setMatchedPerson(toMatchProfile(matchedRow));
        setOracleResult(result);
        setView("suggestion");
        await incrementSuggestionsShown(shown);
      } else {
        setView("waiting");
        await fetchPeopleCount();
      }
    },
    [eventDate],
  );

  const acceptMatch = async () => {
    if (!currentUser || !matchedPerson || !oracleResult) return;

    await supabase.functions.invoke("manage-attendee", {
      body: {
        action: "update",
        email: currentUser.email,
        match_count: (currentUser.match_count || 0) + 1,
        event_date: eventDate,
      },
    });

    await supabase.from("matches").insert({
      from_attendee_id: currentUser.id,
      to_attendee_id: matchedPerson.id,
      event_date: eventDate,
      oracle_resonance: oracleResult.resonance,
      accepted: true,
    });

    await supabase.from("notifications").insert({
      to_attendee_id: matchedPerson.id,
      from_first_name: currentUser.first_name || currentUser.full_name?.split(" ")[0] || "Someone",
      message: oracleResult.for_match,
      event_date: eventDate,
    });

    setView("connect");
  };

  const skipMatch = async () => {
    if (!matchedPerson) return;
    const newExcluded = [...excludedIds, matchedPerson.id];
    setExcludedIds(newExcluded);
    await runMatching(newExcluded);
  };

  const sendWhatsApp = () => {
    if (!matchedPerson || !currentUser) return;

    const rawPhone = normalizeWhatsAppPhone(matchedPerson.whatsapp);
    if (!rawPhone) return;

    const zone = selectedZone || "the venue";
    const desc = description ? ` — ${description}` : "";
    const message = `Hey ${matchedPerson.firstName}, it's ${currentUser.first_name || currentUser.full_name?.split(" ")[0] || "Someone"}. I'm ${zone}${desc}. Looking forward to meeting you.`;

    openWhatsApp(rawPhone, message);

    supabase
      .from("notifications")
      .update({ location: zone, description: description })
      .eq("to_attendee_id", matchedPerson.id)
      .eq("event_date", eventDate);
  };

  const showPulseBanner = useCallback(async (pulseRow: Record<string, unknown>) => {
    const { data: newcomer } = await supabase
      .from("attendees")
      .select("first_name")
      .eq("id", pulseRow.newcomer_id as string)
      .maybeSingle();

    setPulse({
      newcomer_first_name: newcomer?.first_name || "Someone",
      resonance: (pulseRow.resonance as string) || "",
      why_now: (pulseRow.why_now as string) || "",
      pulse_id: pulseRow.id as string,
    });
    setShowPulse(true);
    setTimeout(() => setShowPulse(false), 30000);
  }, []);

  useEffect(() => {
    runMatching();

    const email = localStorage.getItem("gg_email");
    if (!email) return;

    let channel: ReturnType<typeof supabase.channel> | null = null;

    const setupPulseListener = async () => {
      const { data: me } = await supabase.functions.invoke("manage-attendee", {
        body: { action: "get", email },
      });

      const userId = me?.data?.id as string | undefined;
      if (!userId) return;

      const { data: unreadRes } = await supabase.functions.invoke("pulse-engine", {
        body: { action: "get", recipient_id: userId },
      });

      const unread = (unreadRes?.data as Record<string, unknown>[] | null) || [];
      if (unread.length > 0) {
        await showPulseBanner(unread[0]);
      }

      channel = supabase
        .channel(`pulses-${userId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "pulses",
            filter: `recipient_id=eq.${userId}`,
          },
          async (payload) => {
            await showPulseBanner(payload.new as Record<string, unknown>);
          },
        )
        .subscribe();
    };

    setupPulseListener();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [runMatching, showPulseBanner]);

  if (view === "loading") {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0A0A0A",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <p
            style={{
              fontSize: "10px",
              color: "#444",
              letterSpacing: "2.5px",
              textTransform: "uppercase",
              marginBottom: "24px",
            }}
          >
            Finding your match
          </p>
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "#D85A30",
              margin: "0 auto 24px",
              animation: "pulse 1s infinite",
            }}
          />
          <style>{`
            @keyframes pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.3; }
            }
            @keyframes slideDown {
              from { transform: translateY(-100%); }
              to { transform: translateY(0); }
            }
          `}</style>
          <p style={{ fontSize: "12px", color: "#333" }}>The oracle is reading the room...</p>
        </div>
      </div>
    );
  }

  if (view === "waiting") {
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
        <div
          style={{
            background: "#111111",
            border: "1px solid #1E1E1E",
            borderRadius: "16px",
            padding: "28px",
            maxWidth: "320px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "#D85A30",
              margin: "0 auto 24px",
              animation: "pulse 1s infinite",
            }}
          />
          <h1 style={{ fontSize: "18px", fontWeight: "600", color: "#ffffff", marginBottom: "12px" }}>
            The room is filling up.
          </h1>
          <p style={{ fontSize: "13px", color: "#444", fontWeight: "300", lineHeight: "1.6", marginBottom: "20px" }}>
            Your match will appear as more people arrive tonight. Check back in a few minutes.
          </p>
          <p style={{ fontSize: "10px", color: "#2A2A2A", marginBottom: "24px" }}>
            {peopleCount} people in the room tonight
          </p>
          <button
            onClick={() => runMatching(excludedIds)}
            style={{
              background: "transparent",
              border: "1px solid #2A2A2A",
              borderRadius: "12px",
              padding: "12px",
              color: "#888",
              fontSize: "13px",
              fontWeight: "500",
              cursor: "pointer",
              width: "100%",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Refresh →
          </button>
        </div>
      </div>
    );
  }

  if (view === "suggestion" && matchedPerson && oracleResult) {
    const linkedInUrl = normalizeLinkedInUrl(matchedPerson.linkedin_url);
    const hasLinkedIn = !!linkedInUrl;
    const rawPhoneSuggestion = normalizeWhatsAppPhone(matchedPerson.whatsapp);
    const hasWhatsApp = rawPhoneSuggestion.length > 0;

    const dots = [];
    for (let i = 0; i < 5; i++) {
      dots.push(
        <div
          key={i}
          style={{
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            background: i < suggestionsShown ? "#D85A30" : "#1E1E1E",
          }}
        />,
      );
    }

    const suggestionWhatsAppMessage = `Hey ${matchedPerson.firstName}, it's ${currentUser?.first_name || "Someone"} from Grit & Growl — the app matched us tonight. Where are you right now?`;

    return (
      <>
        {showPulse && pulse && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              zIndex: 1000,
              background: "#0A0A0A",
              borderBottom: "1px solid #D85A30",
              padding: "16px 20px",
              fontFamily: "'Inter', sans-serif",
              animation: "slideDown 0.3s ease",
            }}
          >
            <div style={{ maxWidth: "360px", margin: "0 auto" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "8px",
                }}
              >
                <p
                  style={{
                    fontSize: "10px",
                    color: "#D85A30",
                    letterSpacing: "2px",
                    textTransform: "uppercase",
                    fontWeight: "600",
                  }}
                >
                  ⚡ Just walked in
                </p>
                <button
                  onClick={() => setShowPulse(false)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#444",
                    fontSize: "16px",
                    cursor: "pointer",
                    padding: "0",
                    lineHeight: "1",
                  }}
                >
                  ×
                </button>
              </div>
              <p style={{ fontSize: "16px", fontWeight: "600", color: "#fff", marginBottom: "6px" }}>
                {pulse.newcomer_first_name} just arrived.
              </p>
              <p
                style={{
                  fontSize: "13px",
                  color: "#888",
                  lineHeight: "1.5",
                  marginBottom: "14px",
                  fontStyle: "italic",
                }}
              >
                "{pulse.why_now}"
              </p>
              <button
                onClick={async () => {
                  setShowPulse(false);
                  await supabase.functions.invoke("pulse-engine", {
                    body: { action: "mark-read", pulse_id: pulse.pulse_id },
                  });
                  runMatching(excludedIds);
                }}
                style={{
                  background: "#D85A30",
                  border: "none",
                  borderRadius: "10px",
                  padding: "10px 20px",
                  color: "#fff",
                  fontSize: "13px",
                  fontWeight: "600",
                  cursor: "pointer",
                  fontFamily: "'Inter', sans-serif",
                  width: "100%",
                }}
              >
                See who it is →
              </button>
            </div>
          </div>
        )}

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
          <div style={{ width: "100%", maxWidth: "360px" }}>
            <p
              style={{
                fontSize: "10px",
                color: "#444",
                letterSpacing: "2px",
                textTransform: "uppercase",
                marginBottom: "20px",
                textAlign: "center",
              }}
            >
              YOUR MATCHES TONIGHT
            </p>

            <div
              style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}
            >
              <span style={{ fontSize: "11px", color: "#444" }}>Suggestions</span>
              <div style={{ display: "flex", gap: "6px" }}>{dots}</div>
            </div>

            <div
              style={{
                background: "#111111",
                border: "1px solid #1E1E1E",
                borderRadius: "16px",
                padding: "20px",
                marginBottom: "20px",
              }}
            >
              <div
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}
              >
                <h2 style={{ fontSize: "22px", fontWeight: "600", color: "#ffffff" }}>{matchedPerson.firstName}</h2>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {hasLinkedIn && (
                    <a
                      href={linkedInUrl!}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "inline-block",
                        background: "#0A66C2",
                        color: "#ffffff",
                        borderRadius: "20px",
                        padding: "5px 14px",
                        fontSize: "12px",
                        fontWeight: "600",
                        textDecoration: "none",
                        fontFamily: "'Inter', sans-serif",
                      }}
                    >
                      LinkedIn →
                    </a>
                  )}
                  {hasWhatsApp && (
                    <a
                      href={`https://wa.me/${rawPhoneSuggestion}?text=${encodeURIComponent(suggestionWhatsAppMessage)}`}
                      style={{
                        display: "inline-block",
                        background: "#128C7E",
                        color: "#ffffff",
                        borderRadius: "20px",
                        padding: "5px 14px",
                        fontSize: "12px",
                        fontWeight: "600",
                        textDecoration: "none",
                        fontFamily: "'Inter', sans-serif",
                      }}
                    >
                      WhatsApp →
                    </a>
                  )}
                </div>
              </div>
              <p style={{ fontSize: "12px", color: "#555", marginBottom: "20px" }}>
                {matchedPerson.mode === "builder" ? "Connect" : "Chill"} · {matchedPerson.visits}{" "}
                {matchedPerson.visits === 1 ? "evening" : "evenings"}
              </p>

              <div style={{ paddingLeft: "12px", borderLeft: "2px solid #D85A30", marginBottom: "20px" }}>
                <p style={{ fontSize: "14px", color: "#ffffff", lineHeight: "1.6", fontStyle: "italic" }}>
                  {oracleResult.resonance}
                </p>
              </div>

              <p
                style={{
                  fontSize: "10px",
                  color: "#D85A30",
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                  marginBottom: "8px",
                }}
              >
                OPEN WITH THIS
              </p>
              <p style={{ fontSize: "13px", color: "#888", fontStyle: "italic" }}>{oracleResult.ice_breaker}</p>
            </div>

            <button
              onClick={acceptMatch}
              style={{
                background: "#D85A30",
                borderRadius: "12px",
                padding: "15px",
                color: "#ffffff",
                fontSize: "15px",
                fontWeight: "600",
                width: "100%",
                border: "none",
                cursor: "pointer",
                fontFamily: "'Inter', sans-serif",
                marginBottom: "12px",
              }}
            >
              I'll meet them →
            </button>

            <button
              onClick={() => skipMatch()}
              style={{
                background: "transparent",
                border: "1px solid #2A2A2A",
                borderRadius: "12px",
                padding: "15px",
                color: "#888",
                fontSize: "15px",
                fontWeight: "500",
                width: "100%",
                cursor: "pointer",
                fontFamily: "'Inter', sans-serif",
                marginBottom: "8px",
              }}
            >
              I already know them
            </button>

            <button
              onClick={() => skipMatch()}
              style={{
                background: "transparent",
                border: "none",
                borderRadius: "12px",
                padding: "12px",
                color: "#555",
                fontSize: "13px",
                fontWeight: "400",
                width: "100%",
                cursor: "pointer",
                fontFamily: "'Inter', sans-serif",
                marginBottom: "20px",
              }}
            >
              Not tonight
            </button>

            <p style={{ fontSize: "10px", color: "#2A2A2A", textAlign: "center" }}>
              2 free skips — suggestions never run out
            </p>
          </div>
        </div>
      </>
    );
  }

  if (view === "connect" && matchedPerson) {
    const connectPhone = normalizeWhatsAppPhone(matchedPerson.whatsapp);
    const zone = selectedZone || "the venue";
    const desc = description ? ` — ${description}` : "";
    const connectMessage = `Hey ${matchedPerson.firstName}, it's ${currentUser?.first_name || currentUser?.full_name?.split(" ")[0] || "Someone"}. I'm ${zone}${desc}. Looking forward to meeting you.`;
    const connectWaHref =
      connectPhone.length > 0
        ? `https://wa.me/${connectPhone}?text=${encodeURIComponent(connectMessage)}`
        : undefined;

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
        <div style={{ width: "100%", maxWidth: "360px" }}>
          <p
            style={{
              fontSize: "10px",
              color: "#444",
              letterSpacing: "2px",
              textTransform: "uppercase",
              marginBottom: "8px",
              textAlign: "center",
            }}
          >
            HELP THEM FIND YOU
          </p>
          <h1
            style={{ fontSize: "18px", fontWeight: "600", color: "#ffffff", textAlign: "center", marginBottom: "8px" }}
          >
            Where are you right now?
          </h1>
          <p style={{ fontSize: "13px", color: "#444", fontWeight: "300", textAlign: "center", marginBottom: "32px" }}>
            They'll see your exact location.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", marginBottom: "20px" }}>
            {zones.map((zoneName) => (
              <button
                key={zoneName}
                onClick={() => setSelectedZone(zoneName)}
                style={{
                  background: selectedZone === zoneName ? "#1A0800" : "#1A1A1A",
                  border: selectedZone === zoneName ? "1px solid #D85A30" : "1px solid #2A2A2A",
                  borderRadius: "8px",
                  padding: "10px 8px",
                  color: selectedZone === zoneName ? "#D85A30" : "#666",
                  fontSize: "12px",
                  fontWeight: "500",
                  cursor: "pointer",
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                {zoneName}
              </button>
            ))}
          </div>

          <input
            type="text"
            placeholder="What you're wearing, hair color..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{
              width: "100%",
              background: "#1A1A1A",
              border: "1px solid #2A2A2A",
              borderRadius: "10px",
              padding: "12px 14px",
              color: "#ffffff",
              fontSize: "13px",
              fontFamily: "'Inter', sans-serif",
              marginBottom: "20px",
              outline: "none",
            }}
          />

          {connectWaHref ? (
            <a
              href={connectWaHref}
              onClick={() => {
                supabase
                  .from("notifications")
                  .update({ location: selectedZone || "the venue", description: description })
                  .eq("to_attendee_id", matchedPerson.id)
                  .eq("event_date", eventDate);
              }}
              style={{
                background: "#128C7E",
                borderRadius: "12px",
                padding: "14px",
                color: "#ffffff",
                fontSize: "14px",
                fontWeight: "600",
                width: "100%",
                border: "none",
                cursor: "pointer",
                fontFamily: "'Inter', sans-serif",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                marginBottom: "12px",
                textDecoration: "none",
              }}
            >
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "18px",
                  height: "18px",
                  background: "#ffffff",
                  borderRadius: "50%",
                  color: "#128C7E",
                  fontSize: "12px",
                  fontWeight: "700",
                }}
              >
                W
              </span>
              Connect on WhatsApp →
            </a>
          ) : (
            <button
              onClick={sendWhatsApp}
              disabled
              style={{
                background: "#333",
                borderRadius: "12px",
                padding: "14px",
                color: "#888",
                fontSize: "14px",
                fontWeight: "600",
                width: "100%",
                border: "none",
                cursor: "not-allowed",
                fontFamily: "'Inter', sans-serif",
                marginBottom: "12px",
              }}
            >
              No WhatsApp number on file
            </button>
          )}

          <button
            onClick={() => runMatching(excludedIds)}
            style={{
              background: "transparent",
              border: "1px solid #2A2A2A",
              borderRadius: "12px",
              padding: "14px",
              color: "#666",
              fontSize: "13px",
              fontWeight: "500",
              width: "100%",
              cursor: "pointer",
              fontFamily: "'Inter', sans-serif",
              marginBottom: "20px",
            }}
          >
            Skip — I'll find them myself
          </button>

          <p style={{ fontSize: "10px", color: "#2A2A2A", textAlign: "center" }}>
            Opens WhatsApp with your location pre-filled.
          </p>
        </div>
      </div>
    );
  }

  if (view === "done") {
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
        <div style={{ textAlign: "center", maxWidth: "300px" }}>
          <h1 style={{ fontSize: "20px", fontWeight: "600", color: "#ffffff", marginBottom: "12px" }}>
            That's your evening.
          </h1>
          <p style={{ fontSize: "13px", color: "#444", fontWeight: "300", marginBottom: "32px" }}>
            You've received 5 suggestions tonight.
          </p>
          <button
            onClick={() => window.location.assign("/recap")}
            style={{
              background: "#D85A30",
              borderRadius: "12px",
              padding: "15px",
              color: "#ffffff",
              fontSize: "15px",
              fontWeight: "600",
              width: "100%",
              border: "none",
              cursor: "pointer",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            See your connections →
          </button>
        </div>
      </div>
    );
  }

  return null;
}

export const Route = createFileRoute("/match")({
  component: MatchPage,
  ssr: false,
});
