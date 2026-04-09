import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Copy, Check, Mic, Play, Volume2, Video } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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

const AI_QUESTION = "What is the most beautiful lesson of courage your father ever gave you?";

// ── 10 living members + Sultan pet, all float ─────────────────────────────────
const DEMO_MEMBERS = [
  {
    id: "fatima",
    name: "Fatima",
    subtitle: "12 voices",
    photo: marryImg,
    hasNew: true,
    isPet: false,
    left: 18,
    top: 24,
    size: 80,
    float: "mf-a",
    delay: "0s",
  },
  {
    id: "karim",
    name: "Karim",
    subtitle: "8 voices",
    photo: loveImg,
    hasNew: true,
    isPet: false,
    left: 252,
    top: 12,
    size: 75,
    float: "mf-b",
    delay: "1.3s",
  },
  {
    id: "mother",
    name: "Mother",
    subtitle: "8 moments",
    photo: relaxImg,
    hasNew: true,
    isPet: false,
    left: 305,
    top: 138,
    size: 70,
    float: "mf-c",
    delay: "0.6s",
  },
  {
    id: "father",
    name: "Father",
    subtitle: "5 moments",
    photo: houseImg,
    hasNew: false,
    isPet: false,
    left: 4,
    top: 144,
    size: 66,
    float: "mf-a",
    delay: "2.1s",
  },
  {
    id: "nadia",
    name: "A. Nadia",
    subtitle: "5 moments",
    photo: birthImg,
    hasNew: false,
    isPet: false,
    left: 290,
    top: 260,
    size: 62,
    float: "mf-b",
    delay: "0.9s",
  },
  {
    id: "hassan",
    name: "U. Hassan",
    subtitle: "3 voices",
    photo: picnicImg,
    hasNew: false,
    isPet: false,
    left: 6,
    top: 266,
    size: 60,
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
    left: 152,
    top: 4,
    size: 62,
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
    left: 294,
    top: 358,
    size: 58,
    float: "mf-b",
    delay: "2.4s",
  },
  {
    id: "leila",
    name: "Leila",
    subtitle: "2 moments",
    photo: birthImg,
    hasNew: false,
    isPet: false,
    left: 8,
    top: 362,
    size: 56,
    float: "mf-c",
    delay: "1.1s",
  },
  {
    id: "sultan",
    name: "Sultan",
    subtitle: "3 moments",
    photo: childImg,
    hasNew: false,
    isPet: true,
    left: 196,
    top: 368,
    size: 60,
    float: "mf-a",
    delay: "0.4s",
  },
];

// ── Background atmospheric bubbles (no interaction) ───────────────────────────
const BG_BUBBLES = [
  { photo: grandfatherImg, size: 64, x: 2, y: 6, anim: "bg-s", delay: "0s", op: 0.13 },
  { photo: loveImg, size: 48, x: 78, y: 8, anim: "bg-m", delay: "1.5s", op: 0.11 },
  { photo: travelImg, size: 38, x: 88, y: 52, anim: "bg-s", delay: "3s", op: 0.1 },
  { photo: graduateImg, size: 52, x: 58, y: 82, anim: "bg-m", delay: "2s", op: 0.12 },
  { photo: picnicImg, size: 30, x: 82, y: 26, anim: "bg-s", delay: "4s", op: 0.09 },
  { photo: relaxImg, size: 42, x: 4, y: 70, anim: "bg-m", delay: "0.8s", op: 0.1 },
  { photo: houseImg, size: 34, x: 44, y: 90, anim: "bg-s", delay: "1.3s", op: 0.08 },
];

const DEMO_SHELF = [
  {
    id: "s1",
    memberName: "Karim",
    title: "The day of the exam",
    duration: "2 min",
    type: "video",
    thumbnail: travelImg,
    photo: loveImg,
    timeAgo: "2h",
  },
  {
    id: "s2",
    memberName: "Mother",
    title: "The tajine recipe",
    duration: "4 min",
    type: "audio",
    thumbnail: picnicImg,
    photo: relaxImg,
    timeAgo: "5h",
  },
  {
    id: "s3",
    memberName: "Fatima",
    title: "Memories of Agadir",
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

const FILTERS: { id: FilterType; label: string }[] = [
  { id: "all", label: "All" },
  { id: "voices", label: "🎙️ Voices" },
  { id: "moments", label: "🎬 Moments" },
  { id: "chronicles", label: "📖 Chronicles" },
];

const Circle = () => {
  const navigate = useNavigate();
  const sphereTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [copied, setCopied] = useState(false);
  const [sphereMode, setSphereMode] = useState<SphereMode>("question");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [seenMembers, setSeenMembers] = useState<Set<string>>(new Set());
  const [memories, setMemories] = useState<Memory[]>([]);

  useEffect(() => {
    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;
      const { data: mems } = await (supabase as any)
        .from("memories")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })
        .limit(10);
      if (mems?.length) setMemories(mems as Memory[]);
    };
    init();
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
    toast.success("Link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    const msg = `Join our Family Circle on Infeelit 🕯️\nhttps://infeelit.com/join/demo`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const latestMem = memories[0] ?? null;

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-x-hidden"
      style={{
        background: "radial-gradient(ellipse at 50% 36%, #F5E6CC 0%, #D2B48C 100%)",
        backgroundColor: "#D2B48C",
      }}
    >
      <style>{`

        /* ── Atmospheric bg bubbles ── */
        @keyframes bgS {
          0%,100% { transform: translate(0,0); }
          25%      { transform: translate(22px,-30px); }
          50%      { transform: translate(40px,8px); }
          75%      { transform: translate(14px,36px); }
        }
        @keyframes bgM {
          0%,100% { transform: translate(0,0); }
          25%      { transform: translate(-28px,-22px); }
          50%      { transform: translate(-42px,18px); }
          75%      { transform: translate(-16px,40px); }
        }
        .bg-s { animation: bgS 22s ease-in-out infinite; }
        .bg-m { animation: bgM 16s ease-in-out infinite; }

        /* ── Member float — 3 distinct lazy paths ── */
        @keyframes mfA {
          0%,100% { transform: translate(0px,  0px); }
          25%      { transform: translate(7px, -12px); }
          50%      { transform: translate(14px, -2px); }
          75%      { transform: translate(5px,  10px); }
        }
        @keyframes mfB {
          0%,100% { transform: translate(0px,   0px); }
          25%      { transform: translate(-10px, -8px); }
          50%      { transform: translate(-13px,  8px); }
          75%      { transform: translate(-4px,  13px); }
        }
        @keyframes mfC {
          0%,100% { transform: translate(0px,  0px); }
          25%      { transform: translate(11px,  8px); }
          50%      { transform: translate(4px, -13px); }
          75%      { transform: translate(-9px, -5px); }
        }
        .mf-a { animation: mfA  9s ease-in-out infinite; }
        .mf-b { animation: mfB 11s ease-in-out infinite; }
        .mf-c { animation: mfC 13s ease-in-out infinite; }

        /* ── Gold ring on members with new content ── */
        @keyframes goldRing {
          0%,100% { box-shadow: 0 0 0 3px rgba(255,200,50,.95), 0 0 14px rgba(255,170,0,.6); }
          50%      { box-shadow: 0 0 0 4px rgba(255,225,80,1),   0 0 24px rgba(255,200,0,.9); }
        }
        .gold-ring { animation: goldRing 2s ease-in-out infinite; }

        /* ── Sphere pulse ── */
        @keyframes spherePulse {
          0%,100% { box-shadow: 0 0 36px rgba(255,185,60,.55), 0 0 70px rgba(232,116,42,.28); }
          50%      { box-shadow: 0 0 65px rgba(255,210,80,.85), 0 0 115px rgba(232,116,42,.48); }
        }
        .sphere-glow { animation: spherePulse 3s ease-in-out infinite; }

        /* ── Frame halo — light only, NO position change ── */
        @keyframes frameHalo {
          0%,100% { box-shadow: 0 0 16px rgba(251,191,36,.42), 0 0 32px rgba(251,191,36,.18); }
          50%      { box-shadow: 0 0 26px rgba(251,191,36,.68), 0 0 50px rgba(251,191,36,.32); }
        }
        .frame-halo { animation: frameHalo 4s ease-in-out infinite; }

        /* ── Candle flame: skew + brightness, ONLY mobile element in shrine ── */
        @keyframes flameBurn {
          0%   { transform: scaleX(1)    scaleY(1)    skewX(0deg)   translateY(0px);    opacity:1; }
          14%  { transform: scaleX(.87)  scaleY(1.13) skewX(-4deg)  translateY(-2px);   opacity:.82; }
          28%  { transform: scaleX(1.1)  scaleY(.90)  skewX(3deg)   translateY(.6px);   opacity:1; }
          42%  { transform: scaleX(.92)  scaleY(1.08) skewX(-2.5deg)translateY(-2.5px); opacity:.87; }
          57%  { transform: scaleX(1.07) scaleY(.93)  skewX(4deg)   translateY(.8px);   opacity:.96; }
          71%  { transform: scaleX(.94)  scaleY(1.06) skewX(-3deg)  translateY(-1px);   opacity:.9; }
          85%  { transform: scaleX(1.04) scaleY(.96)  skewX(1deg)   translateY(0);      opacity:.95; }
          100% { transform: scaleX(1)    scaleY(1)    skewX(0deg)   translateY(0px);    opacity:1; }
        }
        @keyframes candleGlow {
          0%,100% { box-shadow: 0 -5px 12px rgba(255,130,0,.55), 0 0 26px rgba(255,90,0,.25); }
          50%      { box-shadow: 0 -5px 22px rgba(255,155,0,.88), 0 0 42px rgba(255,120,0,.44); }
        }
        .flame       { animation: flameBurn 1.75s ease-in-out infinite; transform-origin: bottom center; }
        .candle-body { animation: candleGlow 2.3s ease-in-out infinite; }

        .hide-scroll { scrollbar-width: none; }
        .hide-scroll::-webkit-scrollbar { display: none; }
      `}</style>

      {/* ── Atmospheric background bubbles (z-0, no interaction) ── */}
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
                border: "1px solid rgba(212,175,55,.2)",
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
                  filter: "sepia(.9) brightness(.78) contrast(.88)",
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* ── Header ── */}
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
            Al-Fassi Family
          </h1>
          <p className="text-[10px] uppercase tracking-widest" style={{ color: "rgba(61,43,26,.42)" }}>
            Our Circle of Life · 12 members
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
          🔒 Private
        </div>
      </div>

      {/* ── Constellation ── */}
      <div className="relative mx-auto z-10" style={{ width: "370px", height: "500px" }}>
        {/* Orbit rings */}
        {[108, 132, 156].map((r, i) => (
          <div
            key={i}
            className="absolute rounded-full pointer-events-none"
            style={{
              width: r * 2 + "px",
              height: r * 2 + "px",
              left: 185 - r + "px",
              top: 195 - r + "px",
              border: `1px solid rgba(139,90,43,${0.08 + i * 0.04})`,
            }}
          />
        ))}

        {/* Central sphere */}
        <div
          className="absolute sphere-glow"
          style={{
            width: "132px",
            height: "132px",
            left: "119px",
            top: "129px",
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
                This week
              </p>
              <p style={{ fontSize: "9px", fontWeight: 700, color: "#fff", lineHeight: 1.38, textAlign: "center" }}>
                {AI_QUESTION}
              </p>
            </>
          ) : (
            <>
              <Play size={20} style={{ color: "#fff", marginBottom: "4px" }} />
              <p style={{ fontSize: "9px", fontWeight: 700, color: "#fff", lineHeight: 1.3, textAlign: "center" }}>
                {latestMem?.title ?? "Karim · 2h ago"}
              </p>
              <p style={{ fontSize: "7px", color: "rgba(255,255,255,.6)", marginTop: "3px", textAlign: "center" }}>
                Latest memory
              </p>
            </>
          )}
          <div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{ background: "linear-gradient(135deg,rgba(255,255,255,.26) 0%,transparent 55%)" }}
          />
        </div>

        {/* Living members — all float */}
        {DEMO_MEMBERS.map((m) => {
          const isNew = m.hasNew && !seenMembers.has(m.id);
          return (
            <div
              key={m.id}
              className={`absolute ${m.float}`}
              style={{
                left: `${m.left}px`,
                top: `${m.top}px`,
                width: `${m.size}px`,
                zIndex: 5,
                cursor: "pointer",
                animationDelay: m.delay,
              }}
              onClick={() => {
                setSeenMembers((prev) => new Set([...prev, m.id]));
                toast.info("Member journal — coming soon");
              }}
            >
              <div
                className={isNew ? "gold-ring" : ""}
                style={{
                  width: `${m.size}px`,
                  height: `${m.size}px`,
                  borderRadius: "50%",
                  overflow: "hidden",
                  position: "relative",
                  border: m.isPet
                    ? "2.5px solid rgba(232,116,42,.75)"
                    : isNew
                      ? "none"
                      : "2.5px solid rgba(255,255,255,.62)",
                  boxShadow: "0 4px 12px rgba(0,0,0,.15)",
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
                {m.count} {m.memType}
              </p>
            </div>
          );
        })}

        {/* ══ SHRINE — static, bottom-left, never moves ══════════════════════
            Two rectangular portrait frames tilted toward each other + candle
        ══════════════════════════════════════════════════════════════════════ */}
        <div className="absolute z-8" style={{ left: "6px", bottom: "0px" }}>
          {/* Frames row */}
          <div style={{ display: "flex", alignItems: "flex-end", gap: "6px", paddingLeft: "6px" }}>
            {/* Grandfather — tilted left */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                transform: "rotate(-5deg)",
                transformOrigin: "bottom center",
              }}
            >
              <div
                className="frame-halo"
                style={{
                  width: "66px",
                  height: "86px",
                  borderRadius: "3px",
                  border: "4px solid rgba(184,142,32,.9)",
                  boxShadow: `
                  inset 0 0 0 2px rgba(255,220,80,.5),
                  inset 0 0 0 5px rgba(110,72,8,.4),
                  0 0 28px rgba(251,191,36,.5)
                `,
                  overflow: "hidden",
                  cursor: "pointer",
                  backgroundColor: "#4A2E0A",
                  position: "relative",
                }}
                onClick={() => toast.info("Grandfather's voice — coming soon")}
              >
                <img
                  src={grandfatherImg}
                  alt="Grandfather"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    // Face at top — key fix
                    objectPosition: "center 8%",
                    filter: "grayscale(1) sepia(.52) contrast(1.22) brightness(.82)",
                  }}
                />
                {/* Vignette focuses on face */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "radial-gradient(ellipse 68% 58% at 50% 32%, transparent 28%, rgba(0,0,0,.58) 100%)",
                  }}
                />
              </div>
              <p
                style={{
                  fontSize: "8px",
                  fontWeight: 700,
                  fontStyle: "italic",
                  fontFamily: "Georgia,serif",
                  color: "rgba(61,43,26,.7)",
                  textAlign: "center",
                  marginTop: "4px",
                }}
              >
                Grandfather
              </p>
              <p style={{ fontSize: "6.5px", color: "rgba(61,43,26,.38)", textAlign: "center" }}>4 voices</p>
            </div>

            {/* Grandmother — tilted right */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                transform: "rotate(4deg)",
                transformOrigin: "bottom center",
              }}
            >
              <div
                className="frame-halo"
                style={{
                  width: "58px",
                  height: "76px",
                  borderRadius: "3px",
                  border: "4px solid rgba(184,142,32,.84)",
                  boxShadow: `
                  inset 0 0 0 2px rgba(255,220,80,.46),
                  inset 0 0 0 5px rgba(110,72,8,.36),
                  0 0 22px rgba(251,191,36,.42)
                `,
                  overflow: "hidden",
                  cursor: "pointer",
                  backgroundColor: "#4A2E0A",
                  position: "relative",
                }}
                onClick={() => toast.info("Grandmother's voice — coming soon")}
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
                    background: "radial-gradient(ellipse 68% 58% at 50% 32%, transparent 28%, rgba(0,0,0,.58) 100%)",
                  }}
                />
              </div>
              <p
                style={{
                  fontSize: "8px",
                  fontWeight: 700,
                  fontStyle: "italic",
                  fontFamily: "Georgia,serif",
                  color: "rgba(61,43,26,.7)",
                  textAlign: "center",
                  marginTop: "4px",
                }}
              >
                Grandmother
              </p>
              <p style={{ fontSize: "6.5px", color: "rgba(61,43,26,.38)", textAlign: "center" }}>2 voices</p>
            </div>

            {/* Candle — the ONLY moving element in the shrine */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                paddingBottom: "20px",
                marginLeft: "4px",
              }}
            >
              {/* Glow behind flame */}
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
                {/* Flame */}
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
              {/* Wick */}
              <div style={{ width: "2px", height: "5px", backgroundColor: "#352014", marginTop: "-2px" }} />
              {/* Body */}
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
              {/* Base */}
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

          {/* Wooden table surface */}
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
        {/* end shrine */}
      </div>
      {/* end constellation */}

      {/* ── Shelf "This week" ── */}
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
            This week in your circle
          </p>
          <button style={{ fontSize: "10px", color: "#E8742A", fontWeight: 700 }} onClick={() => navigate("/treasure")}>
            See all →
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

      {/* ── Filter pills ── */}
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

      {/* ── Invite ── */}
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
              Invite Link
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

        <button
          onClick={handleWhatsApp}
          className="w-full py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2"
          style={{ background: "linear-gradient(135deg,#25D366,#128C7E)", color: "#fff" }}
        >
          <span>💬</span> Invite your family on WhatsApp
        </button>
      </div>

      {/* ── Fixed CTA ── */}
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
          <Mic size={20} />+ Add a voice to the circle
        </button>
      </div>
    </div>
  );
};

export default Circle;
