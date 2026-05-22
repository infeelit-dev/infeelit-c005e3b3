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
  Moon,
  Grid3X3,
  Stars,
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
type ViewMode = "grid" | "constellation";

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

const CONSTELLATION_POSITIONS = [
  { x: 15, y: 20 },
  { x: 75, y: 15 },
  { x: 45, y: 35 },
  { x: 20, y: 55 },
  { x: 80, y: 50 },
  { x: 55, y: 65 },
  { x: 10, y: 80 },
  { x: 70, y: 78 },
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
    <div className="flex flex-col items-center">
      <div className="flex items-end gap-1.5 pb-2">
        {LIFE_AGES.map((age, i) => {
          const isSelected = selectedAge === i;
          const isLast = i === LIFE_AGES.length - 1;
          const verticalLift = (LIFE_AGES.length - 1 - i) * 8;
          return (
            <div
              key={i}
              style={{ marginBottom: `${verticalLift}px` }}
              className="cursor-pointer"
              onClick={() => setSelectedAge(isSelected ? null : i)}
            >
              <div
                className="rounded-full overflow-hidden relative transition-all duration-200"
                style={{
                  width: `${age.size}px`,
                  height: `${age.size}px`,
                  border: `2.5px solid ${age.border}`,
                  boxShadow: isSelected
                    ? "0 0 0 3px rgba(232,116,42,.35), 0 0 20px rgba(232,116,42,.5)"
                    : isLast
                      ? "0 0 0 3px rgba(232,116,42,.2), 0 0 16px rgba(232,116,42,.4)"
                      : "0 2px 8px rgba(0,0,0,.15)",
                  transform: isSelected ? "scale(1.08)" : "scale(1)",
                }}
              >
                <img
                  src={age.photo}
                  alt={ageLabels[i]}
                  className="w-full h-full object-cover"
                  style={{ objectPosition: "center top", filter: age.filter }}
                />
                <div
                  className="absolute inset-0 rounded-full"
                  style={{ background: "linear-gradient(135deg,rgba(255,255,255,.15) 0%,transparent 55%)" }}
                />
              </div>
              {isSelected && (
                <div className="text-center mt-1">
                  <span className="text-[8px] font-bold text-[#E8742A] tracking-[.08em] uppercase">{ageLabels[i]}</span>
                </div>
              )}
            </div>
          );
        })}
        <div className="mb-0">
          <button
            onClick={() => toast.info("Add a life photo — coming soon")}
            className="w-9 h-9 rounded-full bg-[#E8742A] border-[2.5px] border-white/30 flex items-center justify-center cursor-pointer"
            style={{ boxShadow: "0 0 12px rgba(232,116,42,.5)" }}
          >
            <Plus size={16} color="#fff" />
          </button>
        </div>
      </div>
      <div className="flex items-center gap-2 mt-1">
        <div className="w-7 h-px" style={{ background: "linear-gradient(to right,transparent,rgba(212,175,85,.5))" }} />
        <p className="text-[8px] font-bold tracking-[.18em] uppercase" style={{ color: "rgba(61,43,31,.35)" }}>
          {lifeLabel}
        </p>
        <div className="w-7 h-px" style={{ background: "linear-gradient(to left,transparent,rgba(212,175,85,.5))" }} />
      </div>
      <p
        className="text-sm font-semibold italic mt-2"
        style={{ color: "rgba(61,43,31,.75)", fontFamily: "Georgia,serif" }}
      >
        @{handle.toLowerCase().replace(/\s+/g, "_")}
      </p>
    </div>
  );
};

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
      toast.error("Failed to report");
    } else {
      toast.success("Thank you. We'll review this content.");
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/[.94] backdrop-blur-xl flex flex-col items-center justify-center p-6"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[340px] bg-[#1A1A1A] rounded-[28px] overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,.7)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`relative flex items-center justify-center overflow-hidden ${isAudio ? "aspect-[16/9]" : "aspect-[4/5]"}`}
          style={{ backgroundColor: isAudio ? "#1A2E38" : "#0a0a0a" }}
        >
          {!isDemo && memory.file_url && memory.file_type === "video" ? (
            <video
              ref={mediaRef as React.RefObject<HTMLVideoElement>}
              src={memory.file_url}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              className="w-full h-full object-cover"
            />
          ) : memory.thumbnail_url && !isAudio ? (
            <img
              src={memory.thumbnail_url}
              alt=""
              className="w-full h-full object-cover"
              style={{ objectPosition: "center top" }}
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
            <div className="flex items-center gap-[3px] h-14">
              {Array.from({ length: 32 }).map((_, i) => (
                <div
                  key={i}
                  className="w-[3px] bg-[#E8742A] rounded-sm opacity-75"
                  style={{
                    height: `${12 + Math.sin(i * 0.55) * 18 + Math.cos(i * 0.3) * 10}px`,
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
            className="absolute inset-0 pointer-events-none"
            style={{ background: "linear-gradient(to top,rgba(0,0,0,.75) 0%,transparent 55%)" }}
          />
          {isDemo && (
            <div
              onClick={handlePlayPause}
              className="absolute w-[68px] h-[68px] rounded-full bg-[#E8742A] flex items-center justify-center cursor-pointer"
              style={{ boxShadow: "0 0 0 8px rgba(232,116,42,.18),0 0 40px rgba(232,116,42,.5)" }}
            >
              <Play size={28} color="#fff" fill="#fff" className="ml-[3px]" />
            </div>
          )}
          <div
            className="absolute top-3.5 left-3.5 px-2.5 py-1 rounded-[20px]"
            style={{ backgroundColor: tl.bg, border: `1px solid ${tl.border}` }}
          >
            <span className="text-[9px] font-black tracking-[.1em] uppercase" style={{ color: tl.color }}>
              {tl.text}
            </span>
          </div>
          <div className="absolute top-3.5 right-3.5 w-[30px] h-[30px] rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center">
            {memory.is_public ? (
              <Globe size={13} color="rgba(255,255,255,.65)" />
            ) : (
              <Lock size={13} color="rgba(255,255,255,.65)" />
            )}
          </div>
        </div>
        <div className="p-5 pb-1">
          <h2 className="text-[19px] font-bold font-[Georgia,serif] text-white mb-2 leading-[1.3]">
            {memory.title || "A memory"}
          </h2>
          {memory.description && (
            <p className="text-[13px] text-white/45 leading-relaxed mb-2.5 italic">"{memory.description}"</p>
          )}
          <p className="text-[11px] text-white/25">{formatDate(memory.created_at)}</p>
        </div>
        {duration > 0 && (
          <div className="px-5 pt-3">
            <input
              type="range"
              min={0}
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1 rounded-sm outline-none cursor-pointer"
              style={{ accentColor: "#E8742A", background: "rgba(255,255,255,.12)" }}
            />
            <div className="flex justify-between mt-1">
              <span className="text-[10px] text-white/35 tabular-nums">{formatTime(Math.floor(currentTime))}</span>
              <span className="text-[10px] text-white/35 tabular-nums">{formatTime(Math.floor(duration))}</span>
            </div>
          </div>
        )}
        <div className="flex items-center justify-center gap-4 px-5 py-2">
          <button
            onClick={handleReport}
            className="bg-transparent border-none text-white/20 text-[10px] cursor-pointer flex items-center gap-1 py-1"
          >
            <Flag size={10} />
            {lang === "ar" ? "إبلاغ" : lang === "fr" ? "Signaler" : "Report"}
          </button>
          <button
            onClick={() => setShowShareModal(true)}
            className="bg-transparent border-none text-white/35 text-[10px] cursor-pointer flex items-center gap-1 py-1"
          >
            <Share2 size={10} />
            {lang === "ar" ? "مشاركة" : lang === "fr" ? "Partager" : "Share"}
          </button>
        </div>
        <div className="flex border-t border-white/[.06] mt-1">
          {[
            { icon: <ChevronLeft size={22} />, action: onPrev, enabled: hasPrev },
            { icon: <X size={18} />, action: onClose, enabled: true },
            { icon: <ChevronRight size={22} />, action: onNext, enabled: hasNext },
          ].map((btn, i) => (
            <button
              key={i}
              onClick={btn.action}
              disabled={!btn.enabled}
              className="flex-1 p-4 flex items-center justify-center bg-transparent border-none cursor-pointer disabled:opacity-[.18] disabled:cursor-default"
              style={{
                borderRight: i < 2 ? "1px solid rgba(255,255,255,.06)" : "none",
                color: "rgba(255,255,255,.55)",
              }}
            >
              {btn.icon}
            </button>
          ))}
        </div>
      </div>
      <p className="text-white/20 text-[11px] mt-4">Tap outside to close</p>
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
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const { data, isLoading } = useQuery({ queryKey: ["memories"], queryFn: fetchMemories, staleTime: 30_000 });

  useEffect(() => {
    if (location.state?.refresh) queryClient.invalidateQueries({ queryKey: ["memories"] });
  }, [location.state, queryClient]);

  const memories = data?.memories ?? DEMO;
  const displayName = data?.displayName ?? "Your";

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
    <div
      className="min-h-screen pb-[120px] relative"
      style={{
        backgroundColor: "#FDF8F0",
        fontFamily: lang === "ar" ? "'Noto Sans Arabic', Arial, sans-serif" : "inherit",
      }}
      dir={rtl ? "rtl" : "ltr"}
    >
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes twinkle { 0%,100% { opacity:0.3; } 50% { opacity:1; } }
        @keyframes astrolabeSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes floatConstellation { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
        .paper-grain { position: fixed; inset: 0; pointer-events: none; z-index: 0; opacity: .025; background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E"); }
        .constellation-line { stroke: rgba(232,116,42,.12); stroke-width: 1; stroke-dasharray: 3 5; }
        .hover-lift { transition: transform .2s ease, box-shadow .2s ease; }
        .hover-lift:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,.06); }
        .hover-lift:active { transform: scale(.98); }
      `}</style>

      <div className="paper-grain" />

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

      {/* Header */}
      <div
        className="relative overflow-hidden rounded-b-[32px] border-b border-[#D4A853]/15 pt-14 pb-7 px-6"
        style={{ background: "linear-gradient(180deg,#FDF8F0 0%,#F8EDDC 60%,#F0DCC0 100%)" }}
      >
        {/* Halo orbs */}
        <div
          className="absolute -top-5 -right-5 w-[150px] h-[150px] rounded-full pointer-events-none"
          style={{ background: "rgba(232,116,42,.04)" }}
        />
        <div
          className="absolute top-10 left-8 w-20 h-20 rounded-full pointer-events-none"
          style={{ background: "rgba(212,175,85,.03)" }}
        />

        {/* Astrolabe compass */}
        <div
          className="absolute top-4 left-1/2 -translate-x-1/2 w-8 h-8 opacity-[.06] pointer-events-none"
          style={{ animation: "astrolabeSpin 60s linear infinite" }}
        >
          <svg viewBox="0 0 32 32">
            <circle cx="16" cy="16" r="14" fill="none" stroke="#3D2B1F" strokeWidth="0.5" />
            <circle cx="16" cy="16" r="10" fill="none" stroke="#3D2B1F" strokeWidth="0.3" />
            <line x1="16" y1="2" x2="16" y2="30" stroke="#3D2B1F" strokeWidth="0.3" />
            <line x1="2" y1="16" x2="30" y2="16" stroke="#3D2B1F" strokeWidth="0.3" />
            <polygon points="16,4 18,12 16,10 14,12" fill="#E8742A" opacity="0.4" />
          </svg>
        </div>

        <button
          onClick={() => navigate(-1)}
          className="absolute top-3.5 left-4 w-[34px] h-[34px] rounded-full bg-[#3D2B1F]/[.08] flex items-center justify-center"
        >
          <ArrowLeft size={17} color="#3D2B1F" />
        </button>

        {/* Spark counter */}
        {sparkBalance > 0 && (
          <div className="absolute top-3.5 right-4 flex items-center gap-1 px-2.5 py-1 rounded-[20px] bg-[#FFD700]/[.12] border border-[#D4A853]/30">
            <Sparkles size={12} color="#D4A853" />
            <span className="text-[11px] font-bold text-[#B8860B]">✦{sparkBalance}</span>
          </div>
        )}

        {/* View toggle */}
        <button
          onClick={() => setViewMode(viewMode === "grid" ? "constellation" : "grid")}
          className="absolute top-3.5 right-16 w-[34px] h-[34px] rounded-full bg-[#3D2B1F]/[.08] flex items-center justify-center"
        >
          {viewMode === "grid" ? <Stars size={16} color="#3D2B1F" /> : <Grid3X3 size={16} color="#3D2B1F" />}
        </button>

        <p
          className="text-center text-[10px] font-black tracking-[.22em] uppercase mb-5"
          style={{ color: "rgba(61,43,31,.3)" }}
        >
          {t.yourHaven}
        </p>
        <LifeTimeline handle={displayName} lifeLabel={t.lifeThrough} />

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mt-5">
          {[
            { value: real.length, label: t.storiesPreserved },
            { value: statVideos, label: t.videoMoments },
            { value: statVoices, label: t.voiceCaptures },
          ].map((s, i) => (
            <div
              key={i}
              className="text-center py-3 px-2 rounded-[14px] bg-white/60 backdrop-blur-md border border-[#D4A853]/[.12] shadow-[0_1px_4px_rgba(0,0,0,.02)]"
            >
              <p className="text-2xl font-black leading-none" style={{ color: "#3D2B1F" }}>
                {s.value}
              </p>
              <p
                className="text-[8px] font-bold tracking-[.1em] uppercase mt-[3px]"
                style={{ color: "rgba(61,43,31,.35)" }}
              >
                {s.label}
              </p>
            </div>
          ))}
        </div>
        {isDemoData && (
          <div className="mt-3 py-2 px-3.5 rounded-xl bg-[#E8742A]/[.06] border border-[#E8742A]/[.12]">
            <p className="text-[10px] text-center" style={{ color: "rgba(232,116,42,.6)" }}>
              {t.previewMode}
            </p>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto px-5 pt-[18px] pb-1 hide-scroll" style={{ scrollbarWidth: "none" }}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="shrink-0 px-5 py-2.5 rounded-[24px] text-[13px] font-bold transition-all duration-[.18s]"
            style={{
              backgroundColor: activeTab === tab.id ? "#E8742A" : "rgba(61,43,31,.05)",
              color: activeTab === tab.id ? "#fff" : "rgba(61,43,31,.5)",
              border: activeTab === tab.id ? "none" : "1px solid rgba(61,43,31,.08)",
              boxShadow: activeTab === tab.id ? "0 4px 18px rgba(232,116,42,.3)" : "none",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="px-5 pt-3 relative z-10">
        {isLoading ? (
          <div className="flex flex-col items-center pt-20 gap-3.5">
            <div className="w-9 h-9 rounded-full border-[3px] border-[#E8742A]/20 border-t-[#E8742A] animate-spin" />
            <p className="text-[13px] italic" style={{ color: "rgba(61,43,31,.3)", fontFamily: "Georgia,serif" }}>
              {t.openingChest}
            </p>
          </div>
        ) : viewMode === "constellation" ? (
          /* Constellation View */
          <div className="relative w-full aspect-square max-h-[60vh] mx-auto mt-4">
            {filtered.map((mem, idx) => {
              const pos = CONSTELLATION_POSITIONS[idx % CONSTELLATION_POSITIONS.length];
              const isAudio = mem.file_type === "audio";
              const size = 50 + Math.random() * 30;
              return (
                <button
                  key={mem.id}
                  onClick={() => setPlayerIdx(idx)}
                  className="absolute rounded-full overflow-hidden cursor-pointer transition-transform hover:scale-110 active:scale-95"
                  style={{
                    left: `${pos.x}%`,
                    top: `${pos.y}%`,
                    width: `${size}px`,
                    height: `${size}px`,
                    border: `2px solid rgba(212,175,85,.4)`,
                    boxShadow: "0 0 20px rgba(232,116,42,.2), 0 0 40px rgba(232,116,42,.05)",
                    animation: `floatConstellation ${4 + Math.random() * 4}s ease-in-out infinite`,
                    animationDelay: `${Math.random() * 2}s`,
                  }}
                >
                  {mem.thumbnail_url ? (
                    <img
                      src={mem.thumbnail_url}
                      alt=""
                      className="w-full h-full object-cover"
                      style={{ objectPosition: "center top", filter: "sepia(.3) brightness(.9)" }}
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center"
                      style={{ background: "radial-gradient(circle,rgba(232,116,42,.3),rgba(212,175,85,.1))" }}
                    >
                      {isAudio ? (
                        <Volume2 size={size * 0.35} color="#D4A853" />
                      ) : (
                        <Video size={size * 0.35} color="#D4A853" />
                      )}
                    </div>
                  )}
                </button>
              );
            })}
            {/* Constellation lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.3 }}>
              {filtered.slice(0, -1).map((_, i) => {
                const p1 = CONSTELLATION_POSITIONS[i % CONSTELLATION_POSITIONS.length];
                const p2 = CONSTELLATION_POSITIONS[(i + 1) % CONSTELLATION_POSITIONS.length];
                return (
                  <line
                    key={i}
                    x1={`${p1.x}%`}
                    y1={`${p1.y}%`}
                    x2={`${p2.x}%`}
                    y2={`${p2.y}%`}
                    className="constellation-line"
                  />
                );
              })}
            </svg>
          </div>
        ) : (
          /* Grid View */
          <div className="grid grid-cols-2 gap-3">
            {/* Secret Garden */}
            <div
              onClick={() => toast.info(t.comingSoon)}
              className="col-span-2 bg-[#FFF8EE] rounded-[20px] border border-[#D4A853]/40 p-5 cursor-pointer hover-lift flex items-center gap-4"
              style={{
                boxShadow:
                  "0 0 0 1px rgba(212,175,85,.08), 0 2px 16px rgba(0,0,0,.04), inset 0 1px 0 rgba(255,255,255,.6)",
              }}
            >
              <div
                className="w-12 h-12 rounded-[14px] shrink-0 flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg,rgba(212,175,85,.18),rgba(184,140,40,.08))",
                  border: "1px solid rgba(212,175,85,.3)",
                }}
              >
                <Moon size={22} color="rgba(212,175,85,.9)" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold mb-[3px]" style={{ color: "#3D2B1F", fontFamily: "Georgia,serif" }}>
                  🌙 Secret Garden
                </p>
                <p className="text-[11px] leading-relaxed" style={{ color: "rgba(61,43,31,.45)" }}>
                  The memories you cherish in silence.
                </p>
              </div>
              <Lock size={16} color="rgba(212,175,85,.6)" className="shrink-0" />
            </div>

            {filtered.map((mem, idx) => {
              const tl = tlStyle(mem.timeline);
              const isAudio = mem.file_type === "audio";
              const isFore = mem.timeline === "forever";
              const rotation = idx % 2 === 0 ? "-1.5deg" : "1.5deg";
              return (
                <div
                  key={mem.id}
                  onClick={() => setPlayerIdx(idx)}
                  className="bg-white rounded-[20px] overflow-hidden border hover-lift cursor-pointer"
                  style={{
                    borderColor: isFore ? "rgba(107,78,155,.2)" : "rgba(212,175,85,.15)",
                    boxShadow: "0 1px 6px rgba(0,0,0,.03)",
                    transform: `rotate(${rotation})`,
                  }}
                >
                  <div
                    className={`relative aspect-square flex items-center justify-center overflow-hidden ${isAudio ? (isFore ? "bg-[#6B4E9B]/[.06]" : "bg-[#E8742A]/[.06]") : "bg-[#3D2B1F]/[.04]"}`}
                  >
                    {mem.thumbnail_url ? (
                      <img
                        src={mem.thumbnail_url}
                        alt=""
                        className="w-full h-full object-cover"
                        style={{
                          objectPosition: "center top",
                          filter: isFore ? "brightness(.9) saturate(.8)" : "none",
                        }}
                      />
                    ) : (
                      <div className="opacity-[.18]">
                        {isAudio ? <Volume2 size={28} color="#3D2B1F" /> : <Video size={28} color="#3D2B1F" />}
                      </div>
                    )}
                    <div
                      className="absolute inset-0"
                      style={{
                        background: "linear-gradient(to top,rgba(0,0,0,.45) 0%,rgba(0,0,0,.02) 55%,transparent 100%)",
                      }}
                    />
                    <div
                      className="absolute bottom-2 right-2 w-[30px] h-[30px] rounded-full bg-[#E8742A]/[.85] flex items-center justify-center"
                      style={{ boxShadow: "0 0 12px rgba(232,116,42,.3)" }}
                    >
                      <Play size={12} color="#fff" fill="#fff" className="ml-px" />
                    </div>
                    <div
                      className="absolute top-2 left-2 px-2 py-[3px] rounded-[20px]"
                      style={{ backgroundColor: tl.bg, border: `1px solid ${tl.border}` }}
                    >
                      <span className="text-[7px] font-black tracking-[.08em] uppercase" style={{ color: tl.color }}>
                        {tl.text}
                      </span>
                    </div>
                    <div className="absolute top-2 right-2 w-[22px] h-[22px] rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center">
                      {mem.is_public ? (
                        <Globe size={9} color="rgba(255,255,255,.7)" />
                      ) : (
                        <Lock size={9} color="rgba(255,255,255,.7)" />
                      )}
                    </div>
                    {isFore && (
                      <div
                        className="absolute inset-0"
                        style={{ background: "linear-gradient(to top,rgba(107,78,155,.25) 0%,transparent 55%)" }}
                      />
                    )}
                  </div>
                  <div className="p-2.5 px-3">
                    <h3 className="text-[11px] font-bold truncate mb-1 leading-[1.3]" style={{ color: "#3D2B1F" }}>
                      {mem.title || "A memory"}
                    </h3>
                    <div className="flex items-center justify-between">
                      <p className="text-[9px]" style={{ color: "rgba(61,43,31,.35)" }}>
                        {formatDate(mem.created_at)}
                      </p>
                      <div
                        className="flex items-center gap-[3px] px-[7px] py-0.5 rounded-[10px]"
                        style={{ backgroundColor: isAudio ? "rgba(107,78,155,.08)" : "rgba(232,116,42,.06)" }}
                      >
                        {isAudio ? <Volume2 size={8} color="#6B4E9B" /> : <Video size={8} color="#E8742A" />}
                        <span className="text-[8px] font-bold" style={{ color: isAudio ? "#6B4E9B" : "#E8742A" }}>
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

      {/* Fixed CTA */}
      <div
        className="fixed bottom-0 left-0 right-0 px-5 pt-4 pb-8 z-50"
        style={{ background: "linear-gradient(to top,#FDF8F0 55%,transparent)" }}
      >
        <button
          onClick={() => navigate("/record")}
          className="w-full py-[17px] rounded-[20px] font-bold text-[15px] flex items-center justify-center gap-2.5 text-white border-none cursor-pointer"
          style={{
            background: "linear-gradient(135deg,#E8742A,#D4621A)",
            boxShadow: "0 0 0 1px rgba(232,116,42,.3),0 8px 32px rgba(232,116,42,.45)",
          }}
        >
          <Mic size={20} /> {t.preserveStory}
        </button>
      </div>
    </div>
  );
};

export default Treasure;
