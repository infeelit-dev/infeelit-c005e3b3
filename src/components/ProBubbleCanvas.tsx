import { useEffect, useRef, type CSSProperties } from "react";

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
}

interface ProBubbleCanvasProps {
  onScroll?: (scrollTop: number) => void;
  onBubbleTap?: (bubble: ProBubbleItem & { color: string; zone: ProZoneId }) => void;
}

type ZoneConfig = {
  id: ProZoneId;
  label: string;
  color: string;
  opacity: number;
  borderWidth: number;
  fill: string;
  float: "slow" | "medium" | "anchored";
  wash: string;
};

const ZONES: ZoneConfig[] = [
  {
    id: "vision",
    label: "VISION",
    color: "#6D59A8",
    opacity: 0.7,
    borderWidth: 1.5,
    fill: "rgba(109,89,168,0.15)",
    float: "slow",
    wash: "radial-gradient(ellipse at 50% 30%, rgba(109,89,168,0.22) 0%, transparent 65%)",
  },
  {
    id: "now",
    label: "NOW",
    color: "#2A6496",
    opacity: 0.85,
    borderWidth: 2,
    fill: "rgba(42,100,150,0.2)",
    float: "medium",
    wash: "radial-gradient(ellipse at 50% 40%, rgba(42,100,150,0.2) 0%, transparent 65%)",
  },
  {
    id: "foundation",
    label: "FONDATION",
    color: "#C4922A",
    opacity: 1,
    borderWidth: 3,
    fill: "rgba(196,146,42,0.25)",
    float: "anchored",
    wash: "radial-gradient(ellipse at 50% 60%, rgba(196,146,42,0.22) 0%, transparent 70%)",
  },
];

export const ZONE_BUBBLES: Record<ProZoneId, ProBubbleItem[]> = {
  vision: [
    {
      id: "v1",
      name: "Malik A.",
      role: "Fondateur",
      title: "Karak Tea Dubai Campaign",
      duration: "1:23",
      size: 75,
      x: 28,
      y: 32,
      hasPhoto: true,
      photoUrl:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face",
    },
    {
      id: "v2",
      name: "Équipe",
      role: "Infeelit",
      title: "$FEEL Token 2027",
      duration: "2:01",
      size: 80,
      x: 70,
      y: 28,
    },
    {
      id: "v3",
      name: "Malik A.",
      role: "Fondateur",
      title: "Infeelit pour les familles",
      duration: "1:45",
      size: 70,
      x: 52,
      y: 62,
    },
  ],
  now: [
    {
      id: "n1",
      name: "Malik A.",
      role: "Fondateur",
      title: "Launch day est arrivé",
      duration: "2:14",
      size: 95,
      x: 32,
      y: 30,
      hasPhoto: true,
      photoUrl:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face",
    },
    {
      id: "n2",
      name: "Équipe",
      role: "Infeelit",
      title: "18 langues ajoutées",
      duration: "1:38",
      size: 85,
      x: 72,
      y: 36,
    },
    {
      id: "n3",
      name: "Malik A.",
      role: "Fondateur",
      title: "Grit & Growl x Infeelit",
      duration: "3:02",
      size: 90,
      x: 48,
      y: 64,
      hasPhoto: true,
      photoUrl:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face",
    },
  ],
  foundation: [
    {
      id: "f1",
      name: "Malik A.",
      role: "Fondateur",
      title: "Pourquoi Infeelit est né",
      duration: "2:34",
      size: 125,
      x: 30,
      y: 34,
      hasPhoto: true,
      photoUrl:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face",
    },
    {
      id: "f2",
      name: "Malik A.",
      role: "Fondateur",
      title: "La peur de la première année",
      duration: "1:47",
      size: 110,
      x: 72,
      y: 30,
    },
    {
      id: "f3",
      name: "Malik A.",
      role: "Fondateur",
      title: "Notre mission pour 20 ans",
      duration: "3:12",
      size: 115,
      x: 50,
      y: 66,
    },
  ],
};

const FLOAT_CLASS: Record<ZoneConfig["float"], string> = {
  slow: "pro-zone-float-slow",
  medium: "pro-zone-float-medium",
  anchored: "pro-zone-float-anchored",
};

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
        opacity: zone.opacity,
        boxShadow: `0 4px 24px ${zone.color}40`,
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
            background:
              "linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.12) 45%, transparent 70%)",
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
          color: hasPhoto ? "#fff" : zone.color,
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
            textShadow: hasPhoto ? "0 1px 4px rgba(0,0,0,0.5)" : "none",
          }}
        >
          {bubble.name}
        </p>
        <p
          style={{
            fontSize: "9px",
            margin: "2px 0 0",
            opacity: 0.85,
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
          background: "rgba(0,0,0,0.65)",
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

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el || !onScroll) return;
    const handle = () => onScroll(el.scrollTop);
    el.addEventListener("scroll", handle, { passive: true });
    return () => el.removeEventListener("scroll", handle);
  }, [onScroll]);

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
        background: `
          linear-gradient(
            180deg,
            rgba(109,89,168,0.28) 0%,
            rgba(13,27,42,0.4) 18%,
            rgba(42,100,150,0.22) 48%,
            rgba(13,27,42,0.35) 72%,
            rgba(196,146,42,0.26) 100%
          ),
          #0D1B2A
        `,
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
          }}
        >
          {/* Sticky zone rail */}
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
                background: `linear-gradient(90deg, transparent, ${zone.color}99, transparent)`,
                boxShadow: `0 0 12px ${zone.color}55`,
              }}
            />
            <span
              style={{
                position: "relative",
                zIndex: 1,
                padding: "4px 14px",
                borderRadius: "999px",
                background: "rgba(13,27,42,0.92)",
                border: `1px solid ${zone.color}66`,
                color: zone.color,
                fontSize: "10px",
                fontWeight: 900,
                letterSpacing: "0.28em",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
              }}
            >
              {zone.label}
            </span>
          </div>

          <div
            style={{
              position: "absolute",
              inset: 0,
              background: zone.wash,
              pointerEvents: "none",
            }}
          />

          <div
            style={{
              position: "relative",
              width: "100%",
              height: "calc(100vh - 44px)",
              minHeight: "480px",
            }}
          >
            {ZONE_BUBBLES[zone.id].map((bubble, index) => (
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
