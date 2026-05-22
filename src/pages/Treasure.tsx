import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Mic,
  Play,
  Volume2,
  Video,
  ArrowLeft,
  Lock,
  Globe,
  X,
  ChevronLeft,
  ChevronRight,
  Shield,
  Plus,
  Flag,
  Share2,
  Sparkles,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import ShareModal from "@/components/ShareModal";

import grandfatherImg from "@/assets/grandfather.jpg";
import marryImg from "@/assets/marry.jpg";
import loveImg from "@/assets/love.jpg";
import relaxImg from "@/assets/relax.jpg";
import travelImg from "@/assets/travel.jpg";
import graduateImg from "@/assets/graduate.jpg";
import picnicImg from "@/assets/picnic.jpg";
import childImg from "@/assets/child.jpg";
import houseImg from "@/assets/house.jpg";

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
    title: "A message for your wedding",
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

const LIFE_AGES = [
  { photo: childImg, filter: "grayscale(1) sepia(.4) brightness(.85)", size: 62, border: "rgba(232,116,42,.6)" },
  { photo: picnicImg, filter: "grayscale(1) sepia(.25) brightness(.9)", size: 62, border: "rgba(232,116,42,.7)" },
  { photo: loveImg, filter: "grayscale(.4) brightness(.95)", size: 68, border: "rgba(232,116,42,.85)" },
  { photo: relaxImg, filter: "grayscale(.15) brightness(1)", size: 68, border: "rgba(232,116,42,.9)" },
  { photo: marryImg, filter: "none", size: 78, border: "rgba(232,116,42,1)" },
];

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
const formatTime = (seconds: number) => Math.floor(seconds / 60) + ":" + (seconds % 60).toString().padStart(2, "0");

const tlStyle = (tl: string | null) => {
  if (tl === "forever")
    return { text: "Forever", bg: "rgba(107,78,155,.15)", border: "rgba(107,78,155,.4)", color: "#6B4E9B" };
  if (tl === "instant")
    return { text: "Now", bg: "rgba(56,189,248,.12)", border: "rgba(56,189,248,.4)", color: "#0284c7" };
  return { text: "Past", bg: "rgba(232,116,42,.12)", border: "rgba(232,116,42,.4)", color: "#c2410c" };
};

const fetchMemories = async (): Promise<{ memories: Memory[]; displayName: string; isLoggedIn: boolean }> => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return { memories: DEMO, displayName: "Your", isLoggedIn: false };
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("user_id", session.user.id)
    .single();
  const { data: mems } = await supabase
    .from("memories")
    .select("*")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false });
  return {
    memories: (mems as Memory[]) && mems.length > 0 ? (mems as Memory[]) : [],
    displayName: profile?.display_name || "Your",
    isLoggedIn: true,
  };
};

const LifeTimeline = ({ handle, lifeLabel }: { handle: string; lifeLabel: string }) => {
  const [selectedAge, setSelectedAge] = useState<number | null>(null);
  const ageLabels = ["Childhood", "Teen", "Young adult", "Prime", "Today"];
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: "6px", paddingBottom: "8px" }}>
        {LIFE_AGES.map((age, i) => {
          const isSelected = selectedAge === i;
          const isLast = i === LIFE_AGES.length - 1;
          const verticalLift = (LIFE_AGES.length - 1 - i) * 8;
          return (
            <div
              key={i}
              style={{ marginBottom: `${verticalLift}px`, cursor: "pointer" }}
              onClick={() => setSelectedAge(isSelected ? null : i)}
            >
              <div
                style={{
                  width: `${age.size}px`,
                  height: `${age.size}px`,
                  borderRadius: "50%",
                  overflow: "hidden",
                  border: `2.5px solid ${age.border}`,
                  boxShadow: isSelected
                    ? "0 0 0 3px rgba(232,116,42,.35), 0 0 20px rgba(232,116,42,.5)"
                    : isLast
                      ? "0 0 0 3px rgba(232,116,42,.2), 0 0 16px rgba(232,116,42,.4)"
                      : "0 2px 8px rgba(0,0,0,.15)",
                  transition: "box-shadow .2s, transform .2s",
                  transform: isSelected ? "scale(1.08)" : "scale(1)",
                  position: "relative",
                }}
              >
                <img
                  src={age.photo}
                  alt={ageLabels[i]}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    objectPosition: "center top",
                    filter: age.filter,
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "linear-gradient(135deg,rgba(255,255,255,.15) 0%,transparent 55%)",
                    borderRadius: "50%",
                  }}
                />
              </div>
              {isSelected && (
                <div style={{ textAlign: "center", marginTop: "4px" }}>
                  <span
                    style={{
                      fontSize: "8px",
                      fontWeight: 700,
                      color: "#E8742A",
                      letterSpacing: ".08em",
                      textTransform: "uppercase",
                    }}
                  >
                    {ageLabels[i]}
                  </span>
                </div>
              )}
            </div>
          );
        })}
        <div style={{ marginBottom: "0px" }}>
          <button
            onClick={() => toast.info("Add a life photo — coming soon")}
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              backgroundColor: "#E8742A",
              border: "2.5px solid rgba(255,255,255,.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              boxShadow: "0 0 12px rgba(232,116,42,.5)",
            }}
          >
            <Plus size={16} color="#fff" />
          </button>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
        <div
          style={{
            width: "28px",
            height: "1px",
            background: "linear-gradient(to right,transparent,rgba(212,175,85,.5))",
          }}
        />
        <p
          style={{
            fontSize: "8px",
            fontWeight: 700,
            letterSpacing: ".18em",
            color: "rgba(61,43,31,.35)",
            textTransform: "uppercase",
          }}
        >
          {lifeLabel}
        </p>
        <div
          style={{
            width: "28px",
            height: "1px",
            background: "linear-gradient(to left,transparent,rgba(212,175,85,.5))",
          }}
        />
      </div>
      <p
        style={{
          fontSize: "14px",
          fontWeight: 600,
          color: "rgba(61,43,31,.75)",
          marginTop: "8px",
          fontFamily: "Georgia,serif",
          fontStyle: "italic",
        }}
      >
        @{handle.toLowerCase().replace(/\s+/g, "_")}
      </p>
    </div>
  );
};

const VaultCard = ({ title, subtitle, onClick }: { title: string; subtitle: string; onClick: () => void }) => (
  <div
    onClick={onClick}
    style={{
      gridColumn: "1 / -1",
      backgroundColor: "#FFFAF2",
      borderRadius: "20px",
      border: "1px solid rgba(212,175,85,.35)",
      boxShadow: "0 0 0 1px rgba(212,175,85,.08), 0 2px 16px rgba(0,0,0,.04), inset 0 1px 0 rgba(255,255,255,.6)",
      padding: "20px",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: "16px",
      marginBottom: "4px",
    }}
  >
    <div
      style={{
        width: "48px",
        height: "48px",
        borderRadius: "14px",
        flexShrink: 0,
        background: "linear-gradient(135deg,rgba(212,175,85,.18),rgba(184,140,40,.08))",
        border: "1px solid rgba(212,175,85,.3)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Shield size={22} color="rgba(212,175,85,.9)" />
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <p
        style={{
          fontSize: "13px",
          fontWeight: 700,
          color: "#3D2B1F",
          marginBottom: "3px",
          fontFamily: "Georgia,serif",
        }}
      >
        {title}
      </p>
      <p style={{ fontSize: "11px", color: "rgba(61,43,31,.45)", lineHeight: 1.4 }}>{subtitle}</p>
    </div>
    <Lock size={16} color="rgba(212,175,85,.6)" style={{ flexShrink: 0 }} />
  </div>
);

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
  const { lang } = useLanguage();
  const tl = tlStyle(memory.timeline);
  const isAudio = memory.file_type === "audio";
  const isDemo = memory.id.startsWith("d");
  const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const handleTimeUpdate = () => {
    if (mediaRef.current) setCurrentTime(mediaRef.current.currentTime);
  };
  const handleLoadedMetadata = () => {
    if (mediaRef.current) setDuration(mediaRef.current.duration);
  };
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (mediaRef.current) mediaRef.current.currentTime = time;
    setCurrentTime(time);
  };
  const handlePlayPause = () => {
    if (!mediaRef.current) return;
    if (isPlaying) {
      mediaRef.current.pause();
    } else {
      mediaRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };
  const handleReport = async () => {
    const reason = prompt(
      lang === "ar"
        ? "لماذا تبلغ عن هذا المحتوى؟"
        : lang === "fr"
          ? "Pourquoi signalez-vous ce contenu ?"
          : "Why are you reporting this content?",
    );
    if (!reason) return;
    const { error } = await supabase.rpc("report_memory", { memory_id: memory.id, reason });
    if (error) {
      toast.error(lang === "ar" ? "فشل الإبلاغ" : lang === "fr" ? "Échec du signalement" : "Failed to report");
    } else {
      toast.success(
        lang === "ar"
          ? "شكراً. سنراجع هذا المحتوى."
          : lang === "fr"
            ? "Merci. Nous allons examiner ce contenu."
            : "Thank you. We'll review this content.",
      );
    }
  };

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
          backgroundColor: "#1A1A1A",
          borderRadius: "28px",
          overflow: "hidden",
          boxShadow: "0 40px 80px rgba(0,0,0,.7),0 0 0 1px rgba(255,255,255,.06)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
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
          {!isDemo && memory.file_url && memory.file_type === "video" ? (
            <video
              ref={mediaRef as React.RefObject<HTMLVideoElement>}
              src={memory.file_url}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : memory.thumbnail_url && !isAudio ? (
            <img
              src={memory.thumbnail_url}
              alt=""
              style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }}
            />
          ) : isAudio && !isDemo && memory.file_url ? (
            <audio
              ref={mediaRef as React.RefObject<HTMLAudioElement>}
              src={memory.file_url}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
          ) : isAudio ? (
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
          ) : (
            <Video size={48} color="rgba(255,255,255,.15)" />
          )}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(to top,rgba(0,0,0,.75) 0%,transparent 55%)",
              pointerEvents: "none",
            }}
          />
          {isDemo && (
            <div
              onClick={handlePlayPause}
              style={{
                position: "absolute",
                width: "68px",
                height: "68px",
                borderRadius: "50%",
                backgroundColor: "#E8742A",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 0 8px rgba(232,116,42,.18),0 0 40px rgba(232,116,42,.5)",
                cursor: "pointer",
              }}
            >
              <Play size={28} color="#fff" fill="#fff" style={{ marginLeft: "3px" }} />
            </div>
          )}
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
              {tl.text}
            </span>
          </div>
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
        {duration > 0 && (
          <div style={{ padding: "12px 20px 0" }}>
            <input
              type="range"
              min={0}
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              style={{
                width: "100%",
                height: "4px",
                WebkitAppearance: "none",
                appearance: "none",
                background: "rgba(255,255,255,.12)",
                borderRadius: "2px",
                outline: "none",
                cursor: "pointer",
                accentColor: "#E8742A",
              }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px" }}>
              <span style={{ fontSize: "10px", color: "rgba(255,255,255,.35)", fontVariantNumeric: "tabular-nums" }}>
                {formatTime(Math.floor(currentTime))}
              </span>
              <span style={{ fontSize: "10px", color: "rgba(255,255,255,.35)", fontVariantNumeric: "tabular-nums" }}>
                {formatTime(Math.floor(duration))}
              </span>
            </div>
          </div>
        )}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "16px",
            padding: "8px 20px 4px",
          }}
        >
          <button
            onClick={handleReport}
            style={{
              background: "none",
              border: "none",
              color: "rgba(255,255,255,.2)",
              fontSize: "10px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              padding: "4px 0",
            }}
          >
            <Flag size={10} />
            {lang === "ar" ? "إبلاغ" : lang === "fr" ? "Signaler" : "Report"}
          </button>
          <button
            onClick={() => setShowShareModal(true)}
            style={{
              background: "none",
              border: "none",
              color: "rgba(255,255,255,.35)",
              fontSize: "10px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              padding: "4px 0",
            }}
          >
            <Share2 size={10} />
            {lang === "ar" ? "مشاركة" : lang === "fr" ? "Partager" : "Share"}
          </button>
        </div>
        <div style={{ display: "flex", borderTop: "1px solid rgba(255,255,255,.06)", marginTop: "4px" }}>
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
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        title={memory.title || "A memory"}
        url={memory.file_url || "https://infeelit.com"}
        text={`Listen to this memory on Infeelit: "${memory.title || "A precious moment"}"`}
      />
    </div>
  );
};

const Treasure = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { t, lang, rtl } = useLanguage();
  const [activeTab, setActiveTab] = useState<ActiveTab>("all");
  const [playerIdx, setPlayerIdx] = useState<number | null>(null);

  const { data, isLoading } = useQuery({ queryKey: ["memories"], queryFn: fetchMemories, staleTime: 30_000 });

  useEffect(() => {
    if (location.state?.refresh) queryClient.invalidateQueries({ queryKey: ["memories"] });
  }, [location.state, queryClient]);

  const memories = data?.memories ?? DEMO;
  const displayName = data?.displayName ?? "Your";
  const isLoggedIn = data?.isLoggedIn ?? false;

  const TABS: { id: ActiveTab; label: string }[] = [
    { id: "all", label: t.tabAll },
    { id: "memories", label: t.tabMemories },
    { id: "forever", label: t.tabForever },
    { id: "video", label: t.tabVideo },
    { id: "voices", label: t.tabVoices },
  ];

  const filtered = memories.filter((m) => {
    if (activeTab === "all") return true;
    if (activeTab === "memories") return m.timeline === "memories" || m.timeline === "past";
    if (activeTab === "forever") return m.timeline === "forever";
    if (activeTab === "video") return m.file_type === "video";
    if (activeTab === "voices") return m.file_type === "audio";
    return true;
  });

  const isDemoData = memories.length > 0 && memories[0].id.startsWith("d");
  const real = isDemoData ? [] : memories;
  const statVideos = real.filter((m) => m.file_type === "video").length;
  const statVoices = real.filter((m) => m.file_type === "audio").length;

  const sparkBalance = Number(localStorage.getItem("infeelit_spark_balance") || 0);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#FDF8F0", paddingBottom: "120px" }} dir={rtl ? "rtl" : "ltr"}>
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

      <div
        style={{
          background: "linear-gradient(180deg,#FDF8F0 0%,#F8EDDC 60%,#F0DCC0 100%)",
          paddingTop: "56px",
          paddingBottom: "28px",
          paddingLeft: "24px",
          paddingRight: "24px",
          borderRadius: "0 0 32px 32px",
          position: "relative",
          overflow: "hidden",
          fontFamily: lang === "ar" ? "'Noto Sans Arabic', Arial, sans-serif" : "inherit",
          borderBottom: "1px solid rgba(212,175,85,.15)",
        }}
      >
        <button
          onClick={() => navigate(-1)}
          style={{
            position: "absolute",
            top: "14px",
            left: "16px",
            width: "34px",
            height: "34px",
            borderRadius: "50%",
            backgroundColor: "rgba(61,43,31,.08)",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <ArrowLeft size={17} color="#3D2B1F" />
        </button>
        <div
          style={{
            position: "absolute",
            top: "-20px",
            right: "-20px",
            width: "150px",
            height: "150px",
            borderRadius: "50%",
            background: "rgba(232,116,42,.04)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "40px",
            left: "30px",
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            background: "rgba(212,175,85,.03)",
            pointerEvents: "none",
          }}
        />

        {sparkBalance > 0 && (
          <div
            style={{
              position: "absolute",
              top: "14px",
              right: "16px",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              padding: "4px 10px",
              borderRadius: "20px",
              background: "rgba(255,215,0,.12)",
              border: "1px solid rgba(212,175,85,.3)",
            }}
          >
            <Sparkles size={12} color="#D4A853" />
            <span style={{ fontSize: "11px", fontWeight: 700, color: "#B8860B" }}>✦{sparkBalance}</span>
          </div>
        )}

        <p
          style={{
            textAlign: "center",
            fontSize: "10px",
            fontWeight: 900,
            letterSpacing: ".22em",
            color: "rgba(61,43,31,.3)",
            textTransform: "uppercase",
            marginBottom: "20px",
          }}
        >
          {t.yourHaven}
        </p>
        <LifeTimeline handle={displayName} lifeLabel={t.lifeThrough} />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginTop: "20px" }}>
          {[
            { value: real.length, label: t.storiesPreserved },
            { value: statVideos, label: t.videoMoments },
            { value: statVoices, label: t.voiceCaptures },
          ].map((s, i) => (
            <div
              key={i}
              style={{
                backgroundColor: "rgba(255,255,255,.6)",
                borderRadius: "14px",
                padding: "12px 8px",
                textAlign: "center",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(212,175,85,.12)",
                boxShadow: "0 1px 4px rgba(0,0,0,.02)",
              }}
            >
              <p style={{ fontSize: "24px", fontWeight: 900, color: "#3D2B1F", lineHeight: 1 }}>{s.value}</p>
              <p
                style={{
                  fontSize: "8px",
                  fontWeight: 700,
                  letterSpacing: ".1em",
                  color: "rgba(61,43,31,.35)",
                  textTransform: "uppercase",
                  marginTop: "3px",
                }}
              >
                {s.label}
              </p>
            </div>
          ))}
        </div>
        {isDemoData && (
          <div
            style={{
              marginTop: "12px",
              padding: "9px 14px",
              borderRadius: "12px",
              backgroundColor: "rgba(232,116,42,.06)",
              border: "1px solid rgba(232,116,42,.12)",
            }}
          >
            <p style={{ fontSize: "10px", color: "rgba(232,116,42,.6)", textAlign: "center" }}>{t.previewMode}</p>
          </div>
        )}
      </div>

      <div
        style={{
          padding: "18px 20px 4px",
          display: "flex",
          gap: "8px",
          overflowX: "auto",
          scrollbarWidth: "none",
          fontFamily: lang === "ar" ? "'Noto Sans Arabic', Arial, sans-serif" : "inherit",
        }}
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flexShrink: 0,
              padding: "10px 20px",
              borderRadius: "24px",
              fontSize: "13px",
              fontWeight: 700,
              transition: "all .18s",
              backgroundColor: activeTab === tab.id ? "#E8742A" : "rgba(61,43,31,.05)",
              color: activeTab === tab.id ? "#fff" : "rgba(61,43,31,.5)",
              border: activeTab === tab.id ? "none" : "1px solid rgba(61,43,31,.08)",
              boxShadow: activeTab === tab.id ? "0 4px 18px rgba(232,116,42,.3)" : "none",
              cursor: "pointer",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{ padding: "12px 20px" }}>
        {isLoading ? (
          <div
            style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: "80px", gap: "14px" }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                border: "3px solid rgba(232,116,42,.2)",
                borderTopColor: "#E8742A",
                animation: "spin 1s linear infinite",
              }}
            />
            <p
              style={{ fontSize: "13px", fontFamily: "Georgia,serif", fontStyle: "italic", color: "rgba(61,43,31,.3)" }}
            >
              {t.openingChest}
            </p>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <VaultCard
              title="🌙 Secret Garden"
              subtitle="The memories you cherish in silence."
              onClick={() => toast.info(t.comingSoon)}
            />
            {filtered.map((mem, idx) => {
              const tl = tlStyle(mem.timeline);
              const isAudio = mem.file_type === "audio";
              const isFore = mem.timeline === "forever";
              return (
                <div
                  key={mem.id}
                  onClick={() => setPlayerIdx(idx)}
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: "20px",
                    overflow: "hidden",
                    border: isFore ? "1px solid rgba(107,78,155,.2)" : "1px solid rgba(212,175,85,.15)",
                    boxShadow: "0 1px 6px rgba(0,0,0,.03)",
                    cursor: "pointer",
                    transition: "transform .14s",
                  }}
                  onTouchStart={(e) => (e.currentTarget.style.transform = "scale(.96)")}
                  onTouchEnd={(e) => (e.currentTarget.style.transform = "scale(1)")}
                >
                  <div
                    style={{
                      position: "relative",
                      aspectRatio: "1",
                      backgroundColor: isAudio
                        ? isFore
                          ? "rgba(107,78,155,.06)"
                          : "rgba(232,116,42,.06)"
                        : "rgba(61,43,31,.04)",
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
                          filter: isFore ? "brightness(.9) saturate(.8)" : "none",
                        }}
                      />
                    ) : (
                      <div style={{ opacity: 0.18 }}>
                        {isAudio ? <Volume2 size={28} color="#3D2B1F" /> : <Video size={28} color="#3D2B1F" />}
                      </div>
                    )}
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: "linear-gradient(to top,rgba(0,0,0,.45) 0%,rgba(0,0,0,.02) 55%,transparent 100%)",
                      }}
                    />
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
                        boxShadow: "0 0 12px rgba(232,116,42,.3)",
                      }}
                    >
                      <Play size={12} color="#fff" fill="#fff" style={{ marginLeft: "1px" }} />
                    </div>
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
                        {tl.text}
                      </span>
                    </div>
                    <div
                      style={{
                        position: "absolute",
                        top: "8px",
                        right: "8px",
                        width: "22px",
                        height: "22px",
                        borderRadius: "50%",
                        backgroundColor: "rgba(0,0,0,.2)",
                        backdropFilter: "blur(4px)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {mem.is_public ? (
                        <Globe size={9} color="rgba(255,255,255,.7)" />
                      ) : (
                        <Lock size={9} color="rgba(255,255,255,.7)" />
                      )}
                    </div>
                    {isFore && (
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          background: "linear-gradient(to top,rgba(107,78,155,.25) 0%,transparent 55%)",
                        }}
                      />
                    )}
                  </div>
                  <div style={{ padding: "10px 12px 12px" }}>
                    <h3
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        color: "#3D2B1F",
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
                      <p style={{ fontSize: "9px", color: "rgba(61,43,31,.35)" }}>{formatDate(mem.created_at)}</p>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "3px",
                          padding: "2px 7px",
                          borderRadius: "10px",
                          backgroundColor: isAudio ? "rgba(107,78,155,.08)" : "rgba(232,116,42,.06)",
                        }}
                      >
                        {isAudio ? <Volume2 size={8} color="#6B4E9B" /> : <Video size={8} color="#E8742A" />}
                        <span style={{ fontSize: "8px", fontWeight: 700, color: isAudio ? "#6B4E9B" : "#E8742A" }}>
                          {isAudio ? t.voiceLabel : t.videoLabel}
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

      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "16px 20px 32px",
          background: "linear-gradient(to top,#FDF8F0 55%,transparent)",
          zIndex: 50,
          fontFamily: lang === "ar" ? "'Noto Sans Arabic', Arial, sans-serif" : "inherit",
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
            boxShadow: "0 0 0 1px rgba(232,116,42,.3),0 8px 32px rgba(232,116,42,.45)",
            border: "none",
            cursor: "pointer",
          }}
        >
          <Mic size={20} /> {t.preserveStory}
        </button>
      </div>
    </div>
  );
};

export default Treasure;
