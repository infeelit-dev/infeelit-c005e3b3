import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Copy, Check, Mic, Play, Volume2, Video } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import useUserName from "@/hooks/useUserName";

import grandfatherImg from "@/assets/grandfather.jpg";
import marryImg from "@/assets/marry.jpg";
import loveImg from "@/assets/love.jpg";
import relaxImg from "@/assets/relax.jpg";
import birthImg from "@/assets/birth.jpg";
import picnicImg from "@/assets/picnic.jpg";
import travelImg from "@/assets/travel.jpg";
import childImg from "@/assets/child.jpg";
import houseImg from "@/assets/house.jpg";
import graduateImg from "@/assets/graduate.jpg";

interface Memory {
  id: string;
  title: string | null;
  file_url: string;
  file_type: string | null;
  thumbnail_url: string | null;
  created_at: string;
}

type FilterType = "all" | "voices" | "moments" | "chronicles";
type SphereMode = "question" | "memory";

interface DemoMember {
  id: string;
  name: string;
  subtitle: string;
  photo: string;
  hasNew: boolean;
  isPet: boolean;
  leftPct: number;
  topPct: number;
  sizePct: number;
  float: string;
  delay: string;
}

const DEMO_MEMBERS: DemoMember[] = [
  {
    id: "sophia",
    name: "Sophia",
    subtitle: "12 voices",
    photo: marryImg,
    hasNew: true,
    isPet: false,
    leftPct: 4.9,
    topPct: 4.7,
    sizePct: 21.6,
    float: "mf-a",
    delay: "0s",
  },
  {
    id: "lucas",
    name: "Lucas",
    subtitle: "8 voices",
    photo: loveImg,
    hasNew: true,
    isPet: false,
    leftPct: 68.1,
    topPct: 2.4,
    sizePct: 20.3,
    float: "mf-b",
    delay: "1.3s",
  },
  {
    id: "elena",
    name: "Elena",
    subtitle: "8 moments",
    photo: relaxImg,
    hasNew: true,
    isPet: false,
    leftPct: 82.4,
    topPct: 27.1,
    sizePct: 18.9,
    float: "mf-c",
    delay: "0.6s",
  },
  {
    id: "marco",
    name: "Marco",
    subtitle: "5 moments",
    photo: houseImg,
    hasNew: false,
    isPet: false,
    leftPct: 1.1,
    topPct: 28.2,
    sizePct: 17.8,
    float: "mf-a",
    delay: "2.1s",
  },
  {
    id: "nadia",
    name: "Nadia",
    subtitle: "5 moments",
    photo: birthImg,
    hasNew: false,
    isPet: false,
    leftPct: 78.4,
    topPct: 51,
    sizePct: 16.8,
    float: "mf-b",
    delay: "0.9s",
  },
  {
    id: "thomas",
    name: "Thomas",
    subtitle: "3 voices",
    photo: picnicImg,
    hasNew: false,
    isPet: false,
    leftPct: 1.6,
    topPct: 52.2,
    sizePct: 16.2,
    float: "mf-c",
    delay: "1.8s",
  },
  {
    id: "sara",
    name: "Sara",
    subtitle: "6 moments",
    photo: graduateImg,
    hasNew: true,
    isPet: false,
    leftPct: 41.1,
    topPct: 0.8,
    sizePct: 16.8,
    float: "mf-a",
    delay: "3s",
  },
  {
    id: "adam",
    name: "Adam",
    subtitle: "4 voices",
    photo: travelImg,
    hasNew: false,
    isPet: false,
    leftPct: 79.5,
    topPct: 70.2,
    sizePct: 15.7,
    float: "mf-b",
    delay: "2.4s",
  },
  {
    id: "lea",
    name: "Léa",
    subtitle: "2 moments",
    photo: birthImg,
    hasNew: false,
    isPet: false,
    leftPct: 2.2,
    topPct: 71,
    sizePct: 15.1,
    float: "mf-c",
    delay: "1.1s",
  },
  {
    id: "max",
    name: "Max",
    subtitle: "3 moments",
    photo: childImg,
    hasNew: false,
    isPet: true,
    leftPct: 53,
    topPct: 72.2,
    sizePct: 16.2,
    float: "mf-a",
    delay: "0.4s",
  },
];

const BG_BUBBLES = [
  { photo: grandfatherImg, size: 64, x: 2, y: 6, anim: "bg-s", delay: "0s", op: 0.13 },
  { photo: loveImg, size: 48, x: 78, y: 8, anim: "bg-m", delay: "1.5s", op: 0.11 },
  { photo: travelImg, size: 38, x: 88, y: 52, anim: "bg-s", delay: "3s", op: 0.1 },
  { photo: graduateImg, size: 52, x: 58, y: 82, anim: "bg-m", delay: "2s", op: 0.12 },
  { photo: picnicImg, size: 30, x: 82, y: 26, anim: "bg-s", delay: "4s", op: 0.09 },
  { photo: relaxImg, size: 42, x: 4, y: 70, anim: "bg-m", delay: "0.8s", op: 0.1 },
  { photo: houseImg, size: 34, x: 44, y: 90, anim: "bg-s", delay: "1.3s", op: 0.08 },
  { photo: marryImg, size: 44, x: 66, y: 42, anim: "bg-m", delay: "2.6s", op: 0.09 },
  { photo: childImg, size: 28, x: 18, y: 88, anim: "bg-s", delay: "3.5s", op: 0.07 },
];

const DEMO_SHELF = [
  {
    id: "s1",
    memberName: "Lucas",
    title: "The day of the exam",
    duration: "2 min",
    type: "video",
    thumbnail: travelImg,
    photo: loveImg,
    timeAgo: "2h",
  },
  {
    id: "s2",
    memberName: "Elena",
    title: "The tajine recipe",
    duration: "4 min",
    type: "audio",
    thumbnail: picnicImg,
    photo: relaxImg,
    timeAgo: "5h",
  },
  {
    id: "s3",
    memberName: "Sophia",
    title: "Summer of 1987",
    duration: "3 min",
    type: "video",
    thumbnail: graduateImg,
    photo: marryImg,
    timeAgo: "1d",
  },
  {
    id: "s4",
    memberName: "Sara",
    title: "My first day at uni",
    duration: "2 min",
    type: "audio",
    thumbnail: houseImg,
    photo: graduateImg,
    timeAgo: "2d",
  },
];

const fetchMemories = async (): Promise<Memory[]> => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return [];
  const { data: mems } = await supabase
    .from("memories")
    .select("*")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false })
    .limit(10);
  return (mems as Memory[]) || [];
};

const Circle = () => {
  const navigate = useNavigate();
  const { t, lang, rtl } = useLanguage();
  const userName = useUserName();
  const sphereTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [copied, setCopied] = useState(false);
  const [sphereMode, setSphereMode] = useState<SphereMode>("question");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [seenMembers, setSeenMembers] = useState<Set<string>>(new Set());
  const [circleCode, setCircleCode] = useState("");
  const [showGroupImport, setShowGroupImport] = useState(false);
  const [groupNames, setGroupNames] = useState("");
  const [generatedMessage, setGeneratedMessage] = useState("");

  const { data: memories = [] } = useQuery({ queryKey: ["memories"], queryFn: fetchMemories, staleTime: 30_000 });

  const FILTERS: { id: FilterType; label: string }[] = [
    { id: "all", label: t.tabAll },
    { id: "voices", label: t.tabVoices },
    { id: "moments", label: t.tabVideo },
    { id: "chronicles", label: "📖 Chronicles" },
  ];

  // Charger le code d'invitation du cercle
  useEffect(() => {
    const loadCircleCode = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) return;

      // Récupérer le premier cercle de l'utilisateur
      const { data: memberships } = await supabase
        .from("circle_members")
        .select("circle_id")
        .eq("user_id", session.user.id)
        .limit(1);

      if (!memberships?.length) return;

      const circleId = memberships[0].circle_id;
      const { data: code } = await supabase.rpc("get_circle_invite_code", { _circle_id: circleId });
      if (code) setCircleCode(code);
    };
    loadCircleCode();
  }, []);

  useEffect(() => {
    sphereTimerRef.current = setInterval(() => {
      setSphereMode((p) => (p === "question" ? "memory" : "question"));
    }, 6000);
    return () => {
      if (sphereTimerRef.current) clearInterval(sphereTimerRef.current);
    };
  }, []);

  const handleCopyLink = () => {
    navigator.clipboard.writeText("https://infeelit.com/join/demo");
    setCopied(true);
    toast.success(t.comingSoon);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    const msg = `Join our Family Circle on Infeelit 🕯️\nhttps://infeelit.com/join/demo`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const generateGroupMessage = () => {
    const names = groupNames
      .split(/[,;\n]+/)
      .map((n) => n.trim())
      .filter((n) => n.length > 0);

    if (names.length === 0) return;

    const inviteUrl = `infeelit.com/join/${circleCode || "demo"}`;

    const displayed = names.slice(0, 3);
    const remaining = names.length - 3;

    let namesPart = "";
    if (names.length === 1) {
      namesPart = displayed[0];
    } else if (names.length === 2) {
      namesPart = `${displayed[0]} et ${displayed[1]}`;
    } else if (names.length === 3) {
      namesPart = `${displayed[0]}, ${displayed[1]} et ${displayed[2]}`;
    } else {
      namesPart = `${displayed[0]}, ${displayed[1]}, ${displayed[2]} et ${remaining} autre${remaining > 1 ? "s" : ""}`;
    }

    const msg =
      lang === "fr"
        ? `${namesPart} — votre espace famille vous attend sur Infeelit.\n\n${userName || "Quelqu'un que tu aimes"} a créé un sanctuaire pour préserver vos souvenirs ensemble.\n\nRejoignez-nous maintenant 👇\n${inviteUrl}`
        : lang === "ar"
          ? `${namesPart} — مساحة عائلتكم تنتظركم على Infeelit.\n\n${userName || "شخص تحبه"} أنشأ مكاناً للحفاظ على ذكرياتكم معاً.\n\nانضموا إلينا الآن 👇\n${inviteUrl}`
          : `${namesPart} — your family space is waiting for you on Infeelit.\n\n${userName || "Someone you love"} created a sanctuary to preserve your memories together.\n\nJoin us now 👇\n${inviteUrl}`;

    setGeneratedMessage(msg);
  };

  const latestMem = memories[0] ?? null;

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-x-hidden"
      dir={rtl ? "rtl" : "ltr"}
      style={{
        background: "radial-gradient(ellipse at 50% 36%, #F5E6CC 0%, #D2B48C 100%)",
        backgroundColor: "#D2B48C",
        fontFamily: lang === "ar" ? "'Noto Sans Arabic', Arial, sans-serif" : "inherit",
      }}
    >
      <style>{`
        @keyframes bgS { 0%{transform:translate(0,0);} 20%{transform:translate(35px,-45px);} 40%{transform:translate(58px,10px);} 60%{transform:translate(40px,55px);} 80%{transform:translate(-12px,35px);} 100%{transform:translate(0,0);} }
        @keyframes bgM { 0%{transform:translate(0,0);} 20%{transform:translate(-42px,-32px);} 40%{transform:translate(-60px,20px);} 60%{transform:translate(-38px,60px);} 80%{transform:translate(10px,42px);} 100%{transform:translate(0,0);} }
        @keyframes mfA { 0%,100%{transform:translate(0,0);} 20%{transform:translate(12px,-18px);} 40%{transform:translate(22px,-4px);} 60%{transform:translate(14px,16px);} 80%{transform:translate(-5px,10px);} }
        @keyframes mfB { 0%,100%{transform:translate(0,0);} 20%{transform:translate(-16px,-13px);} 40%{transform:translate(-22px,10px);} 60%{transform:translate(-12px,20px);} 80%{transform:translate(6px,14px);} }
        @keyframes mfC { 0%,100%{transform:translate(0,0);} 20%{transform:translate(18px,13px);} 40%{transform:translate(8px,-20px);} 60%{transform:translate(-14px,-10px);} 80%{transform:translate(-8px,8px);} }
        @keyframes goldRing { 0%,100%{box-shadow:0 0 0 3px rgba(255,200,50,.95),0 0 14px rgba(255,170,0,.6);} 50%{box-shadow:0 0 0 4px rgba(255,225,80,1),0 0 24px rgba(255,200,0,.9);} }
        @keyframes spherePulse { 0%,100%{box-shadow:0 0 36px rgba(255,185,60,.55),0 0 70px rgba(232,116,42,.28);} 50%{box-shadow:0 0 65px rgba(255,210,80,.85),0 0 115px rgba(232,116,42,.48);} }
        @keyframes frameHalo { 0%,100%{box-shadow:0 0 16px rgba(251,191,36,.42),0 0 32px rgba(251,191,36,.18);} 50%{box-shadow:0 0 26px rgba(251,191,36,.68),0 0 50px rgba(251,191,36,.32);} }
        @keyframes flameBurn { 0%{transform:scaleX(1) scaleY(1) skewX(0deg) translateY(0px);opacity:1;} 14%{transform:scaleX(.87) scaleY(1.13) skewX(-4deg) translateY(-2px);opacity:.82;} 28%{transform:scaleX(1.10) scaleY(.90) skewX(3deg) translateY(.6px);opacity:1;} 42%{transform:scaleX(.92) scaleY(1.08) skewX(-2.5deg) translateY(-2.5px);opacity:.87;} 57%{transform:scaleX(1.07) scaleY(.93) skewX(4deg) translateY(.8px);opacity:.96;} 71%{transform:scaleX(.94) scaleY(1.06) skewX(-3deg) translateY(-1px);opacity:.9;} 85%{transform:scaleX(1.04) scaleY(.96) skewX(1deg) translateY(0px);opacity:.95;} 100%{transform:scaleX(1) scaleY(1) skewX(0deg) translateY(0px);opacity:1;} }
        @keyframes candleGlow { 0%,100%{box-shadow:0 -5px 12px rgba(255,130,0,.55),0 0 26px rgba(255,90,0,.25);} 50%{box-shadow:0 -5px 22px rgba(255,155,0,.88),0 0 42px rgba(255,120,0,.44);} }
        .bg-s{animation:bgS 20s ease-in-out infinite;}
        .bg-m{animation:bgM 15s ease-in-out infinite;}
        .mf-a{animation:mfA 8s ease-in-out infinite;}
        .mf-b{animation:mfB 10s ease-in-out infinite;}
        .mf-c{animation:mfC 12s ease-in-out infinite;}
        .gold-ring{animation:goldRing 2s ease-in-out infinite;}
        .sphere-glow{animation:spherePulse 3s ease-in-out infinite;}
        .frame-halo{animation:frameHalo 4s ease-in-out infinite;}
        .flame{animation:flameBurn 1.75s ease-in-out infinite;transform-origin:bottom center;}
        .candle-body{animation:candleGlow 2.3s ease-in-out infinite;}
        .hide-scroll{scrollbar-width:none;}
        .hide-scroll::-webkit-scrollbar{display:none;}
      `}</style>

      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {BG_BUBBLES.map((b, i) => (
          <div
            key={i}
            className={`absolute ${b.anim}`}
            style={{ left: `${b.x}%`, top: `${b.y}%`, animationDelay: b.delay }}
          >
            <div
              style={{
                width: `${b.size}px`,
                height: `${b.size}px`,
                borderRadius: "50%",
                overflow: "hidden",
                border: "1px solid rgba(212,175,55,.18)",
                opacity: b.op,
              }}
            >
              <img
                src={b.photo}
                alt=""
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: "center top",
                  filter: "sepia(.9) brightness(.76) contrast(.88)",
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="relative z-10 flex items-center justify-between px-5 pt-14 pb-2">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full"
          style={{ backgroundColor: "rgba(61,43,26,.12)", color: "#3D2B1A" }}
        >
          ←
        </button>
        <div className="text-center">
          <h1 className="font-bold text-lg font-serif" style={{ color: "#3D2B1A" }}>
            {lang === "ar" ? "دوائري" : lang === "fr" ? "Mes Cercles" : "My Circles"}
          </h1>
          <p className="text-[10px] uppercase tracking-widest" style={{ color: "rgba(61,43,26,.42)" }}>
            {t.ourCircle} · 12 members
          </p>
        </div>
        <div
          className="px-3 py-1 rounded-full text-[10px] font-bold"
          style={{
            backgroundColor: "rgba(107,78,155,.13)",
            border: "1px solid rgba(107,78,155,.36)",
            color: "#6B4E9B",
          }}
        >
          {t.privateLabel}
        </div>
      </div>

      <div className="relative mx-auto z-10 w-full max-w-[90vw] aspect-[3.7/5.1] max-h-[55vh]">
        {[108, 132, 156].map((r, i) => (
          <div
            key={i}
            className="absolute rounded-full pointer-events-none"
            style={{
              width: `${((r * 2) / 370) * 100}%`,
              height: `${((r * 2) / 510) * 100}%`,
              left: `${((185 - r) / 370) * 100}%`,
              top: `${((198 - r) / 510) * 100}%`,
              border: `1px solid rgba(139,90,43,${0.08 + i * 0.04})`,
            }}
          />
        ))}

        <div
          className="absolute sphere-glow"
          style={{
            width: `${(132 / 370) * 100}%`,
            height: `${(132 / 510) * 100}%`,
            left: `${(119 / 370) * 100}%`,
            top: `${(132 / 510) * 100}%`,
            borderRadius: "50%",
            background:
              "radial-gradient(circle at 38% 35%, rgba(255,228,115,.98), rgba(232,116,42,.9), rgba(175,90,10,.72))",
            border: "2.5px solid rgba(255,200,70,.88)",
            cursor: "pointer",
            zIndex: 6,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "14px",
            overflow: "hidden",
          }}
          onClick={() => (latestMem ? navigate("/treasure") : navigate("/record"))}
        >
          {sphereMode === "question" ? (
            <>
              <p
                style={{
                  fontSize: "6px",
                  fontWeight: 900,
                  letterSpacing: ".12em",
                  color: "rgba(255,255,255,.7)",
                  textTransform: "uppercase",
                  marginBottom: "4px",
                  textAlign: "center",
                }}
              >
                {t.thisWeek}
              </p>
              <p style={{ fontSize: "9px", fontWeight: 700, color: "#fff", lineHeight: 1.38, textAlign: "center" }}>
                {lang === "ar"
                  ? "ما هو أجمل درس في الشجاعة تعلمته من والدك؟"
                  : lang === "fr"
                    ? "Quelle est la plus belle leçon de courage de votre père ?"
                    : "What is the most beautiful lesson of courage your father gave you?"}
              </p>
            </>
          ) : (
            <>
              <Play size={20} style={{ color: "#fff", marginBottom: "4px" }} />
              <p style={{ fontSize: "9px", fontWeight: 700, color: "#fff", lineHeight: 1.3, textAlign: "center" }}>
                {latestMem?.title ?? "Lucas · 2h ago"}
              </p>
              <p style={{ fontSize: "7px", color: "rgba(255,255,255,.6)", marginTop: "3px", textAlign: "center" }}>
                {t.latestMemory}
              </p>
            </>
          )}
          <div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{ background: "linear-gradient(135deg,rgba(255,255,255,.26) 0%,transparent 55%)" }}
          />
        </div>

        {DEMO_MEMBERS.map((m) => {
          const isNew = m.hasNew && !seenMembers.has(m.id);
          return (
            <div
              key={m.id}
              className={`absolute ${m.float}`}
              style={{
                left: `${m.leftPct}%`,
                top: `${m.topPct}%`,
                width: `${m.sizePct}%`,
                maxWidth: "80px",
                zIndex: 5,
                cursor: "pointer",
                animationDelay: m.delay,
              }}
              onClick={() => {
                setSeenMembers((prev) => new Set([...prev, m.id]));
                toast.info(t.memberJournal);
              }}
            >
              <div
                className={isNew ? "gold-ring" : ""}
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  overflow: "hidden",
                  position: "relative",
                  border: m.isPet
                    ? "2.5px solid rgba(232,116,42,.75)"
                    : isNew
                      ? "none"
                      : "2.5px solid rgba(255,255,255,.62)",
                  boxShadow: "0 4px 14px rgba(0,0,0,.16)",
                }}
              >
                <img
                  src={m.photo}
                  alt={m.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    objectPosition: "center top",
                    filter: m.isPet ? "saturate(1.35) brightness(1.06)" : "none",
                  }}
                />
                <div
                  className="absolute inset-0 rounded-full"
                  style={{ background: "linear-gradient(135deg,rgba(255,255,255,.18) 0%,transparent 55%)" }}
                />
                {m.isPet && (
                  <div
                    className="absolute bottom-0.5 right-0.5 rounded-full flex items-center justify-center"
                    style={{
                      width: "20px",
                      height: "20px",
                      backgroundColor: "#E8742A",
                      border: "2px solid #F5E6CC",
                      fontSize: "10px",
                    }}
                  >
                    🐾
                  </div>
                )}
                {isNew && (
                  <div
                    className="absolute top-0.5 right-0.5 rounded-full"
                    style={{
                      width: "10px",
                      height: "10px",
                      backgroundColor: "#FFD700",
                      border: "2px solid #F5E6CC",
                      boxShadow: "0 0 6px rgba(255,210,0,.85)",
                    }}
                  />
                )}
              </div>
              <p
                style={{
                  fontSize: "8.5px",
                  fontWeight: 700,
                  color: "#3D2B1A",
                  textAlign: "center",
                  marginTop: "3px",
                  textShadow: "0 1px 2px rgba(255,255,255,.75)",
                }}
              >
                {m.name}
              </p>
              <p style={{ fontSize: "7px", color: "rgba(61,43,26,.48)", textAlign: "center", lineHeight: 1.1 }}>
                {m.subtitle}
              </p>
            </div>
          );
        })}

        <div className="absolute" style={{ left: `${(6 / 370) * 100}%`, bottom: "0px", zIndex: 7 }}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: "8px", paddingLeft: "8px" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div
                className="frame-halo"
                style={{
                  width: `${(68 / 370) * 100}%`,
                  maxWidth: "68px",
                  height: `${(88 / 510) * 100}%`,
                  maxHeight: "88px",
                  borderRadius: "3px",
                  border: "4px solid rgba(184,142,32,.92)",
                  boxShadow:
                    "inset 0 0 0 2px rgba(255,220,80,.52), inset 0 0 0 5px rgba(110,72,8,.42), 0 0 28px rgba(251,191,36,.5)",
                  overflow: "hidden",
                  cursor: "pointer",
                  backgroundColor: "#4A2E0A",
                  position: "relative",
                }}
                onClick={() => toast.info(t.grandfatherVoice)}
              >
                <img
                  src={grandfatherImg}
                  alt="Grandfather"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    objectPosition: "center 8%",
                    filter: "grayscale(1) sepia(.52) contrast(1.22) brightness(.82)",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "radial-gradient(ellipse 68% 58% at 50% 32%, transparent 28%, rgba(0,0,0,.56) 100%)",
                  }}
                />
              </div>
              <p
                style={{
                  fontSize: "8px",
                  fontWeight: 700,
                  fontStyle: "italic",
                  fontFamily: "Georgia,serif",
                  color: "rgba(61,43,26,.72)",
                  textAlign: "center",
                  marginTop: "4px",
                }}
              >
                {lang === "ar" ? "الجد" : lang === "fr" ? "Grand-père" : "Grandfather"}
              </p>
              <p style={{ fontSize: "6.5px", color: "rgba(61,43,26,.38)", textAlign: "center" }}>
                4 {t.tabVoices.replace("🎙️ ", "")}
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div
                className="frame-halo"
                style={{
                  width: `${(60 / 370) * 100}%`,
                  maxWidth: "60px",
                  height: `${(78 / 510) * 100}%`,
                  maxHeight: "78px",
                  borderRadius: "3px",
                  border: "4px solid rgba(184,142,32,.86)",
                  boxShadow:
                    "inset 0 0 0 2px rgba(255,220,80,.48), inset 0 0 0 5px rgba(110,72,8,.38), 0 0 22px rgba(251,191,36,.42)",
                  overflow: "hidden",
                  cursor: "pointer",
                  backgroundColor: "#4A2E0A",
                  position: "relative",
                }}
                onClick={() => toast.info(t.grandmotherVoice)}
              >
                <img
                  src={relaxImg}
                  alt="Grandmother"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    objectPosition: "center 5%",
                    filter: "grayscale(1) sepia(.52) contrast(1.22) brightness(.80)",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "radial-gradient(ellipse 68% 58% at 50% 32%, transparent 28%, rgba(0,0,0,.56) 100%)",
                  }}
                />
              </div>
              <p
                style={{
                  fontSize: "8px",
                  fontWeight: 700,
                  fontStyle: "italic",
                  fontFamily: "Georgia,serif",
                  color: "rgba(61,43,26,.72)",
                  textAlign: "center",
                  marginTop: "4px",
                }}
              >
                {lang === "ar" ? "الجدة" : lang === "fr" ? "Grand-mère" : "Grandmother"}
              </p>
              <p style={{ fontSize: "6.5px", color: "rgba(61,43,26,.38)", textAlign: "center" }}>
                2 {t.tabVoices.replace("🎙️ ", "")}
              </p>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                paddingBottom: "20px",
                marginLeft: "4px",
              }}
            >
              <div
                style={{
                  position: "relative",
                  width: "26px",
                  height: "32px",
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    bottom: "2px",
                    width: "28px",
                    height: "28px",
                    background: "radial-gradient(ellipse at 50% 80%, rgba(255,120,0,.42) 0%, transparent 70%)",
                    borderRadius: "50%",
                  }}
                />
                <div
                  className="flame"
                  style={{
                    width: "13px",
                    height: "24px",
                    background:
                      "linear-gradient(to top, #FF3300 0%, #FF8800 32%, #FFCC00 66%, rgba(255,248,160,.5) 100%)",
                    borderRadius: "50% 50% 28% 28%",
                    filter: "blur(.28px)",
                  }}
                />
              </div>
              <div style={{ width: "2px", height: "5px", backgroundColor: "#352014", marginTop: "-2px" }} />
              <div
                className="candle-body"
                style={{
                  width: "22px",
                  height: "58px",
                  position: "relative",
                  background:
                    "linear-gradient(to right,rgba(255,254,242,.96),rgba(255,250,225,.98),rgba(248,235,195,.92))",
                  borderRadius: "3px 3px 2px 2px",
                  border: "1px solid rgba(210,178,115,.55)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: "8px",
                    left: "-3px",
                    width: "7px",
                    height: "13px",
                    background: "rgba(255,250,230,.88)",
                    borderRadius: "0 0 50% 50%",
                  }}
                />
              </div>
              <div
                style={{
                  width: "10px",
                  height: "6px",
                  backgroundColor: "rgba(255,246,215,.82)",
                  borderRadius: "0 0 50% 50%",
                  marginTop: "-1px",
                }}
              />
            </div>
          </div>
          <div
            style={{
              height: "11px",
              marginTop: "2px",
              background: [
                "repeating-linear-gradient(90deg,transparent,transparent 18px,rgba(0,0,0,.05) 18px,rgba(0,0,0,.05) 19px)",
                "linear-gradient(to bottom,#8B5A26 0%,#6B4018 55%,#4A2C0E 100%)",
              ].join(", "),
              borderRadius: "1px 6px 0 0",
              boxShadow: "0 5px 16px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,185,80,.2)",
            }}
          />
          <div
            style={{
              height: "6px",
              background: "linear-gradient(to bottom,rgba(0,0,0,.2),transparent)",
              marginLeft: "8px",
              marginRight: "8px",
              borderRadius: "0 0 4px 4px",
            }}
          />
        </div>
      </div>

      <div className="px-5 mb-5 relative z-10">
        <div className="flex items-center justify-between mb-3">
          <p
            style={{
              fontSize: "10px",
              fontWeight: 900,
              letterSpacing: ".16em",
              textTransform: "uppercase",
              color: "rgba(61,43,26,.38)",
            }}
          >
            {t.thisWeek}
          </p>
          <button style={{ fontSize: "10px", color: "#E8742A", fontWeight: 700 }} onClick={() => navigate("/treasure")}>
            {t.seeAll}
          </button>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 hide-scroll">
          {DEMO_SHELF.map((card) => (
            <div
              key={card.id}
              className="shrink-0 rounded-2xl overflow-hidden cursor-pointer relative"
              style={{
                width: "148px",
                height: "116px",
                backgroundColor: "rgba(255,255,255,.36)",
                border: "1px solid rgba(180,140,80,.38)",
                backdropFilter: "blur(6px)",
              }}
              onClick={() => navigate("/treasure")}
            >
              <img
                src={card.thumbnail}
                alt=""
                style={{ width: "100%", height: "70px", objectFit: "cover", objectPosition: "center top" }}
              />
              <div
                className="absolute top-1.5 right-1.5 rounded-full px-1.5 py-0.5 flex items-center gap-1"
                style={{ backgroundColor: "rgba(0,0,0,.5)" }}
              >
                {card.type === "audio" ? <Volume2 size={8} color="#fff" /> : <Video size={8} color="#fff" />}
                <span style={{ fontSize: "7px", color: "#fff", fontWeight: 700 }}>{card.duration}</span>
              </div>
              <div style={{ padding: "5px 8px" }}>
                <div className="flex items-center gap-1.5">
                  <img
                    src={card.photo}
                    alt=""
                    style={{ width: "16px", height: "16px", borderRadius: "50%", objectFit: "cover" }}
                  />
                  <p style={{ fontSize: "8px", fontWeight: 700, color: "#3D2B1A" }}>{card.memberName}</p>
                  <span style={{ fontSize: "7px", color: "rgba(61,43,26,.4)", marginLeft: "auto" }}>
                    {card.timeAgo}
                  </span>
                </div>
                <p
                  style={{
                    fontSize: "9px",
                    fontWeight: 600,
                    color: "#3D2B1A",
                    marginTop: "2px",
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                    textOverflow: "ellipsis",
                  }}
                >
                  {card.title}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="px-5 mb-5 relative z-10">
        <div className="flex gap-2 overflow-x-auto pb-1 hide-scroll">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className="shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all"
              style={
                activeFilter === f.id
                  ? { backgroundColor: "#E8742A", color: "#fff", boxShadow: "0 3px 12px rgba(232,116,42,.45)" }
                  : {
                      backgroundColor: "rgba(255,255,255,.48)",
                      color: "#3D2B1A",
                      border: "1px solid rgba(180,140,80,.36)",
                    }
              }
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 pb-36 relative z-10 space-y-3">
        <div
          className="flex items-center gap-3 p-4 rounded-2xl"
          style={{ backgroundColor: "rgba(255,255,255,.38)", border: "1px solid rgba(180,140,80,.36)" }}
        >
          <div className="flex-1 min-w-0">
            <p
              style={{
                fontSize: "8px",
                textTransform: "uppercase",
                letterSpacing: ".1em",
                color: "rgba(61,43,26,.36)",
                marginBottom: "2px",
              }}
            >
              {t.inviteLink}
            </p>
            <p className="font-mono text-sm truncate" style={{ color: "#3D2B1A" }}>
              infeelit.com/join/demo
            </p>
          </div>
          <button
            onClick={handleCopyLink}
            className="shrink-0 p-2.5 rounded-xl"
            style={
              copied
                ? { backgroundColor: "rgba(16,185,129,.2)", border: "1px solid rgba(16,185,129,.4)" }
                : { backgroundColor: "rgba(255,255,255,.55)", border: "1px solid rgba(180,140,80,.36)" }
            }
          >
            {copied ? (
              <Check size={16} className="text-emerald-500" />
            ) : (
              <Copy size={16} style={{ color: "#3D2B1A" }} />
            )}
          </button>
        </div>

        {/* Bouton WhatsApp existant */}
        <button
          onClick={handleWhatsApp}
          className="w-full py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2"
          style={{ background: "linear-gradient(135deg,#25D366,#128C7E)", color: "#fff" }}
        >
          <span>💬</span> {t.inviteWhatsApp}
        </button>

        {/* NOUVEAU : Bouton Importer mon groupe WhatsApp */}
        <button
          onClick={() => setShowGroupImport(true)}
          style={{
            width: "100%",
            padding: "14px 20px",
            borderRadius: "16px",
            background: "rgba(37,211,102,0.12)",
            border: "1px solid rgba(37,211,102,0.3)",
            color: "#25D366",
            fontWeight: 700,
            fontSize: "14px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            marginTop: "8px",
          }}
        >
          <span style={{ fontSize: "18px" }}>👥</span>
          {lang === "fr"
            ? "Importer mon groupe WhatsApp"
            : lang === "ar"
              ? "استيراد مجموعة واتساب"
              : "Import my WhatsApp group"}
        </button>

        <p className="text-center text-xs" style={{ color: "rgba(61,43,26,.28)" }}>
          {t.circlePrivate}
        </p>
      </div>

      <div
        className="fixed bottom-0 left-0 right-0 px-5 pb-8 pt-4 z-20"
        style={{ background: "linear-gradient(to top,rgba(210,180,140,1) 60%,transparent)" }}
      >
        <button
          onClick={() => navigate("/record")}
          className="w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-3"
          style={{
            background: "linear-gradient(135deg,#E8742A,#D4621A)",
            color: "#fff",
            boxShadow: "0 0 28px rgba(232,116,42,.45)",
          }}
        >
          <Mic size={20} /> {t.addVoice}
        </button>
      </div>

      {/* Modal d'import de groupe WhatsApp */}
      {showGroupImport && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            background: "rgba(0,0,0,0.7)",
            backdropFilter: "blur(8px)",
          }}
          onClick={() => {
            setShowGroupImport(false);
            setGeneratedMessage("");
            setGroupNames("");
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "480px",
              backgroundColor: "#0E1A20",
              borderRadius: "24px 24px 0 0",
              padding: "24px 20px 40px",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle */}
            <div
              style={{
                width: "40px",
                height: "4px",
                backgroundColor: "rgba(255,255,255,0.2)",
                borderRadius: "999px",
                margin: "0 auto 20px",
              }}
            />

            <p
              style={{
                fontSize: "10px",
                fontWeight: 900,
                letterSpacing: "0.3em",
                color: "#25D366",
                textTransform: "uppercase",
                textAlign: "center",
                marginBottom: "6px",
              }}
            >
              {lang === "fr" ? "Groupe WhatsApp" : lang === "ar" ? "مجموعة واتساب" : "WhatsApp Group"}
            </p>

            <h2
              style={{
                fontSize: "18px",
                fontWeight: 700,
                color: "#fff",
                textAlign: "center",
                fontFamily: "Georgia, serif",
                marginBottom: "20px",
                lineHeight: 1.4,
              }}
            >
              {lang === "fr"
                ? "Entre les prénoms de ta famille"
                : lang === "ar"
                  ? "أدخل أسماء أفراد عائلتك"
                  : "Enter your family members' names"}
            </h2>

            {!generatedMessage ? (
              <>
                <p
                  style={{
                    fontSize: "12px",
                    color: "rgba(255,255,255,0.4)",
                    textAlign: "center",
                    marginBottom: "16px",
                    lineHeight: 1.5,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {lang === "fr"
                    ? "Séparés par des virgules\nEx: Ahmed, Fatima, Karim, Mama"
                    : lang === "ar"
                      ? "مفصولة بفواصل\nمثال: أحمد، فاطمة، كريم"
                      : "Separated by commas\nEx: Ahmed, Fatima, Karim, Mom"}
                </p>

                <textarea
                  value={groupNames}
                  onChange={(e) => setGroupNames(e.target.value)}
                  placeholder={
                    lang === "fr"
                      ? "Ahmed, Fatima, Karim, Mama, Papa, Leila..."
                      : lang === "ar"
                        ? "أحمد، فاطمة، كريم، ماما، بابا..."
                        : "Ahmed, Fatima, Karim, Mom, Dad, Leila..."
                  }
                  rows={3}
                  style={{
                    width: "100%",
                    padding: "14px 16px",
                    borderRadius: "14px",
                    border: "1px solid rgba(255,255,255,0.1)",
                    backgroundColor: "rgba(255,255,255,0.05)",
                    color: "#fff",
                    fontSize: "14px",
                    outline: "none",
                    resize: "none",
                    boxSizing: "border-box",
                    fontFamily: "inherit",
                    marginBottom: "16px",
                  }}
                />

                <button
                  onClick={generateGroupMessage}
                  disabled={groupNames.trim().length < 2}
                  style={{
                    width: "100%",
                    padding: "16px",
                    borderRadius: "14px",
                    background: "linear-gradient(135deg, #25D366, #128C7E)",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: "15px",
                    border: "none",
                    cursor: groupNames.trim().length < 2 ? "not-allowed" : "pointer",
                    opacity: groupNames.trim().length < 2 ? 0.4 : 1,
                  }}
                >
                  {lang === "fr" ? "Générer le message ✦" : lang === "ar" ? "إنشاء الرسالة ✦" : "Generate message ✦"}
                </button>
              </>
            ) : (
              <>
                {/* Message généré */}
                <div
                  style={{
                    padding: "16px",
                    borderRadius: "14px",
                    backgroundColor: "rgba(37,211,102,0.08)",
                    border: "1px solid rgba(37,211,102,0.2)",
                    marginBottom: "16px",
                  }}
                >
                  <p
                    style={{
                      fontSize: "13px",
                      color: "rgba(255,255,255,0.85)",
                      lineHeight: 1.6,
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {generatedMessage}
                  </p>
                </div>

                {/* Bouton WhatsApp */}
                <button
                  onClick={() => {
                    window.open(`https://wa.me/?text=${encodeURIComponent(generatedMessage)}`, "_blank");
                  }}
                  style={{
                    width: "100%",
                    padding: "16px",
                    borderRadius: "14px",
                    background: "linear-gradient(135deg, #25D366, #128C7E)",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: "15px",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "10px",
                    marginBottom: "10px",
                    boxShadow: "0 4px 20px rgba(37,211,102,0.3)",
                  }}
                >
                  <span style={{ fontSize: "20px" }}>💬</span>
                  {lang === "fr" ? "Envoyer sur WhatsApp" : lang === "ar" ? "إرسال عبر واتساب" : "Send on WhatsApp"}
                </button>

                {/* Copier le message */}
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(generatedMessage);
                  }}
                  style={{
                    width: "100%",
                    padding: "14px",
                    borderRadius: "14px",
                    background: "rgba(255,255,255,0.08)",
                    color: "rgba(255,255,255,0.6)",
                    fontWeight: 600,
                    fontSize: "14px",
                    border: "1px solid rgba(255,255,255,0.1)",
                    cursor: "pointer",
                  }}
                >
                  {lang === "fr" ? "Copier le message" : lang === "ar" ? "نسخ الرسالة" : "Copy message"}
                </button>

                {/* Recommencer */}
                <button
                  onClick={() => {
                    setGeneratedMessage("");
                    setGroupNames("");
                  }}
                  style={{
                    width: "100%",
                    padding: "12px",
                    background: "none",
                    border: "none",
                    color: "rgba(255,255,255,0.3)",
                    fontSize: "12px",
                    cursor: "pointer",
                    marginTop: "4px",
                  }}
                >
                  {lang === "fr" ? "← Modifier les prénoms" : lang === "ar" ? "← تعديل الأسماء" : "← Edit names"}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Circle;
