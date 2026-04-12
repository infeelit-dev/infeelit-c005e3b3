import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Mic, Heart, Volume2, Video, Play, ArrowLeft, Lock, Globe, X, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

import grandfatherImg from "@/assets/grandfather.jpg";
import marryImg from "@/assets/marry.jpg";
import loveImg from "@/assets/love.jpg";
import relaxImg from "@/assets/relax.jpg";
import travelImg from "@/assets/travel.jpg";
import graduateImg from "@/assets/graduate.jpg";
import picnicImg from "@/assets/picnic.jpg";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Memory {
  id: string;
  title: string | null;
  file_url: string;
  file_type: string | null;
  thumbnail_url: string | null;
  created_at: string;
  is_public: boolean | null;
  timeline: string | null;
  description: string | null;
}

type ActiveTab = "all" | "memories" | "forever" | "video" | "voices";

// ─── Demo fallback ────────────────────────────────────────────────────────────

const DEMO: Memory[] = [
  {
    id: "d1",
    title: "The smell of home",
    file_url: "",
    file_type: "video",
    thumbnail_url: grandfatherImg,
    created_at: "2026-04-07T10:00:00Z",
    is_public: false,
    timeline: "memories",
    description: "Every time I smell fresh bread I think of her hands...",
  },
  {
    id: "d2",
    title: "Dad's lesson about courage",
    file_url: "",
    file_type: "audio",
    thumbnail_url: null,
    created_at: "2026-04-06T14:00:00Z",
    is_public: true,
    timeline: "memories",
    description: null,
  },
  {
    id: "d3",
    title: "Summer of 1987",
    file_url: "",
    file_type: "video",
    thumbnail_url: marryImg,
    created_at: "2026-04-05T09:00:00Z",
    is_public: false,
    timeline: "memories",
    description: null,
  },
  {
    id: "d4",
    title: "What I want my daughter to know",
    file_url: "",
    file_type: "video",
    thumbnail_url: loveImg,
    created_at: "2026-04-04T18:00:00Z",
    is_public: false,
    timeline: "forever",
    description: "My dear child, when this day comes...",
  },
  {
    id: "d5",
    title: "Our first home in Dubai",
    file_url: "",
    file_type: "audio",
    thumbnail_url: null,
    created_at: "2026-04-03T11:00:00Z",
    is_public: true,
    timeline: "instant",
    description: null,
  },
  {
    id: "d6",
    title: "The day you were born",
    file_url: "",
    file_type: "video",
    thumbnail_url: relaxImg,
    created_at: "2026-04-02T16:00:00Z",
    is_public: false,
    timeline: "memories",
    description: null,
  },
  {
    id: "d7",
    title: "Grandmother's tajine recipe",
    file_url: "",
    file_type: "audio",
    thumbnail_url: null,
    created_at: "2026-04-01T08:00:00Z",
    is_public: true,
    timeline: "memories",
    description: null,
  },
  {
    id: "d8",
    title: "When I am no longer here",
    file_url: "",
    file_type: "video",
    thumbnail_url: travelImg,
    created_at: "2026-03-30T20:00:00Z",
    is_public: false,
    timeline: "forever",
    description: "I want you to know...",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });

const tlStyle = (tl: string | null) => {
  if (tl === "forever")
    return { icon: "✉️", text: "Forever", bg: "rgba(107,78,155,.22)", border: "rgba(107,78,155,.5)", color: "#c4b5fd" };
  if (tl === "instant")
    return { icon: "●", text: "Now", bg: "rgba(56,189,248,.18)", border: "rgba(56,189,248,.5)", color: "#7dd3fc" };
  return { icon: "◎", text: "Past", bg: "rgba(232,116,42,.18)", border: "rgba(232,116,42,.45)", color: "#fdba74" };
};

const TABS: { id: ActiveTab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "memories", label: "Memories" },
  { id: "forever", label: "Forever" },
  { id: "video", label: "🎬 Video" },
  { id: "voices", label: "🎙️ Voice" },
];

// ─── Player overlay ───────────────────────────────────────────────────────────

const Player = ({
  memory,
  onClose,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
}: {
  memory: Memory;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
}) => {
  const tl = tlStyle(memory.timeline);
  const isAudio = memory.file_type === "audio";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        backgroundColor: "rgba(0,0,0,.94)",
        backdropFilter: "blur(12px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "340px",
          backgroundColor: "#141414",
          borderRadius: "28px",
          overflow: "hidden",
          boxShadow: "0 40px 80px rgba(0,0,0,.7), 0 0 0 1px rgba(255,255,255,.06)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Media */}
        <div
          style={{
            position: "relative",
            aspectRatio: isAudio ? "16/9" : "4/5",
            backgroundColor: isAudio ? "#1A2E38" : "#0a0a0a",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          {memory.thumbnail_url && !isAudio ? (
            <img
              src={memory.thumbnail_url}
              alt=""
              style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }}
            />
          ) : isAudio ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "3px", height: "56px" }}>
                {Array.from({ length: 32 }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      width: "3px",
                      height: `${12 + Math.sin(i * 0.55) * 18 + Math.cos(i * 0.3) * 10}px`,
                      backgroundColor: "#E8742A",
                      borderRadius: "2px",
                      opacity: 0.75,
                      animation: `wv ${0.7 + (i % 5) * 0.15}s ease-in-out infinite alternate`,
                      animationDelay: `${i * 0.04}s`,
                    }}
                  />
                ))}
              </div>
              <Volume2 size={28} color="rgba(255,255,255,.2)" />
            </div>
          ) : (
            <Video size={48} color="rgba(255,255,255,.15)" />
          )}

          {/* Overlay gradient */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(to top, rgba(0,0,0,.75) 0%, transparent 55%)",
            }}
          />

          {/* Play */}
          <div
            style={{
              position: "absolute",
              width: "68px",
              height: "68px",
              borderRadius: "50%",
              backgroundColor: "#E8742A",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 0 8px rgba(232,116,42,.18), 0 0 40px rgba(232,116,42,.5)",
              cursor: "pointer",
            }}
          >
            <Play size={28} color="#fff" fill="#fff" style={{ marginLeft: "3px" }} />
          </div>

          {/* Timeline badge */}
          <div
            style={{
              position: "absolute",
              top: "14px",
              left: "14px",
              padding: "4px 10px",
              borderRadius: "20px",
              backgroundColor: tl.bg,
              border: `1px solid ${tl.border}`,
            }}
          >
            <span
              style={{
                fontSize: "9px",
                fontWeight: 900,
                letterSpacing: ".1em",
                color: tl.color,
                textTransform: "uppercase",
              }}
            >
              {tl.icon} {tl.text}
            </span>
          </div>

          {/* Privacy */}
          <div
            style={{
              position: "absolute",
              top: "14px",
              right: "14px",
              width: "30px",
              height: "30px",
              borderRadius: "50%",
              backgroundColor: "rgba(0,0,0,.4)",
              backdropFilter: "blur(6px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {memory.is_public ? (
              <Globe size={13} color="rgba(255,255,255,.65)" />
            ) : (
              <Lock size={13} color="rgba(255,255,255,.65)" />
            )}
          </div>
        </div>

        {/* Info */}
        <div style={{ padding: "20px 20px 4px" }}>
          <h2
            style={{
              fontSize: "19px",
              fontWeight: 700,
              fontFamily: "Georgia,serif",
              color: "#fff",
              marginBottom: "8px",
              lineHeight: 1.3,
            }}
          >
            {memory.title || "A memory"}
          </h2>
          {memory.description && (
            <p
              style={{
                fontSize: "13px",
                color: "rgba(255,255,255,.45)",
                lineHeight: 1.55,
                marginBottom: "10px",
                fontStyle: "italic",
              }}
            >
              "{memory.description}"
            </p>
          )}
          <p style={{ fontSize: "11px", color: "rgba(255,255,255,.25)" }}>{formatDate(memory.created_at)}</p>
        </div>

        {/* Nav */}
        <div style={{ display: "flex", borderTop: "1px solid rgba(255,255,255,.06)", marginTop: "16px" }}>
          {[
            { icon: <ChevronLeft size={22} />, action: onPrev, enabled: hasPrev },
            { icon: <X size={18} />, action: onClose, enabled: true },
            { icon: <ChevronRight size={22} />, action: onNext, enabled: hasNext },
          ].map((btn, i) => (
            <button
              key={i}
              onClick={btn.action}
              disabled={!btn.enabled}
              style={{
                flex: 1,
                padding: "16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "transparent",
                border: "none",
                borderRight: i < 2 ? "1px solid rgba(255,255,255,.06)" : "none",
                cursor: btn.enabled ? "pointer" : "default",
                opacity: btn.enabled ? 1 : 0.18,
                color: "rgba(255,255,255,.55)",
              }}
            >
              {btn.icon}
            </button>
          ))}
        </div>
      </div>

      <p style={{ color: "rgba(255,255,255,.2)", fontSize: "11px", marginTop: "16px" }}>Tap outside to close</p>

      <style>{`@keyframes wv{from{transform:scaleY(1)}to{transform:scaleY(1.7)}}`}</style>
    </div>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────

const Treasure = () => {
  const navigate = useNavigate();

  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState("Your");
  const [userInitial, setUserInitial] = useState("M");
  const [activeTab, setActiveTab] = useState<ActiveTab>("all");
  const [isDemo, setIsDemo] = useState(false);
  const [playerIdx, setPlayerIdx] = useState<number | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          setMemories(DEMO);
          setIsDemo(true);
          setLoading(false);
          return;
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("display_name")
          .eq("user_id", session.user.id)
          .single();
        if (profile?.display_name) {
          setDisplayName(profile.display_name);
          setUserInitial(profile.display_name[0]?.toUpperCase() || "M");
        }

        const { data: mems, error } = await (supabase as any)
          .from("memories")
          .select("*")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false });

        if (error) console.error(error);

        if (mems?.length > 0) {
          setMemories(mems as Memory[]);
          setIsDemo(false);
        } else {
          setMemories(DEMO);
          setIsDemo(true);
        }
      } catch (err) {
        console.error(err);
        setMemories(DEMO);
        setIsDemo(true);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const filtered = memories.filter((m) => {
    if (activeTab === "all") return true;
    if (activeTab === "memories") return m.timeline === "memories" || m.timeline === "past";
    if (activeTab === "forever") return m.timeline === "forever";
    if (activeTab === "video") return m.file_type === "video";
    if (activeTab === "voices") return m.file_type === "audio";
    return true;
  });

  const real = isDemo ? [] : memories;
  const statVideos = real.filter((m) => m.file_type === "video").length;
  const statVoices = real.filter((m) => m.file_type === "audio").length;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0E1A20", paddingBottom: "120px" }}>
      {/* Player */}
      {playerIdx !== null && filtered[playerIdx] && (
        <Player
          memory={filtered[playerIdx]}
          onClose={() => setPlayerIdx(null)}
          onPrev={() => setPlayerIdx((i) => (i! > 0 ? i! - 1 : i))}
          onNext={() => setPlayerIdx((i) => (i! < filtered.length - 1 ? i! + 1 : i))}
          hasPrev={playerIdx > 0}
          hasNext={playerIdx < filtered.length - 1}
        />
      )}

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div
        style={{
          background: "linear-gradient(145deg, #1A3B47 0%, #22534A 45%, #B85A18 100%)",
          paddingTop: "56px",
          paddingBottom: "28px",
          paddingLeft: "24px",
          paddingRight: "24px",
          borderRadius: "0 0 32px 32px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          style={{
            position: "absolute",
            top: "14px",
            left: "16px",
            width: "34px",
            height: "34px",
            borderRadius: "50%",
            backgroundColor: "rgba(255,255,255,.1)",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <ArrowLeft size={17} color="#fff" />
        </button>

        {/* Decorative circles */}
        <div
          style={{
            position: "absolute",
            top: "-30px",
            right: "-30px",
            width: "160px",
            height: "160px",
            borderRadius: "50%",
            background: "rgba(255,255,255,.04)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-20px",
            right: "40px",
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            background: "rgba(232,116,42,.15)",
            pointerEvents: "none",
          }}
        />

        {/* Top row: label + avatar — aligned */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
          <p
            style={{
              fontSize: "10px",
              fontWeight: 900,
              letterSpacing: ".22em",
              color: "rgba(255,255,255,.4)",
              textTransform: "uppercase",
            }}
          >
            Your Haven
          </p>
          {/* Avatar — aligned with title line */}
          <div
            style={{
              width: "46px",
              height: "46px",
              borderRadius: "50%",
              backgroundColor: "#E8742A",
              border: "2.5px solid rgba(255,255,255,.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "18px",
              fontWeight: 900,
              color: "#fff",
              boxShadow: "0 0 0 4px rgba(232,116,42,.2)",
              flexShrink: 0,
            }}
          >
            {userInitial}
          </div>
        </div>

        {/* Title — same left edge as label above */}
        <h1
          style={{
            fontSize: "30px",
            fontWeight: 700,
            color: "#fff",
            fontFamily: "Georgia,serif",
            lineHeight: 1.15,
            marginBottom: "24px",
          }}
        >
          Your
          <br />
          <span style={{ fontStyle: "italic", color: "rgba(255,255,255,.85)" }}>stories</span>
        </h1>

        {/* Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "8px",
          }}
        >
          {[
            { value: real.length, label: "Stories preserved" },
            { value: statVideos, label: "Video moments" },
            { value: statVoices, label: "Voice captures" },
          ].map((s, i) => (
            <div
              key={i}
              style={{
                backgroundColor: "rgba(255,255,255,.1)",
                borderRadius: "16px",
                padding: "14px 8px",
                textAlign: "center",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255,255,255,.08)",
              }}
            >
              <p style={{ fontSize: "28px", fontWeight: 900, color: "#fff", lineHeight: 1 }}>{s.value}</p>
              <p
                style={{
                  fontSize: "8.5px",
                  fontWeight: 700,
                  letterSpacing: ".1em",
                  color: "rgba(255,255,255,.38)",
                  textTransform: "uppercase",
                  marginTop: "4px",
                }}
              >
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {isDemo && (
          <div
            style={{
              marginTop: "12px",
              padding: "10px 14px",
              borderRadius: "12px",
              backgroundColor: "rgba(255,255,255,.07)",
              border: "1px solid rgba(255,255,255,.12)",
            }}
          >
            <p style={{ fontSize: "11px", color: "rgba(255,255,255,.5)", textAlign: "center" }}>
              ✦ Preview mode — record your first memory
            </p>
          </div>
        )}
      </div>

      {/* ── Tabs ──────────────────────────────────────────────────────────── */}
      <div
        style={{
          padding: "20px 20px 4px",
          display: "flex",
          gap: "8px",
          overflowX: "auto",
          scrollbarWidth: "none",
        }}
      >
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              flexShrink: 0,
              // Bigger touch target
              padding: "10px 20px",
              borderRadius: "24px",
              fontSize: "13px",
              fontWeight: 700,
              transition: "all .18s",
              backgroundColor: activeTab === t.id ? "#E8742A" : "rgba(255,255,255,.08)",
              color: activeTab === t.id ? "#fff" : "rgba(255,255,255,.55)",
              border: activeTab === t.id ? "none" : "1px solid rgba(255,255,255,.1)",
              boxShadow: activeTab === t.id ? "0 4px 18px rgba(232,116,42,.45)" : "none",
              cursor: "pointer",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Grid ──────────────────────────────────────────────────────────── */}
      <div style={{ padding: "12px 20px" }}>
        {loading ? (
          <div
            style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: "80px", gap: "14px" }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                border: "3px solid rgba(232,116,42,.3)",
                borderTopColor: "#E8742A",
                animation: "spin 1s linear infinite",
              }}
            />
            <p
              style={{
                fontSize: "13px",
                fontFamily: "Georgia,serif",
                fontStyle: "italic",
                color: "rgba(255,255,255,.3)",
              }}
            >
              Opening your chest...
            </p>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : filtered.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px 24px",
              marginTop: "8px",
              backgroundColor: "rgba(255,255,255,.04)",
              borderRadius: "24px",
              border: "2px dashed rgba(255,255,255,.1)",
            }}
          >
            <Heart size={44} color="rgba(255,255,255,.1)" style={{ margin: "0 auto 16px" }} />
            <p
              style={{
                fontSize: "16px",
                fontFamily: "Georgia,serif",
                fontStyle: "italic",
                color: "rgba(255,255,255,.5)",
                marginBottom: "8px",
              }}
            >
              Nothing here yet...
            </p>
            <p style={{ fontSize: "12px", color: "rgba(255,255,255,.25)" }}>Record a memory to fill this space.</p>
          </div>
        ) : (
          // NO "+ card" in grid — only real/demo cards
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            {filtered.map((mem, idx) => {
              const tl = tlStyle(mem.timeline);
              const isAudio = mem.file_type === "audio";
              const isFore = mem.timeline === "forever";

              return (
                <div
                  key={mem.id}
                  onClick={() => {
                    if (isDemo) {
                      toast.info("Record your first memory.");
                      return;
                    }
                    setPlayerIdx(idx);
                  }}
                  style={{
                    backgroundColor: "#1A2530",
                    borderRadius: "20px",
                    overflow: "hidden",
                    border: isFore ? "1px solid rgba(107,78,155,.3)" : "1px solid rgba(255,255,255,.07)",
                    cursor: "pointer",
                    transition: "transform .14s",
                  }}
                  onTouchStart={(e) => (e.currentTarget.style.transform = "scale(.96)")}
                  onTouchEnd={(e) => (e.currentTarget.style.transform = "scale(1)")}
                >
                  {/* Thumbnail */}
                  <div
                    style={{
                      position: "relative",
                      aspectRatio: "1",
                      backgroundColor: isAudio
                        ? isFore
                          ? "rgba(107,78,155,.15)"
                          : "rgba(26,59,71,.4)"
                        : "rgba(0,0,0,.4)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                    }}
                  >
                    {mem.thumbnail_url ? (
                      <img
                        src={mem.thumbnail_url}
                        alt=""
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          objectPosition: "center top",
                          filter: isFore ? "brightness(.8) saturate(.7)" : "none",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: "6px",
                          opacity: 0.25,
                        }}
                      >
                        {isAudio ? <Volume2 size={28} color="#fff" /> : <Video size={28} color="#fff" />}
                      </div>
                    )}

                    {/* Strong gradient for text legibility */}
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background:
                          "linear-gradient(to top, rgba(0,0,0,.78) 0%, rgba(0,0,0,.12) 55%, transparent 100%)",
                      }}
                    />

                    {/* Play */}
                    <div
                      style={{
                        position: "absolute",
                        bottom: "8px",
                        right: "8px",
                        width: "30px",
                        height: "30px",
                        borderRadius: "50%",
                        backgroundColor: "rgba(232,116,42,.85)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 0 12px rgba(232,116,42,.4)",
                      }}
                    >
                      <Play size={12} color="#fff" fill="#fff" style={{ marginLeft: "1px" }} />
                    </div>

                    {/* Timeline badge */}
                    <div
                      style={{
                        position: "absolute",
                        top: "8px",
                        left: "8px",
                        padding: "3px 8px",
                        borderRadius: "20px",
                        backgroundColor: tl.bg,
                        border: `1px solid ${tl.border}`,
                      }}
                    >
                      <span
                        style={{
                          fontSize: "7px",
                          fontWeight: 900,
                          letterSpacing: ".08em",
                          color: tl.color,
                          textTransform: "uppercase",
                        }}
                      >
                        {tl.text.toUpperCase()}
                      </span>
                    </div>

                    {/* Privacy */}
                    <div
                      style={{
                        position: "absolute",
                        top: "8px",
                        right: "8px",
                        width: "22px",
                        height: "22px",
                        borderRadius: "50%",
                        backgroundColor: "rgba(0,0,0,.35)",
                        backdropFilter: "blur(4px)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {mem.is_public ? (
                        <Globe size={9} color="rgba(255,255,255,.65)" />
                      ) : (
                        <Lock size={9} color="rgba(255,255,255,.65)" />
                      )}
                    </div>

                    {/* Forever vignette */}
                    {isFore && (
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          background: "linear-gradient(to top, rgba(107,78,155,.45) 0%, transparent 55%)",
                        }}
                      />
                    )}
                  </div>

                  {/* Footer */}
                  <div style={{ padding: "10px 12px 12px" }}>
                    <h3
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        color: "#fff",
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                        textOverflow: "ellipsis",
                        marginBottom: "4px",
                        lineHeight: 1.3,
                      }}
                    >
                      {mem.title || "A memory"}
                    </h3>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <p style={{ fontSize: "9px", color: "rgba(255,255,255,.3)" }}>{formatDate(mem.created_at)}</p>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "3px",
                          padding: "2px 7px",
                          borderRadius: "10px",
                          backgroundColor: isAudio ? "rgba(107,78,155,.2)" : "rgba(255,255,255,.07)",
                        }}
                      >
                        {isAudio ? (
                          <Volume2 size={8} color="#c4b5fd" />
                        ) : (
                          <Video size={8} color="rgba(255,255,255,.5)" />
                        )}
                        <span
                          style={{
                            fontSize: "8px",
                            fontWeight: 700,
                            color: isAudio ? "#c4b5fd" : "rgba(255,255,255,.45)",
                          }}
                        >
                          {isAudio ? "Voice" : "Video"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Fixed CTA — orange glow, no duplicate "+" card ────────────────── */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "16px 20px 32px",
          background: "linear-gradient(to top, #0E1A20 55%, transparent)",
          zIndex: 50,
        }}
      >
        <button
          onClick={() => navigate("/record")}
          style={{
            width: "100%",
            padding: "17px",
            borderRadius: "20px",
            background: "linear-gradient(135deg,#E8742A,#D4621A)",
            color: "#fff",
            fontWeight: 700,
            fontSize: "15px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            // Magic glow
            boxShadow: "0 0 0 1px rgba(232,116,42,.3), 0 8px 32px rgba(232,116,42,.55), 0 0 60px rgba(232,116,42,.25)",
            border: "none",
            cursor: "pointer",
          }}
        >
          <Mic size={20} />
          Preserve a story
        </button>
      </div>
    </div>
  );
};

export default Treasure;
