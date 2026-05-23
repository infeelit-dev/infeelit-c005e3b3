import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Play, Volume2, Video, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import useUserName from "@/hooks/useUserName";
import type { Timeline } from "@/types/timeline";

import imgGrandfather from "@/assets/grandfather.jpg";
import imgChild from "@/assets/child.jpg";
import imgMarry from "@/assets/marry.jpg";
import imgRelax from "@/assets/relax.jpg";
import imgBirth from "@/assets/birth.jpg";
import imgLove from "@/assets/love.jpg";
import imgHouse from "@/assets/house.jpg";
import imgPicnic from "@/assets/picnic.jpg";
import imgTravel from "@/assets/travel.jpg";
import imgGraduate from "@/assets/graduate.jpg";

const REAL_CONTENT_THRESHOLD = 3;

const THEME_IMAGES: Record<string, string> = {
  enfant: imgChild,
  child: imgChild,
  طفل: imgChild,
  père: imgGrandfather,
  father: imgGrandfather,
  أب: imgGrandfather,
  mère: imgGrandfather,
  mother: imgGrandfather,
  أم: imgGrandfather,
  maison: imgHouse,
  home: imgHouse,
  بيت: imgHouse,
  amour: imgLove,
  love: imgLove,
  حب: imgLove,
  voyage: imgTravel,
  travel: imgTravel,
  سفر: imgTravel,
  mariage: imgMarry,
  marry: imgMarry,
  زواج: imgMarry,
  naissance: imgBirth,
  birth: imgBirth,
  ولادة: imgBirth,
  diplôme: imgGraduate,
  graduate: imgGraduate,
  تخرج: imgGraduate,
  pique: imgPicnic,
  picnic: imgPicnic,
  نزهة: imgPicnic,
  repos: imgRelax,
  relax: imgRelax,
  راحة: imgRelax,
};

const DEMO_QUESTIONS: Record<
  string,
  { fr: string; en: string; ar: string; image: string; size: number; x: number; y: number; colorMode: string }[]
> = {
  memories: [
    {
      fr: "L'odeur de sa cuisine",
      en: "The scent of her kitchen",
      ar: "رائحة مطبخها",
      image: imgGrandfather,
      size: 130,
      x: 5,
      y: 15,
      colorMode: "sepia",
    },
    {
      fr: "Ton plus vieux fou rire",
      en: "Your earliest belly laugh",
      ar: "أول ضحكة من القلب",
      image: imgChild,
      size: 110,
      x: 55,
      y: 10,
      colorMode: "color",
    },
    {
      fr: "Leur geste d'amour muet",
      en: "Their silent act of love",
      ar: "لفتة حب صامتة",
      image: imgMarry,
      size: 140,
      x: 25,
      y: 38,
      colorMode: "sepia",
    },
    {
      fr: "Le bruit de la maison",
      en: "The sound of home",
      ar: "صوت البيت",
      image: imgPicnic,
      size: 90,
      x: 5,
      y: 52,
      colorMode: "color",
    },
    {
      fr: "Le café des matins",
      en: "The morning coffee",
      ar: "قهوة الصباح",
      image: imgLove,
      size: 115,
      x: 45,
      y: 68,
      colorMode: "sepia",
    },
    {
      fr: "Le vêtement de ton père",
      en: "Your father's old coat",
      ar: "رداء والدك القديم",
      image: imgTravel,
      size: 100,
      x: 65,
      y: 55,
      colorMode: "sepia",
    },
    {
      fr: "Leur secret de bonheur",
      en: "Their secret to happiness",
      ar: "سر سعادتهم",
      image: imgRelax,
      size: 95,
      x: 70,
      y: 20,
      colorMode: "color",
    },
    { fr: "", en: "", ar: "", image: imgBirth, size: 40, x: 88, y: 8, colorMode: "sepia" },
    { fr: "", en: "", ar: "", image: imgGraduate, size: 35, x: 3, y: 88, colorMode: "sepia" },
  ],
  instant: [
    {
      fr: "Ton doudou fétiche",
      en: "Your favorite plushie",
      ar: "دميتك المفضلة",
      image: imgLove,
      size: 130,
      x: 10,
      y: 18,
      colorMode: "color",
    },
    {
      fr: "Votre langage secret",
      en: "Your secret language",
      ar: "لغتكم السرية",
      image: imgChild,
      size: 110,
      x: 55,
      y: 12,
      colorMode: "color",
    },
    {
      fr: "Ta première cabane",
      en: "Your first secret fort",
      ar: "مخبؤك الأول",
      image: imgPicnic,
      size: 95,
      x: 70,
      y: 35,
      colorMode: "sepia",
    },
    {
      fr: "Le pacte de sang",
      en: "The childhood pact",
      ar: "عهد الطفولة",
      image: imgTravel,
      size: 120,
      x: 20,
      y: 50,
      colorMode: "color",
    },
    {
      fr: "Ton goûter d'enfance",
      en: "Your childhood snack",
      ar: "وجبة طفولتك الخفيفة",
      image: imgMarry,
      size: 100,
      x: 60,
      y: 65,
      colorMode: "color",
    },
    { fr: "", en: "", ar: "", image: imgRelax, size: 45, x: 85, y: 70, colorMode: "sepia" },
    { fr: "", en: "", ar: "", image: imgHouse, size: 35, x: 5, y: 80, colorMode: "color" },
  ],
  forever: [
    {
      fr: "S'ils t'écoutaient ce soir",
      en: "If they heard you tonight",
      ar: "لو سمعوك الليلة",
      image: imgGraduate,
      size: 140,
      x: 8,
      y: 18,
      colorMode: "color",
    },
    {
      fr: "Le merci suspendu",
      en: "The unspoken thank you",
      ar: "شكر لم يُقل بعد",
      image: imgHouse,
      size: 120,
      x: 58,
      y: 12,
      colorMode: "sepia",
    },
    {
      fr: "Le nom que tu portes",
      en: "The name you carry",
      ar: "الاسم الذي تحمله",
      image: imgRelax,
      size: 130,
      x: 22,
      y: 40,
      colorMode: "color",
    },
    {
      fr: "La maison quittée",
      en: "The house left behind",
      ar: "البيت الذي غادرته",
      image: imgMarry,
      size: 105,
      x: 68,
      y: 42,
      colorMode: "color",
    },
    {
      fr: "La valeur héritée",
      en: "The inherited value",
      ar: "القيمة الموروثة",
      image: imgLove,
      size: 115,
      x: 12,
      y: 62,
      colorMode: "sepia",
    },
    {
      fr: "Leur sacrifice invisible",
      en: "Their invisible sacrifice",
      ar: "تضحيتهم غير المرئية",
      image: imgBirth,
      size: 100,
      x: 55,
      y: 65,
      colorMode: "color",
    },
    {
      fr: "Le fauteuil de ton grand-père",
      en: "Your grandfather's chair",
      ar: "كرسي جدك المفضل",
      image: imgGrandfather,
      size: 110,
      x: 72,
      y: 28,
      colorMode: "sepia",
    },
    { fr: "", en: "", ar: "", image: imgTravel, size: 38, x: 85, y: 55, colorMode: "color" },
    { fr: "", en: "", ar: "", image: imgChild, size: 30, x: 3, y: 75, colorMode: "sepia" },
  ],
};

const ZONES = [
  { xMin: 5, xMax: 30, yMin: 10, yMax: 35 },
  { xMin: 60, xMax: 90, yMin: 10, yMax: 35 },
  { xMin: 5, xMax: 30, yMin: 40, yMax: 65 },
  { xMin: 60, xMax: 90, yMin: 40, yMax: 65 },
  { xMin: 5, xMax: 30, yMin: 70, yMax: 90 },
  { xMin: 60, xMax: 90, yMin: 70, yMax: 90 },
  { xMin: 30, xMax: 45, yMin: 10, yMax: 30 },
  { xMin: 45, xMax: 65, yMin: 65, yMax: 90 },
];

const ANIMS = ["bubble-float-1", "bubble-float-2", "bubble-float-3"];
const LAYERS = [
  { label: "large", sizeMin: 130, sizeMax: 155, opacity: 1, zIndex: 10, durMin: 18, durMax: 22 },
  { label: "large", sizeMin: 130, sizeMax: 155, opacity: 1, zIndex: 10, durMin: 18, durMax: 22 },
  { label: "medium", sizeMin: 90, sizeMax: 115, opacity: 0.9, zIndex: 8, durMin: 14, durMax: 18 },
  { label: "medium", sizeMin: 90, sizeMax: 115, opacity: 0.9, zIndex: 8, durMin: 14, durMax: 18 },
  { label: "medium", sizeMin: 90, sizeMax: 115, opacity: 0.9, zIndex: 8, durMin: 14, durMax: 18 },
  { label: "small", sizeMin: 55, sizeMax: 80, opacity: 0.7, zIndex: 6, durMin: 10, durMax: 14 },
  { label: "small", sizeMin: 55, sizeMax: 80, opacity: 0.7, zIndex: 6, durMin: 10, durMax: 14 },
  { label: "small", sizeMin: 55, sizeMax: 80, opacity: 0.7, zIndex: 6, durMin: 10, durMax: 14 },
];

interface MemoryFromDB {
  id: string;
  title: string | null;
  file_url: string;
  file_type: string | null;
  thumbnail_url: string | null;
  is_anonymous: boolean;
  is_community: boolean;
  created_at: string;
  user_id: string;
  profiles: { display_name: string | null } | null;
}

interface BubbleItem {
  id: string;
  title: string;
  file_url: string;
  file_type: string;
  thumbnail_url: string | null;
  isAnonymous: boolean;
  displayName: string;
  createdAt: string;
  image: string;
  size: number;
  x: number;
  y: number;
  opacity: number;
  zIndex: number;
  animClass: string;
  animDuration: string;
  animDelay: string;
  isDemo: boolean;
  zoneIndex: number;
  bornAt: number;
}

interface BubbleCanvasProps {
  onBubbleClick?: (question: string, category: "past") => void;
  activeTimeline: Timeline;
}

const BubbleCanvas = ({ onBubbleClick, activeTimeline }: BubbleCanvasProps) => {
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const userName = useUserName();
  const [bubbles, setBubbles] = useState<BubbleItem[]>([]);
  const [selectedBubble, setSelectedBubble] = useState<BubbleItem | null>(null);
  const [showOverlay, setShowOverlay] = useState(false);
  const [showMirror, setShowMirror] = useState(false);
  const [mirrorQuestion, setMirrorQuestion] = useState("");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const usedZonesRef = useRef<Set<number>>(new Set());
  const bubbleIdCounter = useRef(0);

  const getThemedImage = useCallback((title: string): string => {
    const lower = title.toLowerCase();
    for (const [keyword, img] of Object.entries(THEME_IMAGES)) {
      if (lower.includes(keyword)) return img;
    }
    return imgRelax;
  }, []);

  const getDemoBubbles = useCallback((): BubbleItem[] => {
    const questions = DEMO_QUESTIONS[activeTimeline] || DEMO_QUESTIONS.memories;
    const langKey = (lang === "fr" ? "fr" : lang === "ar" ? "ar" : "en") as "fr" | "en" | "ar";
    return questions
      .filter((q) => q[langKey] && q[langKey].length > 0)
      .map((q, i) => {
        const zone = ZONES[i % ZONES.length];
        const layer = LAYERS[i % LAYERS.length];
        const size = layer.sizeMin + Math.random() * (layer.sizeMax - layer.sizeMin);
        const x = zone.xMin + Math.random() * (zone.xMax - zone.xMin);
        const y = zone.yMin + Math.random() * (zone.yMax - zone.yMin);
        const dur = layer.durMin + Math.random() * (layer.durMax - layer.durMin);
        bubbleIdCounter.current += 1;
        return {
          id: `demo-${bubbleIdCounter.current}`,
          title: q[langKey] || q.en || "",
          file_url: "",
          file_type: "question",
          thumbnail_url: null,
          isAnonymous: false,
          displayName: "",
          createdAt: "",
          image: q.image,
          size,
          x,
          y,
          opacity: layer.opacity,
          zIndex: layer.zIndex,
          animClass: ANIMS[i % 3],
          animDuration: `${dur}s`,
          animDelay: `${Math.random() * 8}s`,
          isDemo: true,
          zoneIndex: i,
          bornAt: Date.now(),
        };
      });
  }, [activeTimeline, lang]);

  const createBubbleFromMemory = useCallback(
    (mem: MemoryFromDB, zoneIndex: number): BubbleItem => {
      const zone = ZONES[zoneIndex % ZONES.length];
      const layer = LAYERS[zoneIndex % LAYERS.length];
      const size = layer.sizeMin + Math.random() * (layer.sizeMax - layer.sizeMin);
      const x = zone.xMin + Math.random() * (zone.xMax - zone.xMin);
      const y = zone.yMin + Math.random() * (zone.yMax - zone.yMin);
      const dur = layer.durMin + Math.random() * (layer.durMax - layer.durMin);
      const image = mem.thumbnail_url || getThemedImage(mem.title || "");
      const displayName = mem.is_anonymous ? "Un Gardien" : mem.profiles?.display_name?.split(" ")[0] || "Un Gardien";
      bubbleIdCounter.current += 1;
      return {
        id: `mem-${bubbleIdCounter.current}`,
        title: mem.title || "A memory",
        file_url: mem.file_url,
        file_type: mem.file_type || "audio",
        thumbnail_url: mem.thumbnail_url,
        isAnonymous: mem.is_anonymous,
        displayName,
        createdAt: mem.created_at,
        image,
        size,
        x,
        y,
        opacity: layer.opacity,
        zIndex: layer.zIndex,
        animClass: ANIMS[zoneIndex % 3],
        animDuration: `${dur}s`,
        animDelay: `${Math.random() * 8}s`,
        isDemo: false,
        zoneIndex,
        bornAt: Date.now(),
      };
    },
    [getThemedImage],
  );

  useEffect(() => {
    const loadMemories = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const currentUserId = session?.user?.id || "";

      const { data: memories } = await supabase
        .from("memories")
        .select(
          "id, title, file_url, file_type, thumbnail_url, is_anonymous, is_community, created_at, user_id, profiles(display_name)",
        )
        .or(currentUserId ? `is_community.eq.true,user_id.eq.${currentUserId}` : "is_community.eq.true")
        .order("created_at", { ascending: false })
        .limit(30);

      const realMemories = (memories as unknown as MemoryFromDB[]) || [];

      if (realMemories.length >= REAL_CONTENT_THRESHOLD) {
        const realBubbles = realMemories.slice(0, 8).map((mem, i) => createBubbleFromMemory(mem, i));
        realBubbles.forEach((b) => usedZonesRef.current.add(b.zoneIndex));
        setBubbles(realBubbles);
      } else {
        const demoBubbles = getDemoBubbles();
        demoBubbles.forEach((b) => usedZonesRef.current.add(b.zoneIndex));
        const mixedBubbles = [...demoBubbles];
        realMemories.forEach((mem, i) => {
          const freeZone = ZONES.findIndex((_, zi) => !usedZonesRef.current.has(zi));
          if (freeZone !== -1) {
            usedZonesRef.current.add(freeZone);
            mixedBubbles.push(createBubbleFromMemory(mem, freeZone));
          }
        });
        setBubbles(mixedBubbles.slice(0, 8));
      }
    };

    loadMemories();
  }, [activeTimeline, createBubbleFromMemory, getDemoBubbles]);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setBubbles((prev) => {
        if (prev.length === 0) return prev;
        const oldest = prev.reduce((a, b) => (a.bornAt < b.bornAt ? a : b));
        const newZoneIndex = oldest.zoneIndex;
        const remaining = prev.filter((b) => b.id !== oldest.id);
        usedZonesRef.current.delete(newZoneIndex);

        if (remaining.length < 8 && oldest.isDemo) {
          const newDemo = getDemoBubbles().find(
            (d) => !usedZonesRef.current.has(d.zoneIndex) && !remaining.some((r) => r.zoneIndex === d.zoneIndex),
          );
          if (newDemo) {
            usedZonesRef.current.add(newDemo.zoneIndex);
            return [...remaining, newDemo];
          }
        }
        return remaining;
      });
    }, 10000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [getDemoBubbles]);

  const handleBubbleTap = (bubble: BubbleItem) => {
    if (bubble.isDemo) {
      if (onBubbleClick && bubble.title) {
        onBubbleClick(bubble.title, "past");
      }
      return;
    }
    setSelectedBubble(bubble);
    setShowOverlay(true);
    setTimeout(() => setShowOverlay(false), 3000);
  };

  const handleClosePlayer = () => {
    setSelectedBubble(null);
    setShowMirror(false);
    setMirrorQuestion("");
  };

  const handleMediaEnded = () => {
    if (!selectedBubble) return;
    const name = userName || (lang === "fr" ? "toi" : lang === "ar" ? "أنت" : "you");
    const mirror =
      lang === "fr"
        ? `Et toi ${name}, qu'as-tu ressenti en écoutant "${selectedBubble.title}" ?`
        : lang === "ar"
          ? `وأنت ${name}، ماذا شعرت وأنت تستمع إلى "${selectedBubble.title}" ؟`
          : `And you ${name}, what did you feel listening to "${selectedBubble.title}"?`;
    setMirrorQuestion(mirror);
    setShowMirror(true);
  };

  const handleRecordMirror = () => {
    navigate("/record", { state: { question: mirrorQuestion, category: "past", fromMemory: true } });
    handleClosePlayer();
  };

  const getShortTitle = (title: string): string => {
    const words = title.split(" ").slice(0, 4);
    return words.join(" ") + (words.length < title.split(" ").length ? "..." : "");
  };

  return (
    <div className="absolute inset-0 z-[1] overflow-hidden">
      <style>{`
        @keyframes bubble-float-1 {
          0%   { transform: translate3d(0px, 0px, 0) scale(1); }
          20%  { transform: translate3d(12px, -18px, 0) scale(1.02); }
          40%  { transform: translate3d(-8px, -12px, 0) scale(0.98); }
          60%  { transform: translate3d(15px, 8px, 0) scale(1.01); }
          80%  { transform: translate3d(-10px, 15px, 0) scale(0.99); }
          100% { transform: translate3d(0px, 0px, 0) scale(1); }
        }
        @keyframes bubble-float-2 {
          0%   { transform: translate3d(0px, 0px, 0) scale(1); }
          25%  { transform: translate3d(-15px, -20px, 0) scale(1.03); }
          50%  { transform: translate3d(10px, -8px, 0) scale(0.97); }
          75%  { transform: translate3d(-12px, 12px, 0) scale(1.02); }
          100% { transform: translate3d(0px, 0px, 0) scale(1); }
        }
        @keyframes bubble-float-3 {
          0%   { transform: translate3d(0px, 0px, 0) scale(1); }
          33%  { transform: translate3d(18px, -15px, 0) scale(0.98); }
          66%  { transform: translate3d(-14px, 10px, 0) scale(1.03); }
          100% { transform: translate3d(0px, 0px, 0) scale(1); }
        }
        @keyframes bubble-born {
          from { opacity: 0; transform: scale(0.3); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes bubble-die {
          from { opacity: 1; transform: scale(1); }
          to   { opacity: 0; transform: scale(0.3); }
        }
        .bubble-float-1 { animation: bubble-float-1 var(--dur) ease-in-out infinite var(--delay), bubble-born 0.6s ease-out; }
        .bubble-float-2 { animation: bubble-float-2 var(--dur) ease-in-out infinite var(--delay), bubble-born 0.6s ease-out; }
        .bubble-float-3 { animation: bubble-float-3 var(--dur) ease-in-out infinite var(--delay), bubble-born 0.6s ease-out; }
        .bubble-dying { animation: bubble-die 0.8s ease-in forwards; }
      `}</style>

      {bubbles.map((bubble) => (
        <button
          key={bubble.id}
          onClick={() => handleBubbleTap(bubble)}
          className={`absolute rounded-full overflow-hidden cursor-pointer transition-all ${bubble.animClass}`}
          style={
            {
              width: `${bubble.size}px`,
              height: `${bubble.size}px`,
              left: `${bubble.x}%`,
              top: `${bubble.y}%`,
              opacity: bubble.opacity,
              zIndex: bubble.zIndex,
              border: bubble.isDemo ? "2px solid rgba(232,116,42,0.55)" : "2.5px solid rgba(107,78,155,0.7)",
              boxShadow: bubble.isDemo ? "0 0 20px rgba(232,116,42,0.2)" : "0 0 20px rgba(107,78,155,0.25)",
              "--dur": bubble.animDuration,
              "--delay": bubble.animDelay,
              willChange: "transform",
            } as React.CSSProperties
          }
        >
          <img
            src={bubble.image}
            alt=""
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center top",
              filter: bubble.isDemo ? "grayscale(60%) sepia(40%) brightness(0.85)" : "sepia(30%) brightness(0.9)",
            }}
          />

          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.1) 50%, transparent 100%)",
            }}
          />

          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(135deg, rgba(255,255,255,0.18) 0%, transparent 55%)",
            }}
          />

          {!bubble.isDemo && bubble.file_type === "audio" && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "3px",
                paddingBottom: "20px",
              }}
            >
              {[14, 22, 10, 18, 26].map((h, k) => (
                <div
                  key={k}
                  style={{
                    width: "3px",
                    height: `${h}px`,
                    backgroundColor: "#c4b5fd",
                    borderRadius: "2px",
                    opacity: 0.8,
                    animation: `audioWaveGlow ${0.7 + (k % 3) * 0.2}s ease-in-out infinite`,
                    animationDelay: `${k * 0.06}s`,
                  }}
                />
              ))}
            </div>
          )}

          <div style={{ position: "absolute", top: "6px", right: "6px" }}>
            <div
              style={{
                width: "20px",
                height: "20px",
                borderRadius: "50%",
                backgroundColor: "rgba(0,0,0,0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {bubble.isDemo ? (
                <span style={{ fontSize: "10px", color: "#E8742A", fontWeight: 900 }}>?</span>
              ) : bubble.file_type === "video" ? (
                <Play size={10} color="#fff" fill="#fff" />
              ) : (
                <Volume2 size={10} color="#c4b5fd" />
              )}
            </div>
          </div>

          {bubble.size >= 90 && (
            <div
              style={{ position: "absolute", bottom: "8px", left: 0, right: 0, padding: "0 8px", textAlign: "center" }}
            >
              {!bubble.isDemo && (
                <p
                  style={{
                    fontSize: "8px",
                    fontWeight: 700,
                    color: "#fff",
                    textTransform: "uppercase",
                    marginBottom: "1px",
                    textShadow: "0 1px 4px rgba(0,0,0,0.8)",
                  }}
                >
                  {bubble.displayName}
                </p>
              )}
              <p
                style={{
                  fontSize: "7px",
                  fontStyle: "italic",
                  color: "rgba(255,255,255,0.7)",
                  lineHeight: 1.2,
                  textShadow: "0 1px 3px rgba(0,0,0,0.7)",
                  overflow: "hidden",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                }}
              >
                {getShortTitle(bubble.title)}
              </p>
            </div>
          )}
        </button>
      ))}

      {selectedBubble && !selectedBubble.isDemo && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-6"
          onClick={handleClosePlayer}
        >
          <div
            className="relative w-full max-w-[340px] rounded-full overflow-hidden"
            style={{ aspectRatio: selectedBubble.file_type === "audio" ? "16/9" : "4/5" }}
            onClick={(e) => e.stopPropagation()}
          >
            {selectedBubble.file_type === "video" && selectedBubble.file_url ? (
              <video
                src={selectedBubble.file_url}
                controls
                autoPlay
                onEnded={handleMediaEnded}
                className="w-full h-full object-cover"
                style={{ borderRadius: "50%" }}
              />
            ) : selectedBubble.file_type === "audio" && selectedBubble.file_url ? (
              <audio
                src={selectedBubble.file_url}
                controls
                autoPlay
                onEnded={handleMediaEnded}
                className="w-[80%] mx-auto mt-[40%]"
              />
            ) : (
              <img
                src={selectedBubble.image}
                alt=""
                className="w-full h-full object-cover"
                style={{ borderRadius: "50%", filter: "sepia(30%) brightness(0.8)" }}
              />
            )}

            {showOverlay && (
              <div
                className="absolute top-0 left-0 right-0 px-5 py-4 z-10"
                style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.85) 0%, transparent 100%)" }}
              >
                <p className="text-[10px] text-white/50 uppercase tracking-[0.2em] font-bold mb-1.5">
                  {lang === "fr" ? "Ils ont demandé..." : lang === "ar" ? "سألوا..." : "They asked..."}
                </p>
                <p className="text-[15px] text-white italic font-serif leading-relaxed">"{selectedBubble.title}"</p>
              </div>
            )}

            <div className="absolute bottom-4 left-0 right-0 text-center">
              <p className="text-white/60 text-xs font-bold">
                {selectedBubble.displayName} · {new Date(selectedBubble.createdAt).toLocaleDateString()}
              </p>
            </div>

            {showMirror && (
              <div
                className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center gap-6 px-6 z-20"
                style={{ borderRadius: "50%" }}
              >
                <p className="text-white text-lg italic font-serif text-center leading-relaxed">"{mirrorQuestion}"</p>
                <button
                  onClick={handleRecordMirror}
                  className="px-6 py-3 rounded-full font-bold text-sm"
                  style={{
                    background: "linear-gradient(135deg, #E8742A, #D4621A)",
                    color: "#fff",
                    boxShadow: "0 0 24px rgba(232,116,42,0.5)",
                  }}
                >
                  {lang === "fr" ? "Je veux raconter ça" : lang === "ar" ? "أريد أن أحكي هذا" : "I want to tell this"}
                </button>
                <button onClick={handleClosePlayer} className="text-white/30 text-xs">
                  {lang === "fr" ? "Plus tard" : lang === "ar" ? "لاحقاً" : "Later"}
                </button>
              </div>
            )}
          </div>

          <button
            onClick={handleClosePlayer}
            className="absolute top-6 right-6 p-3 rounded-full bg-white/10 text-white"
          >
            <X size={22} />
          </button>
        </div>
      )}

      <style>{`@keyframes audioWaveGlow{0%,100%{opacity:.7}50%{opacity:1}}`}</style>
    </div>
  );
};

export default BubbleCanvas;
