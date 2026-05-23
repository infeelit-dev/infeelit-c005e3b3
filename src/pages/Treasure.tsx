```tsx
import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Mic, Play, Volume2, Video, ArrowLeft, Lock, Globe, X, ChevronLeft, ChevronRight,
  Plus, Flag, Share2, Sparkles, Moon, Grid3X3, Stars, Calendar,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUserName } from "@/hooks/useUserName";
import ShareModal from "@/components/ShareModal";

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
  background_image_url?: string | null;
  aura_intensity?: number | null;
}

type ActiveTab = "all" | "memories" | "forever" | "video" | "voices";
type ViewMode = "grid" | "constellation";

const DEMO: Memory[] = [
  { id: "d1", title: "The smell of home", file_url: "", file_type: "video", thumbnail_url: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=400&q=80", created_at: "2026-04-07T10:00:00Z", is_public: false, timeline: "memories", description: "Every time I smell fresh bread I think of her hands..." },
  { id: "d2", title: "Dad's lesson about courage", file_url: "", file_type: "audio", thumbnail_url: null, created_at: "2026-04-06T14:00:00Z", is_public: true, timeline: "memories", description: null },
  { id: "d3", title: "Summer of 1987", file_url: "", file_type: "video", thumbnail_url: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=400&q=80", created_at: "2026-04-05T09:00:00Z", is_public: false, timeline: "memories", description: "We were free, wild and carefree on that beach." },
  { id: "d4", title: "A message for your wedding", file_url: "", file_type: "video", thumbnail_url: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=400&q=80", created_at: "2026-04-04T18:00:00Z", is_public: false, timeline: "forever", description: "My dear child, when this day comes..." },
  { id: "d5", title: "Our first home in Dubai", file_url: "", file_type: "audio", thumbnail_url: null, created_at: "2026-04-03T11:00:00Z", is_public: true, timeline: "instant", description: null },
  { id: "d6", title: "The day you were born", file_url: "", file_type: "video", thumbnail_url: "https://images.unsplash.com/photo-1551256817-e905fe6b4e9b?auto=format&fit=crop&w=400&q=80", created_at: "2026-04-02T16:00:00Z", is_public: false, timeline: "memories", description: "I had never felt such a spark of pure love." },
  { id: "d7", title: "Grandmother's tajine recipe", file_url: "", file_type: "audio", thumbnail_url: null, created_at: "2026-04-01T08:00:00Z", is_public: true, timeline: "memories", description: null },
  { id: "d8", title: "When I am no longer here", file_url: "", file_type: "video", thumbnail_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80", created_at: "2026-03-30T20:00:00Z", is_public: false, timeline: "forever", description: "I want you to know..." },
];

const LIFE_EPOCHS = [
  { id: "childhood", name: { en: "Childhood", fr: "Enfance", ar: "الطفولة" }, photo: "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&w=150&q=80", filter: "grayscale(80%) sepia(30%) brightness(0.9) contrast(1.1)", size: 56, border: "rgba(180,120,40,0.6)", glow: "rgba(180,120,40,0.4)" },
  { id: "teen", name: { en: "Teenage", fr: "Adolescence", ar: "الشباب" }, photo: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=150&q=80", filter: "grayscale(30%) sepia(10%) brightness(0.92) saturate(1.1)", size: 56, border: "rgba(210,130,50,0.7)", glow: "rgba(210,130,50,0.5)" },
  { id: "youngAdult", name: { en: "Young Adult", fr: "Jeune Adulte", ar: "مقتبل العمر" }, photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80", filter: "grayscale(10%) brightness(0.95) saturate(1.2)", size: 62, border: "rgba(56,189,248,0.5)", glow: "rgba(56,189,248,0.4)" },
  { id: "prime", name: { en: "Prime", fr: "Vie Active", ar: "العمر الذهبي" }, photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80", filter: "saturate(1.2) contrast(1.05)", size: 62, border: "rgba(232,116,42,0.6)", glow: "rgba(232,116,42,0.5)" },
  { id: "today", name: { en: "Today", fr: "Aujourd'hui", ar: "اليوم" }, photo: "https://images.unsplash.com/photo-1472417583565-62e00defa53b?auto=format&fit=crop&w=150&q=80", filter: "brightness(1) saturate(1.1)", size: 70, border: "rgba(255,215,0,0.8)", glow: "rgba(255,215,0,0.6)" },
];

const CONSTELLATION_POSITIONS = [
  { x: 18, y: 15 }, { x: 72, y: 12 }, { x: 45, y: 32 }, { x: 15, y: 52 }, { x: 78, y: 48 }, { x: 52, y: 62 }, { x: 10, y: 78 }, { x: 68, y: 76 },
];

const formatDate = (iso: string) => new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
const formatTime = (seconds: number) => Math.floor(seconds / 60) + ":" + (seconds % 60).toString().padStart(2, "0");

const tlStyle = (tl: string | null) => {
  if (tl === "forever") return { text: "Forever", bg: "rgba(147,51,234,0.15)", border: "rgba(147,51,234,0.3)", color: "#d8b4fe" };
  if (tl === "instant") return { text: "Now", bg: "rgba(56,189,248,0.15)", border: "rgba(56,189,248,0.3)", color: "#7dd3fc" };
  return { text: "Past", bg: "rgba(232,116,42,0.15)", border: "rgba(232,116,42,0.3)", color: "#fdbb74" };
};

const fetchMemories = async (): Promise<{ memories: Memory[]; displayName: string; isLoggedIn: boolean }> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { memories: DEMO, displayName: "You", isLoggedIn: false };
  const { data: profile } = await supabase.from("profiles").select("display_name").eq("user_id", session.user.id).single();
  const { data: mems } = await supabase.from("memories").select("*").eq("user_id", session.user.id).order("created_at", { ascending: false });
  return { memories: (mems as Memory[]) && mems.length > 0 ? (mems as Memory[]) : [], displayName: profile?.display_name || "You", isLoggedIn: true };
};

const Player = ({ memory, onClose, onPrev, onNext, hasPrev, hasNext }: { memory: Memory; onClose: () => void; onPrev: () => void; onNext: () => void; hasPrev: boolean; hasNext: boolean }) => {
  const { lang } = useLanguage();
  const userName = useUserName();
  const navigate = useNavigate();
  const tl = tlStyle(memory.timeline);
  const isAudio = memory.file_type === "audio";
  const isDemo = memory.id.startsWith("d");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timersRef = useRef<number[]>([]);
  const [cinemaPhase, setCinemaPhase] = useState<"blur" | "text" | "clear" | "playing">("blur");
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showMirror, setShowMirror] = useState(false);
  const [mirrorQuestion, setMirrorQuestion] = useState("");

  const startCinemaRitual = () => {
    if (videoRef.current) videoRef.current.load();
    if (audioRef.current) audioRef.current.load();
    setCinemaPhase("blur");
    const t1 = window.setTimeout(() => setCinemaPhase("text"), 1500);
    const t2 = window.setTimeout(() => setCinemaPhase("clear"), 4000);
    const t3 = window.setTimeout(() => { setCinemaPhase("playing"); videoRef.current?.play().catch(() => {}); audioRef.current?.play().catch(() => {}); }, 5500);
    timersRef.current = [t1, t2, t3];
  };
  const skipRitual = () => { timersRef.current.forEach((t) => clearTimeout(t)); setCinemaPhase("playing"); videoRef.current?.play().catch(() => {}); audioRef.current?.play().catch(() => {}); };

  useEffect(() => { if (!isDemo) startCinemaRitual(); else setCinemaPhase("playing"); return () => { timersRef.current.forEach((t) => clearTimeout(t)); }; }, [memory.id]);

  const handleTimeUpdate = () => { const el = videoRef.current || audioRef.current; if (el) setCurrentTime(el.currentTime); };
  const handleLoadedMetadata = () => { const el = videoRef.current || audioRef.current; if (el) setDuration(el.duration); };
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => { const time = parseFloat(e.target.value); const el = videoRef.current || audioRef.current; if (el) { el.currentTime = time; setCurrentTime(time); } };
  const handlePlayPause = () => { const el = videoRef.current || audioRef.current; if (!el) return; if (isPlaying) el.pause(); else el.play(); setIsPlaying(!isPlaying); };
  const handleMediaEnded = () => { const name = userName || (lang === "fr" ? "toi" : lang === "ar" ? "أنت" : "you"); const mirror = lang === "fr" ? `Et toi ${name}, qu'as-tu ressenti en écoutant "${memory.title}" ?` : lang === "ar" ? `وأنت ${name}، ماذا شعرت وأنت تستمع إلى "${memory.title}" ؟` : `And you ${name}, what did you feel listening to "${memory.title}"?`; setMirrorQuestion(mirror); setShowMirror(true); };
  const handleReport = async () => { const reason = prompt(lang === "ar" ? "لماذا تبلغ عن هذا المحتوى؟" : lang === "fr" ? "Pourquoi signalez-vous ce contenu ?" : "Why are you reporting this content?"); if (!reason) return; const { error } = await (supabase as any).rpc("report_memory", { memory_id: memory.id, reason }); if (error) { toast.error("Failed to report"); } else { toast.success("Thank you. We'll review this content."); } };
  const handleRecordMirror = () => { navigate("/record", { state: { question: mirrorQuestion, category: "past", fromMemory: true } }); onClose(); };

  return (
    <div className="fixed inset-0 z-[100] bg-black/[.96] backdrop-blur-xl flex flex-col items-center justify-center p-6" onClick={onClose}>
      <style>{`@keyframes audioWaveGlow{0%,100%{opacity:.7}50%{opacity:1}}@keyframes fadeInText{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div className="w-full max-w-[340px] bg-[#0a0f14] rounded-[28px] overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,.8)] border border-white/[.06]" onClick={(e) => e.stopPropagation()}>
        <div className={`relative flex items-center justify-center overflow-hidden ${isAudio ? "aspect-[16/9]" : "aspect-[4/5]"}`} style={{ backgroundColor: isAudio ? "#0f172a" : "#000" }}>
          {/* Aura du Souvenir */}
          {(memory as any).background_image_url && (
            <>
              <div style={{
                position: "absolute", inset: 0,
                backgroundImage: `url(${(memory as any).background_image_url})`,
                backgroundSize: "cover", backgroundPosition: "center",
                opacity: (memory as any).aura_intensity ? (memory as any).aura_intensity / 100 : 0.35,
                filter: "blur(4px) sepia(40%) brightness(0.8)",
                zIndex: 1, transform: "scale(1.05)",
              }} />
              <div style={{
                position: "absolute", inset: 0,
                background: "radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.5) 70%, rgba(0,0,0,0.85) 100%)",
                zIndex: 2, pointerEvents: "none",
              }} />
            </>
          )}

          {!isDemo && memory.file_url && memory.file_type === "video" ? (
            <video ref={videoRef} src={memory.file_url} onTimeUpdate={handleTimeUpdate} onLoadedMetadata={handleLoadedMetadata} onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} onEnded={handleMediaEnded} className="w-full h-full object-cover" style={{ zIndex: 3, filter: cinemaPhase === "blur" ? "blur(8px) brightness(0.4)" : cinemaPhase === "text" ? "blur(4px) brightness(0.5)" : "blur(0px) brightness(1)", transition: "filter 1.5s ease" }} />
          ) : memory.thumbnail_url && !isAudio ? (
            <img src={memory.thumbnail_url} alt="" className="w-full h-full object-cover" style={{ objectPosition: "center top", zIndex: 3, filter: cinemaPhase === "blur" ? "blur(8px) brightness(0.4)" : cinemaPhase === "text" ? "blur(4px) brightness(0.5)" : "blur(0px) brightness(1)", transition: "filter 1.5s ease" }} />
          ) : isAudio && !isDemo && memory.file_url ? (
            <audio ref={audioRef} src={memory.file_url} onTimeUpdate={handleTimeUpdate} onLoadedMetadata={handleLoadedMetadata} onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} onEnded={handleMediaEnded} style={{ zIndex: 3 }} />
          ) : isAudio ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 bg-[radial-gradient(ellipse_at_center,rgba(25,14,40,0.6)_0%,transparent_75%)]" style={{ zIndex: 3 }}>
              <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/25 flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.15)]"><Volume2 className="w-6 h-6 text-amber-500 animate-pulse" /></div>
              <div className="flex items-center gap-1 h-12">{Array.from({ length: 24 }).map((_, i) => (<div key={i} className="w-[3px] rounded-full bg-amber-500/80" style={{ height: `${14 + Math.sin(i * 0.45) * 20 + Math.cos(i * 0.25) * 8}px`, animation: `audioWaveGlow ${0.8 + (i % 4) * 0.2}s ease-in-out infinite`, animationDelay: `${i * 0.03}s` }} />))}</div>
            </div>
          ) : (<Video size={48} color="rgba(255,255,255,.1)" style={{ zIndex: 3 }} />)}
          <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(to top,rgba(0,0,0,.8) 0%,transparent 55%)", zIndex: 4 }} />
          {isDemo && (<div onClick={handlePlayPause} className="absolute w-[68px] h-[68px] rounded-full bg-[#E8742A] flex items-center justify-center cursor-pointer shadow-[0_0_0_8px_rgba(232,116,42,.18),0_0_40px_rgba(232,116,42,.5)]" style={{ zIndex: 5 }}><Play size={28} color="#fff" fill="#fff" className="ml-[3px]" /></div>)}
          <div className="absolute top-3.5 left-3.5 px-2.5 py-1 rounded-[20px]" style={{ backgroundColor: tl.bg, border: `1px solid ${tl.border}`, zIndex: 5 }}><span className="text-[9px] font-black tracking-[.1em] uppercase" style={{ color: tl.color }}>{tl.text}</span></div>
          <div className="absolute top-3.5 right-3.5 w-[30px] h-[30px] rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center" style={{ zIndex: 5 }}>{memory.is_public ? <Globe size={13} color="rgba(255,255,255,.65)" /> : <Lock size={13} color="rgba(255,255,255,.65)" />}</div>
          {cinemaPhase !== "playing" && (
            <div onClick={skipRitual} style={{ position: "absolute", inset: 0, zIndex: 20, cursor: "pointer", transition: "all 1.5s ease", backdropFilter: cinemaPhase === "blur" ? "blur(8px)" : cinemaPhase === "text" ? "blur(4px)" : "blur(0px)", backgroundColor: cinemaPhase === "blur" ? "rgba(0,0,0,0.65)" : cinemaPhase === "text" ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px", gap: "16px" }}>
              {cinemaPhase === "text" && (<><p style={{ fontSize: "10px", color: "rgba(255,255,255,0.5)", letterSpacing: "0.3em", textTransform: "uppercase", fontWeight: 700, animation: "fadeInText 0.8s ease forwards" }}>{lang === "fr" ? "Ils ont demandé..." : lang === "ar" ? "سألوا..." : "They asked..."}</p><p style={{ fontSize: "18px", color: "#fff", fontStyle: "italic", fontFamily: "Georgia, serif", textAlign: "center", lineHeight: 1.6, maxWidth: "280px", animation: "fadeInText 0.8s ease 0.3s both" }}>"{memory.title}"</p></>)}
              <p style={{ position: "absolute", bottom: "20px", fontSize: "10px", color: "rgba(255,255,255,0.2)", letterSpacing: "0.15em" }}>{lang === "fr" ? "Appuie pour passer" : lang === "ar" ? "اضغط للتخطي" : "Tap to skip"}</p>
            </div>
          )}
          {showMirror && (
            <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center gap-6 px-6 z-20">
              <p className="text-white text-lg italic font-serif text-center leading-relaxed">"{mirrorQuestion}"</p>
              <button onClick={handleRecordMirror} className="px-6 py-3 rounded-full font-bold text-sm" style={{ background: "linear-gradient(135deg, #E8742A, #D4621A)", color: "#fff", boxShadow: "0 0 24px rgba(232,116,42,0.5)" }}>{lang === "fr" ? "Je veux raconter ça" : lang === "ar" ? "أريد أن أحكي هذا" : "I want to tell this"}</button>
              <button onClick={() => setShowMirror(false)} className="text-white/30 text-xs">{lang === "fr" ? "Plus tard" : lang === "ar" ? "لاحقاً" : "Later"}</button>
            </div>
          )}
        </div>
        <div className="p-5 pb-1">
          <h2 className="text-[19px] font-bold font-[Georgia,serif] text-white mb-2 leading-[1.3]">{memory.title || "A memory"}</h2>
          {memory.description && <p className="text-[13px] text-white/45 leading-relaxed mb-2.5 italic">"{memory.description}"</p>}
          <p className="text-[11px] text-white/25">{formatDate(memory.created_at)}</p>
        </div>
        {duration > 0 && (<div className="px-5 pt-3"><input type="range" min={0} max={duration || 0} value={currentTime} onChange={handleSeek} className="w-full h-1 rounded-sm outline-none cursor-pointer" style={{ accentColor: "#E8742A", background: "rgba(255,255,255,.12)" }} /><div className="flex justify-between mt-1"><span className="text-[10px] text-white/35 tabular-nums">{formatTime(Math.floor(currentTime))}</span><span className="text-[10px] text-white/35 tabular-nums">{formatTime(Math.floor(duration))}</span></div></div>)}
        <div className="flex items-center justify-center gap-4 px-5 py-2">
          <button onClick={handleReport} className="bg-transparent border-none text-white/20 text-[10px] cursor-pointer flex items-center gap-1 py-1"><Flag size={10} />{lang === "ar" ? "إبلاغ" : lang === "fr" ? "Signaler" : "Report"}</button>
          <button onClick={() => setShowShareModal(true)} className="bg-transparent border-none text-white/35 text-[10px] cursor-pointer flex items-center gap-1 py-1"><Share2 size={10} />{lang === "ar" ? "مشاركة" : lang === "fr" ? "Partager" : "Share"}</button>
        </div>
        <div className="flex border-t border-white/[.06] mt-1">
          {[{ icon: <ChevronLeft size={22} />, action: onPrev, enabled: hasPrev }, { icon: <X size={18} />, action: onClose, enabled: true }, { icon: <ChevronRight size={22} />, action: onNext, enabled: hasNext }].map((btn, i) => (<button key={i} onClick={btn.action} disabled={!btn.enabled} className="flex-1 p-4 flex items-center justify-center bg-transparent border-none cursor-pointer disabled:opacity-[.18] disabled:cursor-default" style={{ borderRight: i < 2 ? "1px solid rgba(255,255,255,.06)" : "none", color: "rgba(255,255,255,.55)" }}>{btn.icon}</button>))}
        </div>
      </div>
      <p className="text-white/20 text-[11px] mt-4">Tap outside to close</p>
      <ShareModal isOpen={showShareModal} onClose={() => setShowShareModal(false)} title={memory.title || "A memory"} url={memory.file_url || "https://infeelit.com"} text={`Listen to this memory on Infeelit: "${memory.title || "A precious moment"}"`} />
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
  const [selectedEpoch, setSelectedEpoch] = useState<string | null>(null);

  const { data, isLoading } = useQuery({ queryKey: ["memories"], queryFn: fetchMemories, staleTime: 30_000 });
  useEffect(() => { if (location.state?.refresh) queryClient.invalidateQueries({ queryKey: ["memories"] }); }, [location.state, queryClient]);

  const memories = data?.memories ?? DEMO;
  const displayName = data?.displayName ?? "You";

  const TABS: { id: ActiveTab; label: string }[] = [
    { id: "all", label: t.tabAll }, { id: "memories", label: t.tabMemories }, { id: "forever", label: t.tabForever }, { id: "video", label: t.tabVideo }, { id: "voices", label: t.tabVoices },
  ];

  const getMemoryEpoch = (m: Memory): string => {
    if (m.id === "d1") return "childhood"; if (m.id === "d2") return "youngAdult"; if (m.id === "d3") return "teen"; if (m.id === "d4") return "prime"; if (m.id === "d5") return "today"; if (m.id === "d6") return "today"; if (m.id === "d7") return "childhood"; if (m.id === "d8") return "prime";
    return "today";
  };

  const filtered = memories.filter((m) => {
    if (selectedEpoch && getMemoryEpoch(m) !== selectedEpoch) return false;
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

  const souvenirDuJour = (() => { if (filtered.length === 0) return memories[0] || null; const forevers = filtered.filter((m) => m.timeline === "forever"); if (forevers.length > 0) return forevers[new Date().getDate() % forevers.length]; return filtered[new Date().getDate() % filtered.length]; })();

  return (
    <div className="min-h-screen pb-[140px] relative select-none" style={{ backgroundColor: "#FDF8F0", fontFamily: lang === "ar" ? "'Noto Sans Arabic', Arial, sans-serif" : "inherit" }} dir={rtl ? "rtl" : "ltr"}>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes twinkle{0%,100%{opacity:.3}50%{opacity:1}}
        @keyframes todayBreathe{0%,100%{transform:translate(-50%,-50%) scale(1);box-shadow:0 4px 12px rgba(232,116,42,.15)}50%{transform:translate(-50%,-50%) scale(1.04);box-shadow:0 10px 28px rgba(232,116,42,.35)}}
        @keyframes floatCard{0%,100%{transform:translateY(0px) rotate(var(--orig-rot))}50%{transform:translateY(-5px) rotate(calc(var(--orig-rot) + 0.5deg))}}
        @keyframes astrolabeSpin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes audioWaveGlow{0%,100%{opacity:.7}50%{opacity:1}}
        .paper-grain{position:fixed;inset:0;pointer-events:none;z-index:0;opacity:.02;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")}
        .today-pulse{animation:todayBreathe 3s ease-in-out infinite}
        .river-floating-card{animation:floatCard 6s ease-in-out infinite}
        .constellation-line{stroke:rgba(232,116,42,.1);stroke-width:1;stroke-dasharray:3 5}
        .hide-scroll{scrollbar-width:none}
        .hide-scroll::-webkit-scrollbar{display:none}
        .fancy-scroll::-webkit-scrollbar{height:5px}
        .fancy-scroll::-webkit-scrollbar-track{background:rgba(139,90,43,.04);border-radius:99px}
        .fancy-scroll::-webkit-scrollbar-thumb{background:rgba(232,116,42,.2);border-radius:99px}
      `}</style>
      <div className="paper-grain" />
      {playerIdx !== null && filtered[playerIdx] && (<Player memory={filtered[playerIdx]} onClose={() => setPlayerIdx(null)} onPrev={() => setPlayerIdx((i) => (i! > 0 ? i! - 1 : i))} onNext={() => setPlayerIdx((i) => (i! < filtered.length - 1 ? i! + 1 : i))} hasPrev={playerIdx > 0} hasNext={playerIdx < filtered.length - 1} />)}

      <div className="relative pt-14 pb-8 px-6 rounded-b-[42px] overflow-hidden border-b border-[#D4A853]/10 shadow-[0_12px_35px_rgba(61,43,31,0.03)] z-10" style={{ background: "linear-gradient(180deg,#FFF9F2 0%,#FAF3E8 60%,#FDF8F0 100%)" }}>
        <div className="absolute -top-5 -right-5 w-[150px] h-[150px] rounded-full pointer-events-none" style={{ background: "rgba(232,116,42,.03)" }} />
        <div className="absolute top-10 left-8 w-20 h-20 rounded-full pointer-events-none" style={{ background: "rgba(212,175,85,.02)" }} />
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-8 h-8 opacity-[.04] pointer-events-none" style={{ animation: "astrolabeSpin 60s linear infinite" }}><svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="14" fill="none" stroke="#3D2B1F" strokeWidth="0.5" /><circle cx="16" cy="16" r="10" fill="none" stroke="#3D2B1F" strokeWidth="0.3" /><line x1="16" y1="2" x2="16" y2="30" stroke="#3D2B1F" strokeWidth="0.3" /><line x1="2" y1="16" x2="30" y2="16" stroke="#3D2B1F" strokeWidth="0.3" /><polygon points="16,4 18,12 16,10 14,12" fill="#E8742A" opacity="0.4" /></svg></div>
        <button onClick={() => navigate(-1)} className="absolute top-3.5 left-4 w-[34px] h-[34px] rounded-full bg-[#3D2B1F]/[.08] flex items-center justify-center"><ArrowLeft size={17} color="#3D2B1F" /></button>
        {sparkBalance > 0 && (<div className="absolute top-3.5 right-4 flex items-center gap-1 px-2.5 py-1 rounded-[20px] bg-[#FFD700]/[.12] border border-[#D4A853]/30"><Sparkles size={12} color="#D4A853" /><span className="text-[11px] font-bold text-[#B8860B]">✦{sparkBalance}</span></div>)}
        <button onClick={() => setViewMode(viewMode === "grid" ? "constellation" : "grid")} className="absolute top-3.5 right-16 w-[34px] h-[34px] rounded-full bg-[#3D2B1F]/[.08] flex items-center justify-center">{viewMode === "grid" ? <Stars size={16} color="#3D2B1F" /> : <Grid3X3 size={16} color="#3D2B1F" />}</button>
        <p className="text-center text-[10px] font-black tracking-[.22em] uppercase mb-6" style={{ color: "rgba(61,43,31,.3)" }}>{t.yourHaven}</p>

        <div className="relative w-full h-[160px] bg-gradient-to-b from-[#FFFDF9]/40 to-[#F6EDDC]/10 border border-[#D4A853]/12 rounded-3xl mb-5 overflow-hidden">
          <svg className="absolute inset-x-0 top-0 w-full h-[160px] text-[#D4A853]/20 pointer-events-none z-0" viewBox="0 0 1000 160" preserveAspectRatio="none"><path d="M 100,40 C 325,115 675,115 900,45" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4,5" /><path d="M 100,40 C 325,115 675,115 900,45" fill="none" stroke="#E8742A" strokeWidth="5" opacity="0.05" className="blur-[2px]" /></svg>
          <div className="absolute inset-0 w-full h-full z-10 pointer-events-none">
            {[{ id: "childhood", left: "10%", top: "38px", size: 56 },{ id: "teen", left: "30%", top: "75px", size: 56 },{ id: "youngAdult", left: "50%", top: "98px", size: 62 },{ id: "prime", left: "70%", top: "75px", size: 62 },{ id: "today", left: "90%", top: "42px", size: 70 }].map((item) => { const epoch = LIFE_EPOCHS.find((e) => e.id === item.id); if (!epoch) return null; const isSelected = selectedEpoch === epoch.id; const isToday = epoch.id === "today"; return (<div key={epoch.id} className={`absolute pointer-events-auto flex flex-col items-center ${isToday && !isSelected ? "today-pulse" : ""}`} style={{ left: item.left, top: item.top, transform: "translate(-50%,-50%)" }}><button className="flex flex-col items-center justify-center cursor-pointer group bg-transparent border-none" onClick={() => setSelectedEpoch(isSelected ? null : epoch.id)}><div className="relative flex items-center justify-center rounded-full border-2 transition-all duration-300" style={{ width: `${item.size}px`, height: `${item.size}px`, borderColor: isSelected ? "#D4A853" : epoch.border, backgroundColor: isSelected ? "#fff" : "transparent", boxShadow: isSelected ? "0 0 22px rgba(212,168,83,0.6)" : "none", transform: isSelected ? "scale(1.05)" : "scale(1)" }}><img src={epoch.photo} className="rounded-full object-cover" style={{ width: `${item.size - 12}px`, height: `${item.size - 12}px`, filter: isSelected ? "none" : epoch.filter }} /><div className="absolute top-0.5 left-1 w-2.5 h-1 bg-white/40 rounded-full rotate-[-15deg] blur-[0.2px] pointer-events-none" /></div><span className={`text-[7.5px] font-black tracking-wider mt-1 px-1 rounded whitespace-nowrap ${isSelected ? "text-[#E8742A] bg-[#E8742A]/5" : "text-stone-500 group-hover:text-stone-700"}`}>{epoch.name[lang as "en" | "fr" | "ar"] || epoch.name.en}</span></button></div>); })}
          </div>
          <p className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[7px] font-black tracking-[.2em] text-stone-400 uppercase z-20 bg-[#FFF8F0]/50 px-3 py-0.5 rounded-full">{lang === "ar" ? "✦ عقد لآلئ العصور ✦" : lang === "fr" ? "✦ COLLIER DE PERLES DES ÂGES ✦" : "✦ NECKLACE OF LIFETIME AGES ✦"}</p>
        </div>

        {souvenirDuJour && (<div className="w-full max-w-xs mx-auto relative group cursor-pointer mb-5" onClick={() => { const idx = filtered.findIndex((m) => m.id === souvenirDuJour.id); if (idx !== -1) setPlayerIdx(idx); }}><div className="absolute top-[-8px] left-1/2 -translate-x-1/2 z-30 flex flex-col items-center pointer-events-none"><div className="w-3 h-3 rounded-full bg-gradient-to-tr from-[#D4A853] to-amber-300 border border-amber-900/40 shadow-sm relative"><div className="absolute top-0.5 left-0.5 w-0.5 h-0.5 rounded-full bg-white/60" /></div><div className="w-[1.5px] h-2 bg-stone-500/80 -mt-0.5" /></div><div className="bg-[#FFFFFC] border border-[#D4A853]/25 p-3 pb-4 shadow-[0_8px_20px_rgba(139,90,43,0.08)] rounded-sm transform rotate-[-1deg] transition-all duration-300 group-hover:rotate-[0.5deg] group-hover:scale-[1.01] relative"><span className="absolute top-2 right-2.5 text-[7px] font-black tracking-widest text-[#E8742A] uppercase flex items-center gap-1 bg-[#E8742A]/5 px-1 py-0.5 rounded-sm"><Sparkles className="w-2 h-2 animate-pulse" />{lang === "ar" ? "تذكار اليوم" : lang === "fr" ? "SOUVENIR DU JOUR" : "SOUVENIR OF THE DAY"}</span><div className="aspect-video w-full overflow-hidden bg-stone-100 rounded-xs mb-2.5 relative shadow-inner">{souvenirDuJour.thumbnail_url ? (<img src={souvenirDuJour.thumbnail_url} className="w-full h-full object-cover filter brightness-[1.01] contrast-[1.01]" />) : (<div className="absolute inset-0 bg-gradient-to-br from-[#FAF3E8]/70 to-[#FFF] flex items-center justify-center">{souvenirDuJour.file_type === "audio" ? <Volume2 className="w-6 h-6 text-[#E8742A]/35" /> : <Video className="w-6 h-6 text-amber-900/25" />}</div>)}</div><h3 className="font-serif font-black text-xs text-[#3D2B1F] leading-tight line-clamp-1 italic text-center">"{souvenirDuJour.title || "A memory"}"</h3>{souvenirDuJour.description && <p className="text-[9px] text-stone-500 italic mt-1 line-clamp-1 text-center">"{souvenirDuJour.description}"</p>}<div className="flex items-center justify-between mt-2 pt-1.5 border-t border-stone-100 text-[7.5px] text-[#3D2B1F]/45 font-bold"><span>{formatDate(souvenirDuJour.created_at)}</span><span className="px-1 bg-stone-100 rounded-[3px] text-[7px] font-black uppercase text-stone-600">{souvenirDuJour.file_type === "audio" ? t.voiceLabel : t.videoLabel}</span></div></div></div>)}

        <div className="flex items-center gap-3 mb-3"><div className="flex-1 h-px bg-gradient-to-r from-transparent to-amber-700/20" /><span className="text-[8px] font-black tracking-[.2em] text-stone-500 uppercase">{lang === "ar" ? "نهر الذكريات" : lang === "fr" ? "RIVIÈRE DE MÉMOIRES" : "RIVER OF MEMORIES"}</span><div className="flex-1 h-px bg-gradient-to-l from-transparent to-amber-700/20" /></div>
        <p className="text-sm font-semibold italic text-center mt-2" style={{ color: "rgba(61,43,31,.75)", fontFamily: "Georgia,serif" }}>@{displayName.toLowerCase().replace(/\s+/g, "_")}</p>

        <div className="grid grid-cols-3 gap-2 mt-5">{[{ value: real.length, label: t.storiesPreserved },{ value: statVideos, label: t.videoMoments },{ value: statVoices, label: t.voiceCaptures }].map((s, i) => (<div key={i} className="text-center py-3 px-2 rounded-2xl bg-white/60 backdrop-blur-md border border-[#D4A853]/[.1] shadow-[0_1px_4px_rgba(0,0,0,.02)]"><p className="text-2xl font-black leading-none text-[#3D2B1F]">{s.value}</p><p className="text-[8px] font-black tracking-[.1em] uppercase mt-[3px] text-[#3D2B1F]/35">{s.label}</p></div>))}</div>
        {isDemoData && (<div className="mt-3 py-2 px-3.5 rounded-xl bg-[#E8742A]/[.06] border border-[#E8742A]/[.12] flex items-center justify-center gap-1.5"><Sparkles className="w-3 h-3 text-[#E8742A]" /><p className="text-[10px] font-bold text-[#E8742A]/60 text-center">{t.previewMode}</p></div>)}
      </div>

      <div className="px-5 pt-4 space-y-3 relative z-10">
        <div className="flex items-center justify-between"><span className="text-[9px] font-black tracking-widest text-stone-500 uppercase">{viewMode === "constellation" ? (lang === "fr" ? "CARTE CÉLESTE" : "STAR MAP") : (lang === "fr" ? "ALBUM POLAROÏD" : "POLAROID ALBUM")}</span><div className="bg-stone-200/50 border border-stone-200/60 rounded-xl p-0.5 flex gap-1"><button onClick={() => setViewMode("grid")} className={`p-2 rounded-lg cursor-pointer transition-all ${viewMode === "grid" ? "bg-[#E8742A] text-white shadow-sm" : "text-stone-500 hover:text-stone-800"}`}><Grid3X3 className="w-4 h-4" /></button><button onClick={() => setViewMode("constellation")} className={`p-2 rounded-lg cursor-pointer transition-all ${viewMode === "constellation" ? "bg-amber-800 text-white shadow-sm" : "text-stone-500 hover:text-stone-800"}`}><Stars className="w-4 h-4" /></button></div></div>
        <div className="flex gap-2 overflow-x-auto hide-scroll pb-1">{TABS.map((tab) => (<button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`shrink-0 px-5 py-2.5 rounded-full text-xs font-bold transition-all border ${activeTab === tab.id ? "bg-[#E8742A] text-white border-transparent shadow-[0_4px_14px_rgba(232,116,42,0.25)]" : "bg-white/65 text-stone-600 border-stone-200/60 hover:bg-white hover:text-[#3D2B1F]"}`}>{tab.label}</button>))}</div>
      </div>

      <div className="px-5 mt-4 relative z-10">
        {isLoading ? (<div className="flex flex-col items-center pt-20 gap-3.5"><div className="w-9 h-9 rounded-full border-[3px] border-[#E8742A]/20 border-t-[#E8742A] animate-spin" /><p className="text-[13px] italic" style={{ color: "rgba(61,43,31,.3)", fontFamily: "Georgia,serif" }}>{t.openingChest}</p></div>) : viewMode === "constellation" ? (
          <div className="relative w-full aspect-square max-h-[60vh] mx-auto rounded-3xl overflow-hidden border border-amber-700/10" style={{ background: "radial-gradient(ellipse at center,#F4E7CE 0%,#EDE0C3 100%)" }}>
            <div className="absolute inset-0 bg-[radial-gradient(rgba(139,90,43,0.04)_1.5px,transparent_1.5px)] bg-[size:16px_16px] pointer-events-none" />
            {filtered.length > 1 && (<svg className="absolute inset-0 w-full h-full pointer-events-none z-0">{filtered.map((_, idx) => { if (idx === filtered.length - 1) return null; const p1 = CONSTELLATION_POSITIONS[idx % CONSTELLATION_POSITIONS.length]; const p2 = CONSTELLATION_POSITIONS[(idx + 1) % CONSTELLATION_POSITIONS.length]; return <line key={idx} x1={`${p1.x}%`} y1={`${p1.y}%`} x2={`${p2.x}%`} y2={`${p2.y}%`} className="constellation-line" />; })}</svg>)}
            <div className="absolute inset-0 z-10">{filtered.map((mem, idx) => { const pos = CONSTELLATION_POSITIONS[idx % CONSTELLATION_POSITIONS.length]; const isAudio = mem.file_type === "audio"; return (<button key={mem.id} onClick={() => setPlayerIdx(idx)} className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer" style={{ left: `${pos.x}%`, top: `${pos.y}%` }}><div className="w-14 h-14 rounded-full overflow-hidden border-2 border-stone-200/90 bg-[#FFFFF6] flex items-center justify-center shadow-md transition-all duration-300 group-hover:scale-110 group-hover:-rotate-3">{mem.thumbnail_url ? (<img src={mem.thumbnail_url} alt="" className="w-full h-full object-cover rounded-full filter sepia-[20%]" />) : (<div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center">{isAudio ? <Volume2 className="w-5 h-5 text-[#E8742A]" /> : <Video className="w-5 h-5 text-amber-900" />}</div>)}</div><span className="mt-1.5 px-1.5 py-0.5 rounded-md bg-[#FFFFFC] border border-stone-300/40 text-[8px] font-serif font-black text-[#3D2B1F] max-w-[80px] truncate text-center shadow-xs opacity-80 group-hover:opacity-100 transition-all">{mem.title || `Story #${idx + 1}`}</span></button>); })}</div>
            <div className="absolute bottom-0 left-0 right-0 bg-[#FFFFFB]/80 backdrop-blur-md p-2 border-t border-stone-300/20 flex justify-between items-center"><span className="text-[8px] font-mono tracking-widest text-stone-500 font-bold">✦ {filtered.length} NODES</span><span className="text-[8px] font-black text-stone-400">{lang === "ar" ? "المسار النجمي" : lang === "fr" ? "SILLAGE TEMPOREL" : "STARDUST PATH"}</span></div>
          </div>
        ) : (
          <div className="space-y-6 pb-8">
            <div className="bg-[#FFF8EE] rounded-2xl p-5 border border-[#D4A853]/40 hover:border-[#D4A853]/80 hover:shadow-[0_8px_24px_rgba(212,168,83,0.1)] cursor-pointer transition-all duration-300 shadow-sm active:scale-[.99] overflow-hidden relative group" onClick={() => toast.info(t.comingSoon)}><div className="relative z-10 flex items-center gap-4"><div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white border border-[#D4A853]/30 shadow-xs group-hover:scale-105 transition-all"><Moon className="w-6 h-6 text-[#E8742A] fill-[#E8742A]/10" /></div><div className="flex-1 min-w-0"><h4 className="text-sm font-black text-[#3D2B1F] tracking-wider group-hover:text-[#E8742A] transition-colors uppercase flex items-center gap-1 font-serif">🌙 Secret Garden<Sparkles className="w-3.5 h-3.5 text-[#D4A853] animate-pulse" /></h4><p className="text-[#3D2B1F]/50 text-[10px] leading-relaxed mt-1">The memories you cherish in silence.</p></div><div className="p-1.5 px-2.5 rounded bg-amber-600/5 border border-[#D4A853]/35 text-[8px] font-black uppercase text-[#D4A853] tracking-wider">SILENT KEY</div></div></div>
            <div className="flex items-center justify-between text-stone-400 text-[9px] uppercase font-bold tracking-widest px-1"><span>{lang === "ar" ? "→ أقدم" : lang === "fr" ? "← PLUS ANCIEN" : "← OLDER"}</span><span className="text-amber-700/50 animate-pulse">{lang === "ar" ? "✦ مرر النهر ✦" : lang === "fr" ? "✦ GLISSEZ LA RIVIÈRE ✦" : "✦ SCROLL THE RIVER ✦"}</span><span>{lang === "ar" ? "أحدث ←" : lang === "fr" ? "RÉCENT →" : "RECENT →"}</span></div>
            {filtered.length === 0 ? (<div className="py-20 text-center bg-white/60 backdrop-blur-md border border-dashed border-stone-300 rounded-3xl"><p className="text-stone-400 text-sm italic font-serif leading-relaxed px-4">{t.recordToFill}</p></div>) : (
              <div className="w-screen -mx-5 px-5 flex gap-8 py-6 overflow-x-auto fancy-scroll snap-x snap-mandatory relative z-10 select-none">
                {[...filtered].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()).map((mem, idx, sortedArr) => { const tl = tlStyle(mem.timeline); const isAudio = mem.file_type === "audio"; const isFore = mem.timeline === "forever"; const ratio = idx / Math.max(1, sortedArr.length - 1); const sepiaPercent = Math.round((1 - ratio) * 85); const saturatePercent = Math.round(50 + ratio * 85); const brightnessPercent = Math.round(92 + ratio * 10); const rotDeg = idx % 3 === 0 ? "-2deg" : idx % 3 === 1 ? "1.5deg" : "2.5deg"; const originalFilteredIndex = filtered.findIndex((m) => m.id === mem.id); return (<div key={mem.id} onClick={() => { if (originalFilteredIndex !== -1) setPlayerIdx(originalFilteredIndex); }} className="snap-center shrink-0 w-64 bg-[#FFFFFA] border border-amber-800/10 p-3 pb-5 rounded-none shadow-[0_6px_16px_rgba(61,43,31,0.06),0_1px_3px_rgba(61,43,15,0.03)] hover:shadow-[0_15px_30px_rgba(232,116,42,0.12)] hover:border-[#E8742A]/30 hover:-translate-y-2 hover:scale-[1.01] transition-all duration-500 cursor-pointer relative group river-floating-card" style={{ filter: `sepia(${sepiaPercent}%) saturate(${saturatePercent}%) brightness(${brightnessPercent}%)`, "--orig-rot": rotDeg, transform: `rotate(${rotDeg}) translate3d(0,0,0)` } as React.CSSProperties}><div className="relative aspect-square overflow-hidden bg-stone-100 flex items-center justify-center shadow-[inset_0_1px_4px_rgba(0,0,0,0.06)] rounded-xs">{mem.thumbnail_url ? (<img src={mem.thumbnail_url} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />) : (<div className="absolute inset-0 bg-gradient-to-tr from-[#FAF3E8] to-[#FFFFFC] flex items-center justify-center"><div className="opacity-45 group-hover:scale-110 transition-transform duration-300">{isAudio ? <Volume2 className="w-8 h-8 text-stone-500" /> : <Video className="w-8 h-8 text-stone-500" />}</div></div>)}{isAudio && (<div className="absolute inset-0 flex items-center justify-center gap-1 pb-4 pointer-events-none">{[14,25,12,18,30,20,10,16,22].map((h, k) => (<div key={k} className="w-[2px] rounded-full" style={{ height: `${h}px`, backgroundColor: isFore ? "#9333EA" : "#E8742A", opacity: 0.85, animation: `audioWaveGlow 2s ease-in-out infinite`, animationDuration: `${0.8 + (k % 3) * 0.2}s`, animationDelay: `${k * 0.04}s` }} />))}</div>)}<div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 bg-black/10 pointer-events-none"><div className="w-10 h-10 rounded-full bg-[#E8742A] flex items-center justify-center shadow-md"><Play className="w-4 h-4 text-white fill-white ml-[1px]" /></div></div><div className="absolute top-2 left-2 z-10"><span className="px-1.5 py-0.5 rounded-full text-[6.5px] font-black tracking-wider uppercase border bg-white" style={{ borderColor: tl.border, color: tl.color }}>{tl.text}</span></div><div className="absolute bottom-2 left-2 px-1 py-0.5 bg-white/90 backdrop-blur-xs rounded-md border border-stone-200 text-[6px] font-black uppercase text-stone-500 tracking-wider">{getMemoryEpoch(mem)}</div></div><div className="pt-3.5 flex flex-col justify-between"><div><h4 className="text-[12.5px] font-black font-serif text-[#3D2B1F] tracking-tight leading-tight group-hover:text-[#E8742A] transition-colors line-clamp-1 italic">{mem.title || "Untitled Story"}</h4>{mem.description && <p className="text-[9px] text-stone-500 italic leading-relaxed mt-1 line-clamp-1">"{mem.description}"</p>}</div><div className="flex items-center justify-between mt-3 pt-2 border-t border-stone-100 text-[8.5px] text-stone-400 font-bold"><span className="flex items-center gap-1.5"><Calendar className="w-3 h-3 text-[#E8742A]/60" />{formatDate(mem.created_at)}</span><span className="px-1 py-0.5 bg-stone-100 rounded text-[7.5px] font-black uppercase text-stone-600">{isAudio ? t.voiceLabel : t.videoLabel}</span></div></div></div>); })}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 px-5 pt-4 pb-8 z-50" style={{ background: "linear-gradient(to top,#FDF8F0 55%,transparent)" }}><button onClick={() => navigate("/record")} className="w-full py-[17px] rounded-2xl font-bold text-[15px] flex items-center justify-center gap-2.5 text-white border-none cursor-pointer shadow-[0_10px_25px_rgba(232,116,42,0.3)] transition-transform hover:scale-[1.01] active:scale-[.98]" style={{ background: "linear-gradient(135deg,#E8742A,#D4621A)" }}><Mic size={20} /> {t.preserveStory}</button></div>
    </div>
  );
};

export default Treasure;
```