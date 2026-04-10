import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Mic, Heart, Volume2, Video, Play, Lock, Globe, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

import grandfatherImg from "@/assets/grandfather.jpg";
import marryImg from "@/assets/marry.jpg";
import loveImg from "@/assets/love.jpg";
import relaxImg from "@/assets/relax.jpg";
import travelImg from "@/assets/travel.jpg";
import graduateImg from "@/assets/graduate.jpg";

interface Memory {
  id: string;
  title: string | null;
  file_url: string;
  file_type: string | null;
  thumbnail_url: string | null;
  created_at: string;
  is_public: boolean | null;
  timeline: string | null;
}

type ActiveTab = "all" | "voices" | "video" | "forever";

// Demo memories shown when Supabase returns nothing
const DEMO_MEMORIES: Memory[] = [
  {
    id: "d1",
    title: "The smell of home",
    file_url: "",
    file_type: "video",
    thumbnail_url: grandfatherImg,
    created_at: "2026-04-07T10:00:00Z",
    is_public: false,
    timeline: "past",
  },
  {
    id: "d2",
    title: "What courage taught me",
    file_url: "",
    file_type: "audio",
    thumbnail_url: null,
    created_at: "2026-04-06T14:00:00Z",
    is_public: true,
    timeline: "past",
  },
  {
    id: "d3",
    title: "Summer of 1987",
    file_url: "",
    file_type: "video",
    thumbnail_url: marryImg,
    created_at: "2026-04-05T09:00:00Z",
    is_public: false,
    timeline: "past",
  },
  {
    id: "d4",
    title: "A message for your wedding",
    file_url: "",
    file_type: "video",
    thumbnail_url: loveImg,
    created_at: "2026-04-04T18:00:00Z",
    is_public: false,
    timeline: "forever",
  },
  {
    id: "d5",
    title: "Sunday mornings",
    file_url: "",
    file_type: "audio",
    thumbnail_url: null,
    created_at: "2026-04-03T11:00:00Z",
    is_public: true,
    timeline: "instant",
  },
  {
    id: "d6",
    title: "The day you were born",
    file_url: "",
    file_type: "video",
    thumbnail_url: relaxImg,
    created_at: "2026-04-02T16:00:00Z",
    is_public: false,
    timeline: "past",
  },
  {
    id: "d7",
    title: "Grandmother's recipe",
    file_url: "",
    file_type: "audio",
    thumbnail_url: null,
    created_at: "2026-04-01T08:00:00Z",
    is_public: true,
    timeline: "past",
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
  },
];

const TABS: { id: ActiveTab; label: string; icon: string }[] = [
  { id: "all", label: "All", icon: "✦" },
  { id: "voices", label: "Voices", icon: "🎙️" },
  { id: "video", label: "Moments", icon: "🎬" },
  { id: "forever", label: "Forever", icon: "✉️" },
];

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });

const timelineColor = (tl: string | null) => {
  if (tl === "forever") return { bg: "rgba(107,78,155,.18)", border: "rgba(107,78,155,.4)", text: "#6B4E9B" };
  if (tl === "instant") return { bg: "rgba(56,189,248,.14)", border: "rgba(56,189,248,.4)", text: "#0ea5e9" };
  return { bg: "rgba(232,116,42,.12)", border: "rgba(232,116,42,.35)", text: "#E8742A" };
};

const Treasure = () => {
  const navigate = useNavigate();

  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState("Your");
  const [activeTab, setActiveTab] = useState<ActiveTab>("all");
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        navigate("/");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("user_id", session.user.id)
        .single();
      if (profile?.display_name) setDisplayName(profile.display_name);

      const { data: mems, error } = await (supabase as any)
        .from("memories")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (error) console.error(error);

      if (mems && mems.length > 0) {
        setMemories(mems as Memory[]);
        setIsDemo(false);
      } else {
        // Show demo content so the page never feels empty
        setMemories(DEMO_MEMORIES);
        setIsDemo(true);
      }
      setLoading(false);
    };
    fetch();
  }, [navigate]);

  const filtered = memories.filter((m) => {
    if (activeTab === "all") return true;
    if (activeTab === "voices") return m.file_type === "audio";
    if (activeTab === "video") return m.file_type === "video";
    if (activeTab === "forever") return m.timeline === "forever";
    return true;
  });

  const countByType = (type: string) => memories.filter((m) => m.file_type === type).length;
  const countForever = memories.filter((m) => m.timeline === "forever").length;

  const handleOpen = (mem: Memory) => {
    if (isDemo) {
      toast.info("Record your first memory to see it here.");
      return;
    }
    toast.info(`Opening: ${mem.title || "Memory"}`);
    // TODO: open immersive player
  };

  return (
    <div className="min-h-screen pb-32" style={{ backgroundColor: "#FAF8F6" }}>
      {/* ── Hero header ────────────────────────────────────────────────────── */}
      <div
        style={{
          background: "linear-gradient(160deg, #1A3B47 0%, #2C6E49 60%, #E8742A 140%)",
          paddingTop: "64px",
          paddingBottom: "32px",
          paddingLeft: "24px",
          paddingRight: "24px",
          borderRadius: "0 0 36px 36px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative bubble bg */}
        <div
          style={{
            position: "absolute",
            top: "-20px",
            right: "-20px",
            width: "160px",
            height: "160px",
            borderRadius: "50%",
            background: "rgba(255,255,255,.05)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-40px",
            right: "60px",
            width: "100px",
            height: "100px",
            borderRadius: "50%",
            background: "rgba(232,116,42,.15)",
          }}
        />

        {/* Name + tagline */}
        <p
          style={{
            fontSize: "11px",
            fontWeight: 900,
            letterSpacing: ".2em",
            color: "rgba(255,255,255,.5)",
            textTransform: "uppercase",
            marginBottom: "6px",
          }}
        >
          Treasure
        </p>
        <h1
          style={{
            fontSize: "28px",
            fontWeight: 700,
            color: "#fff",
            fontFamily: "Georgia,serif",
            lineHeight: 1.2,
            marginBottom: "4px",
          }}
        >
          {displayName},
        </h1>
        <p
          style={{
            fontSize: "16px",
            color: "rgba(255,255,255,.55)",
            fontFamily: "Georgia,serif",
            fontStyle: "italic",
            marginBottom: "28px",
          }}
        >
          your memories live here.
        </p>

        {/* Stats row */}
        <div
          style={{
            display: "flex",
            gap: "0",
            backgroundColor: "rgba(255,255,255,.1)",
            borderRadius: "16px",
            overflow: "hidden",
          }}
        >
          {[
            { value: memories.length, label: "Memories", color: "#E8742A" },
            { value: countByType("audio"), label: "Voices", color: "#a78bfa" },
            { value: countForever, label: "Forever", color: "#38bdf8" },
          ].map((s, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                padding: "14px 8px",
                textAlign: "center",
                borderRight: i < 2 ? "1px solid rgba(255,255,255,.1)" : "none",
              }}
            >
              <p style={{ fontSize: "24px", fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.value}</p>
              <p
                style={{
                  fontSize: "9px",
                  fontWeight: 700,
                  letterSpacing: ".12em",
                  color: "rgba(255,255,255,.45)",
                  textTransform: "uppercase",
                  marginTop: "3px",
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
              marginTop: "14px",
              padding: "10px 14px",
              borderRadius: "12px",
              backgroundColor: "rgba(255,255,255,.1)",
              border: "1px solid rgba(255,255,255,.2)",
            }}
          >
            <p style={{ fontSize: "11px", color: "rgba(255,255,255,.7)", textAlign: "center" }}>
              ✦ Demo preview — record your first memory to fill this space
            </p>
          </div>
        )}
      </div>

      {/* ── Tabs ───────────────────────────────────────────────────────────── */}
      <div style={{ padding: "20px 20px 8px", display: "flex", gap: "8px", overflowX: "auto" }} className="hide-scroll">
        <style>{`.hide-scroll{scrollbar-width:none}.hide-scroll::-webkit-scrollbar{display:none}`}</style>
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              flexShrink: 0,
              padding: "8px 16px",
              borderRadius: "20px",
              fontSize: "12px",
              fontWeight: 700,
              transition: "all .2s",
              backgroundColor: activeTab === t.id ? "#1A3B47" : "rgba(255,255,255,.8)",
              color: activeTab === t.id ? "#fff" : "#1A3B47",
              border: activeTab === t.id ? "none" : "1px solid rgba(26,59,71,.15)",
              boxShadow: activeTab === t.id ? "0 4px 14px rgba(26,59,71,.3)" : "none",
            }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ── Content ────────────────────────────────────────────────────────── */}
      <div style={{ padding: "8px 20px" }}>
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", paddingTop: "80px" }}>
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                border: "3px solid #E8742A",
                borderTopColor: "transparent",
                animation: "spin 1s linear infinite",
              }}
            />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : filtered.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px 24px",
              backgroundColor: "rgba(255,255,255,.6)",
              borderRadius: "24px",
              border: "2px dashed rgba(26,59,71,.12)",
              marginTop: "8px",
            }}
          >
            <Heart size={44} style={{ color: "rgba(26,59,71,.15)", margin: "0 auto 16px" }} />
            <p
              style={{
                fontSize: "16px",
                fontWeight: 600,
                fontFamily: "Georgia,serif",
                fontStyle: "italic",
                color: "#1A3B47",
                marginBottom: "8px",
              }}
            >
              Nothing here yet...
            </p>
            <p style={{ fontSize: "13px", color: "rgba(26,59,71,.45)" }}>Record a memory to fill this space.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginTop: "4px" }}>
            {filtered.map((mem, idx) => {
              const tl = timelineColor(mem.timeline);
              const isForever = mem.timeline === "forever";
              const isAudio = mem.file_type === "audio";

              return (
                <div
                  key={mem.id}
                  onClick={() => handleOpen(mem)}
                  style={{
                    backgroundColor: "#fff",
                    borderRadius: "20px",
                    overflow: "hidden",
                    boxShadow: "0 2px 12px rgba(0,0,0,.07)",
                    border: "1px solid rgba(26,59,71,.07)",
                    cursor: "pointer",
                    transform: "scale(1)",
                    transition: "transform .15s",
                    // Forever memories get a special purple tint
                    ...(isForever ? { border: "1px solid rgba(107,78,155,.3)" } : {}),
                  }}
                  onTouchStart={(e) => (e.currentTarget.style.transform = "scale(.97)")}
                  onTouchEnd={(e) => (e.currentTarget.style.transform = "scale(1)")}
                >
                  {/* Thumbnail */}
                  <div
                    style={{
                      position: "relative",
                      aspectRatio: "1",
                      backgroundColor: isForever ? "rgba(107,78,155,.08)" : "rgba(26,59,71,.06)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
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
                          filter: isForever ? "brightness(.88) saturate(.8)" : "none",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: "6px",
                          opacity: 0.28,
                        }}
                      >
                        {isAudio ? <Volume2 size={32} color="#1A3B47" /> : <Video size={32} color="#1A3B47" />}
                        <span
                          style={{
                            fontSize: "8px",
                            fontWeight: 900,
                            letterSpacing: ".1em",
                            color: "#1A3B47",
                            textTransform: "uppercase",
                          }}
                        >
                          {isAudio ? "Audio" : "Video"}
                        </span>
                      </div>
                    )}

                    {/* Play button */}
                    <div
                      style={{
                        position: "absolute",
                        bottom: "8px",
                        right: "8px",
                        width: "28px",
                        height: "28px",
                        borderRadius: "50%",
                        backgroundColor: "rgba(0,0,0,.35)",
                        backdropFilter: "blur(4px)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Play size={12} color="#fff" fill="#fff" />
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
                      <p
                        style={{
                          fontSize: "7px",
                          fontWeight: 900,
                          letterSpacing: ".1em",
                          color: tl.text,
                          textTransform: "uppercase",
                        }}
                      >
                        {mem.timeline === "forever" ? "✉️ Forever" : mem.timeline === "instant" ? "● Now" : "◎ Past"}
                      </p>
                    </div>

                    {/* Privacy badge */}
                    <div
                      style={{
                        position: "absolute",
                        top: "8px",
                        right: "8px",
                        width: "22px",
                        height: "22px",
                        borderRadius: "50%",
                        backgroundColor: "rgba(0,0,0,.3)",
                        backdropFilter: "blur(4px)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {mem.is_public ? (
                        <Globe size={10} color="rgba(255,255,255,.8)" />
                      ) : (
                        <Lock size={10} color="rgba(255,255,255,.8)" />
                      )}
                    </div>

                    {/* Forever overlay vignette */}
                    {isForever && (
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          background: "linear-gradient(to top, rgba(107,78,155,.35) 0%, transparent 50%)",
                        }}
                      />
                    )}
                  </div>

                  {/* Card footer */}
                  <div style={{ padding: "10px 12px 12px" }}>
                    <h3
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        color: "#1A3B47",
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                        textOverflow: "ellipsis",
                        marginBottom: "4px",
                      }}
                    >
                      {mem.title || "A memory"}
                    </h3>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <p style={{ fontSize: "9px", color: "rgba(26,59,71,.4)" }}>{formatDate(mem.created_at)}</p>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "3px",
                          padding: "2px 7px",
                          borderRadius: "10px",
                          backgroundColor: isAudio ? "rgba(107,78,155,.1)" : "rgba(26,59,71,.08)",
                        }}
                      >
                        {isAudio ? <Volume2 size={8} color="#6B4E9B" /> : <Video size={8} color="#1A3B47" />}
                        <span style={{ fontSize: "8px", fontWeight: 700, color: isAudio ? "#6B4E9B" : "#1A3B47" }}>
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

      {/* ── Fixed bottom CTA ───────────────────────────────────────────────── */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "16px 20px 32px",
          background: "linear-gradient(to top, #FAF8F6 60%, transparent)",
        }}
      >
        <button
          onClick={() => navigate("/record")}
          style={{
            width: "100%",
            padding: "16px",
            borderRadius: "18px",
            background: "linear-gradient(135deg,#E8742A,#D4621A)",
            color: "#fff",
            fontWeight: 700,
            fontSize: "15px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            boxShadow: "0 10px 30px rgba(232,116,42,.4)",
            border: "none",
            cursor: "pointer",
          }}
        >
          <Mic size={20} />
          Record a new memory
        </button>
      </div>
    </div>
  );
};

export default Treasure;
