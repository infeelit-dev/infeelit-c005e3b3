import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Play, Volume2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import useUserName from "@/hooks/useUserName";
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
import imgTravel from "@/assets/travel.jpg";
import imgGraduate from "@/assets/graduate.jpg";

const REAL_CONTENT_THRESHOLD = 3;
const VISIBLE_COUNT = 8;

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
  { fr: string; en: string; ar: string; image: string; size: number; x: number; y: number }[]
> = {
  memories: [
    { fr: "L'odeur de sa cuisine", en: "The scent of her kitchen", ar: "رائحة مطبخها", image: imgGrandfather, size: 130, x: 5, y: 15 },
    { fr: "Ton plus vieux fou rire", en: "Your earliest belly laugh", ar: "أول ضحكة من القلب", image: imgChild, size: 110, x: 55, y: 10 },
    { fr: "Leur geste d'amour muet", en: "Their silent act of love", ar: "لفتة حب صامتة", image: imgMarry, size: 140, x: 25, y: 38 },
    { fr: "Le bruit de la maison", en: "The sound of home", ar: "صوت البيت", image: imgPicnic, size: 90, x: 5, y: 52 },
    { fr: "Le café des matins", en: "The morning coffee", ar: "قهوة الصباح", image: imgLove, size: 115, x: 45, y: 68 },
    { fr: "Le vêtement de ton père", en: "Your father's old coat", ar: "رداء والدك القديم", image: imgTravel, size: 100, x: 65, y: 55 },
    { fr: "Leur secret de bonheur", en: "Their secret to happiness", ar: "سر سعادتهم", image: imgRelax, size: 95, x: 70, y: 20 },
  ],
  instant: [
    { fr: "Ton doudou fétiche", en: "Your favorite plushie", ar: "دميتك المفضلة", image: imgLove, size: 130, x: 10, y: 18 },
    { fr: "Votre langage secret", en: "Your secret language", ar: "لغتكم السرية", image: imgChild, size: 110, x: 55, y: 12 },
    { fr: "Ta première cabane", en: "Your first secret fort", ar: "مخبؤك الأول", image: imgPicnic, size: 95, x: 70, y: 35 },
    { fr: "Le pacte de sang", en: "The childhood pact", ar: "عهد الطفولة", image: imgTravel, size: 120, x: 20, y: 50 },
    { fr: "Ton goûter d'enfance", en: "Your childhood snack", ar: "وجبة طفولتك الخفيفة", image: imgMarry, size: 100, x: 60, y: 65 },
  ],
  forever: [
    { fr: "S'ils t'écoutaient ce soir", en: "If they heard you tonight", ar: "لو سمعوك الليلة", image: imgGraduate, size: 140, x: 8, y: 18 },
    { fr: "Le merci suspendu", en: "The unspoken thank you", ar: "شكر لم يُقل بعد", image: imgHouse, size: 120, x: 58, y: 12 },
    { fr: "Le nom que tu portes", en: "The name you carry", ar: "الاسم الذي تحمله", image: imgRelax, size: 130, x: 22, y: 40 },
    { fr: "La maison quittée", en: "The house left behind", ar: "البيت الذي غادرته", image: imgMarry, size: 105, x: 68, y: 42 },
    { fr: "La valeur héritée", en: "The inherited value", ar: "القيمة الموروثة", image: imgLove, size: 115, x: 12, y: 62 },
    { fr: "Leur sacrifice invisible", en: "Their invisible sacrifice", ar: "تضحيتهم غير المرئية", image: imgBirth, size: 100, x: 55, y: 65 },
    { fr: "Le fauteuil de ton grand-père", en: "Your grandfather's chair", ar: "كرسي جدك المفضل", image: imgGrandfather, size: 110, x: 72, y: 28 },
  ],
};

interface BubbleData {
  id: string;
  type: "real" | "demo";
  title: string;
  question_fr?: string;
  question_en?: string;
  question_ar?: string;
  file_url?: string;
  file_type?: string | null;
  thumbnail_url?: string | null;
  user_name?: string;
  user_id?: string;
  sparks_count?: number;
  transcript_fr?: string | null;
  transcript_en?: string | null;
  transcript_ar?: string | null;
  translation_status?: string | null;
  detected_lang?: string | null;
  image?: string;
  size: number;
  x: number;
  y: number;
  animDelay: number;
  animDuration: number;
  floatClass: string;
  isExiting?: boolean;
  isEntering?: boolean;
}

interface BubbleCanvasProps {
  onBubbleClick?: (question: string, category: "past") => void;
  activeTimeline: Timeline;
}

function getBubbleSize(sparks: number): number {
  if (sparks >= 50) return 155;
  if (sparks >= 20) return 130;
  if (sparks >= 5) return 110;
  return 90;
}

function generatePositions(sizes: number[]): { x: number; y: number }[] {
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

  return sizes.map((_, i) => {
    const zone = zones[i % zones.length];
    return {
      x: zone.x[0] + Math.random() * (zone.x[1] - zone.x[0]),
      y: zone.y[0] + Math.random() * (zone.y[1] - zone.y[0]),
    };
  });
}

function getNewPosition(
  existingBubbles: BubbleData[],
  _newSize: number,
): { x: number; y: number } {
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

  for (const zone of zones) {
    const x = zone.x[0] + Math.random() * (zone.x[1] - zone.x[0]);
    const y = zone.y[0] + Math.random() * (zone.y[1] - zone.y[0]);
    const tooClose = existingBubbles.some(
      (b) => Math.abs(b.x - x) < 15 && Math.abs(b.y - y) < 15,
    );
    if (!tooClose) return { x, y };
  }

  return { x: 20 + Math.random() * 60, y: 20 + Math.random() * 60 };
}

function getThemedImage(title: string): string {
  const lower = title.toLowerCase();
  for (const [keyword, img] of Object.entries(THEME_IMAGES)) {
    if (lower.includes(keyword)) return img;
  }
  return imgRelax;
}

const FLOAT_CLASSES = ["bubble-float-1", "bubble-float-2", "bubble-float-3"];

const BubbleCanvas = ({ onBubbleClick, activeTimeline }: BubbleCanvasProps) => {
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const userName = useUserName();
  const [currentUserId, setCurrentUserId] = useState<string | undefined>();
  const [useRealFeed, setUseRealFeed] = useState(false);
  const [demoBubbles, setDemoBubbles] = useState<BubbleData[]>([]);

  const [memoryQueue, setMemoryQueue] = useState<BubbleData[]>([]);
  const [visibleBubbles, setVisibleBubbles] = useState<BubbleData[]>([]);
  const [seenIds, setSeenIds] = useState<Set<string>>(new Set());
  const seenIdsRef = useRef(seenIds);

  const [bloomingBubble, setBloomingBubble] = useState<{
    id: string;
    x: number;
    y: number;
    size: number;
  } | null>(null);
  const [openMemory, setOpenMemory] = useState<BubbleData | null>(null);
  const [highlightedIds, setHighlightedIds] = useState<string[]>([]);
  const [isPressing, setIsPressing] = useState(false);
  const [constellationQueue, setConstellationQueue] = useState<BubbleData[]>([]);
  const constellationQueueRef = useRef<BubbleData[]>([]);

  const isPressingRef = useRef(false);
  const selectedPathRef = useRef<string[]>([]);
  const lastMousePos = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    seenIdsRef.current = seenIds;
  }, [seenIds]);

  useEffect(() => {
    constellationQueueRef.current = constellationQueue;
  }, [constellationQueue]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUserId(session?.user?.id);
    });
  }, []);

  const mapMemoryToBubble = useCallback(
    (m: Record<string, unknown>, index: number): BubbleData => ({
      id: m.id as string,
      type: "real",
      title: (m.title as string) || "Un souvenir",
      file_url: (m.file_url as string) || "",
      file_type: (m.file_type as string) || "video",
      thumbnail_url: (m.thumbnail_url as string) || null,
      user_name:
        (m.profiles as { display_name?: string } | null)?.display_name?.split(" ")[0] ||
        (m.is_anonymous ? "Un Gardien" : "Quelqu'un"),
      user_id: m.user_id as string,
      sparks_count: (m.sparks_count as number) || 0,
      transcript_fr: m.transcript_fr as string | null,
      transcript_en: m.transcript_en as string | null,
      transcript_ar: m.transcript_ar as string | null,
      translation_status: m.translation_status as string | null,
      detected_lang: m.detected_lang as string | null,
      image: (m.thumbnail_url as string) || getThemedImage((m.title as string) || ""),
      size: getBubbleSize((m.sparks_count as number) || 0),
      x: 0,
      y: 0,
      animDelay: Math.random() * 3,
      animDuration: 3 + Math.random() * 4,
      floatClass: FLOAT_CLASSES[index % 3],
    }),
    [],
  );

  const getDemoBubbles = useCallback((): BubbleData[] => {
    const questions = DEMO_QUESTIONS[activeTimeline] || DEMO_QUESTIONS.memories;
    const langKey = (lang === "fr" ? "fr" : lang === "ar" ? "ar" : "en") as "fr" | "en" | "ar";
    return questions
      .filter((q) => q[langKey] && q[langKey].length > 0)
      .map((q, i) => ({
        id: `demo-${i}-${langKey}`,
        type: "demo" as const,
        title: q[langKey] || q.en || "",
        question_fr: q.fr,
        question_en: q.en,
        question_ar: q.ar,
        image: q.image,
        size: q.size,
        x: q.x,
        y: q.y,
        animDelay: Math.random() * 3,
        animDuration: 3 + Math.random() * 4,
        floatClass: FLOAT_CLASSES[i % 3],
      }));
  }, [activeTimeline, lang]);

  useEffect(() => {
    const loadMemories = async () => {
      const { data } = await supabase
        .from("memories")
        .select("*, profiles (display_name)")
        .eq("is_public", true)
        .not("moderation_status", "eq", "rejected")
        .order("created_at", { ascending: false })
        .limit(40);

      if (!data || data.length < REAL_CONTENT_THRESHOLD) {
        setUseRealFeed(false);
        setDemoBubbles(getDemoBubbles());
        setVisibleBubbles([]);
        setMemoryQueue([]);
        return;
      }

      const resolved = await resolveMemoryFields(data);
      const bubbles = resolved.map((m, i) => mapMemoryToBubble(m as Record<string, unknown>, i));
      const shuffled = [...bubbles].sort(() => Math.random() - 0.5);
      const initial = shuffled.slice(0, VISIBLE_COUNT);
      const queue = shuffled.slice(VISIBLE_COUNT);
      const positions = generatePositions(initial.map((b) => b.size));
      const positioned = initial.map((b, i) => ({
        ...b,
        x: positions[i].x,
        y: positions[i].y,
      }));

      setUseRealFeed(true);
      setDemoBubbles([]);
      setVisibleBubbles(positioned);
      setMemoryQueue(queue);
      setSeenIds(new Set());
    };

    loadMemories();
  }, [activeTimeline, getDemoBubbles, mapMemoryToBubble]);

  const reloadMoreMemories = async () => {
    const ids = [...seenIdsRef.current];
    let query = supabase
      .from("memories")
      .select("*, profiles (display_name)")
      .eq("is_public", true)
      .not("moderation_status", "eq", "rejected")
      .order("created_at", { ascending: false })
      .limit(20);

    if (ids.length > 0) {
      query = query.not("id", "in", `(${ids.join(",")})`);
    }

    const { data } = await query;

    if (data && data.length > 0) {
      const resolved = await resolveMemoryFields(data);
      const newBubbles = resolved.map((m, i) => mapMemoryToBubble(m as Record<string, unknown>, i));
      setMemoryQueue(newBubbles);
    } else {
      setSeenIds(new Set());
    }
  };

  const replaceBubble = useCallback((viewedBubble: BubbleData) => {
    if (!useRealFeed) return;

    setMemoryQueue((currentQueue) => {
      if (currentQueue.length > 0) {
        const [nextBubble, ...remainingQueue] = currentQueue;

        setVisibleBubbles((prev) => {
          const newPosition = getNewPosition(
            prev.filter((b) => b.id !== viewedBubble.id),
            nextBubble.size,
          );

          const newBubble: BubbleData = {
            ...nextBubble,
            x: newPosition.x,
            y: newPosition.y,
            animDelay: Math.random() * 2,
            animDuration: 3 + Math.random() * 4,
            isEntering: true,
          };

          const withExiting = prev.map((b) =>
            b.id === viewedBubble.id ? { ...b, isExiting: true } : b,
          );

          setTimeout(() => {
            setVisibleBubbles((current) => [
              ...current.filter((b) => b.id !== viewedBubble.id),
              newBubble,
            ]);

            setTimeout(() => {
              setVisibleBubbles((current) =>
                current.map((b) => (b.id === newBubble.id ? { ...b, isEntering: false } : b)),
              );
            }, 600);
          }, 500);

          return withExiting;
        });

        return remainingQueue;
      }

      setVisibleBubbles((prev) => prev.filter((b) => b.id !== viewedBubble.id));
      reloadMoreMemories();
      return currentQueue;
    });
  }, [useRealFeed]);

  const handleCloseMemory = (viewedBubble: BubbleData) => {
    setOpenMemory(null);
    setSeenIds((prev) => new Set([...prev, viewedBubble.id]));

    const queue = constellationQueueRef.current;
    if (queue.length > 0) {
      const [next, ...rest] = queue;
      setConstellationQueue(rest);
      setTimeout(() => {
        handleBubbleTap(next);
      }, 300);
    } else {
      replaceBubble(viewedBubble);
    }
  };

  const handleBubbleTap = useCallback(
    (bubble: BubbleData) => {
      if (bubble.type === "demo") {
        navigate("/record", {
          state: {
            preSelectedQuestion: {
              fr: bubble.question_fr || bubble.title,
              en: bubble.question_en || bubble.title,
              ar: bubble.question_ar || bubble.title,
            },
          },
        });
        return;
      }

      const el = document.querySelector(`[data-bubble-id="${bubble.id}"]`);
      let bloomX = (bubble.x / 100) * window.innerWidth;
      let bloomY = (bubble.y / 100) * window.innerHeight;
      if (el) {
        const rect = el.getBoundingClientRect();
        bloomX = rect.left + rect.width / 2;
        bloomY = rect.top + rect.height / 2;
      }

      setBloomingBubble({
        id: bubble.id,
        x: bloomX,
        y: bloomY,
        size: bubble.size,
      });

      setTimeout(() => {
        setBloomingBubble(null);
        setOpenMemory(bubble);
      }, 500);
    },
    [navigate],
  );

  const handleConstellationGesture = useCallback(
    (bubbles: BubbleData[]) => {
      if (bubbles.length === 0) return;
      setConstellationQueue(bubbles.slice(1));
      handleBubbleTap(bubbles[0]);
    },
    [handleBubbleTap],
  );

  const getActiveBubbles = useCallback((): BubbleData[] => {
    return useRealFeed ? visibleBubbles : demoBubbles;
  }, [useRealFeed, visibleBubbles, demoBubbles]);

  const addBubbleToPath = useCallback((bubbleId: string) => {
    if (!isPressingRef.current) return;
    if (selectedPathRef.current.includes(bubbleId)) return;

    selectedPathRef.current = [...selectedPathRef.current, bubbleId];
    setHighlightedIds([...selectedPathRef.current]);
  }, []);

  const startPress = useCallback((bubbleId: string) => {
    isPressingRef.current = true;
    setIsPressing(true);
    selectedPathRef.current = [bubbleId];
    setHighlightedIds([bubbleId]);
  }, []);

  const finishGesture = useCallback(() => {
    if (!isPressingRef.current) return;
    isPressingRef.current = false;
    setIsPressing(false);
    lastMousePos.current = null;

    const path = selectedPathRef.current;
    selectedPathRef.current = [];
    setHighlightedIds([]);

    if (path.length === 0) return;

    const bubbles = getActiveBubbles();

    if (path.length === 1) {
      const bubble = bubbles.find((b) => b.id === path[0]);
      if (bubble) handleBubbleTap(bubble);
    } else {
      const orderedBubbles = path
        .map((id) => bubbles.find((b) => b.id === id))
        .filter((b): b is BubbleData => Boolean(b));
      handleConstellationGesture(orderedBubbles);
    }
  }, [getActiveBubbles, handleBubbleTap, handleConstellationGesture]);

  const getShortTitle = (title: string): string => {
    const words = title.split(" ").slice(0, 4);
    return words.join(" ") + (words.length < title.split(" ").length ? "..." : "");
  };

  const renderBubble = (bubble: BubbleData) => {
    let animation: string | undefined;
    if (bubble.isExiting) {
      animation = "bubbleExit 0.5s ease-in forwards";
    } else if (bubble.isEntering) {
      animation = "bubbleEnter 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards";
    }

    const isHighlighted = highlightedIds.includes(bubble.id);
    const defaultBoxShadow =
      bubble.type === "demo"
        ? "0 0 20px rgba(232,116,42,0.2)"
        : "0 0 24px rgba(212,175,55,0.35)";

    const floatStyle = animation
      ? { animation }
      : isHighlighted
        ? {}
        : ({
            "--dur": `${bubble.animDuration}s`,
            "--delay": `${bubble.animDelay}s`,
          } as React.CSSProperties);

    return (
      <div
        key={bubble.id}
        role="button"
        tabIndex={0}
        data-bubble-id={bubble.id}
        onMouseDown={(e) => {
          e.preventDefault();
          startPress(bubble.id);
        }}
        onTouchStart={(e) => {
          e.preventDefault();
          startPress(bubble.id);
        }}
        onMouseUp={() => {
          finishGesture();
        }}
        onTouchEnd={(e) => {
          e.preventDefault();
          finishGesture();
        }}
        className={`absolute rounded-full overflow-hidden cursor-pointer ${animation || isHighlighted ? "" : bubble.floatClass}`}
        style={{
          width: `${bubble.size}px`,
          height: `${bubble.size}px`,
          left: `${bubble.x}%`,
          top: `${bubble.y}%`,
          outline: isHighlighted ? "3px solid #E8742A" : "none",
          outlineOffset: "2px",
          transform: `translate(-50%, -50%) scale(${isHighlighted ? 1.08 : 1})`,
          filter: isHighlighted
            ? "drop-shadow(0 0 12px rgba(232,116,42,0.7)) brightness(1.1)"
            : "none",
          transition: "transform 0.15s ease, filter 0.15s ease, outline 0.15s ease",
          zIndex: isHighlighted ? 15 : bubble.isEntering ? 20 : 10,
          border:
            bubble.type === "demo"
              ? "2px solid rgba(232,116,42,0.55)"
              : "2.5px solid rgba(212,175,55,0.75)",
          boxShadow: isHighlighted ? "none" : defaultBoxShadow,
          pointerEvents: openMemory || bloomingBubble ? "none" : "auto",
          WebkitTapHighlightColor: "transparent",
          userSelect: "none",
          animationPlayState: isPressing ? "paused" : "running",
          ...floatStyle,
        }}
      >
        <img
          src={bubble.image || imgRelax}
          alt=""
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center top",
            pointerEvents: "none",
            filter:
              bubble.type === "demo"
                ? "grayscale(60%) sepia(40%) brightness(0.85)"
                : "sepia(20%) brightness(0.92)",
          }}
        />

        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background:
              "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.1) 50%, transparent 100%)",
          }}
        />

        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background: "linear-gradient(135deg, rgba(255,255,255,0.18) 0%, transparent 55%)",
          }}
        />

        {bubble.type === "real" && bubble.file_type === "audio" && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "3px",
              paddingBottom: "20px",
              pointerEvents: "none",
            }}
          >
            {[14, 22, 10, 18, 26].map((h, k) => (
              <div
                key={k}
                style={{
                  width: "3px",
                  height: `${h}px`,
                  backgroundColor: "#D4AF37",
                  borderRadius: "2px",
                  opacity: 0.8,
                  pointerEvents: "none",
                }}
              />
            ))}
          </div>
        )}

        <div style={{ position: "absolute", top: "6px", right: "6px", pointerEvents: "none" }}>
          <div
            style={{
              width: "20px",
              height: "20px",
              borderRadius: "50%",
              backgroundColor: "rgba(0,0,0,0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
            }}
          >
            {bubble.type === "demo" ? (
              <span style={{ fontSize: "10px", color: "#E8742A", fontWeight: 900, pointerEvents: "none" }}>
                ?
              </span>
            ) : bubble.file_type === "video" ? (
              <Play size={10} color="#fff" fill="#fff" style={{ pointerEvents: "none" }} />
            ) : (
              <Volume2 size={10} color="#D4AF37" style={{ pointerEvents: "none" }} />
            )}
          </div>
        </div>

        {bubble.size >= 90 && (
          <div
            style={{
              position: "absolute",
              bottom: "8px",
              left: 0,
              right: 0,
              padding: "0 8px",
              textAlign: "center",
              pointerEvents: "none",
            }}
          >
            {bubble.type === "real" && bubble.user_name && (
              <p
                style={{
                  fontSize: "8px",
                  fontWeight: 700,
                  color: "#fff",
                  textTransform: "uppercase",
                  marginBottom: "1px",
                  textShadow: "0 1px 4px rgba(0,0,0,0.8)",
                  pointerEvents: "none",
                }}
              >
                {bubble.user_name}
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
                pointerEvents: "none",
              }}
            >
              {getShortTitle(bubble.title)}
            </p>
          </div>
        )}
      </div>
    );
  };

  const bubblesToRender = useRealFeed ? visibleBubbles : demoBubbles;

  return (
    <div
      className="absolute inset-0 z-[1] overflow-hidden"
      style={{ touchAction: "none", userSelect: "none" }}
      onMouseMove={(e) => {
        if (!isPressingRef.current) return;

        const moved =
          !lastMousePos.current ||
          Math.abs(e.clientX - lastMousePos.current.x) > 8 ||
          Math.abs(e.clientY - lastMousePos.current.y) > 8;
        if (!moved) return;

        lastMousePos.current = { x: e.clientX, y: e.clientY };

        const el = document.elementFromPoint(e.clientX, e.clientY);
        const bubbleEl = el?.closest("[data-bubble-id]");
        if (!bubbleEl) return;

        const id = bubbleEl.getAttribute("data-bubble-id");
        if (!id) return;
        if (selectedPathRef.current.includes(id)) return;

        selectedPathRef.current = [...selectedPathRef.current, id];
        setHighlightedIds([...selectedPathRef.current]);
      }}
      onTouchMove={(e) => {
        if (!isPressingRef.current) return;
        e.preventDefault();

        const touch = e.touches[0];
        const el = document.elementFromPoint(touch.clientX, touch.clientY);
        const bubbleEl = el?.closest("[data-bubble-id]");
        if (!bubbleEl) return;

        const id = bubbleEl.getAttribute("data-bubble-id");
        if (id) addBubbleToPath(id);
      }}
      onTouchEnd={() => {
        finishGesture();
      }}
      onMouseUp={() => {
        lastMousePos.current = null;
        finishGesture();
      }}
      onMouseLeave={() => {
        if (isPressingRef.current) finishGesture();
      }}
    >
      <style>{`
        [data-bubble-id] {
          -webkit-tap-highlight-color: transparent;
        }
        @keyframes bloomExpand {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          30% { transform: translate(-50%, -50%) scale(1.12); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
        }
        @keyframes bloomLight {
          0% { transform: translate(-50%, -50%) scale(0); opacity: 0.9; }
          60% { opacity: 0.7; }
          100% { transform: translate(-50%, -50%) scale(8); opacity: 0; }
        }
        @keyframes bloomReveal {
          0% { opacity: 0; transform: scale(0.92); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes bloomClose {
          0% { opacity: 1; transform: scale(1); border-radius: 0%; }
          70% { opacity: 0.8; transform: scale(0.15); border-radius: 50%; }
          100% { opacity: 0; transform: scale(0); border-radius: 50%; }
        }
        @keyframes bubbleExit {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(0.3); opacity: 0; }
        }
        @keyframes bubbleEnter {
          0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
          60% { transform: translate(-50%, -50%) scale(1.1); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        }
        @keyframes bubble-float-1 {
          0%   { transform: translate(-50%, -50%) translate3d(0px, 0px, 0) scale(1); }
          20%  { transform: translate(-50%, -50%) translate3d(12px, -18px, 0) scale(1.02); }
          40%  { transform: translate(-50%, -50%) translate3d(-8px, -12px, 0) scale(0.98); }
          60%  { transform: translate(-50%, -50%) translate3d(15px, 8px, 0) scale(1.01); }
          80%  { transform: translate(-50%, -50%) translate3d(-10px, 15px, 0) scale(0.99); }
          100% { transform: translate(-50%, -50%) translate3d(0px, 0px, 0) scale(1); }
        }
        @keyframes bubble-float-2 {
          0%   { transform: translate(-50%, -50%) translate3d(0px, 0px, 0) scale(1); }
          25%  { transform: translate(-50%, -50%) translate3d(-15px, -20px, 0) scale(1.03); }
          50%  { transform: translate(-50%, -50%) translate3d(10px, -8px, 0) scale(0.97); }
          75%  { transform: translate(-50%, -50%) translate3d(-12px, 12px, 0) scale(1.02); }
          100% { transform: translate(-50%, -50%) translate3d(0px, 0px, 0) scale(1); }
        }
        @keyframes bubble-float-3 {
          0%   { transform: translate(-50%, -50%) translate3d(0px, 0px, 0) scale(1); }
          33%  { transform: translate(-50%, -50%) translate3d(18px, -15px, 0) scale(0.98); }
          66%  { transform: translate(-50%, -50%) translate3d(-14px, 10px, 0) scale(1.03); }
          100% { transform: translate(-50%, -50%) translate3d(0px, 0px, 0) scale(1); }
        }
        .bubble-float-1 { animation: bubble-float-1 var(--dur) ease-in-out infinite var(--delay); }
        .bubble-float-2 { animation: bubble-float-2 var(--dur) ease-in-out infinite var(--delay); }
        .bubble-float-3 { animation: bubble-float-3 var(--dur) ease-in-out infinite var(--delay); }
      `}</style>

      {bubblesToRender.map(renderBubble)}

      {bloomingBubble && (
        <>
          <div
            style={{
              position: "fixed",
              left: bloomingBubble.x,
              top: bloomingBubble.y,
              width: bloomingBubble.size,
              height: bloomingBubble.size,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(212,175,55,0.9) 0%, rgba(232,116,42,0.7) 60%, transparent 100%)",
              transform: "translate(-50%, -50%)",
              animation: "bloomExpand 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
              zIndex: 150,
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "fixed",
              left: bloomingBubble.x,
              top: bloomingBubble.y,
              width: "120px",
              height: "120px",
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(253,248,240,0.95) 0%, rgba(232,116,42,0.6) 40%, rgba(212,175,55,0.3) 70%, transparent 100%)",
              transform: "translate(-50%, -50%)",
              animation: "bloomLight 0.5s ease-out forwards",
              zIndex: 149,
              pointerEvents: "none",
            }}
          />
        </>
      )}

      {openMemory && (
        <MemoryFullscreen
          bubble={openMemory}
          onClose={() => handleCloseMemory(openMemory)}
          userName={userName}
          currentUserId={currentUserId}
        />
      )}
    </div>
  );
};

export default BubbleCanvas;
