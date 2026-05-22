import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Mic,
  Volume2,
  Video,
  Play,
  ArrowLeft,
  Lock,
  Globe,
  X,
  ChevronLeft,
  ChevronRight,
  Shield,
  Plus,
  Sparkles,
  Calendar,
  Hourglass,
  Star,
  Activity,
  Layers,
  Compass,
  Orbit,
  ExternalLink,
  Eye,
  Moon,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

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
type ViewMode = "grid" | "constellation";

// ─── Curated Unsplash Portrayals representing chronological lifespans ───────

const EPOCH_PORTRAITS = {
  childhood: "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&w=150&q=80",
  teen: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=150&q=80",
  youngAdult: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
  prime: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80",
  today: "https://images.unsplash.com/photo-1472417583565-62e00defa53b?auto=format&fit=crop&w=150&q=80",
};

// ─── Fallback Demo Memories ───────────────────────────────────────────────────

const DEMO: Memory[] = [
  {
    id: "d1",
    title: "Le parfum de notre maison d'enfance",
    file_url: "",
    file_type: "video",
    thumbnail_url: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=400&q=80",
    created_at: "2026-04-07T10:00:00Z",
    is_public: false,
    timeline: "memories",
    description: "Chaque fois que je sens l'odeur du pain grillé le matin...",
  },
  {
    id: "d2",
    title: "La grande leçon de courage de mon père",
    file_url: "",
    file_type: "audio",
    thumbnail_url: null,
    created_at: "2026-04-06T14:00:00Z",
    is_public: true,
    timeline: "memories",
    description: "Il n'utilisait jamais beaucoup de mots, mais sa poignée de main...",
  },
  {
    id: "d3",
    title: "L'été doré de 1987",
    file_url: "",
    file_type: "video",
    thumbnail_url: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=400&q=80",
    created_at: "2026-04-05T09:00:00Z",
    is_public: false,
    timeline: "memories",
    description: "Nous étions libres, sauvages et insouciants sur cette plage.",
  },
  {
    id: "d4",
    title: "Un message pour le jour de ton mariage",
    file_url: "",
    file_type: "video",
    thumbnail_url: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=400&q=80",
    created_at: "2026-04-04T18:00:00Z",
    is_public: false,
    timeline: "forever",
    description: "Mon cher enfant, quand ce moment se produira, écoute ceci...",
  },
  {
    id: "d5",
    title: "Notre toute première maison à l'étranger",
    file_url: "",
    file_type: "audio",
    thumbnail_url: null,
    created_at: "2026-04-03T11:00:00Z",
    is_public: true,
    timeline: "instant",
    description: "Les bruits de la rue, le chant des voisins sous les fenêtres.",
  },
  {
    id: "d6",
    title: "Le jour de ta naissance",
    file_url: "",
    file_type: "video",
    thumbnail_url: "https://images.unsplash.com/photo-1551256817-e905fe6b4e9b?auto=format&fit=crop&w=400&q=80",
    created_at: "2026-04-02T16:00:00Z",
    is_public: false,
    timeline: "memories",
    description: "Je n'avais jamais ressenti une telle étincelle d'amour pur.",
  },
];

// ─── Life Epoch Definition with Custom Vintage Chronological Filters ──────────

interface LifeEpoch {
  id: string;
  name: Record<"en" | "fr" | "ar", string>;
  photo: string;
  filter: string;
  size: number;
  borderClass: string;
  glowColor: string;
}

const LIFE_EPOCHS: LifeEpoch[] = [
  {
    id: "childhood",
    name: { en: "Childhood", fr: "Enfance", ar: "الطفولة" },
    photo: EPOCH_PORTRAITS.childhood,
    filter: "grayscale(80%) sepia(30%) brightness(0.9) contrast(1.1)",
    size: 56,
    borderClass: "border-amber-700/60",
    glowColor: "rgba(180,120,40,0.4)",
  },
  {
    id: "teen",
    name: { en: "Teenage", fr: "Adolescence", ar: "الشباب" },
    photo: EPOCH_PORTRAITS.teen,
    filter: "grayscale(30%) sepia(10%) brightness(0.92) saturate(1.1)",
    size: 56,
    borderClass: "border-amber-600/70",
    glowColor: "rgba(210,130,50,0.5)",
  },
  {
    id: "youngAdult",
    name: { en: "Young Adult", fr: "Jeune Adulte", ar: "مقتبل العمر" },
    photo: EPOCH_PORTRAITS.youngAdult,
    filter: "grayscale(10%) brightness(0.95) saturate(1.2)",
    size: 62,
    borderClass: "border-sky-500/50",
    glowColor: "rgba(56,189,248,0.4)",
  },
  {
    id: "prime",
    name: { en: "Prime", fr: "Vie Active", ar: "العمر الذهبي" },
    photo: EPOCH_PORTRAITS.prime,
    filter: "saturate(1.2) contrast(1.05)",
    size: 62,
    borderClass: "border-[#E8742A]/60",
    glowColor: "rgba(232,116,42,0.5)",
  },
  {
    id: "today",
    name: { en: "Today", fr: "Aujourd'hui", ar: "اليوم" },
    photo: EPOCH_PORTRAITS.today,
    filter: "brightness(1) saturate(1.1)",
    size: 70,
    borderClass: "border-amber-400",
    glowColor: "rgba(255,215,0,0.6)",
  },
];

// ─── Helper Epoch Classifier based on titles ───────────────────────────────

const getMemoryEpoch = (m: Memory): string => {
  if (m.id === "d1") return "childhood";
  if (m.id === "d2") return "youngAdult";
  if (m.id === "d3") return "teen";
  if (m.id === "d4") return "prime";
  if (m.id === "d5") return "today";
  if (m.id === "d6") return "today";

  const titleLower = m.title?.toLowerCase() || "";
  const descLower = m.description?.toLowerCase() || "";
  if (
    titleLower.includes("enfant") ||
    titleLower.includes("child") ||
    descLower.includes("enfance") ||
    descLower.includes("childhood") ||
    descLower.includes("bebé") ||
    descLower.includes("baby")
  )
    return "childhood";
  if (
    titleLower.includes("ado") ||
    titleLower.includes("teen") ||
    titleLower.includes("été") ||
    titleLower.includes("summer") ||
    titleLower.includes("école") ||
    titleLower.includes("school") ||
    titleLower.includes("19") ||
    titleLower.includes("bac")
  )
    return "teen";
  if (
    titleLower.includes("jeune") ||
    titleLower.includes("young") ||
    titleLower.includes("fac") ||
    titleLower.includes("univ") ||
    titleLower.includes("étudiant") ||
    titleLower.includes("student") ||
    titleLower.includes("diplome")
  )
    return "youngAdult";
  if (
    m.timeline === "forever" ||
    titleLower.includes("mariage") ||
    titleLower.includes("wedding") ||
    titleLower.includes("naissance") ||
    titleLower.includes("birth") ||
    titleLower.includes("fils") ||
    titleLower.includes("fille") ||
    titleLower.includes("mon cher")
  )
    return "prime";
  return "today";
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });

const tlStyle = (tl: string | null) => {
  if (tl === "forever")
    return { text: "Forever", bg: "rgba(147,51,234,0.15)", border: "rgba(147,51,234,0.3)", color: "#d8b4fe" };
  if (tl === "instant")
    return { text: "Now", bg: "rgba(56,189,248,0.15)", border: "rgba(56,189,248,0.3)", color: "#7dd3fc" };
  return { text: "Past", bg: "rgba(232,116,42,0.15)", border: "rgba(232,116,42,0.3)", color: "#fdbb74" };
};

// ─── Fetch function (for React Query Cache) ───────────────────────────────────

const fetchMemories = async (): Promise<{ memories: Memory[]; displayName: string; isLoggedIn: boolean }> => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    return { memories: DEMO, displayName: "M", isLoggedIn: false };
  }

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
    memories: mems && mems.length > 0 ? (mems as Memory[]) : DEMO,
    displayName: profile?.display_name || "M",
    isLoggedIn: true,
  };
};

// ─── Main Treasury Page ───────────────────────────────────────────────────────

const Treasure = () => {
  const navigate = useNavigate();
  const { t, lang, rtl } = useLanguage();

  const [activeTab, setActiveTab] = useState<ActiveTab>("all");
  const [selectedEpoch, setSelectedEpoch] = useState<string | null>(null);
  const [playerIdx, setPlayerIdx] = useState<number | null>(null);
  const [sparkCount, setSparkCount] = useState<number>(0);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  // Custom text translator function to add immense magical flavor beautifully
  const getTxt = (key: string): string => {
    const trans: Record<string, Record<string, string>> = {
      constellationView: {
        en: "Constellation Star Map",
        fr: "Voie Lactée des Mémoires",
        ar: "خريطة الكويكبات النجمية",
      },
      linearView: {
        en: "Chronological Chest",
        fr: "Grille du Coffre au Trésor",
        ar: "شبكة صندوق الكنز",
      },
      constellationSub: {
        en: "Your voice recordings suspended as glowing stars connected in eternity.",
        fr: "Vos enregistrements vocaux suspendus comme des étoiles brillantes et éternelles.",
        ar: "تسجيلاتك الصوتية معلقة كنجوم متوهجة في سماء الخلود الرقمي.",
      },
      tapToWhisper: {
        en: "Tap a glowing star to revive its memory...",
        fr: "Touchez un astre pour faire résonner un souvenir...",
        ar: "انقر على جرم متوهج لإيقاظ ذكراه الصوتية...",
      },
      vaultSecurity: {
        en: "Biometric and Quantum safehouse shielding activated.",
        fr: "Protection quantique et stockage crypté de pointe activés.",
        ar: "بروتوكول الحماية البيومترية والمستودع المشفر قيد التشغيل.",
      },
      starDustSpeed: {
        en: "Celestial Stardust Path",
        fr: "Sillage Temporel Scintillant",
        ar: "المسار النجمي العابر للزمن",
      },
      wisdomSubtitle: {
        en: "Every recorded confession of your family forms a star that guides the next generation.",
        fr: "Chaque recueil de votre histoire familiale forme une étoile guidant la génération future.",
        ar: "كل صوت عائلي موثق هنا ينسج شهاباً يضيء دروب أجيالنا القادمة.",
      },
      eterniteVoice: {
        en: "Voice of Eternity",
        fr: "Écho de l'Éternité",
        ar: "صدى الأبدية",
      },
      secretGardenTitle: {
        en: "Secret Garden",
        fr: "Jardin Secret",
        ar: "Jardin Secret",
      },
      secretGardenSub: {
        en: "Your most intimate whispers and private stories, cloaked in silent grace.",
        fr: "Vos récits les plus intimes et secrets bien gardés, enveloppés de tranquillité.",
        ar: "همساتك وقصصك الخاصة الأكثر حميمية، والمصونة بكامل الأمان والسرية.",
      },
      wisdomQuote: {
        en: "Stories are the threads that bind generations across eternity.",
        fr: "Les histoires sont des fils d'or tissés d'éternité qui relient les générations.",
        ar: "القصص هي حبال الذهب التي تربط الأجيال المتعاقبة عبر الأبدية.",
      },
    };
    return trans[key]?.[lang as "en" | "fr" | "ar"] ?? trans[key]?.["en"] ?? "";
  };

  const TABS = [
    { id: "all" as ActiveTab, label: t.tabAll },
    { id: "memories" as ActiveTab, label: t.tabMemories || "Memories" },
    { id: "forever" as ActiveTab, label: t.tabForever || "Forever" },
    { id: "video" as ActiveTab, label: t.tabVideo || "Video" },
    { id: "voices" as ActiveTab, label: t.tabVoices || "Voices" },
  ];

  // Load Sparks Client-Side token counter
  useEffect(() => {
    const balance = Number(localStorage.getItem("infeelit_spark_balance") || 0);
    setSparkCount(balance);
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ["memories"],
    queryFn: fetchMemories,
    staleTime: 30_000,
  });

  const memories = data?.memories ?? DEMO;
  const displayName = data?.displayName ?? "M";
  const isLoggedIn = data?.isLoggedIn ?? false;

  const filtered = memories.filter((m) => {
    // Advanced search by epoch
    if (selectedEpoch) {
      if (getMemoryEpoch(m) !== selectedEpoch) return false;
    }

    if (activeTab === "all") return true;
    if (activeTab === "memories") return m.timeline === "memories" || m.timeline === "past";
    if (activeTab === "forever") return m.timeline === "forever";
    if (activeTab === "video") return m.file_type === "video";
    if (activeTab === "voices") return m.file_type === "audio";
    return true;
  });

  const isDemoData = memories.length > 0 && memories[0].id.startsWith("d");
  const realMemoriesOnly = isDemoData ? [] : memories;
  const statVideos = realMemoriesOnly.filter((m) => m.file_type === "video").length;
  const statVoices = realMemoriesOnly.filter((m) => m.file_type === "audio").length;

  return (
    <div
      className="min-h-screen bg-[#FDF8F0] text-[#3D2B1F] pb-36 font-sans relative overflow-x-hidden select-none"
      dir={rtl ? "rtl" : "ltr"}
    >
      {/* Elegant linen thread and subtle paper grain overlays */}
      <style>{`
        @keyframes subtlePulse {
          0%, 100% { transform: scale(1); opacity: 0.2; }
          50% { transform: scale(1.05); opacity: 0.35; }
        }
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(2deg); }
        }
        @keyframes orbitCelestial {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes twinkleStar {
          0%, 100% { opacity: 0.25; transform: scale(0.9); }
          50% { opacity: 0.8; transform: scale(1.1); }
        }
        @keyframes audioWaveGlow {
          0%, 100% { height: 12px; }
          50% { height: 28px; }
        }
        .bg-nebula { animation: subtlePulse 14s ease-in-out infinite; }
        .cosmic-float { animation: floatSlow 6s ease-in-out infinite; }
        .celestial-compass { animation: orbitCelestial 60s linear infinite; }
        .twinkle-star-fast { animation: twinkleStar 4s ease-in-out infinite; }
        
        .paper-grain {
          background-image: radial-gradient(rgba(61, 43, 31, 0.035) 1px, transparent 1px);
          background-size: 24px 24px;
        }

        .polaroid-card {
          background: #FFFFFA;
          border: 1px solid rgba(139, 90, 43, 0.12);
          box-shadow: 0 4px 16px rgba(61, 43, 31, 0.05), 0 1px 2px rgba(61, 43, 15, 0.03);
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .polaroid-card:hover {
          transform: translateY(-6px) rotate(0deg) scale(1.02);
          box-shadow: 0 16px 32px rgba(61, 43, 31, 0.08), 0 2px 4px rgba(61, 43, 15, 0.04);
          border-color: rgba(232, 116, 42, 0.3);
        }

        .glass-metric {
          background: rgba(255, 255, 255, 0.65);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(139, 90, 43, 0.08);
          box-shadow: 0 4px 12px rgba(61, 43, 31, 0.02);
        }
        
        .fancy-scrollbar::-webkit-scrollbar {
          height: 4px;
        }
        .fancy-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(232, 116, 42, 0.2);
          border-radius: 99px;
        }
      `}</style>

      {/* Gentle Warm Sun-stains & Soft Lighting */}
      <div className="absolute inset-0 bg-nebula pointer-events-none z-0">
        <div className="absolute top-[3%] -right-24 w-96 h-96 rounded-full bg-amber-500/10 blur-[120px]" />
        <div className="absolute top-[35%] -left-32 w-[450px] h-[450px] rounded-full bg-[#E8742A]/5 blur-[140px]" />
        <div className="absolute bottom-[8%] right-10 w-80 h-80 rounded-full bg-orange-400/5 blur-[100px]" />
      </div>

      {/* Warm Grid & Paper Texture Backdrop */}
      <div className="absolute inset-x-0 top-0 h-[1200px] paper-grain pointer-events-none opacity-85 z-0" />

      {/* Floating Sparkles micro particles */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {[14, 38, 62, 25, 80].map((topVal, idx) => (
          <div
            key={idx}
            className="absolute twinkle-star-fast bg-[#E8742A]/25 rounded-full"
            style={{
              top: `${topVal}%`,
              left: `${((idx * 23) % 93) + 3}%`,
              width: `${(idx % 2) * 2 + 2}px`,
              height: `${(idx % 2) * 2 + 2}px`,
              animationDelay: `${idx * 0.9}s`,
            }}
          />
        ))}
      </div>

      {/* Modal Photo Player focus case */}
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

      {/* TOP CANVAS: Editorial Family Golden Header */}
      <div className="relative pt-14 pb-8 px-6 rounded-b-[42px] bg-gradient-to-b from-[#FFF9F2] via-[#FAF3E8] to-[#FDF8F0] border-b border-amber-900/5 overflow-hidden shadow-[0_12px_35px_rgba(61,43,31,0.03)] z-10">
        {/* Fine Line Astrolabe Map Layer */}
        <div className="absolute top-[-90px] -right-24 w-72 h-72 border border-amber-800/5 rounded-full pointer-events-none select-none celestial-compass flex items-center justify-center">
          <div className="w-56 h-56 border border-dashed border-amber-700/10 rounded-full flex items-center justify-center">
            <div className="w-40 h-40 border border-[#E8742A]/10 rounded-full" />
          </div>
        </div>

        {/* Back navigation */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-5 left-5 w-11 h-11 rounded-full bg-stone-900/5 border border-stone-800/10 flex items-center justify-center cursor-pointer hover:bg-stone-900/10 hover:border-stone-800/20 active:scale-95 transition-all text-[#3D2B1F]"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Sparks Floating Bezel */}
        <div className="absolute top-5 right-5 flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-amber-600/10 border border-amber-600/20 shadow-sm">
          <Sparkles className="w-4 h-4 text-[#E8742A] animate-pulse" />
          <span className="text-[10px] font-black text-amber-900 tracking-wider">✦ {sparkCount} SPARKS</span>
        </div>

        <p className="text-center text-[10px] font-black tracking-[0.3em] text-stone-500 uppercase mb-4 mt-2">
          {t.yourHaven}
        </p>

        {/* Dynamic Space Timelines Carousel */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative flex items-end justify-center gap-4 py-6 px-4 w-full">
            {/* Fine copper horizon timeline axis */}
            <div className="absolute bottom-[46px] left-8 right-8 h-[1px] bg-gradient-to-r from-amber-800/5 via-amber-600/35 to-amber-800/5 border-b border-dashed border-amber-500/25 pointer-events-none" />

            {LIFE_EPOCHS.map((epoch, i) => {
              const isSelected = selectedEpoch === epoch.id;
              const verticalShift = Math.abs(i - 2) * -3;

              return (
                <div
                  key={epoch.id}
                  style={{ transform: `translateY(${verticalShift}px)` }}
                  className="flex flex-col items-center transition-all duration-300 active:scale-95 cursor-pointer relative z-10"
                  onClick={() => setSelectedEpoch(isSelected ? null : epoch.id)}
                >
                  {/* Gentle warm ambient halo behind selected */}
                  {isSelected && (
                    <div
                      className="absolute -inset-2.5 rounded-full opacity-50 blur-md transition-all duration-500"
                      style={{ background: `radial-gradient(circle, rgba(232,116,42,0.3) 0%, transparent 70%)` }}
                    />
                  )}

                  <div
                    className={`relative rounded-full overflow-hidden transition-all duration-500 border-2 ${
                      isSelected
                        ? "border-[#E8742A] scale-115"
                        : "border-stone-200 opacity-80 hover:opacity-100 shadow-sm"
                    }`}
                    style={{
                      width: `${epoch.size}px`,
                      height: `${epoch.size}px`,
                      boxShadow: isSelected ? "0 0 16px rgba(232,116,42,0.25)" : "0 4px 10px rgba(61,43,31,0.06)",
                    }}
                  >
                    <img
                      src={epoch.photo}
                      alt={epoch.name[lang as "en" | "fr" | "ar"]}
                      className="w-full h-full object-cover object-top transition-transform duration-500"
                      style={{ filter: isSelected ? "none" : `${epoch.filter} brightness(1.05)` }}
                    />

                    {/* Subtle warm wash overlay */}
                    <div className="absolute inset-0 bg-amber-900/5 mix-blend-color-burn" />
                  </div>

                  {/* Epoch label */}
                  <span
                    className={`text-[8.5px] font-black tracking-widest mt-2 px-1 text-center transition-all ${
                      isSelected ? "text-[#E8742A] font-bold" : "text-[#3D2B1F]/50"
                    }`}
                  >
                    {epoch.name[lang as "en" | "fr" | "ar"]}
                  </span>

                  {/* Little star tag indicator */}
                  {isSelected && (
                    <div className="w-1 h-1 rounded-full bg-[#E8742A] mt-1 shadow-[0_0_8px_rgba(232,116,42,0.6)]" />
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-px bg-gradient-to-r from-transparent to-amber-700/20" />
            <span className="text-[9px] font-black tracking-[0.25em] text-stone-500 uppercase flex items-center gap-1.5">
              <Orbit className="w-3 h-3 text-[#E8742A] animate-spin" style={{ animationDuration: "20s" }} />
              {getTxt("starDustSpeed")}
            </span>
            <div className="w-10 h-px bg-gradient-to-l from-transparent to-amber-700/20" />
          </div>

          <h2 className="text-2xl font-serif font-semibold text-[#3D2B1F] mt-4 italic tracking-wide">
            @{displayName.toLowerCase().replace(/\s+/g, "_")}
          </h2>

          <p className="text-[10px] text-stone-500 text-center max-w-xs mt-1 italic tracking-normal px-4">
            "{getTxt("wisdomSubtitle")}"
          </p>
        </div>

        {/* Textured Warm Metrics Grid */}
        <div className="grid grid-cols-3 gap-2 px-1">
          {[
            { value: realMemoriesOnly.length, label: t.storiesPreserved, color: "text-[#E8742A]" },
            { value: statVideos, label: t.videoMoments, color: "text-amber-800" },
            { value: statVoices, label: t.voiceCaptures, color: "text-stone-700" },
          ].map((s, i) => (
            <div
              key={i}
              className="glass-metric rounded-2xl py-3 px-1 text-center group hover:border-[#E8742A]/35 hover:bg-white transition-all duration-300 shadow-sm"
            >
              <span className={`text-2xl font-black ${s.color} leading-none block`}>{s.value}</span>
              <span className="text-[8px] font-black tracking-widest text-stone-500 uppercase mt-1 block">
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {isDemoData && (
          <div className="mt-4 py-2 px-4 rounded-xl bg-amber-600/5 border border-amber-600/10 text-center flex items-center justify-center gap-1.5">
            <Sparkles className="w-3 h-3 text-[#E8742A]" />
            <p className="text-[10px] text-amber-900 font-bold">{t.previewMode}</p>
          </div>
        )}
      </div>

      {/* VIEW & TAB NAVIGATION CONTROLS */}
      <div className="px-5 mt-6 space-y-4 relative z-10">
        {/* Toggle between light cartography star map and Polaroid grid */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black tracking-widest text-stone-500 uppercase">
            {viewMode === "constellation" ? getTxt("constellationView") : getTxt("linearView")}
          </span>

          <div className="bg-stone-200/50 border border-stone-200/60 rounded-xl p-0.5 flex gap-1">
            <button
              onClick={() => {
                setViewMode("grid");
                toast.success(lang === "fr" ? "Affichage de l'Album Activé" : "Album View Activated");
              }}
              className={`p-2 rounded-lg cursor-pointer transition-all ${
                viewMode === "grid" ? "bg-[#E8742A] text-white shadow-sm" : "text-stone-500 hover:text-stone-800"
              }`}
              title="Album Table view"
            >
              <Layers className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                setViewMode("constellation");
                toast.success(
                  lang === "fr" ? "Constellations Célestes Activées" : "Celestial Constellations Activated",
                );
              }}
              className={`p-2 rounded-lg cursor-pointer transition-all ${
                viewMode === "constellation"
                  ? "bg-amber-800 text-white shadow-sm"
                  : "text-stone-500 hover:text-stone-800"
              }`}
              title="Compass View"
            >
              <Star className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Media Format filter tabs */}
        <div className="flex gap-2 overflow-x-auto hide-scroll pb-1.5 fancy-scrollbar">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`shrink-0 px-5 py-2.5 rounded-full text-xs font-bold transition-all border cursor-pointer ${
                activeTab === tab.id
                  ? "bg-[#E8742A] text-white border-transparent shadow-[0_4px_14px_rgba(232,116,42,0.25)] scale-102"
                  : "bg-white/65 text-stone-600 border-stone-200/60 hover:bg-white hover:text-[#3D2B1F]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* CORE TREASURE CHAMBERS (GRID LAYOUT VS CONSTELLATION MAP) */}
      <div className="px-5 mt-4 relative z-10">
        {/* MODE A: PARCHMENT GOLD CONSTELLATION COOP MAP */}
        {viewMode === "constellation" ? (
          <div className="space-y-4 animate-fade-in">
            {/* Descriptive message block */}
            <div
              className="glass-metric p-4 rounded-2xl flex items-center gap-3.5 border border-amber-500/10"
              style={{ background: "linear-gradient(135deg, rgba(254,251,246,0.9), rgba(246,238,225,0.95))" }}
            >
              <Compass className="w-8 h-8 text-[#E8742A] animate-pulse shrink-0" />
              <div>
                <p className="text-[11px] font-semibold text-stone-800 leading-relaxed">{getTxt("constellationSub")}</p>
                <p className="text-[9px] text-[#E8742A] mt-0.5 flex items-center gap-1 font-bold tracking-wider">
                  <Star className="w-2.5 h-2.5 fill-current animate-ping" />
                  {getTxt("tapToWhisper")}
                </p>
              </div>
            </div>

            {/* Light Parchment Celestial Chart */}
            <div
              className="relative w-full aspect-[4/5] sm:aspect-square rounded-3xl overflow-hidden border border-amber-700/15 flex flex-col justify-between p-4 shadow-[inset_0_0_35px_rgba(139,90,43,0.06)] bg-[#F8ECD6]"
              style={{
                background: "radial-gradient(ellipse at center, #F4E7CE 0%, #EDE0C3 100%)",
              }}
            >
              {/* Star-Grid elements */}
              <div className="absolute inset-0 bg-[radial-gradient(rgba(139,90,43,0.045)_1.5px,transparent_1.5px)] bg-[size:16px_16px] pointer-events-none" />

              {/* Draw fine golden connection orbits */}
              {filtered.length > 1 && (
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                  <defs>
                    <linearGradient id="astroParchmentLine" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#E8742A" stopOpacity="0.3" />
                      <stop offset="50%" stopColor="#b45309" stopOpacity="0.5" />
                      <stop offset="100%" stopColor="#854d0e" stopOpacity="0.3" />
                    </linearGradient>
                  </defs>
                  {/* Connect sequentially using clean micro lines */}
                  {filtered.map((item, keyIdx) => {
                    if (keyIdx === filtered.length - 1) return null;
                    const next = filtered[keyIdx + 1];

                    const x1 = `${18 + ((keyIdx * 45) % 68)}%`;
                    const y1 = `${12 + ((keyIdx * 32) % 64) + (keyIdx % 2) * 10}%`;
                    const x2 = `${18 + (((keyIdx + 1) * 45) % 68)}%`;
                    const y2 = `${12 + (((keyIdx + 1) * 32) % 64) + ((keyIdx + 1) % 2) * 10}%`;

                    return (
                      <g key={item.id}>
                        <line
                          x1={x1}
                          y1={y1}
                          x2={x2}
                          y2={y2}
                          stroke="url(#astroParchmentLine)"
                          strokeWidth="1.2"
                          strokeDasharray="4 3"
                        />
                        <circle cx={x1} cy={y1} r="2.5" fill="#E8742A" className="opacity-60" />
                      </g>
                    );
                  })}
                </svg>
              )}

              {/* Render memories as mini polaroid tokens inside star map */}
              <div className="absolute inset-0 z-10">
                {filtered.map((mem, idx) => {
                  const isAudio = mem.file_type === "audio";
                  const isFore = mem.timeline === "forever";
                  const x = `${18 + ((idx * 45) % 68)}%`;
                  const y = `${12 + ((idx * 32) % 64) + (idx % 2) * 10}%`;

                  return (
                    <button
                      key={mem.id}
                      onClick={() => setPlayerIdx(idx)}
                      className="absolute translate-x-[-50%] translate-y-[-50%] flex flex-col items-center group cursor-pointer"
                      style={{ left: x, top: y }}
                    >
                      {/* Aura */}
                      <div className="relative">
                        <div
                          className={`absolute inset-[-14px] rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 blur-sm bg-amber-600/10`}
                        />
                        <div
                          className="absolute inset-[-2px] rounded-full animate-ping opacity-20 bg-amber-600"
                          style={{ animationDuration: "6s" }}
                        />

                        {/* Celestial Portrait Token element */}
                        <div
                          className={`w-14 h-14 rounded-full overflow-hidden border-2 flex items-center justify-center p-0.5 shadow-md transition-all duration-300 group-hover:scale-120 group-hover:-rotate-3 border-stone-200/90 bg-[#FFFFF6]`}
                        >
                          {mem.thumbnail_url ? (
                            <img
                              src={mem.thumbnail_url}
                              alt=""
                              className="w-full h-full object-cover rounded-full filter sepia-[20%]"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center">
                              {isAudio ? (
                                <Volume2 className="w-5 h-5 text-[#E8742A]" />
                              ) : (
                                <Video className="w-5 h-5 text-amber-900" />
                              )}
                            </div>
                          )}
                        </div>

                        {/* Lock Status indicator */}
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#FFFFFA] border border-stone-200 flex items-center justify-center text-[10px] shadow-sm">
                          {mem.is_public ? (
                            <Globe className="w-2.5 h-2.5 text-[#E8742A]" />
                          ) : (
                            <Lock className="w-2.5 h-2.5 text-stone-400" />
                          )}
                        </div>
                      </div>

                      {/* Sticky paper-tag labels */}
                      <div className="mt-2 scale-90 group-hover:scale-100 opacity-80 group-hover:opacity-100 transition-all z-20 pointer-events-none">
                        <span className="px-1.5 py-0.5 rounded-md bg-[#FFFFFC] border border-stone-300/40 text-[9px] font-serif font-black tracking-wide text-[#3D2B1F] block max-w-[85px] truncate text-center shadow-xs">
                          {mem.title || `Story #${idx + 1}`}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Star chart footer metadata */}
              <div className="w-full mt-auto flex justify-between items-center z-25 relative bg-[#FFFFFB]/80 backdrop-blur-md p-2 rounded-xl border border-stone-300/20">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse" />
                  <span className="text-[8.5px] font-mono tracking-widest text-stone-500 font-bold">
                    COSMIC ATLAS v1.1
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[#E8742A]">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span className="text-[8px] font-black tracking-wider">{filtered.length} NODES</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* MODE B: CHRONOLOGICAL COFFRE AUX TRESORS GRID (POLAROID PHOTO TABLEAU) */
          <div className="grid grid-cols-2 gap-4 animate-fade-in pb-8">
            {/* SECRET GARDEN - INTENSE PRIVATE SANCTUARY CAROUSEL LINK */}
            <div
              className="col-span-2 relative group bg-[#FFF8EE] rounded-2xl p-5 border border-[#D4A853]/45 hover:border-[#D4A853]/90 hover:shadow-[0_8px_24px_rgba(212,168,83,0.12)] cursor-pointer transition-all duration-300 shadow-sm active:scale-[0.99] overflow-hidden"
              onClick={() => {
                toast.info(t.comingSoon || "Feature coming soon");
              }}
            >
              <div className="absolute inset-x-0 top-0 h-[1000px] paper-grain pointer-events-none opacity-40 animate-pulse" />

              <div className="relative z-10 flex items-center gap-4">
                <div className="w-13 h-13 rounded-2xl flex items-center justify-center bg-white border border-[#D4A853]/30 shadow-xs group-hover:scale-105 transition-all">
                  <Moon className="w-6 h-6 text-[#E8742A] fill-[#E8742A]/10" />
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-black text-[#3D2B1F] tracking-wider group-hover:text-[#E8742A] transition-colors uppercase flex items-center gap-1 font-serif">
                    {getTxt("secretGardenTitle")}
                    <Sparkles className="w-3.5 h-3.5 text-[#D4A853] animate-pulse" />
                  </h4>
                  <p className="text-[#3D2B1F]/60 text-[10px] leading-relaxed mt-1 font-mono">
                    {getTxt("secretGardenSub")}
                  </p>
                </div>

                <div className="p-1.5 px-2.5 rounded bg-amber-600/5 border border-[#D4A853]/35 text-[8px] font-black uppercase text-[#D4A853] select-none tracking-wider">
                  {lang === "ar" ? "مشفر" : "SILENT KEY"}
                </div>
              </div>
            </div>

            {/* EMPTY FAMILY BOX CASE */}
            {filtered.length === 0 ? (
              <div className="col-span-2 py-20 text-center glass-metric border border-dashed border-stone-300 rounded-3xl">
                <Hourglass className="w-12 h-12 mx-auto text-stone-300 mb-4 animate-spinPin" />
                <p className="text-stone-500 text-sm italic font-serif leading-relaxed px-4">{t.recordToFill}</p>
              </div>
            ) : (
              /* RENDER OF IMMACULATE POLAROID PHOTO CARDS */
              filtered.map((mem, idx) => {
                const tl = tlStyle(mem.timeline);
                const isAudio = mem.file_type === "audio";
                const isFore = mem.timeline === "forever";
                const mEpoch = getMemoryEpoch(mem);

                // Alternating elegant rotation angle for loose handmade collage aesthetic!
                const rotationStyle = idx % 2 === 0 ? "rotate-[-1.5deg]" : "rotate-[1.5deg]";

                return (
                  <div
                    key={mem.id}
                    onClick={() => setPlayerIdx(idx)}
                    className={`polaroid-card relative flex flex-col cursor-pointer ${rotationStyle} p-3 pb-6 rounded-none`}
                  >
                    {/* Visual Media Canvas Stage */}
                    <div className="relative aspect-square overflow-hidden bg-stone-100 flex items-center justify-center shadow-[inset_0_1px_5px_rgba(0,0,0,0.06)]">
                      {mem.thumbnail_url ? (
                        <img
                          src={mem.thumbnail_url}
                          alt=""
                          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 filter sepia-[10%] brightness-[1.02]`}
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-tr from-[#FAF3E8] to-[#FFFFFC] flex items-center justify-center">
                          <div className="opacity-40 group-hover:scale-110 transition-transform duration-300">
                            {isAudio ? (
                              <Volume2 className="w-10 h-10 text-stone-500" />
                            ) : (
                              <Video className="w-10 h-10 text-stone-500" />
                            )}
                          </div>
                        </div>
                      )}

                      {/* Delicate vignette for physical authenticity */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none" />

                      {/* Continuous Pulsing Waveform spectrograph overlay on Audio files */}
                      {isAudio && (
                        <div className="absolute inset-0 flex items-center justify-center gap-1 pb-4 pointer-events-none select-none">
                          {[18, 30, 16, 22, 38, 25, 12, 18, 28].map((h, k) => (
                            <div
                              key={k}
                              className={`w-[2px] rounded-full`}
                              style={{
                                height: `${h}px`,
                                backgroundColor: isFore ? "#9333EA" : "#E8742A",
                                opacity: 0.8,
                                animationDuration: `${0.7 + (k % 3) * 0.25}s`,
                                animationDelay: `${k * 0.05}s`,
                              }}
                            />
                          ))}
                        </div>
                      )}

                      {/* Beautiful Retro play circle */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 bg-black/10 pointer-events-none">
                        <div className="w-10 h-10 rounded-full bg-[#E8742A] flex items-center justify-center shadow-md animate-zoom-in">
                          <Play className="w-4 h-4 text-white fill-white ml-[1px]" />
                        </div>
                      </div>

                      {/* Top timeline capsule pill */}
                      <div className="absolute top-2 left-2 z-10">
                        <span
                          className="px-2 py-0.5 rounded-full text-[7px] font-black tracking-wider uppercase border text-center block bg-white"
                          style={{
                            borderColor: tl.border,
                            color: tl.color === "#d8b4fe" ? "#9333EA" : tl.color === "#7dd3fc" ? "#0284c7" : "#c2410c",
                          }}
                        >
                          {tl.text}
                        </span>
                      </div>

                      {/* Top Right Privacy lock status bubble */}
                      <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/90 backdrop-blur-md border border-stone-200 flex items-center justify-center z-10 shadow-xs">
                        {mem.is_public ? (
                          <Globe className="w-3 h-3 text-[#E8742A]" />
                        ) : (
                          <Lock className="w-3 h-3 text-stone-400" />
                        )}
                      </div>

                      {/* Little custom Epoch icon in corner */}
                      <div className="absolute bottom-2 left-2 px-1.5 py-0.5 bg-white/90 backdrop-blur-xs rounded-md border border-stone-200 text-[6.5px] font-black uppercase text-stone-500 tracking-wider">
                        {mEpoch}
                      </div>
                    </div>

                    {/* Metadata Subdescriptions panel - Structured Polaroid Bottom Edge */}
                    <div className="pt-4 flex-1 flex flex-col justify-between">
                      <div>
                        {/* Elegant italic display handwriting substitute */}
                        <h4 className="text-sm font-semibold font-serif text-[#3D2B1F] tracking-tight leading-snug group-hover:text-[#E8742A] transition-colors line-clamp-1">
                          {mem.title || "Untitled Story"}
                        </h4>

                        {mem.description && (
                          <p className="text-[10px] text-stone-500 italic leading-relaxed mt-1 line-clamp-2">
                            "{mem.description}"
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-stone-100">
                        <div className="flex items-center gap-1.5 text-stone-400 text-[9px] font-medium">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(mem.created_at)}</span>
                        </div>

                        <div
                          className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-black uppercase bg-stone-100 text-[#3D2B1F]/70`}
                        >
                          {isAudio ? <Volume2 className="w-2.5 h-2.5" /> : <Video className="w-2.5 h-2.5" />}
                          <span>{isAudio ? t.voiceLabel : t.videoLabel}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* FOOTER EPITAPH MESSAGE: "Echo of Eternity" */}
      <div className="mt-8 mb-8 text-center px-6 relative z-10 max-w-xs mx-auto">
        <div className="w-8 h-px bg-gradient-to-r from-transparent via-amber-800/30 to-transparent mx-auto mb-3" />
        <p className="text-[8.5px] uppercase tracking-[0.25em] text-stone-450 font-bold block mb-1">
          {getTxt("eterniteVoice")}
        </p>
        <p className="text-[9.5px] text-stone-500 italic font-serif leading-relaxed">"{getTxt("wisdomQuote")}"</p>
      </div>

      {/* FIXED FLOATING CORE PRESERVE ACTION */}
      <div className="fixed bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-[#FDF8F0] via-[#FDF8F0]/95 to-transparent z-40">
        <button
          onClick={() => navigate("/record")}
          className="w-full py-[18px] rounded-2xl font-bold text-base bg-gradient-to-r from-[#E8742A] to-[#D4621A] text-white flex items-center justify-center gap-2.5 shadow-[0_10px_25px_rgba(232,116,42,0.3)] cursor-pointer transition-transform hover:scale-[1.01] active:scale-[0.98] border-none"
        >
          <Mic className="w-5 h-5" />
          <span>{t.preserveStory}</span>
        </button>
      </div>
    </div>
  );
};

// ─── Modal Portrayed Memory Player Overhaul ────────────────────────────────────

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
  const { t, lang } = useLanguage();
  const tl = tlStyle(memory.timeline);
  const isAudio = memory.file_type === "audio";
  const isDemo = memory.id.startsWith("d");

  // Local helper for localized types
  const getFormatLabel = () => {
    if (isAudio) return lang === "fr" ? "DOCUMENT AUDIO NUMÉRIQUE" : "DIGITAL VOICE DOCUMENT";
    return lang === "fr" ? "SOUVENIR VIDÉO SÉCURISÉ" : "SECURE FAMILY FOOTAGE";
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center p-5 bg-black/95 backdrop-blur-xl animate-fade-in"
      onClick={onClose}
    >
      {/* Background magical ambient light inside player */}
      <div className="absolute w-72 h-72 rounded-full bg-[#E8742A]/10 blur-[90px] pointer-events-none select-none" />

      <div
        className="w-full max-w-sm bg-[#090e15] rounded-3xl overflow-hidden shadow-[0_30px_90px_rgba(0,0,0,0.85),0_0_0_1px_rgba(255,255,255,0.08)] border border-white/[0.06] animate-zoom-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Visual Header stage */}
        <div className="relative aspect-[4/5] bg-black flex items-center justify-center overflow-hidden">
          {!isDemo && memory.file_url && memory.file_type === "video" ? (
            <video src={memory.file_url} controls className="w-full h-full object-cover" />
          ) : memory.thumbnail_url && !isAudio ? (
            <img src={memory.thumbnail_url} alt="" className="w-full h-full object-cover object-center" />
          ) : isAudio && !isDemo && memory.file_url ? (
            <audio src={memory.file_url} controls className="w-[85%] relative z-10" />
          ) : isAudio ? (
            /* Interactive Pulsing Star-Dust Audio Spectrograph */
            <div className="relative w-full h-full flex flex-col items-center justify-center p-8 bg-[radial-gradient(ellipse_at_center,rgba(25,14,40,0.6)_0%,transparent_75%)]">
              <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/25 flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(245,158,11,0.15)]">
                <Volume2 className="w-7 h-7 text-amber-500 animate-pulse" />
              </div>

              <div className="flex items-center gap-1.5 h-16 relative z-10">
                {Array.from({ length: 24 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-[3px] rounded-full bg-amber-500/80"
                    style={{
                      height: `${14 + Math.sin(i * 0.45) * 20 + Math.cos(i * 0.25) * 8}px`,
                      animation: "audioWaveGlow 2s ease-in-out infinite",
                      animationDuration: `${0.8 + (i % 4) * 0.2}s`,
                      animationDelay: `${i * 0.03}s`,
                    }}
                  />
                ))}
              </div>

              <span className="text-[8px] font-mono tracking-[0.2em] text-amber-500/50 uppercase mt-4 block">
                CYBERNETIC AUDIO ARCHIVE
              </span>
            </div>
          ) : (
            <Video className="w-12 h-12 text-white/10" />
          )}

          {/* Vignette Shadowing */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent pointer-events-none" />

          {/* Timeline Badge */}
          <div className="absolute top-4 left-4">
            <span
              className="px-3 py-1 rounded-full text-[9px] font-black tracking-widest uppercase border"
              style={{
                backgroundColor: tl.bg,
                borderColor: tl.border,
                color: tl.color,
                textShadow: `0 0 6px ${tl.color}`,
              }}
            >
              {tl.text}
            </span>
          </div>

          {/* Privacy Badge */}
          <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10">
            {memory.is_public ? (
              <Globe className="w-3.5 h-3.5 text-sky-400" />
            ) : (
              <Lock className="w-3.5 h-3.5 text-amber-500" />
            )}
          </div>
        </div>

        {/* Subtitles & Descriptions */}
        <div className="p-6 bg-gradient-to-b from-[#090e15] to-[#040810]">
          <div className="text-[8px] font-black font-mono tracking-widest text-white/30 uppercase mb-2 block">
            {getFormatLabel()}
          </div>

          <h3 className="text-xl font-bold font-serif text-white tracking-wide leading-snug">
            {memory.title || "Untitled Memory"}
          </h3>

          {memory.description && (
            <p className="text-white/60 text-sm mt-3.5 font-medium italic leading-relaxed pl-3.5 border-l border-amber-500/30">
              "{memory.description}"
            </p>
          )}

          <div className="flex items-center gap-2 mt-5 text-white/35 text-xs">
            <Calendar className="w-3.5 h-3.5 text-[#E8742A]" />
            <span>{formatDate(memory.created_at)}</span>
            <span className="text-white/10">•</span>
            <span className="text-[9px] font-mono whitespace-nowrap">ID: {memory.id}</span>
          </div>
        </div>

        {/* Custom audio controls wrapper */}
        <div className="flex border-t border-white/[0.04]">
          {[
            { icon: <ChevronLeft className="w-6 h-6" />, action: onPrev, enabled: hasPrev },
            { icon: <X className="w-5 h-5" />, action: onClose, enabled: true },
            { icon: <ChevronRight className="w-6 h-6" />, action: onNext, enabled: hasNext },
          ].map((btn, i) => (
            <button
              key={i}
              onClick={btn.action}
              disabled={!btn.enabled}
              className={`flex-1 py-5 flex items-center justify-center bg-transparent border-none transition-all hover:bg-white/[0.03] active:bg-white/[0.05] ${
                i < 2 ? "border-r border-white/5" : ""
              } ${btn.enabled ? "cursor-pointer text-white/60 hover:text-[#E8742A]" : "opacity-15 pointer-events-none"}`}
            >
              {btn.icon}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Treasure;
