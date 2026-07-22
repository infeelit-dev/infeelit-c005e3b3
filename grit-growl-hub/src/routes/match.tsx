import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { findTopMatches, type MatchResult } from "@/lib/matchingOracle";
import { getDubaiEventDate } from "@/lib/eventDate";
import { normalizeLinkedInUrl, normalizeWhatsAppPhone } from "@/lib/contacts";
import { getStoredEmail } from "@/lib/matchFlow";
import { createFileRoute } from "@tanstack/react-router";

type AttendeeRow = {
  id: string;
  email?: string;
  first_name?: string | null;
  last_name?: string | null;
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
  avatar_url?: string | null;
  event_date?: string | null;
};

type MatchPerson = {
  id: string;
  first_name: string;
  last_name: string;
  mode: string;
  visits: number;
  q1: string;
  q2: string;
  q3: string;
  luma_bio?: string;
  linkedin_summary?: string;
  whatsapp?: string;
  linkedin_url?: string;
  avatar_url?: string;
};

type Match = MatchResult & {
  person: MatchPerson;
  pre_match_id?: string;
};

type PreMatchRow = {
  id: string;
  match_id: string;
  confidence: number;
  bond_type: string | null;
  resonance: string | null;
  ice_breaker: string | null;
  for_match: string | null;
  person: AttendeeRow;
};

const LOADING_TEXTS = [
  "Finding your people...",
  "Reading the room...",
  "Connecting the dots...",
  "Almost there...",
];

function toPerson(row: AttendeeRow): MatchPerson {
  const first = row.first_name || row.full_name?.split(" ")[0] || "Guest";
  const last =
    row.last_name || (row.full_name && row.full_name.split(" ").slice(1).join(" ")) || "";

  return {
    id: row.id,
    first_name: first,
    last_name: last,
    mode: row.mode || "lounge",
    visits: row.visits || 1,
    q1: row.q1 || "",
    q2: row.q2 || "",
    q3: row.q3 || "",
    luma_bio: row.luma_bio ?? undefined,
    linkedin_summary: row.linkedin_summary ?? undefined,
    whatsapp: row.whatsapp ?? undefined,
    linkedin_url: normalizeLinkedInUrl(row.linkedin_url) ?? undefined,
    avatar_url: row.avatar_url ?? undefined,
  };
}

function toOracleProfile(row: AttendeeRow) {
  const person = toPerson(row);
  return {
    id: person.id,
    firstName: person.first_name,
    mode: (person.mode === "builder" ? "builder" : "lounge") as "lounge" | "builder",
    visits: person.visits,
    q1: person.q1,
    q2: person.q2,
    q3: person.q3,
    lumaBio: person.luma_bio,
    linkedinSummary: person.linkedin_summary,
  };
}

function roleLine(person: MatchPerson): string {
  if (person.linkedin_summary?.trim()) {
    return person.linkedin_summary.trim().split("\n")[0].slice(0, 80);
  }
  if (person.luma_bio?.trim()) {
    return person.luma_bio.trim().split(/\s+/).slice(0, 20).join(" ");
  }
  return person.mode === "builder" ? "Connect mode" : "Chill mode";
}

function BondTypeTag({ bondType }: { bondType: string | null | undefined }) {
  if (!bondType || !bondType.trim()) return null;

  const styles: Record<string, { color: string; label: string }> = {
    receive: { color: "#4CAF50", label: "They can help you" },
    give: { color: "#D85A30", label: "You can help them" },
    mutual: { color: "#0A66C2", label: "Mutual opportunity" },
    ecosystem: { color: "#9C27B0", label: "Your worlds connect" },
  };

  const tag = styles[bondType];
  if (!tag) return null;

  return (
    <span
      style={{
        fontSize: "10px",
        color: tag.color,
        letterSpacing: "1px",
        textTransform: "uppercase",
        fontWeight: 600,
        display: "block",
        marginTop: "4px",
      }}
    >
      {tag.label}
    </span>
  );
}

function MatchAvatar({ person }: { person: MatchPerson }) {
  if (person.avatar_url) {
    return (
      <img
        src={person.avatar_url}
        alt=""
        style={{
          width: "48px",
          height: "48px",
          borderRadius: "50%",
          border: "2px solid #D85A30",
          objectFit: "cover",
          flexShrink: 0,
        }}
      />
    );
  }

  return (
    <div
      style={{
        width: "48px",
        height: "48px",
        borderRadius: "50%",
        background: "#D85A30",
        border: "2px solid #D85A30",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontWeight: 600,
        fontSize: "18px",
        flexShrink: 0,
      }}
    >
      {person.first_name[0]?.toUpperCase() || "?"}
    </div>
  );
}

function MatchCard({
  match,
  person,
  currentUserFirstName,
}: {
  match: Match;
  person: MatchPerson;
  currentUserFirstName: string;
}) {
  const phone = normalizeWhatsAppPhone(person.whatsapp);
  const linkedInUrl = normalizeLinkedInUrl(person.linkedin_url);
  const fullName = [person.first_name, person.last_name].filter(Boolean).join(" ");
  const whatsappMessage = `Hey ${person.first_name}, it's ${currentUserFirstName} from Grit & Growl tonight — the app matched us. Where are you right now?`;
  const waHref =
    phone.length > 0
      ? `https://wa.me/${phone}?text=${encodeURIComponent(whatsappMessage)}`
      : undefined;

  return (
    <div
      style={{
        background: "#111",
        border: "1px solid #1E1E1E",
        borderRadius: "16px",
        padding: "20px",
      }}
    >
      <div style={{ display: "flex", gap: "14px", alignItems: "flex-start", marginBottom: "12px" }}>
        <MatchAvatar person={person} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#fff", margin: 0 }}>{fullName}</h2>
          <BondTypeTag bondType={match.bond_type} />
          <p style={{ fontSize: "13px", color: "#666", margin: "4px 0 0" }}>{roleLine(person)}</p>
        </div>
      </div>

      {match.resonance && (
        <p
          style={{
            fontSize: "14px",
            color: "#888",
            fontStyle: "italic",
            lineHeight: 1.5,
            marginBottom: "16px",
          }}
        >
          {match.resonance}
        </p>
      )}

      {match.ice_breaker && (
        <p style={{ fontSize: "12px", color: "#555", marginBottom: "16px", lineHeight: 1.5 }}>
          <span style={{ color: "#D85A30", textTransform: "uppercase", letterSpacing: "1px", fontSize: "10px" }}>
            Open with ·{" "}
          </span>
          {match.ice_breaker}
        </p>
      )}

      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        {waHref ? (
          <a
            href={waHref}
            style={{
              flex: 1,
              minHeight: "44px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#128C7E",
              color: "#fff",
              borderRadius: "12px",
              fontSize: "14px",
              fontWeight: 600,
              textDecoration: "none",
              fontFamily: "Inter, sans-serif",
            }}
          >
            WhatsApp →
          </a>
        ) : (
          <div
            style={{
              flex: 1,
              minHeight: "44px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#1A1A1A",
              color: "#555",
              borderRadius: "12px",
              fontSize: "13px",
            }}
          >
            No WhatsApp
          </div>
        )}
        {linkedInUrl && (
          <a
            href={linkedInUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              flex: 1,
              minHeight: "44px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#0A66C2",
              color: "#fff",
              borderRadius: "12px",
              fontSize: "14px",
              fontWeight: 600,
              textDecoration: "none",
              fontFamily: "Inter, sans-serif",
            }}
          >
            LinkedIn →
          </a>
        )}
      </div>
    </div>
  );
}

function LoadingScreen({ text }: { text: string }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0A0A0A",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <p
        style={{
          color: "#D85A30",
          fontSize: "11px",
          letterSpacing: "3px",
          textTransform: "uppercase",
          marginBottom: "24px",
        }}
      >
        Reading the room
      </p>
      <p
        style={{
          color: "#fff",
          fontSize: "22px",
          fontWeight: 600,
          textAlign: "center",
          maxWidth: "280px",
          lineHeight: 1.4,
          transition: "opacity 0.3s ease",
        }}
      >
        {text}
      </p>
      <div
        style={{
          width: "8px",
          height: "8px",
          borderRadius: "50%",
          background: "#D85A30",
          marginTop: "32px",
          animation: "pulse 1s infinite",
        }}
      />
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(0.8); }
        }
      `}</style>
    </div>
  );
}

function MatchPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingTextIndex, setLoadingTextIndex] = useState(0);
  const [currentUser, setCurrentUser] = useState<AttendeeRow | null>(null);
  const [peopleCount, setPeopleCount] = useState(0);
  const [error, setError] = useState("");
  const [instant, setInstant] = useState(false);

  const eventDate = getDubaiEventDate();

  useEffect(() => {
    if (!loading || instant) return;
    const id = setInterval(() => {
      setLoadingTextIndex((i) => (i + 1) % LOADING_TEXTS.length);
    }, 2000);
    return () => clearInterval(id);
  }, [loading, instant]);

  const loadMatches = useCallback(async () => {
    setError("");

    const email = getStoredEmail();
    if (!email) {
      window.location.assign("/checkin");
      return;
    }

    const { data: profileRes, error: profileErr } = await supabase.functions.invoke(
      "manage-attendee",
      { body: { action: "get-profile", email } },
    );

    const userData = profileRes?.profile as AttendeeRow | null;
    if (profileErr || !userData?.id) {
      setError("Could not load your profile.");
      setLoading(false);
      return;
    }

    setCurrentUser(userData);

    const { data: preRes } = await supabase.functions.invoke("manage-attendee", {
      body: {
        action: "get-pre-matches",
        attendee_id: userData.id,
        event_date: eventDate,
      },
    });

    const preRows = (preRes?.pre_matches as PreMatchRow[] | undefined) || [];
    if (preRows.length > 0) {
      const hydrated: Match[] = preRows.map((row) => ({
        match_id: row.match_id,
        confidence: row.confidence,
        bond_type: row.bond_type as MatchResult["bond_type"],
        resonance: row.resonance,
        ice_breaker: row.ice_breaker,
        for_match: row.for_match,
        person: toPerson(row.person),
        pre_match_id: row.id,
      }));

      setMatches(hydrated);
      setInstant(true);
      setLoading(false);

      void supabase.functions.invoke("manage-attendee", {
        body: {
          action: "mark-pre-matches-used",
          attendee_id: userData.id,
          event_date: eventDate,
          pre_match_ids: preRows.map((r) => r.id),
        },
      });
      return;
    }

    setLoading(true);
    setInstant(false);

    const { data: activeRes, error: activeError } = await supabase.functions.invoke(
      "manage-attendee",
      { body: { action: "get-active-participants", event_date: eventDate } },
    );

    let allActive: AttendeeRow[] = [];
    if (activeError || !activeRes?.data) {
      const { data: legacyRes } = await supabase.functions.invoke("manage-attendee", {
        body: { action: "get-active", event_date: eventDate },
      });
      allActive = (legacyRes?.data as AttendeeRow[] | null) || [];
    } else {
      allActive = (activeRes.data as AttendeeRow[]) || [];
    }

    setPeopleCount(allActive.length);

    const candidates = allActive.filter((p) => p.id !== userData.id);
    if (candidates.length === 0) {
      setMatches([]);
      setLoading(false);
      return;
    }

    const results = await findTopMatches(
      toOracleProfile(userData),
      candidates.map(toOracleProfile),
    );

    const byId = new Map(candidates.map((c) => [c.id, c]));
    const hydrated: Match[] = results
      .map((r) => {
        const row = byId.get(r.match_id);
        if (!row) return null;
        return { ...r, person: toPerson(row) };
      })
      .filter((m): m is Match => m !== null);

    setMatches(hydrated);

    await supabase.functions.invoke("manage-attendee", {
      body: {
        action: "update",
        email,
        suggestions_shown: hydrated.length,
        event_date: eventDate,
      },
    });

    setLoading(false);
  }, [eventDate]);

  useEffect(() => {
    void loadMatches();
  }, [loadMatches]);

  if (loading && !instant) {
    return <LoadingScreen text={LOADING_TEXTS[loadingTextIndex]} />;
  }

  if (error) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0A0A0A",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          fontFamily: "Inter, sans-serif",
        }}
      >
        <div style={{ maxWidth: "420px", textAlign: "center" }}>
          <p style={{ color: "#D85A30", fontSize: "14px", marginBottom: "16px" }}>{error}</p>
          <button
            onClick={() => loadMatches()}
            style={{
              background: "#D85A30",
              border: "none",
              borderRadius: "12px",
              height: "52px",
              color: "#fff",
              fontSize: "15px",
              fontWeight: 600,
              width: "100%",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0A0A0A",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          fontFamily: "Inter, sans-serif",
        }}
      >
        <div style={{ maxWidth: "420px", textAlign: "center" }}>
          <p
            style={{
              fontSize: "11px",
              color: "#D85A30",
              letterSpacing: "3px",
              textTransform: "uppercase",
              marginBottom: "12px",
            }}
          >
            Tonight's connections
          </p>
          <h1 style={{ fontSize: "22px", fontWeight: 600, color: "#fff", marginBottom: "12px" }}>
            The room is still filling up
          </h1>
          <p style={{ fontSize: "14px", color: "#666", lineHeight: 1.6, marginBottom: "24px" }}>
            {peopleCount > 0
              ? `${peopleCount} people are here — check back in a few minutes for stronger matches.`
              : "Your matches will appear as more people check in."}
          </p>
          <button
            onClick={() => loadMatches()}
            style={{
              background: "#D85A30",
              border: "none",
              borderRadius: "12px",
              height: "52px",
              color: "#fff",
              fontSize: "15px",
              fontWeight: 600,
              width: "100%",
              cursor: "pointer",
            }}
          >
            Refresh →
          </button>
        </div>
      </div>
    );
  }

  const currentUserFirstName =
    currentUser?.first_name || currentUser?.full_name?.split(" ")[0] || "Someone";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0A0A0A",
        padding: "32px 20px",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: "32px" }}>
        <p
          style={{
            fontSize: "11px",
            color: "#D85A30",
            letterSpacing: "3px",
            textTransform: "uppercase",
            marginBottom: "8px",
          }}
        >
          Tonight's connections
        </p>
        <p style={{ fontSize: "22px", fontWeight: 600, color: "#fff" }}>
          {matches.length} {matches.length === 1 ? "person" : "people"} waiting for you
        </p>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          maxWidth: "420px",
          margin: "0 auto",
        }}
      >
        {matches.map((match) => (
          <MatchCard
            key={match.pre_match_id || match.match_id}
            match={match}
            person={match.person}
            currentUserFirstName={currentUserFirstName}
          />
        ))}
      </div>
    </div>
  );
}

export const Route = createFileRoute("/match")({
  component: MatchPage,
  ssr: false,
});
