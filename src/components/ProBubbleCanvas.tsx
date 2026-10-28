import { useEffect, useRef, useState } from "react";
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
  yPx?: number;
  color?: string;
  audioUrl?: string;
  isDemo?: boolean;
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

type DemoSeed = {
  id: string;
  name: string;
  title: string;
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

const DEMO_SEEDS: Record<ProZoneId, DemoSeed[]> = {
  foundation: [
    { id: "f1", name: "Karim B.", title: "Mon premier client m'a appelé à 2h du matin." },
    { id: "f2", name: "Amina R.", title: "J'ai tout perdu en 2008. C'est là que j'ai vraiment commencé." },
    { id: "f3", name: "Jean-Pierre M.", title: "Mon père m'a dit : ne travaille jamais pour quelqu'un d'autre." },
    { id: "f4", name: "Yasmine T.", title: "J'avais 19 ans et aucune idée de ce que je faisais." },
  ],
  now: [
    { id: "n1", name: "Sara L.", title: "On a lancé le produit un vendredi soir. Le lundi, 400 signups." },
    { id: "n2", name: "David K.", title: "Notre pivot a tout changé en 6 semaines." },
    { id: "n3", name: "Nadia F.", title: "Je gère une équipe de 8 personnes depuis Dubai." },
    { id: "n4", name: "Omar S.", title: "On vient de signer notre premier contrat entreprise." },
  ],
  vision: [
    { id: "v1", name: "Lena V.", title: "Dans 5 ans, je veux que mon fils soit fier." },
    { id: "v2", name: "Marc A.", title: "Je construis quelque chose qui existera après moi." },
    { id: "v3", name: "Fatima Z.", title: "Mon rêve : former 1000 entrepreneurs au Maroc." },
    { id: "v4", name: "Ryo T.", title: "Je veux prouver qu'on peut scaler sans sacrifier ses valeurs." },
  ],
};

function hash01(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  return (h >>> 0) / 4294967296;
}

function firstName(name: string) {
  return name.split(/\s+/)[0]?.replace(/\.$/, "") || name;
}

function initialsOf(name: string) {
  const parts = name.replace(/\./g, "").split(/\s+/).filter(Boolean);
  const letters = parts.slice(0, 2).map((p) => p[0]?.toUpperCase() || "").join("");
  return letters || "?";
}

function demoAvatarUrl(name: string) {
  return `https://i.pravatar.cc/150?u=${encodeURIComponent(firstName(name))}`;
}

/** Seeded spread inside a zone: size 80–120px, jittered 2×2 grid. */
function demoLayout(id: string, index: number) {
  const rX = hash01(`${id}:x`);
  const rY = hash01(`${id}:y`);
  const rS = hash01(`${id}:s`);
  const size = Math.round(80 + rS * 40);
  const col = index % 2;
  const row = Math.floor(index / 2);
  const x = 22 + col * 52 + (rX - 0.5) * 14;
  const yPx = 96 + row * 168 + (rY - 0.5) * 28;
  return { size, x, yPx };
}

function buildFallbackNetwork(): Record<ProZoneId, ProBubbleItem[]> {
  const zones = emptyZones();
  (Object.keys(DEMO_SEEDS) as ProZoneId[]).forEach((zoneId) => {
    zones[zoneId] = DEMO_SEEDS[zoneId].map((seed, index) => {
      const pos = demoLayout(seed.id, index);
      return {
        id: seed.id,
        name: seed.name,
        role: "",
        title: seed.title,
        duration: "0:20",
        size: pos.size,
        x: pos.x,
        yPx: pos.yPx,
        isDemo: true,
        hasPhoto: true,
        photoUrl: demoAvatarUrl(seed.name),
      };
    });
  });
  return zones;
}

const FALLBACK_NETWORK = buildFallbackNetwork();

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

const COLS = 3;
const ROW_PX = 168;

function zoneOf(row: Record<string, unknown>): ProZoneId {
  const raw = String(row.trame ?? row.zone ?? row.timeline ?? row.kind ?? row.pillar ?? row.frame ?? "")
    .toLowerCase()
    .trim();
  if (raw === "forever" || raw === "vision" || /future|projet|project/.test(raw)) return "vision";
  if (raw === "memories" || raw === "foundation" || raw === "fondation" || /fond|found|past|origin|heritage/.test(raw)) {
    return "foundation";
  }
  if (raw === "instant" || raw === "now" || /actu|present|news/.test(raw)) return "now";
  return "now";
}

function displayName(row: Record<string, unknown>, profiles: Record<string, { name: string; role: string; photo?: string }>) {
  const uid = String(row.user_id ?? row.profile_id ?? "");
  const fromProfile = profiles[uid];
  const name = String(row.author_name || row.display_name || row.name || fromProfile?.name || "Membre Pro");
  const role = String(row.role || row.job_title || fromProfile?.role || "Pro");
  const photo = String(row.photo_url || row.avatar_url || fromProfile?.photo || "");
  return { name, role, photo };
}

function place(index: number) {
  const col = index % COLS;
  const row = Math.floor(index / COLS);
  return {
    x: 20 + col * 30 + (row % 2) * 4,
    yPx: 56 + row * ROW_PX,
  };
}

function zoneBodyHeight(count: number) {
  const rows = Math.max(1, Math.ceil(count / 2));
  return Math.max(480, 56 + rows * ROW_PX + 48);
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
    sb.from("memories").select("*").eq("is_pro", true).eq("is_public", true),
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
      yPx: pos.yPx,
      isDemo: false,
      hasPhoto: Boolean(photo),
      photoUrl: photo || undefined,
      audioUrl: String(row.audio_url || row.file_url || row.media_url || ""),
    });
  }

  return zones;
}

function FaceMark({
  bubble,
  dim,
}: {
  bubble: ProBubbleItem;
  dim: number;
}) {
  const face = Math.round(dim * 0.6);
  const initials = initialsOf(bubble.name);
  const demoFace = Boolean(bubble.isDemo);

  if (demoFace) {
    return (
      <div
        style={{
          width: face,
          height: face,
          borderRadius: "50%",
          overflow: "hidden",
          flexShrink: 0,
          background: "#E2E8F0",
        }}
      >
        <img
          src={demoAvatarUrl(bubble.name)}
          alt=""
          width={face}
          height={face}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      </div>
    );
  }

  if (bubble.hasPhoto && bubble.photoUrl) {
    return (
      <div
        style={{
          width: face,
          height: face,
          borderRadius: "50%",
          overflow: "hidden",
          flexShrink: 0,
          background: `center / cover url(${bubble.photoUrl})`,
        }}
      />
    );
  }

  return (
    <div
      style={{
        width: face,
        height: face,
        borderRadius: "50%",
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(15,23,42,0.08)",
        color: INK,
        fontWeight: 800,
        fontSize: Math.max(12, Math.round(face * 0.32)),
      }}
    >
      {initials}
    </div>
  );
}

function ZoneBubble({
  bubble,
  zone,
  index,
  lifting,
  onTap,
}: {
  bubble: ProBubbleItem;
  zone: ZoneConfig;
  index: number;
  lifting: boolean;
  onTap?: () => void;
}) {
  const dim = bubble.size;
  const liftDelay = `${index * 80}ms`;
  const idleDelay = `${(index % 4) * 0.7}s`;

  return (
    <button
      type="button"
      className={lifting ? "pro-zone-lift" : FLOAT_CLASS[zone.float]}
      aria-label={`${bubble.name} — ${bubble.title}`}
      onClick={onTap}
      style={{
        position: "absolute",
        left: `${bubble.x ?? 50}%`,
        top: bubble.yPx != null ? `${bubble.yPx}px` : `${bubble.y ?? 40}%`,
        width: `${dim}px`,
        height: `${dim}px`,
        marginLeft: `-${dim / 2}px`,
        marginTop: `-${dim / 2}px`,
        borderRadius: "50%",
        border: `${zone.borderWidth}px solid ${zone.color}`,
        background: zone.fill,
        boxShadow: `0 4px 16px ${zone.color}33`,
        cursor: "pointer",
        padding: 0,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
        ["--delay" as string]: lifting ? liftDelay : idleDelay,
      }}
    >
      <FaceMark bubble={bubble} dim={dim} />
      <p
        style={{
          fontSize: dim > 100 ? "11px" : "9px",
          fontWeight: 800,
          margin: 0,
          lineHeight: 1.15,
          color: INK,
          width: "82%",
          textAlign: "center",
          pointerEvents: "none",
        }}
      >
        {bubble.name}
      </p>
    </button>
  );
}

export default function ProBubbleCanvas({ onScroll }: ProBubbleCanvasProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [bubbles, setBubbles] = useState<Record<ProZoneId, ProBubbleItem[]>>(FALLBACK_NETWORK);
  const [openZone, setOpenZone] = useState<ProZoneId | null>(null);
  const [liftingZone, setLiftingZone] = useState<ProZoneId | null>(null);

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

  const openPanel = (zoneId: ProZoneId) => {
    setLiftingZone(zoneId);
    setOpenZone(zoneId);
    window.setTimeout(() => {
      setLiftingZone((current) => (current === zoneId ? null : current));
    }, 600 + 80 * Math.max(0, (bubbles[zoneId]?.length || 1) - 1));
  };

  const closePanel = () => setOpenZone(null);

  const openZoneConfig = ZONES.find((z) => z.id === openZone) || null;
  const panelItems = openZone ? bubbles[openZone] || [] : [];

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
        @keyframes pro-zone-lift {
          0% { transform: translateY(0); }
          100% { transform: translateY(-20px); }
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
        .pro-zone-lift {
          animation: pro-zone-lift 0.6s ease-out forwards var(--delay, 0s);
        }
        .pro-zone-panel {
          position: fixed;
          z-index: 220;
          background: #fff;
          color: ${INK};
          box-shadow: -12px 0 40px rgba(15,23,42,0.18);
          display: flex;
          flex-direction: column;
        }
        @media (min-width: 641px) {
          .pro-zone-panel {
            top: 0;
            right: 0;
            bottom: 0;
            width: min(380px, 92vw);
            animation: pro-panel-in-right 0.35s ease-out;
          }
        }
        @media (max-width: 640px) {
          .pro-zone-panel {
            left: 0;
            right: 0;
            bottom: 0;
            max-height: 72vh;
            border-radius: 18px 18px 0 0;
            animation: pro-panel-in-up 0.35s ease-out;
          }
        }
        @keyframes pro-panel-in-right {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @keyframes pro-panel-in-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
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
            <button
              type="button"
              onClick={() => openPanel(zone.id)}
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
                cursor: "pointer",
                pointerEvents: "auto",
              }}
            >
              {zone.label}
            </button>
          </div>

          <div
            style={{
              position: "relative",
              width: "100%",
              height: zoneBodyHeight((bubbles[zone.id] || []).length),
              minHeight: "480px",
            }}
          >
            {(bubbles[zone.id] || []).map((bubble, index) => (
              <ZoneBubble
                key={bubble.id}
                bubble={bubble}
                zone={zone}
                index={index}
                lifting={liftingZone === zone.id}
                onTap={() => openPanel(zone.id)}
              />
            ))}
          </div>
        </section>
      ))}

      {openZoneConfig && (
        <>
          <button
            type="button"
            aria-label="Fermer"
            onClick={closePanel}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 210,
              border: "none",
              background: "rgba(15,23,42,0.28)",
              cursor: "pointer",
            }}
          />
          <aside className="pro-zone-panel" role="dialog" aria-label={openZoneConfig.label}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px 16px 12px",
                borderBottom: `1px solid ${openZoneConfig.color}33`,
                flexShrink: 0,
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: "11px",
                  fontWeight: 900,
                  letterSpacing: "0.28em",
                  color: openZoneConfig.color,
                }}
              >
                {openZoneConfig.label}
              </p>
              <button
                type="button"
                onClick={closePanel}
                aria-label="Close"
                style={{
                  width: 36,
                  height: 36,
                  border: "none",
                  background: "transparent",
                  color: INK,
                  fontSize: 24,
                  lineHeight: 1,
                  cursor: "pointer",
                }}
              >
                ×
              </button>
            </div>
            <div style={{ overflowY: "auto", padding: "8px 12px 24px", flex: 1 }}>
              {panelItems.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "12px 8px",
                    borderBottom: "1px solid #E2E8F0",
                  }}
                >
                  <FaceMark bubble={item} dim={72} />
                  <div style={{ minWidth: 0 }}>
                    <p style={{ margin: 0, fontWeight: 800, fontSize: 14, color: INK }}>{item.name}</p>
                    <p
                      style={{
                        margin: "4px 0 0",
                        fontSize: 13,
                        lineHeight: 1.4,
                        color: "#475569",
                        fontFamily: "Georgia, serif",
                        fontStyle: "italic",
                      }}
                    >
                      {item.title}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </>
      )}
    </div>
  );
}
