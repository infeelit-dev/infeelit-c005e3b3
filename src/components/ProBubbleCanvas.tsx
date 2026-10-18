import { useEffect, useRef, useState, type CSSProperties } from "react";
import { supabase } from "@/integrations/supabase/client";

export type ProZoneId = "vision" | "now" | "foundation";

export interface ProBubbleItem {
  id: string;
  name: string;
  role: string;
  title: string;
  duration: string;
  size: number;
  hasPhoto?: boolean;
  photoUrl?: string;
  x?: number;
  y?: number;
  color?: string;
  audioUrl?: string;
}

interface ProBubbleCanvasProps {
  onScroll?: (scrollTop: number) => void;
  onBubbleTap?: (bubble: ProBubbleItem & { color: string; zone: ProZoneId }) => void;
}

type ZoneConfig = {
  id: ProZoneId;
  label: string;
  color: string;
  borderWidth: number;
  fill: string;
  float: "slow" | "medium" | "anchored";
  wash: string;
};

const INK = "#0F172A";
const CANVAS_BG = "#F8F9FA";

const ZONES: ZoneConfig[] = [
  {
    id: "vision",
    label: "VISION",
    color: "#7C3AED",
    borderWidth: 1.5,
    fill: "#EDE9FE",
    float: "slow",
    wash: "#EDE9FE",
  },
  {
    id: "now",
    label: "ACTUALITÉS",
    color: "#2563EB",
    borderWidth: 2,
    fill: "#DBEAFE",
    float: "medium",
    wash: "#DBEAFE",
  },
  {
    id: "foundation",
    label: "FONDATION",
    color: "#D97706",
    borderWidth: 3,
    fill: "#FEF3C7",
    float: "anchored",
    wash: "#FEF3C7",
  },
];

/** Fallback network only — several members, never a single-user profile. */
const FALLBACK_NETWORK: Record<ProZoneId, ProBubbleItem[]> = {
  vision: [
    { id: "v1", name: "Sara M.", role: "CEO", title: "Bloom Health 2027", duration: "1:45", size: 78, x: 28, y: 32 },
    { id: "v2", name: "Karim B.", role: "Fondateur", title: "Infeelit pour les familles", duration: "2:01", size: 82, x: 70, y: 28 },
    { id: "v3", name: "Jean-Pierre D.", role: "Technicien", title: "Usine du futur", duration: "1:23", size: 74, x: 50, y: 62 },
  ],
  now: [
    { id: "n1", name: "Karim B.", role: "Fondateur", title: "Launch day", duration: "2:14", size: 92, x: 32, y: 30 },
    { id: "n2", name: "Sara M.", role: "CEO", title: "18 langues ajoutées", duration: "1:38", size: 84, x: 72, y: 36 },
    { id: "n3", name: "Jean-Pierre D.", role: "Technicien", title: "Chantier en cours", duration: "3:02", size: 88, x: 48, y: 64 },
  ],
  foundation: [
    { id: "f1", name: "Karim B.", role: "Fondateur", title: "Pourquoi on a commencé", duration: "2:34", size: 110, x: 30, y: 34 },
    { id: "f2", name: "Sara M.", role: "CEO", title: "La première année", duration: "1:47", size: 100, x: 72, y: 30 },
    { id: "f3", name: "Jean-Pierre D.", role: "Technicien", title: "Ce qu'on transmet", duration: "3:12", size: 105, x: 50, y: 66 },
  ],
};

const FLOAT_CLASS: Record<ZoneConfig["float"], string> = {
  slow: "pro-zone-float-slow",
  medium: "pro-zone-float-medium",
  anchored: "pro-zone-float-anchored",
};

function formatDuration(seconds: unknown) {
  const n = Number(seconds);
  if (!Number.isFinite(n) || n <= 0) return "0:00";
  const s = Math.round(n);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

function zoneOf(row: Record<string, unknown>): ProZoneId {
  const raw = String(row.trame ?? row.zone ?? row.timeline ?? row.kind ?? row.pillar ?? row.frame ?? "").toLowerCase();
  if (/vision|future|projet|project/.test(raw)) return "vision";
  if (/fond|found|past|origin|heritage/.test(raw)) return "foundation";
  if (/now|actu|present|news/.test(raw)) return "now";
  return "now";
}

function displayName(row: Record<string, unknown>, profiles: Record<string, { name: string; role: string; photo?: string }>) {
  const uid = String(row.user_id ?? row.profile_id ?? "");
  const fromProfile = profiles[uid];
  const name = String(
    row.author_name || row.display_name || row.name || fromProfile?.name || "Membre Pro",
  );
  const role = String(row.role || row.job_title || fromProfile?.role || "Pro");
  const photo = String(row.photo_url || row.avatar_url || fromProfile?.photo || "");
  return { name, role, photo };
}

function place(index: number) {
  const col = index % 3;
  const row = Math.floor(index / 3);
  return {
    x: 22 + col * 28 + (row % 2) * 5,
    y: 28 + (row % 4) * 22,
  };
}

function emptyZones(): Record<ProZoneId, ProBubbleItem[]> {
  return { vision: [], now: [], foundation: [] };
}

function hasAny(z: Record<ProZoneId, ProBubbleItem[]>) {
  return z.vision.length + z.now.length + z.foundation.length > 0;
}

/**
 * Network feed: every Pro member. Never filter by auth.uid() / current user.
 */
async function loadAllProBubbles(): Promise<Record<ProZoneId, ProBubbleItem[]>> {
  const sb = supabase as any;
  const zones = emptyZones();

  const [{ data: drafts }, { data: memories }] = await Promise.all([
    sb.from("pro_voice_drafts").select("*"),
    sb.from("memories").select("*").eq("is_pro", true),
  ]);

  const rows: Record<string, unknown>[] = [
    ...((drafts || []) as Record<string, unknown>[]),
    ...((memories || []) as Record<string, unknown>[]).map((m) => ({ ...m, _source: "memory" })),
  ];

  const userIds = [...new Set(rows.map((r) => String(r.user_id ?? "")).filter(Boolean))];
  const profiles: Record<string, { name: string; role: string; photo?: string }> = {};
  if (userIds.length) {
    const { data: profileRows } = await sb.from("profiles").select("user_id, display_name, spark").in("user_id", userIds);
    for (const p of profileRows || []) {
      profiles[p.user_id] = { name: p.display_name || "Membre Pro", role: p.spark || "Pro" };
    }
    const { data: proRows } = await sb
      .from("pro_profiles")
      .select("user_id, display_name, role, avatar_url, photo_url")
      .in("user_id", userIds);
    for (const p of proRows || []) {
      profiles[p.user_id] = {
        name: p.display_name || profiles[p.user_id]?.name || "Membre Pro",
        role: p.role || profiles[p.user_id]?.role || "Pro",
        photo: p.avatar_url || p.photo_url,
      };
    }
  }

  const counts: Record<ProZoneId, number> = { vision: 0, now: 0, foundation: 0 };

  for (const row of rows) {
    const zone = zoneOf(row);
    const { name, role, photo } = displayName(row, profiles);
    const dur = formatDuration(row.duration_s ?? row.duration);
    const idx = counts[zone];
    const pos = place(idx);
    counts[zone] += 1;
    zones[zone].push({
      id: String(row.id ?? `${zone}-${idx}`),
      name,
      role,
      title: String(row.title || row.prompt || row.question || row.transcript || "Voix"),
      duration: dur.includes(":") ? dur : formatDuration(row.duration_s),
      size: zone === "foundation" ? 108 : zone === "now" ? 92 : 80,
      x: pos.x,
      y: pos.y,
      hasPhoto: Boolean(photo),
      photoUrl: photo || undefined,
      audioUrl: String(row.audio_url || row.file_url || row.media_url || ""),
    });
  }

  return zones;
}

function ZoneBubble({
  bubble,
  zone,
  index,
  onTap,
}: {
  bubble: ProBubbleItem;
  zone: ZoneConfig;
  index: number;
  onTap?: () => void;
}) {
  const dim = bubble.size;
  const hasPhoto = Boolean(bubble.hasPhoto && bubble.photoUrl);
  const bg: CSSProperties["background"] = hasPhoto
    ? `center / cover url(${bubble.photoUrl})`
    : zone.fill;

  return (
    <button
      type="button"
      className={FLOAT_CLASS[zone.float]}
      aria-label={`${bubble.title} — ${bubble.duration}`}
      onClick={onTap}
      style={{
        position: "absolute",
        left: `${bubble.x ?? 50}%`,
        top: `${bubble.y ?? 40}%`,
        width: `${dim}px`,
        height: `${dim}px`,
        marginLeft: `-${dim / 2}px`,
        marginTop: `-${dim / 2}px`,
        borderRadius: "50%",
        border: `${zone.borderWidth}px solid ${zone.color}`,
        background: bg,
        boxShadow: `0 4px 16px ${zone.color}33`,
        cursor: "pointer",
        padding: 0,
        overflow: "hidden",
        ["--delay" as string]: `${(index % 4) * 0.7}s`,
      }}
    >
      {hasPhoto && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to top, rgba(15,23,42,0.35) 0%, transparent 55%)",
            pointerEvents: "none",
          }}
        />
      )}

      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -55%)",
          textAlign: "center",
          color: hasPhoto ? "#fff" : INK,
          width: "82%",
          pointerEvents: "none",
        }}
      >
        <p
          style={{
            fontSize: dim > 100 ? "12px" : "10px",
            fontWeight: 800,
            margin: 0,
            lineHeight: 1.15,
          }}
        >
          {bubble.name}
        </p>
        <p
          style={{
            fontSize: "9px",
            margin: "2px 0 0",
            opacity: 0.8,
            fontWeight: 600,
          }}
        >
          {bubble.role}
        </p>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: dim > 100 ? "10px" : "6px",
          left: "50%",
          transform: "translateX(-50%)",
          background: "rgba(15,23,42,0.78)",
          borderRadius: "999px",
          padding: "2px 8px",
          display: "flex",
          alignItems: "center",
          gap: "4px",
          color: "#fff",
          fontSize: dim > 100 ? "10px" : "9px",
          fontWeight: 700,
          whiteSpace: "nowrap",
          pointerEvents: "none",
        }}
      >
        ▶ {bubble.duration}
      </div>
    </button>
  );
}

export default function ProBubbleCanvas({ onScroll, onBubbleTap }: ProBubbleCanvasProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [bubbles, setBubbles] = useState<Record<ProZoneId, ProBubbleItem[]>>(FALLBACK_NETWORK);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el || !onScroll) return;
    const handle = () => onScroll(el.scrollTop);
    el.addEventListener("scroll", handle, { passive: true });
    return () => el.removeEventListener("scroll", handle);
  }, [onScroll]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const loaded = await loadAllProBubbles();
        if (!cancelled && hasAny(loaded)) setBubbles(loaded);
      } catch (err) {
        console.warn("Pro canvas network load failed, keeping fallback network", err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div
      ref={scrollerRef}
      style={{
        flex: 1,
        minHeight: 0,
        height: "100%",
        overflowY: "auto",
        overflowX: "hidden",
        position: "relative",
        scrollBehavior: "smooth",
        background: CANVAS_BG,
      }}
    >
      <style>{`
        @keyframes pro-zone-float-slow {
          0%,100% { transform: translate(0,0); }
          33% { transform: translate(10px,-14px); }
          66% { transform: translate(-8px,8px); }
        }
        @keyframes pro-zone-float-medium {
          0%,100% { transform: translate(0,0); }
          40% { transform: translate(-10px,-8px); }
          80% { transform: translate(8px,10px); }
        }
        @keyframes pro-zone-float-anchored {
          0%,100% { transform: translate(0,0); }
          50% { transform: translate(2px,-3px); }
        }
        .pro-zone-float-slow {
          animation: pro-zone-float-slow 16s ease-in-out infinite var(--delay, 0s);
        }
        .pro-zone-float-medium {
          animation: pro-zone-float-medium 11s ease-in-out infinite var(--delay, 0s);
        }
        .pro-zone-float-anchored {
          animation: pro-zone-float-anchored 22s ease-in-out infinite var(--delay, 0s);
        }
      `}</style>

      {ZONES.map((zone, zoneIndex) => (
        <section
          key={zone.id}
          aria-label={zone.label}
          style={{
            position: "relative",
            minHeight: "100vh",
            paddingTop: zoneIndex === 0 ? "8px" : 0,
            paddingBottom: "48px",
            background: zone.wash,
          }}
        >
          <div
            style={{
              position: "sticky",
              top: 0,
              zIndex: 20,
              height: "44px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: "16px",
                right: "16px",
                top: "50%",
                height: "1px",
                background: `linear-gradient(90deg, transparent, ${zone.color}66, transparent)`,
              }}
            />
            <span
              style={{
                position: "relative",
                zIndex: 1,
                padding: "4px 14px",
                borderRadius: "999px",
                background: CANVAS_BG,
                border: `1px solid ${zone.color}55`,
                color: INK,
                fontSize: "10px",
                fontWeight: 900,
                letterSpacing: "0.28em",
              }}
            >
              {zone.label}
            </span>
          </div>

          <div
            style={{
              position: "relative",
              width: "100%",
              height: "calc(100vh - 44px)",
              minHeight: "480px",
            }}
          >
            {(bubbles[zone.id] || []).map((bubble, index) => (
              <ZoneBubble
                key={bubble.id}
                bubble={bubble}
                zone={zone}
                index={index}
                onTap={() =>
                  onBubbleTap?.({
                    ...bubble,
                    color: zone.color,
                    zone: zone.id,
                  })
                }
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
