import { useCallback, useEffect, useMemo, useState, type CSSProperties, type ReactNode, type FormEvent } from "react";
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

const ZONES = [
  "DIFC",
  "Downtown",
  "Business Bay",
  "Marina",
  "JLT",
  "Palm",
  "Deira",
  "Other",
] as const;

const TIMES = ["6:00 PM", "6:30 PM", "7:00 PM"] as const;

const ZONE_COLORS: Record<string, string> = {
  DIFC: "#E07B3A",
  Downtown: "#0A66C2",
  "Business Bay": "#9C27B0",
  Marina: "#128C7E",
  JLT: "#4CAF50",
  Palm: "#C9A227",
  Deira: "#5C6BC0",
  Other: "#666",
};

const ACCENT = "#E07B3A";

function CarpoolPage() {
  const [mode, setMode] = useState<"choose" | OfferType>("choose");
  const [offers, setOffers] = useState<CarpoolOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [zoneFilter, setZoneFilter] = useState<string>("all");

  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [zone, setZone] = useState<string>(ZONES[0]);
  const [departureTime, setDepartureTime] = useState<string>(TIMES[0]);
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
      setError("Could not load the board. Has the carpool table been created?");
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
          event: "INSERT",
          schema: "public",
          table: "carpool_offers",
        },
        (payload) => {
          const row = payload.new as CarpoolOffer;
          if (row.event_date !== eventDate) return;
          setOffers((prev) => {
            if (prev.some((o) => o.id === row.id)) return prev;
            return [row, ...prev];
          });
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [eventDate]);

  const filtered = useMemo(() => {
    if (zoneFilter === "all") return offers;
    return offers.filter((o) => o.zone === zoneFilter);
  }, [offers, zoneFilter]);

  const drivers = filtered.filter((o) => o.type === "driver");
  const riders = filtered.filter((o) => o.type === "rider");

  const resetForm = () => {
    setName("");
    setWhatsapp("");
    setZone(ZONES[0]);
    setDepartureTime(TIMES[0]);
    setSeats(2);
    setBio("");
    setMode("choose");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (mode === "choose") return;

    const trimmedName = name.trim();
    const trimmedWa = whatsapp.trim();
    if (!trimmedName || !trimmedWa) {
      setError("Name and WhatsApp help people reach you.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const payload = {
      type: mode,
      name: trimmedName,
      whatsapp: trimmedWa,
      zone,
      departure_time: departureTime,
      seats: mode === "driver" ? seats : null,
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
      <div style={{ maxWidth: "720px", margin: "0 auto" }}>
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
            fontSize: "28px",
            fontWeight: 600,
            lineHeight: 1.2,
            margin: "0 0 10px",
          }}
        >
          Who's driving Wednesday?
        </h1>
        <p style={{ fontSize: "14px", color: "#888", lineHeight: 1.55, marginBottom: "28px" }}>
          Offer a seat or hitch a ride. Arrive together, already mid conversation. Not Uber, a favor
          between people headed to the same rooftop.
        </p>

        {mode === "choose" ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: "12px",
              marginBottom: "36px",
            }}
          >
            <ChoiceButton
              title="I have a seat"
              subtitle="Share the road from your zone"
              emoji="🚗"
              onClick={() => setMode("driver")}
            />
            <ChoiceButton
              title="I need a ride"
              subtitle="Who's coming from near you?"
              emoji="👋"
              onClick={() => setMode("rider")}
            />
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            style={{
              background: "#111",
              border: "1px solid #1E1E1E",
              borderRadius: "16px",
              padding: "20px",
              marginBottom: "36px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "18px",
              }}
            >
              <p style={{ margin: 0, fontSize: "15px", fontWeight: 600 }}>
                {mode === "driver" ? "You're offering a seat" : "You're looking for a ride"}
              </p>
              <button
                type="button"
                onClick={() => setMode("choose")}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#666",
                  fontSize: "13px",
                  cursor: "pointer",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                ← Back
              </button>
            </div>

            <Field label="Your name">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="First name is enough"
                required
                style={inputStyle}
              />
            </Field>

            <Field label="WhatsApp">
              <input
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="+971 50 123 4567"
                required
                style={inputStyle}
              />
            </Field>

            <Field label="Your zone">
              <select
                value={zone}
                onChange={(e) => setZone(e.target.value)}
                style={inputStyle}
              >
                {ZONES.map((z) => (
                  <option key={z} value={z}>
                    {z}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Leaving around">
              <select
                value={departureTime}
                onChange={(e) => setDepartureTime(e.target.value)}
                style={inputStyle}
              >
                {TIMES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </Field>

            {mode === "driver" && (
              <Field label="Seats free">
                <select
                  value={seats}
                  onChange={(e) => setSeats(Number(e.target.value))}
                  style={inputStyle}
                >
                  {[1, 2, 3, 4].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </Field>
            )}

            <Field label="One line about you (optional)">
              <input
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Founder in fintech, love a good conversation"
                style={inputStyle}
              />
            </Field>

            {error && (
              <p style={{ color: ACCENT, fontSize: "13px", marginBottom: "12px" }}>{error}</p>
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
              }}
            >
              {submitting ? "Posting…" : "Post to the board →"}
            </button>
          </form>
        )}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "12px",
            marginBottom: "16px",
            flexWrap: "wrap",
          }}
        >
          <h2 style={{ fontSize: "18px", fontWeight: 600, margin: 0 }}>Tonight's board</h2>
          <select
            value={zoneFilter}
            onChange={(e) => setZoneFilter(e.target.value)}
            style={{
              ...inputStyle,
              width: "auto",
              minWidth: "140px",
              marginBottom: 0,
              padding: "10px 12px",
              fontSize: "13px",
            }}
          >
            <option value="all">All zones</option>
            {ZONES.map((z) => (
              <option key={z} value={z}>
                {z}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <p style={{ color: "#555", fontSize: "14px" }}>Loading the board…</p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: "28px",
            }}
            className="carpool-board"
          >
            <BoardColumn title="Drivers" empty="No drivers yet. Be the first from your zone." offers={drivers} />
            <BoardColumn title="Riders" empty="No riders yet. Who needs a lift?" offers={riders} />
          </div>
        )}
      </div>

      <style>{`
        @media (min-width: 720px) {
          .carpool-board {
            grid-template-columns: 1fr 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

function ChoiceButton({
  title,
  subtitle,
  emoji,
  onClick,
}: {
  title: string;
  subtitle: string;
  emoji: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        textAlign: "left",
        background: "#111",
        border: "1px solid #1E1E1E",
        borderRadius: "16px",
        padding: "20px",
        cursor: "pointer",
        fontFamily: "Inter, sans-serif",
        color: "#fff",
      }}
    >
      <div style={{ fontSize: "28px", marginBottom: "10px" }}>{emoji}</div>
      <div style={{ fontSize: "17px", fontWeight: 600, marginBottom: "4px" }}>{title}</div>
      <div style={{ fontSize: "13px", color: "#666" }}>{subtitle}</div>
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

function BoardColumn({
  title,
  empty,
  offers,
}: {
  title: string;
  empty: string;
  offers: CarpoolOffer[];
}) {
  return (
    <section>
      <p
        style={{
          fontSize: "12px",
          color: ACCENT,
          letterSpacing: "2px",
          textTransform: "uppercase",
          marginBottom: "12px",
        }}
      >
        {title} · {offers.length}
      </p>
      {offers.length === 0 ? (
        <p style={{ fontSize: "13px", color: "#444", lineHeight: 1.5 }}>{empty}</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {offers.map((offer) => (
            <OfferCard key={offer.id} offer={offer} />
          ))}
        </div>
      )}
    </section>
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
  const badge = ZONE_COLORS[offer.zone] || "#666";

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
            color: "#fff",
            background: badge,
            borderRadius: "999px",
            padding: "4px 8px",
            whiteSpace: "nowrap",
          }}
        >
          {offer.zone}
        </span>
      </div>

      <p style={{ margin: "0 0 6px", fontSize: "13px", color: "#888" }}>
        {offer.departure_time}
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
