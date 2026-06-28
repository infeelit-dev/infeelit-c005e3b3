import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { resolveMemoryFields } from "@/lib/memoryUrl";
import MemoryFullscreen from "@/components/MemoryFullscreen";
import type { Timeline } from "@/types/timeline";

import imgGrandfather from "@/assets/grandfather.jpg";
import imgChild from "@/assets/child.jpg";
import imgMarry from "@/assets/marry.jpg";
import imgRelax from "@/assets/relax.jpg";
import imgBirth from "@/assets/birth.jpg";
import imgLove from "@/assets/love.jpg";
import imgHouse from "@/assets/house.jpg";
import imgPicnic from "@/assets/picnic.jpg";

export interface BubbleData {
  id: string;
  type: "real" | "demo";
  title: string;
  thumbnail_url?: string | null;
  file_url?: string | null;
  file_type?: "video" | "audio" | string | null;
  question_fr?: string | null;
  question_en?: string | null;
  question_ar?: string | null;
  user_id?: string;
  user_name?: string;
  user_location?: string;
  is_family_circle?: boolean;
  is_following?: boolean;
  sparks_count?: number;
  views_count?: number;
  created_at?: string;
  x: number;
  y: number;
  size: number;
  animDelay: number;
  animDuration: number;
}

const PACKET_SIZE = 8;
const SLIDE_MS = 280;

const getBubbleSize = (sparks = 0, views = 0): number => {
  const score = sparks * 3 + views * 0.1;
  if (score > 200) return 170;
  if (score > 50) return 140;
  if (score > 10) return 110;
  return 80;
};

const getBubbleBorder = (bubble: BubbleData) => {
  if (bubble.is_family_circle) {
    return { color: "#D4AF37", width: "3px", animated: true };
  }
  if (bubble.is_following) {
    return { color: "#E8742A", width: "2px", animated: false };
  }
  return null;
};

const generatePositions = (_sizes: number[]): Array<{ x: number; y: number }> => {
  const zones = [
    { x: [8, 30], y: [12, 30] },
    { x: [35, 60], y: [8, 25] },
    { x: [62, 85], y: [12, 30] },
    { x: [5, 28], y: [35, 55] },
    { x: [55, 82], y: [32, 52] },
    { x: [15, 45], y: [55, 75] },
    { x: [45, 75], y: [58, 78] },
    { x: [62, 88], y: [60, 80] },
  ];

  return zones.map((zone) => ({
    x: zone.x[0] + Math.random() * (zone.x[1] - zone.x[0]),
    y: zone.y[0] + Math.random() * (zone.y[1] - zone.y[0]),
  }));
};

const DEMO_BUBBLES: Omit<BubbleData, "x" | "y" | "size" | "animDelay" | "animDuration">[] = [
  { id: "demo-1", type: "demo", title: "L'odeur de sa cuisine", thumbnail_url: imgGrandfather },
  { id: "demo-2", type: "demo", title: "Ton plus vieux fou rire", thumbnail_url: imgChild },
  { id: "demo-3", type: "demo", title: "Leur geste d'amour muet", thumbnail_url: imgMarry },
  { id: "demo-4", type: "demo", title: "Le bruit de la maison", thumbnail_url: imgPicnic },
  { id: "demo-5", type: "demo", title: "Le café des matins", thumbnail_url: imgLove },
  { id: "demo-6", type: "demo", title: "Le vêtement de ton père", thumbnail_url: imgHouse },
  { id: "demo-7", type: "demo", title: "Leur secret de bonheur", thumbnail_url: imgRelax },
  { id: "demo-8", type: "demo", title: "La première étreinte", thumbnail_url: imgBirth },
];

const getDemoBubbles = (): BubbleData[] => {
  const positions = generatePositions(Array(8).fill(80));
  return DEMO_BUBBLES.map((demo, i) => ({
    ...demo,
    size: 80,
    x: positions[i].x,
    y: positions[i].y,
    animDelay: Math.random() * 3,
    animDuration: 3 + Math.random() * 4,
  }));
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

interface BubbleCanvasProps {
  onBubbleClick?: (question: string, category: "past") => void;
  activeTimeline: Timeline;
}

const BubbleCanvas = ({ onBubbleClick, activeTimeline: _activeTimeline }: BubbleCanvasProps) => {
  const { lang } = useLanguage();
  const touchStartX = useRef(0);
  const [userName, setUserName] = useState("");
  const [packets, setPackets] = useState<BubbleData[][]>([]);
  const [currentPacketIdx, setCurrentPacketIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [slideOffset, setSlideOffset] = useState(0);
  const [slideTransition, setSlideTransition] = useState(false);
  const [selectedBubble, setSelectedBubble] = useState<BubbleData | null>(null);
  const [expandingId, setExpandingId] = useState<string | null>(null);

  useEffect(() => {
    const local = localStorage.getItem("infeelit_user_name");
    if (local) {
      setUserName(local);
      return;
    }
    supabase.auth.getSession().then(({ data: { session } }) => {
      const name = session?.user?.user_metadata?.display_name || "";
      if (name) setUserName(name);
    });
  }, []);

  useEffect(() => {
    const loadMemories = async () => {
      setLoading(true);

      const { data } = await supabase
        .from("memories")
        .select(
          "id, title, thumbnail_url, file_url, file_type, user_id, sparks_count, views_count, created_at",
        )
        .eq("is_public", true)
        .eq("is_community", true)
        .not("moderation_status", "eq", "rejected")
        .order("created_at", { ascending: false })
        .limit(64);

      const rows = await resolveMemoryFields(data || []);

      const authorIds = Array.from(new Set(rows.map((m) => m.user_id).filter(Boolean)));
      const nameMap = new Map<string, string>();
      if (authorIds.length) {
        const { data: profs } = await supabase
          .from("profiles")
          .select("user_id, display_name")
          .in("user_id", authorIds);
        (profs || []).forEach((p) => {
          if (p.display_name) nameMap.set(p.user_id, p.display_name.split(" ")[0]);
        });
      }

      const session = await supabase.auth.getSession();
      const userId = session.data.session?.user?.id;

      let familyIds: string[] = [];
      let followingIds: string[] = [];

      if (userId) {
        const { data: memberOf } = await supabase
          .from("circle_members")
          .select("circle_id")
          .eq("user_id", userId);

        if (memberOf?.length) {
          const circleIds = memberOf.map((m) => m.circle_id);
          const { data: memberRows } = await supabase
            .from("circle_members")
            .select("user_id")
            .in("circle_id", circleIds);
          familyIds = Array.from(
            new Set((memberRows || []).map((r) => r.user_id).filter((id) => id !== userId)),
          );
        }

        const { data: followData } = await (supabase as any)
          .from("follows")
          .select("following_id")
          .eq("follower_id", userId);
        followingIds = (followData || []).map((r: { following_id: string }) => r.following_id);
      }

      const positions = generatePositions(Array(rows.length).fill(80));

      const bubbles: BubbleData[] = rows.map((m, i) => ({
        id: m.id,
        type: "real" as const,
        title: m.title || "Un souvenir",
        thumbnail_url: m.thumbnail_url,
        file_url: m.file_url,
        file_type: m.file_type,
        user_id: m.user_id,
        user_name: nameMap.get(m.user_id) || "Quelqu'un",
        sparks_count: m.sparks_count || 0,
        views_count: m.views_count || 0,
        created_at: m.created_at,
        is_family_circle: familyIds.includes(m.user_id || ""),
        is_following: followingIds.includes(m.user_id || ""),
        size: getBubbleSize(m.sparks_count || 0, m.views_count || 0),
        x: positions[i % positions.length].x,
        y: positions[i % positions.length].y,
        animDelay: Math.random() * 3,
        animDuration: 3 + Math.random() * 4,
      }));

      const demos = getDemoBubbles();
      const combined = bubbles.length < 8 ? [...bubbles, ...demos.slice(0, 8 - bubbles.length)] : bubbles;

      const newPackets: BubbleData[][] = [];
      for (let i = 0; i < combined.length; i += PACKET_SIZE) {
        const packet = combined.slice(i, i + PACKET_SIZE);
        const pPositions = generatePositions(packet.map((b) => b.size));
        newPackets.push(
          packet.map((b, j) => ({
            ...b,
            x: pPositions[j].x,
            y: pPositions[j].y,
          })),
        );
      }

      setPackets(newPackets.length ? newPackets : [demos]);
      setCurrentPacketIdx(0);
      setLoading(false);
    };

    loadMemories();
  }, []);

  const currentBubbles = packets[currentPacketIdx] || [];

  const navigatePacket = async (direction: "next" | "prev") => {
    if (isAnimating) return;

    const nextIdx = direction === "next" ? currentPacketIdx + 1 : currentPacketIdx - 1;
    if (nextIdx < 0 || nextIdx >= packets.length) return;

    setIsAnimating(true);
    setSlideTransition(true);
    setSlideOffset(direction === "next" ? -100 : 100);
    await sleep(SLIDE_MS);

    setSlideTransition(false);
    setCurrentPacketIdx(nextIdx);
    setSlideOffset(direction === "next" ? 100 : -100);
    await sleep(20);

    setSlideTransition(true);
    setSlideOffset(0);
    await sleep(SLIDE_MS);

    setSlideTransition(false);
    setIsAnimating(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (isAnimating || selectedBubble) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (delta > 60) navigatePacket("prev");
    else if (delta < -60) navigatePacket("next");
  };

  const handleBubbleTap = async (bubble: BubbleData) => {
    if (isAnimating) return;

    if (bubble.type === "demo" && onBubbleClick && bubble.title) {
      onBubbleClick(bubble.title, "past");
      return;
    }

    setExpandingId(bubble.id);
    await sleep(200);
    setSelectedBubble(bubble);
    setExpandingId(null);
  };

  const handleCloseMemory = () => {
    setSelectedBubble(null);
  };

  const renderBubbles = (bubbles: BubbleData[]) =>
    bubbles.map((bubble) => {
      const border = getBubbleBorder(bubble);
      const isExpanding = expandingId === bubble.id;
      const floatPaused = isAnimating || !!selectedBubble;

      return (
        <div
          key={bubble.id}
          className={`bubble-item ${isExpanding ? "bubble-expanding" : ""}`}
          onClick={() => handleBubbleTap(bubble)}
          style={{
            position: "absolute",
            left: `${bubble.x}%`,
            top: `${bubble.y}%`,
            transform: "translate(-50%, -50%)",
            width: `${bubble.size}px`,
            height: `${bubble.size}px`,
            borderRadius: "50%",
            cursor: "pointer",
            overflow: "hidden",
            animation: floatPaused
              ? "none"
              : border?.animated
                ? `bubbleFloat ${bubble.animDuration}s ease-in-out ${bubble.animDelay}s infinite, goldPulse 2s ease-in-out infinite`
                : `bubbleFloat ${bubble.animDuration}s ease-in-out ${bubble.animDelay}s infinite`,
            boxShadow: border
              ? border.animated
                ? undefined
                : `0 0 0 ${border.width} ${border.color}, 0 4px 20px rgba(0,0,0,0.15)`
              : bubble.type === "demo"
                ? "0 0 0 2px dashed rgba(232,116,42,0.45), 0 4px 20px rgba(0,0,0,0.12)"
                : "0 4px 20px rgba(0,0,0,0.15)",
            zIndex: bubble.is_family_circle ? 5 : bubble.is_following ? 4 : 3,
            willChange: "transform",
          }}
        >
          {bubble.thumbnail_url ? (
            <img
              src={bubble.thumbnail_url}
              alt={bubble.title}
              loading="lazy"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                pointerEvents: "none",
                filter: bubble.type === "demo" ? "sepia(20%) brightness(0.92)" : undefined,
              }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                background:
                  bubble.type === "demo"
                    ? "linear-gradient(135deg, #E8742A, #D4621A)"
                    : "linear-gradient(135deg, #2D1810, #8B3A1A)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span style={{ fontSize: bubble.size > 120 ? "28px" : "20px", opacity: 0.8 }}>
                {bubble.file_type === "audio" ? "🎙️" : "✦"}
              </span>
            </div>
          )}

          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(to top, rgba(45,24,16,0.7) 0%, transparent 50%)",
              pointerEvents: "none",
            }}
          />

          {bubble.size >= 110 && bubble.title && (
            <div
              style={{
                position: "absolute",
                bottom: "8px",
                left: "8px",
                right: "8px",
                pointerEvents: "none",
              }}
            >
              <p
                style={{
                  fontSize: bubble.size >= 140 ? "11px" : "9px",
                  color: "#fff",
                  margin: 0,
                  lineHeight: 1.3,
                  fontFamily: "Georgia, serif",
                  fontStyle: "italic",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  textShadow: "0 1px 4px rgba(0,0,0,0.8)",
                }}
              >
                {bubble.title}
              </p>
            </div>
          )}

          {bubble.is_family_circle && (
            <div
              style={{
                position: "absolute",
                top: "6px",
                right: "6px",
                width: "16px",
                height: "16px",
                borderRadius: "50%",
                background: "#D4AF37",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "8px",
              }}
            >
              ✦
            </div>
          )}
        </div>
      );
    });

  if (loading) {
    return (
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: "28px",
            height: "28px",
            border: "2px solid rgba(232,116,42,0.2)",
            borderTopColor: "#E8742A",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        background: "transparent",
      }}
    >
      <style>{`
        @keyframes bubbleFloat {
          0%, 100% { transform: translate(-50%, -50%) translateY(0px) rotate(0deg); }
          33% { transform: translate(-50%, -50%) translateY(-12px) rotate(1deg); }
          66% { transform: translate(-50%, -50%) translateY(6px) rotate(-1deg); }
        }
        @keyframes goldPulse {
          0%, 100% { outline: 0 solid rgba(212,175,55,0.5); }
          50% { outline: 4px solid rgba(212,175,55,0); }
        }
        @keyframes bubbleExpand {
          0% { transform: translate(-50%, -50%) scale(1); }
          100% { transform: translate(-50%, -50%) scale(1.15); }
        }
        .bubble-expanding {
          animation: bubbleExpand 0.2s ease-out forwards !important;
        }
        @media (prefers-reduced-motion: reduce) {
          .bubble-item { animation: none !important; }
        }
      `}</style>

      <button
        onClick={() => navigatePacket("prev")}
        disabled={currentPacketIdx === 0 || isAnimating}
        style={{
          position: "absolute",
          left: 0,
          top: "50%",
          transform: "translateY(-50%)",
          width: "36px",
          height: "72px",
          background: currentPacketIdx === 0 ? "rgba(61,43,31,0.05)" : "rgba(232,116,42,0.12)",
          border: "none",
          borderRadius: "0 36px 36px 0",
          cursor: currentPacketIdx === 0 ? "not-allowed" : "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 20,
          transition: "background 0.2s ease",
          backdropFilter: "blur(8px)",
        }}
        aria-label="Bulles précédentes"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path
            d="M9 18l6-6-6-6"
            stroke={currentPacketIdx === 0 ? "rgba(61,43,31,0.2)" : "#E8742A"}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <button
        onClick={() => navigatePacket("next")}
        disabled={currentPacketIdx >= packets.length - 1 || isAnimating}
        style={{
          position: "absolute",
          right: 0,
          top: "50%",
          transform: "translateY(-50%)",
          width: "36px",
          height: "72px",
          background:
            currentPacketIdx >= packets.length - 1 ? "rgba(61,43,31,0.05)" : "rgba(232,116,42,0.12)",
          border: "none",
          borderRadius: "36px 0 0 36px",
          cursor: currentPacketIdx >= packets.length - 1 ? "not-allowed" : "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 20,
          transition: "background 0.2s ease",
          backdropFilter: "blur(8px)",
        }}
        aria-label="Nouvelles bulles"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path
            d="M15 18l-6-6 6-6"
            stroke={currentPacketIdx >= packets.length - 1 ? "rgba(61,43,31,0.2)" : "#E8742A"}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {packets.length > 1 && (
        <div
          style={{
            position: "absolute",
            bottom: "16px",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            gap: "6px",
            zIndex: 20,
          }}
        >
          {packets.map((_, idx) => (
            <div
              key={idx}
              style={{
                width: idx === currentPacketIdx ? "20px" : "6px",
                height: "6px",
                borderRadius: "999px",
                background: idx === currentPacketIdx ? "#E8742A" : "rgba(232,116,42,0.3)",
                transition: "all 0.3s ease",
              }}
            />
          ))}
        </div>
      )}

      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `translateX(${slideOffset}%)`,
          transition: slideTransition ? `transform ${SLIDE_MS}ms ease-in-out` : "none",
          opacity: slideOffset === 0 ? 1 : 0.85,
        }}
      >
        {renderBubbles(currentBubbles)}
      </div>

      {selectedBubble && (
        <MemoryFullscreen
          bubble={selectedBubble}
          onClose={handleCloseMemory}
          userName={userName}
          lang={lang}
        />
      )}
    </div>
  );
};

export default BubbleCanvas;
