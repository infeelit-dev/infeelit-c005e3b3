import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Mic, Video, Plus, ArrowLeft, Play, Lock, Globe } from "lucide-react";
import { toast } from "sonner";

interface Memory {
  id: string;
  title: string | null;
  file_url: string | null;
  file_type: string | null;
  thumbnail_url: string | null;
  created_at: string;
  timeline: string | null;
  is_public: boolean | null;
  description: string | null;
}

const DEMO_MEMORIES: Memory[] = [
  {
    id: "demo-1",
    title: "The smell of grandmother's kitchen",
    file_url: null,
    file_type: "audio",
    thumbnail_url: null,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    timeline: "past",
    is_public: false,
    description: null,
  },
  {
    id: "demo-2",
    title: "Dad's lesson about courage",
    file_url: null,
    file_type: "video",
    thumbnail_url: null,
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    timeline: "past",
    is_public: true,
    description: null,
  },
  {
    id: "demo-3",
    title: "What I want my daughter to know",
    file_url: null,
    file_type: "video",
    thumbnail_url: null,
    created_at: new Date(Date.now() - 86400000 * 8).toISOString(),
    timeline: "future",
    is_public: false,
    description: null,
  },
  {
    id: "demo-4",
    title: "Our first home in Dubai",
    file_url: null,
    file_type: "audio",
    thumbnail_url: null,
    created_at: new Date(Date.now() - 86400000 * 12).toISOString(),
    timeline: "past",
    is_public: true,
    description: null,
  },
];

const TIMELINE_COLORS = {
  past: { bg: "rgba(107,78,155,0.15)", border: "rgba(107,78,155,0.4)", label: "#6B4E9B" },
  present: { bg: "rgba(232,116,42,0.15)", border: "rgba(232,116,42,0.4)", label: "#E8742A" },
  future: { bg: "rgba(56,189,248,0.15)", border: "rgba(56,189,248,0.4)", label: "#38bdf8" },
};

const GRADIENT_BY_TYPE: Record<string, string> = {
  audio: "linear-gradient(135deg, #6B4E9B, #1A3B47)",
  video: "linear-gradient(135deg, #1A3B47, #E8742A)",
};

const Treasure = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [userInitial, setUserInitial] = useState("M");
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<"all" | "past" | "future" | "audio" | "video">("all");
  const [stats, setStats] = useState({ total: 0, videos: 0, voices: 0 });

  useEffect(() => {
    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("display_name")
          .eq("user_id", session.user.id)
          .single();

        if (profile?.display_name) {
          setUserName(profile.display_name);
          setUserInitial(profile.display_name[0].toUpperCase());
        }

        const { data: mems } = await (supabase as any)
          .from("memories")
          .select("*")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false });

        if (mems && mems.length > 0) {
          setMemories(mems as Memory[]);
          setStats({
            total: mems.length,
            videos: mems.filter((m: Memory) => m.file_type === "video").length,
            voices: mems.filter((m: Memory) => m.file_type === "audio").length,
          });
        } else {
          // Démo si pas encore de vrais souvenirs
          setMemories(DEMO_MEMORIES);
          setStats({ total: 4, videos: 2, voices: 2 });
        }
      } else {
        // Non connecté — on montre les démos
        setMemories(DEMO_MEMORIES);
        setStats({ total: 4, videos: 2, voices: 2 });
      }

      setLoading(false);
    };
    init();
  }, []);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const filteredMemories = memories.filter((m) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "audio") return m.file_type === "audio";
    if (activeFilter === "video") return m.file_type === "video";
    if (activeFilter === "past") return m.timeline === "past";
    if (activeFilter === "future") return m.timeline === "future";
    return true;
  });

  const handlePlay = (mem: Memory) => {
    if (mem.id.startsWith("demo-")) {
      toast("Record your first memory to hear it here. ✨");
      return;
    }
    if (mem.file_url) {
      window.open(mem.file_url, "_blank");
    }
  };

  const filters = [
    { key: "all", label: "All" },
    { key: "past", label: "Memories" },
    { key: "future", label: "Forever" },
    { key: "video", label: "🎬 Video" },
    { key: "audio", label: "🎙️ Voice" },
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#FAF8F6" }}>
      {/* Header gradient */}
      <div
        style={{
          background: "linear-gradient(160deg, #1A3B47 0%, #2d5a6b 60%, #E8742A 100%)",
          paddingTop: "52px",
          paddingBottom: "32px",
          paddingLeft: "24px",
          paddingRight: "24px",
        }}
      >
        <button
          onClick={() => navigate(-1)}
          className="mb-5"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            background: "rgba(255,255,255,0.15)",
            border: "none",
            borderRadius: "999px",
            padding: "6px 12px",
            color: "#FFFFFF",
            cursor: "pointer",
            fontSize: "13px",
          }}
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
          }}
        >
          <div>
            <p
              style={{
                color: "rgba(255,255,255,0.6)",
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                marginBottom: "4px",
              }}
            >
              Your Haven
            </p>
            <h1
              style={{
                color: "#FFFFFF",
                fontWeight: 900,
                fontSize: "26px",
                lineHeight: 1.1,
              }}
            >
              {userName ? `${userName}'s` : "Your"}
              <br />
              <span style={{ fontStyle: "italic", opacity: 0.9 }}>stories</span>
            </h1>
          </div>

          {/* Avatar */}
          <div
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              backgroundColor: "#E8742A",
              border: "3px solid rgba(255,255,255,0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#FFFFFF",
              fontWeight: 900,
              fontSize: "22px",
            }}
          >
            {userInitial}
          </div>
        </div>

        {/* Stats */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            marginTop: "24px",
          }}
        >
          {[
            { label: "Stories preserved", value: stats.total },
            { label: "Video moments", value: stats.videos },
            { label: "Voice captures", value: stats.voices },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                flex: 1,
                backgroundColor: "rgba(255,255,255,0.12)",
                borderRadius: "16px",
                padding: "12px 8px",
                textAlign: "center",
                border: "1px solid rgba(255,255,255,0.15)",
              }}
            >
              <p
                style={{
                  color: "#FFFFFF",
                  fontWeight: 900,
                  fontSize: "22px",
                  lineHeight: 1,
                }}
              >
                {s.value}
              </p>
              <p
                style={{
                  color: "rgba(255,255,255,0.55)",
                  fontSize: "9px",
                  marginTop: "3px",
                  fontWeight: 600,
                }}
              >
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Filtres */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          padding: "16px 20px",
          overflowX: "auto",
          backgroundColor: "#FAF8F6",
        }}
      >
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setActiveFilter(f.key as any)}
            style={{
              padding: "6px 14px",
              borderRadius: "999px",
              border: "none",
              cursor: "pointer",
              whiteSpace: "nowrap",
              fontSize: "11px",
              fontWeight: 700,
              backgroundColor: activeFilter === f.key ? "#1A3B47" : "rgba(0,0,0,0.06)",
              color: activeFilter === f.key ? "#FFFFFF" : "#1A3B47",
              transition: "all 0.2s ease",
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Grille de souvenirs */}
      <div
        style={{
          flex: 1,
          padding: "0 20px 120px",
        }}
      >
        {loading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              paddingTop: "60px",
            }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                border: "2px solid #E8742A",
                borderTopColor: "transparent",
                animation: "spin 0.8s linear infinite",
              }}
            />
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
            }}
          >
            {filteredMemories.map((mem) => {
              const tl = (mem.timeline as keyof typeof TIMELINE_COLORS) || "past";
              const tlStyle = TIMELINE_COLORS[tl] || TIMELINE_COLORS.past;

              return (
                <div
                  key={mem.id}
                  onClick={() => handlePlay(mem)}
                  style={{
                    borderRadius: "20px",
                    overflow: "hidden",
                    cursor: "pointer",
                    aspectRatio: "1",
                    position: "relative",
                    background: GRADIENT_BY_TYPE[mem.file_type || "audio"],
                    border: "1px solid rgba(0,0,0,0.06)",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
                  }}
                >
                  {/* Thumbnail si disponible */}
                  {mem.thumbnail_url && (
                    <img
                      src={mem.thumbnail_url}
                      alt=""
                      style={{
                        position: "absolute",
                        inset: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  )}

                  {/* Overlay gradient */}
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.1) 55%)",
                    }}
                  />

                  {/* Icône type */}
                  <div
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      opacity: mem.thumbnail_url ? 0 : 0.4,
                    }}
                  >
                    {mem.file_type === "audio" ? (
                      <Mic size={32} color="#FFFFFF" />
                    ) : (
                      <Video size={32} color="#FFFFFF" />
                    )}
                  </div>

                  {/* Play button */}
                  <div
                    style={{
                      position: "absolute",
                      top: "10px",
                      right: "10px",
                      width: "28px",
                      height: "28px",
                      borderRadius: "50%",
                      backgroundColor: "rgba(255,255,255,0.2)",
                      backdropFilter: "blur(4px)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Play size={12} color="#FFFFFF" />
                  </div>

                  {/* Badge timeline */}
                  <div
                    style={{
                      position: "absolute",
                      top: "10px",
                      left: "10px",
                      padding: "2px 8px",
                      borderRadius: "999px",
                      backgroundColor: tlStyle.bg,
                      border: `1px solid ${tlStyle.border}`,
                    }}
                  >
                    <span
                      style={{
                        fontSize: "8px",
                        fontWeight: 700,
                        color: tlStyle.label,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      {tl}
                    </span>
                  </div>

                  {/* Badge privacy */}
                  <div
                    style={{
                      position: "absolute",
                      bottom: "38px",
                      right: "10px",
                    }}
                  >
                    {mem.is_public ? (
                      <Globe size={12} color="rgba(255,255,255,0.5)" />
                    ) : (
                      <Lock size={12} color="rgba(255,255,255,0.5)" />
                    )}
                  </div>

                  {/* Titre et date */}
                  <div
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      padding: "10px 12px",
                    }}
                  >
                    <p
                      style={{
                        color: "#FFFFFF",
                        fontWeight: 700,
                        fontSize: "11px",
                        lineHeight: 1.3,
                        marginBottom: "2px",
                        overflow: "hidden",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {mem.title || "A captured moment"}
                    </p>
                    <p
                      style={{
                        color: "rgba(255,255,255,0.5)",
                        fontSize: "9px",
                      }}
                    >
                      {formatDate(mem.created_at)}
                    </p>
                  </div>
                </div>
              );
            })}

            {/* Card ajouter */}
            <button
              onClick={() => navigate("/record")}
              style={{
                borderRadius: "20px",
                aspectRatio: "1",
                backgroundColor: "rgba(232,116,42,0.06)",
                border: "2px dashed rgba(232,116,42,0.3)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                cursor: "pointer",
              }}
            >
              <Plus size={26} color="#E8742A" />
              <p
                style={{
                  fontSize: "10px",
                  fontWeight: 700,
                  color: "#E8742A",
                  textAlign: "center",
                }}
              >
                Preserve a story
              </p>
            </button>
          </div>
        )}
      </div>

      {/* CTA fixe */}
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
            borderRadius: "999px",
            background: "linear-gradient(135deg, #E8742A, #D4621A)",
            color: "#FFFFFF",
            fontWeight: 800,
            fontSize: "15px",
            border: "none",
            cursor: "pointer",
            boxShadow: "0 4px 20px rgba(232,116,42,0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}
        >
          <Mic size={18} />
          Preserve a story
        </button>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Treasure;
