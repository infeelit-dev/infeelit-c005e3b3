import { useCallback, useEffect, useMemo, useState, type CSSProperties, type FormEvent, type ReactNode } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { getDubaiEventDate } from "@/lib/eventDate";
import { normalizeWhatsAppPhone } from "@/lib/contacts";

export const Route = createFileRoute("/carpool")({
  component: CarpoolPage,
  ssr: false,
});

type OfferType = "driver" | "rider";

type CarpoolOffer = {
  id: string;
  created_at: string;
  type: OfferType;
  name: string;
  whatsapp: string;
  zone: string;
  departure_time: string;
  seats: number | null;
  bio: string | null;
  event_date: string;
};

const ACCENT = "#E07B3A";

function CarpoolPage() {
  const [tab, setTab] = useState<OfferType>("driver");
  const [offers, setOffers] = useState<CarpoolOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [posted, setPosted] = useState(false);

  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [zone, setZone] = useState("");
  const [departureTime, setDepartureTime] = useState("");
  const [seats, setSeats] = useState(2);
  const [bio, setBio] = useState("");

  const eventDate = getDubaiEventDate();

  const loadOffers = useCallback(async () => {
    const { data, error: fetchErr } = await supabase
      .from("carpool_offers")
      .select("*")
      .eq("event_date", eventDate)
      .order("created_at", { ascending: false });

    if (fetchErr) {
      console.error(fetchErr);
      setError("Could not load tonight's rides.");
      setLoading(false);
      return;
    }

    setOffers((data as CarpoolOffer[]) || []);
    setError(null);
    setLoading(false);
  }, [eventDate]);

  useEffect(() => {
    void loadOffers();
  }, [loadOffers]);

  useEffect(() => {
    const channel = supabase
      .channel("carpool")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "carpool_offers",
        },
        () => {
          void loadOffers();
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [loadOffers]);

  const sortedOffers = useMemo(() => {
    const drivers = offers.filter((o) => o.type === "driver");
    const riders = offers.filter((o) => o.type === "rider");
    return [...drivers, ...riders];
  }, [offers]);

  const resetForm = () => {
    setName("");
    setWhatsapp("");
    setZone("");
    setDepartureTime("");
    setSeats(2);
    setBio("");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const trimmedName = name.trim();
    const trimmedWa = whatsapp.trim();
    const trimmedZone = zone.trim();
    const trimmedTime = departureTime.trim();

    if (!trimmedName || !trimmedWa || !trimmedZone || !trimmedTime) {
      setError("Name, WhatsApp, zone, and departure time help people find you.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const payload = {
      type: tab,
      name: trimmedName,
      whatsapp: trimmedWa,
      zone: trimmedZone,
      departure_time: trimmedTime,
      seats: tab === "driver" ? seats : null,
      bio: bio.trim() || null,
      event_date: eventDate,
    };

    const { data, error: insertErr } = await supabase
      .from("carpool_offers")
      .insert(payload)
      .select("*")
      .single();

    setSubmitting(false);

    if (insertErr) {
      console.error(insertErr);
      setError("Could not post. Please try again.");
      return;
    }

    if (data) {
      const row = data as CarpoolOffer;
      setOffers((prev) => {
        if (prev.some((o) => o.id === row.id)) return prev;
        return [row, ...prev];
      });
    }

    setPosted(true);
    resetForm();
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0A0A0A",
        color: "#fff",
        fontFamily: "Inter, sans-serif",
        padding: "28px 20px 64px",
      }}
    >
      <div style={{ maxWidth: "480px", margin: "0 auto" }}>
        <p
          style={{
            fontSize: "11px",
            color: ACCENT,
            letterSpacing: "2px",
            textTransform: "uppercase",
            marginBottom: "10px",
          }}
        >
          Grit & Growl · Wednesday
        </p>
        <h1
          style={{
            fontSize: "26px",
            fontWeight: 600,
            lineHeight: 1.25,
            margin: "0 0 10px",
          }}
        >
          Who's driving Wednesday?
        </h1>
        <p style={{ fontSize: "14px", color: "#888", lineHeight: 1.55, marginBottom: "24px" }}>
          Offer a seat or hitch a ride. Arrive together, already mid conversation. A favor between
          people headed to the same rooftop.
        </p>

        {/* Tabs */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "8px",
            marginBottom: "20px",
            background: "#111",
            border: "1px solid #1E1E1E",
            borderRadius: "12px",
            padding: "6px",
          }}
        >
          <TabButton active={tab === "driver"} onClick={() => setTab("driver")} label="I'm driving" />
          <TabButton active={tab === "rider"} onClick={() => setTab("rider")} label="I need a ride" />
        </div>

        <form
          onSubmit={handleSubmit}
          style={{
            background: "#111",
            border: "1px solid #1E1E1E",
            borderRadius: "16px",
            padding: "18px",
            marginBottom: "32px",
          }}
        >
          <Field label="Name">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="First name is enough"
              required
              style={inputStyle}
            />
          </Field>

          <Field label="WhatsApp number">
            <input
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="+971 50 123 4567"
              required
              inputMode="tel"
              style={inputStyle}
            />
          </Field>

          <Field label="Zone / neighbourhood">
            <input
              value={zone}
              onChange={(e) => setZone(e.target.value)}
              placeholder='e.g. Marina, DIFC, JLT'
              required
              style={inputStyle}
            />
          </Field>

          <Field label="Departure time">
            <input
              value={departureTime}
              onChange={(e) => setDepartureTime(e.target.value)}
              placeholder='e.g. 19:00, 19:30'
              required
              style={inputStyle}
            />
          </Field>

          {tab === "driver" && (
            <Field label="Seats available">
              <select
                value={seats}
                onChange={(e) => setSeats(Number(e.target.value))}
                style={inputStyle}
              >
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </Field>
          )}

          <Field label="Note (optional)">
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value.slice(0, 140))}
              placeholder="Founder in fintech, love a good conversation"
              rows={3}
              maxLength={140}
              style={{ ...inputStyle, resize: "none", lineHeight: 1.45 }}
            />
            <p
              style={{
                fontSize: "11px",
                color: bio.length >= 140 ? ACCENT : "#555",
                textAlign: "right",
                margin: "4px 0 0",
              }}
            >
              {bio.length} / 140
            </p>
          </Field>

          {error && (
            <p style={{ color: ACCENT, fontSize: "13px", marginBottom: "12px" }}>{error}</p>
          )}
          {posted && !error && (
            <p style={{ color: "#4CAF50", fontSize: "13px", marginBottom: "12px" }}>
              You're on the board. Someone may WhatsApp you soon.
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            style={{
              width: "100%",
              minHeight: "52px",
              background: submitting ? "#161616" : ACCENT,
              color: submitting ? "#555" : "#fff",
              border: "none",
              borderRadius: "12px",
              fontSize: "15px",
              fontWeight: 600,
              cursor: submitting ? "not-allowed" : "pointer",
              fontFamily: "Inter, sans-serif",
              marginTop: "8px",
            }}
          >
            {submitting ? "Posting…" : tab === "driver" ? "Offer my seat →" : "Ask for a ride →"}
          </button>
        </form>

        <h2 style={{ fontSize: "18px", fontWeight: 600, margin: "0 0 14px" }}>Tonight's board</h2>

        {loading ? (
          <p style={{ color: "#555", fontSize: "14px" }}>Loading…</p>
        ) : sortedOffers.length === 0 ? (
          <p style={{ color: "#555", fontSize: "14px", lineHeight: 1.5 }}>
            No rides yet. Be the first from your zone.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {sortedOffers.map((offer) => (
              <OfferCard key={offer.id} offer={offer} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        minHeight: "44px",
        border: "none",
        borderRadius: "10px",
        background: active ? ACCENT : "transparent",
        color: active ? "#fff" : "#888",
        fontSize: "14px",
        fontWeight: 600,
        cursor: "pointer",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {label}
    </button>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label style={{ display: "block", marginBottom: "14px" }}>
      <span
        style={{
          display: "block",
          fontSize: "11px",
          color: "#666",
          letterSpacing: "1px",
          textTransform: "uppercase",
          marginBottom: "6px",
        }}
      >
        {label}
      </span>
      {children}
    </label>
  );
}

function OfferCard({ offer }: { offer: CarpoolOffer }) {
  const phone = normalizeWhatsAppPhone(offer.whatsapp);
  const message =
    offer.type === "driver"
      ? `Hey ${offer.name}, I saw your Grit & Growl ride from ${offer.zone} at ${offer.departure_time}. Still have a seat?`
      : `Hey ${offer.name}, I saw you're looking for a ride from ${offer.zone} for Grit & Growl. I can pick you up.`;
  const waHref =
    phone.length > 0
      ? `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
      : undefined;

  return (
    <div
      style={{
        background: "#111",
        border: "1px solid #1E1E1E",
        borderRadius: "14px",
        padding: "16px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "10px",
          marginBottom: "8px",
        }}
      >
        <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 600 }}>{offer.name}</h3>
        <span
          style={{
            fontSize: "10px",
            fontWeight: 600,
            letterSpacing: "0.5px",
            textTransform: "uppercase",
            color: offer.type === "driver" ? ACCENT : "#128C7E",
            border: `1px solid ${offer.type === "driver" ? ACCENT : "#128C7E"}`,
            borderRadius: "999px",
            padding: "4px 8px",
            whiteSpace: "nowrap",
          }}
        >
          {offer.type === "driver" ? "Driving" : "Needs ride"}
        </span>
      </div>

      <p style={{ margin: "0 0 6px", fontSize: "13px", color: "#888" }}>
        {offer.zone} · {offer.departure_time}
        {offer.type === "driver" && offer.seats
          ? ` · ${offer.seats} seat${offer.seats === 1 ? "" : "s"}`
          : ""}
      </p>

      {offer.bio && (
        <p
          style={{
            margin: "0 0 12px",
            fontSize: "13px",
            color: "#aaa",
            lineHeight: 1.45,
            fontStyle: "italic",
          }}
        >
          {offer.bio}
        </p>
      )}

      {waHref ? (
        <a
          href={waHref}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "44px",
            background: "#128C7E",
            color: "#fff",
            borderRadius: "10px",
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
            minHeight: "44px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#1A1A1A",
            color: "#555",
            borderRadius: "10px",
            fontSize: "13px",
          }}
        >
          No WhatsApp
        </div>
      )}
    </div>
  );
}

const inputStyle: CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  background: "#1A1A1A",
  border: "1px solid #2A2A2A",
  borderRadius: "10px",
  padding: "12px 14px",
  color: "#fff",
  fontSize: "15px",
  fontFamily: "Inter, sans-serif",
  outline: "none",
  marginBottom: 0,
};
