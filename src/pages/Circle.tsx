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

interface DemoMember {
  id: string;
  name: string;
  subtitle: string;
  photo: string;
  hasNew: boolean;
  left: number;
  top: number;
  size: number;
  floatAnim: string;
  floatDelay: string;
  isPet?: boolean;
  // Pet = colorful, human = normal
}

interface ShelfCard {
  id: string;
  memberName: string;
  memberPhoto: string;
  title: string;
  duration: string;
  type: "audio" | "video";
  thumbnail: string;
  timeAgo: string;
}

const AI_QUESTION = "What is the most beautiful lesson of courage your father ever gave you?";

// ── Living members + Sultan (pet = floating, colorful, round) ────────────────
const DEMO_MEMBERS: DemoMember[] = [
  {
    id: "fatima",
    name: "Fatima",
    subtitle: "34 · 12 voices",
    photo: marryImg,
    hasNew: true,
    left: 18,
    top: 28,
    size: 76,
    floatAnim: "mf-a",
    floatDelay: "0s",
  },
  {
    id: "karim",
    name: "Karim",
    subtitle: "28 · 8 voices",
    photo: loveImg,
    hasNew: true,
    left: 248,
    top: 16,
    size: 72,
    floatAnim: "mf-b",
    floatDelay: "1.4s",
  },
  {
    id: "mother",
    name: "Mother",
    subtitle: "60 · 8 moments",
    photo: relaxImg,
    hasNew: true,
    left: 302,
    top: 134,
    size: 68,
    floatAnim: "mf-c",
    floatDelay: "0.7s",
  },
  {
    id: "father",
    name: "Father",
    subtitle: "62 · 5 moments",
    photo: houseImg,
    hasNew: false,
    left: 4,
    top: 140,
    size: 66,
    floatAnim: "mf-a",
    floatDelay: "2.2s",
  },
  {
    id: "nadia",
    name: "A. Nadia",
    subtitle: "5 moments",
    photo: birthImg,
    hasNew: false,
    left: 288,
    top: 258,
    size: 62,
    floatAnim: "mf-b",
    floatDelay: "1s",
  },
  {
    id: "hassan",
    name: "U. Hassan",
    subtitle: "3 voices",
    photo: picnicImg,
    hasNew: false,
    left: 8,
    top: 264,
    size: 60,
    floatAnim: "mf-c",
    floatDelay: "1.9s",
  },
  {
    id: "sara",
    name: "Sara",
    subtitle: "22 · 6 moments",
    photo: graduateImg,
    hasNew: true,
    left: 150,
    top: 6,
    size: 62,
    floatAnim: "mf-a",
    floatDelay: "3.1s",
  },
  {
    id: "adam",
    name: "Adam",
    subtitle: "19 · 4 voices",
    photo: travelImg,
    hasNew: false,
    left: 292,
    top: 354,
    size: 58,
    floatAnim: "mf-b",
    floatDelay: "2.5s",
  },
  // Sultan — pet, round, colorful, floats with the living
  {
    id: "sultan",
    name: "Sultan",
    subtitle: "3 moments",
    photo: childImg,
    hasNew: false,
    left: 194,
    top: 360,
    size: 60,
    floatAnim: "mf-c",
    floatDelay: "0.5s",
    isPet: true,
  },
];

const DEMO_SHELF: ShelfCard[] = [
  {
    id: "s1",
    memberName: "Karim",
    memberPhoto: loveImg,
    title: "The day of the exam",
    duration: "2 min",
    type: "video",
    thumbnail: travelImg,
    timeAgo: "2h",
  },
  {
    id: "s2",
    memberName: "Mother",
    memberPhoto: relaxImg,
    title: "The tajine recipe",
    duration: "4 min",
    type: "audio",
    thumbnail: picnicImg,
    timeAgo: "5h",
  },
  {
    id: "s3",
    memberName: "Fatima",
    memberPhoto: marryImg,
    title: "Memories of Agadir",
    duration: "3 min",
    type: "video",
    thumbnail: graduateImg,
    timeAgo: "1d",
  },
  {
    id: "s4",
    memberName: "Sara",
    memberPhoto: graduateImg,
    title: "My first day at uni",
    duration: "2 min",
    type: "audio",
    thumbnail: houseImg,
    timeAgo: "2d",
  },
];

const FILTERS: { id: FilterType; label: string }[] = [
  { id: "all", label: "All" },
  { id: "voices", label: "🎙️ Voices" },
  { id: "moments", label: "🎬 Moments" },
  { id: "chronicles", label: "📖 Chronicles" },
];

// ─── Component ────────────────────────────────────────────────────────────────
const Circle = () => {
  const navigate = useNavigate();
  const sphereTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState("demo-user");
  const [copied, setCopied] = useState(false);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [seenMembers, setSeenMembers] = useState<Set<string>>(new Set());
  const [sphereMode, setSphereMode] = useState<SphereMode>("question");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

  useEffect(() => {
    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;
      setUserId(session.user.id);
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("user_id", session.user.id)
        .single();
      if (profile?.display_name) setUserName(profile.display_name);
      const { data: mems } = await (supabase as any)
        .from("memories")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })
        .limit(10);
      if (mems?.length) setMemories(mems as Memory[]);
    };
    init();
  }, []);

  useEffect(() => {
    sphereTimerRef.current = setInterval(() => {
      setSphereMode((p) => (p === "question" ? "memory" : "question"));
    }, 6000);
    return () => {
      if (sphereTimerRef.current) clearInterval(sphereTimerRef.current);
    };
  }, []);

  const handleMemberClick = (id: string) => {
    setSeenMembers((prev) => new Set([...prev, id]));
    toast.info("Member journal — coming soon");
  };

  const handleCopyLink = () => {
    const link = `https://infeelit.com/join/${userId.slice(0, 8)}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success("Link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    const link = `https://infeelit.com/join/${userId.slice(0, 8)}`;
    const name = userName || "someone special";
    const msg = `${name} invites you to join our Family Circle on Infeelit 🕯️\n\nShare our voices, our memories, our story.\n\n${link}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const inviteLink = `https://infeelit.com/join/${userId.slice(0, 8)}`;
  const latestMem = memories[0] ?? null;

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-x-hidden"
      style={{
        background: "radial-gradient(ellipse at 50% 42%, #F5E6CC 0%, #D2B48C 100%)",
        backgroundColor: "#D2B48C",
      }}
    >
      <style>{`

        /* ── Noise texture ── */
        .wall-texture::before {
          content: "";
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E");
          background-repeat: repeat;
          pointer-events: none;
          z-index: 0;
          mix-blend-mode: multiply;
        }

        /* ── Member float ── */
        @keyframes mfA {
          0%,100% { transform: translate(0px,  0px); }
          25%      { transform: translate(8px, -13px); }
          50%      { transform: translate(15px, -2px); }
          75%      { transform: translate(5px,  11px); }
        }
        @keyframes mfB {
          0%,100% { transform: translate(0px,   0px); }
          25%      { transform: translate(-11px, -8px); }
          50%      { transform: translate(-14px,  8px); }
          75%      { transform: translate(-4px,  14px); }
        }
        @keyframes mfC {
          0%,100% { transform: translate(0px,  0px); }
          25%      { transform: translate(12px,  9px); }
          50%      { transform: translate(4px, -14px); }
          75%      { transform: translate(-9px, -5px); }
        }
        .mf-a { animation: mfA  9s ease-in-out infinite; }
        .mf-b { animation: mfB 11s ease-in-out infinite; }
        .mf-c { animation: mfC 13s ease-in-out infinite; }

        /* ── Gold ring ── */
        @keyframes goldRing {
          0%,100% { box-shadow: 0 0 0 3px rgba(255,200,50,.95), 0 0 16px rgba(255,170,0,.65); }
          50%      { box-shadow: 0 0 0 4px rgba(255,225,80,1),   0 0 26px rgba(255,200,0,.9); }
        }
        .gold-ring { animation: goldRing 2s ease-in-out infinite; }

        /* ── Sphere ── */
        @keyframes spherePulse {
          0%,100% { box-shadow: 0 0 38px rgba(255,185,60,.55), 0 0 75px rgba(232,116,42,.28); }
          50%      { box-shadow: 0 0 68px rgba(255,210,80,.85), 0 0 120px rgba(232,116,42,.48); }
        }
        .sphere-glow { animation: spherePulse 3s ease-in-out infinite; }

        /* ── Frame halo — only glow, position NEVER moves ── */
        @keyframes frameHalo {
          0%,100% { box-shadow: 0 0 18px rgba(251,191,36,.45), 0 0 36px rgba(251,191,36,.2); }
          50%      { box-shadow: 0 0 28px rgba(251,191,36,.7),  0 0 52px rgba(251,191,36,.35); }
        }
        .frame-halo { animation: frameHalo 4s ease-in-out infinite; }

        /* ── Candle flame — skew + brightness, only element moving in shrine ── */
        @keyframes flameBurn {
          0%   { transform: scaleX(1)    scaleY(1)    skewX(0deg)    translateY(0px);    opacity: 1; }
          12%  { transform: scaleX(.86)  scaleY(1.14) skewX(-4deg)   translateY(-2px);   opacity: .82; }
          25%  { transform: scaleX(1.1)  scaleY(.90)  skewX(3deg)    translateY(.5px);   opacity: 1; }
          38%  { transform: scaleX(.92)  scaleY(1.09) skewX(-2deg)   translateY(-2.5px); opacity: .87; }
          52%  { transform: scaleX(1.07) scaleY(.93)  skewX(4deg)    translateY(.8px);   opacity: .96; }
          67%  { transform: scaleX(.94)  scaleY(1.06) skewX(-3deg)   translateY(-1px);   opacity: .9; }
          82%  { transform: scaleX(1.04) scaleY(.96)  skewX(1deg)    translateY(0px);    opacity: .95; }
          100% { transform: scaleX(1)    scaleY(1)    skewX(0deg)    translateY(0px);    opacity: 1; }
        }
        @keyframes candleGlow {
          0%,100% { box-shadow: 0 -6px 14px rgba(255,130,0,.55), 0 0 28px rgba(255,90,0,.25); }
          50%      { box-shadow: 0 -6px 24px rgba(255,155,0,.85), 0 0 44px rgba(255,120,0,.45); }
        }
        .flame       { animation: flameBurn  1.8s ease-in-out infinite; transform-origin: bottom center; }
        .candle-body { animation: candleGlow 2.3s ease-in-out infinite; }

        /* ── Misc ── */
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(14px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .fade-up     { animation: fadeUp .5s ease forwards; }
        .hide-scroll { scrollbar-width: none; }
        .hide-scroll::-webkit-scrollbar { display: none; }
      `}</style>

      {/* Noise overlay */}
      <div className="wall-texture absolute inset-0 pointer-events-none z-0" />

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="relative z-10 flex items-center justify-between px-5 pt-14 pb-2">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full"
          style={{ backgroundColor: "rgba(61,43,26,.12)", color: "#3D2B1A" }}
        >
          ←
        </button>

        <div className="text-center">
          <h1
            className="font-bold text-lg"
            style={{ color: "#3D2B1A", fontFamily: "Georgia,serif", letterSpacing: ".02em" }}
          >
            Al-Fassi Family
          </h1>
          <p className="text-xs" style={{ color: "rgba(61,43,26,.45)" }}>
            Our Circle of Life · 12 members
          </p>
        </div>

        <div
          className="px-3 py-1 rounded-full text-xs font-bold"
          style={{
            backgroundColor: "rgba(107,78,155,.13)",
            border: "1px solid rgba(107,78,155,.36)",
            color: "#6B4E9B",
          }}
        >
          🔒 Private
        </div>
      </div>

      {/* ── Constellation ──────────────────────────────────────────────────── */}
      <div className="relative mx-auto z-10" style={{ width: "370px", height: "480px" }}>
        {/* Orbit rings */}
        {[108, 132, 156].map((r, i) => (
          <div
            key={i}
            className="absolute rounded-full pointer-events-none"
            style={{
              width: r * 2 + "px",
              height: r * 2 + "px",
              left: 185 - r + "px",
              top: 188 - r + "px",
              border: `1px solid rgba(139,90,43,${0.09 + i * 0.04})`,
            }}
          />
        ))}

        {/* Central sphere */}
        <div
          className="absolute sphere-glow"
          style={{
            width: "130px",
            height: "130px",
            left: "120px",
            top: "123px",
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
                  color: "rgba(255,255,255,.72)",
                  textTransform: "uppercase",
                  marginBottom: "5px",
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
              <Play size={20} style={{ color: "#fff", marginBottom: "5px" }} />
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
            style={{ background: "linear-gradient(135deg,rgba(255,255,255,.28) 0%,transparent 55%)" }}
          />
        </div>

        {/* ── Living members + Sultan (all float) ── */}
        {DEMO_MEMBERS.map((m) => {
          const isNew = m.hasNew && !seenMembers.has(m.id);
          return (
            <div
              key={m.id}
              className={`absolute ${m.floatAnim}`}
              style={{
                left: `${m.left}px`,
                top: `${m.top}px`,
                width: `${m.size}px`,
                zIndex: 5,
                cursor: "pointer",
                animationDelay: m.floatDelay,
              }}
              onClick={() => handleMemberClick(m.id)}
            >
              {/* Avatar circle */}
              <div
                className={isNew ? "gold-ring" : ""}
                style={{
                  width: `${m.size}px`,
                  height: `${m.size}px`,
                  borderRadius: "50%",
                  overflow: "hidden",
                  position: "relative",
                  border: m.isPet
                    ? "2.5px solid rgba(232,116,42,.7)" // amber for pet
                    : isNew
                      ? "none"
                      : "2.5px solid rgba(255,255,255,.6)",
                  boxShadow: isNew ? undefined : "0 4px 14px rgba(0,0,0,.16)",
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
                    // Pet stays colorful, humans normal
                    filter: m.isPet ? "saturate(1.3) brightness(1.05)" : "none",
                  }}
                />
                <div
                  className="absolute inset-0 rounded-full"
                  style={{ background: "linear-gradient(135deg,rgba(255,255,255,.18) 0%,transparent 55%)" }}
                />
                {/* Pet badge */}
                {m.isPet && (
                  <div
                    className="absolute bottom-0.5 right-0.5 rounded-full flex items-center justify-center"
                    style={{
                      width: "20px",
                      height: "20px",
                      backgroundColor: "rgba(232,116,42,.9)",
                      border: "2px solid #F5E6CC",
                      fontSize: "10px",
                      boxShadow: "0 2px 6px rgba(0,0,0,.25)",
                    }}
                  >
                    🐾
                  </div>
                )}
                {/* New dot */}
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
                  textShadow: "0 1px 2px rgba(255,255,255,.7)",
                }}
              >
                {m.name}
              </p>
              <p style={{ fontSize: "7px", color: "rgba(61,43,26,.5)", textAlign: "center", lineHeight: 1.1 }}>
                {m.subtitle}
              </p>
            </div>
          );
        })}
      </div>
      {/* end constellation */}

      {/* ══════════════════════════════════════════════════════════════════════
          SHRINE — bedside table, fully static
          Grandfather frame (slightly tilted left) +
          Grandmother frame (slightly tilted right) +
          Candle in front
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="absolute z-10" style={{ left: 0, bottom: "100px", width: "230px" }}>
        {/* Frames + candle row */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: "8px",
            paddingLeft: "14px",
            paddingBottom: "0",
          }}
        >
          {/* ── Frame 1 : Grandfather — tilted slightly left ── */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              transform: "rotate(-4deg)",
              transformOrigin: "bottom center",
            }}
          >
            <div
              className="frame-halo"
              style={{
                width: "68px",
                height: "90px", // 3:4 portrait ratio
                position: "relative",
                borderRadius: "3px",
                // Outer golden moulding
                border: "4px solid rgba(184,142,32,.92)",
                // Bevel inset effect
                boxShadow: `
                inset 0 0 0 2px rgba(255,220,80,.55),
                inset 0 0 0 5px rgba(120,80,10,.42),
                0 0 0 1px rgba(100,70,0,.3),
                0 0 30px rgba(251,191,36,.5)
              `,
                overflow: "hidden",
                cursor: "pointer",
                backgroundColor: "#4A2E0A",
                flexShrink: 0,
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
                  // Focus on face — top of image
                  objectPosition: "center 15%",
                  // Old warm B&W photo
                  filter: "grayscale(1) sepia(.55) contrast(1.25) brightness(.84)",
                }}
              />
              {/* Soft vignette to focus on face */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "radial-gradient(ellipse 70% 60% at 50% 35%, transparent 30%, rgba(0,0,0,.55) 100%)",
                }}
              />
              {/* Very subtle warm tint overlay */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "rgba(180,130,50,.08)",
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
                marginTop: "5px",
              }}
            >
              Grandfather
            </p>
            <p style={{ fontSize: "7px", color: "rgba(61,43,26,.4)", textAlign: "center" }}>4 voices</p>
          </div>

          {/* ── Frame 2 : Grandmother — tilted slightly right ── */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              transform: "rotate(3deg)",
              transformOrigin: "bottom center",
            }}
          >
            <div
              className="frame-halo"
              style={{
                width: "60px",
                height: "80px",
                position: "relative",
                borderRadius: "3px",
                border: "4px solid rgba(184,142,32,.85)",
                boxShadow: `
                inset 0 0 0 2px rgba(255,220,80,.5),
                inset 0 0 0 5px rgba(120,80,10,.38),
                0 0 0 1px rgba(100,70,0,.25),
                0 0 24px rgba(251,191,36,.42)
              `,
                overflow: "hidden",
                cursor: "pointer",
                backgroundColor: "#4A2E0A",
                flexShrink: 0,
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
                  objectPosition: "center 10%",
                  filter: "grayscale(1) sepia(.55) contrast(1.25) brightness(.82)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "radial-gradient(ellipse 70% 60% at 50% 35%, transparent 30%, rgba(0,0,0,.55) 100%)",
                }}
              />
              <div style={{ position: "absolute", inset: 0, background: "rgba(180,130,50,.08)" }} />
            </div>
            <p
              style={{
                fontSize: "8px",
                fontWeight: 700,
                fontStyle: "italic",
                fontFamily: "Georgia,serif",
                color: "rgba(61,43,26,.72)",
                textAlign: "center",
                marginTop: "5px",
              }}
            >
              Grandmother
            </p>
            <p style={{ fontSize: "7px", color: "rgba(61,43,26,.4)", textAlign: "center" }}>2 voices</p>
          </div>

          {/* ── Candle — only moving element in shrine ── */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              paddingBottom: "18px",
              marginLeft: "6px",
            }}
          >
            {/* Outer flame glow */}
            <div
              style={{
                width: "26px",
                height: "34px",
                position: "relative",
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "center",
              }}
            >
              {/* Diffuse glow behind flame */}
              <div
                style={{
                  position: "absolute",
                  bottom: "2px",
                  width: "26px",
                  height: "30px",
                  background: "radial-gradient(ellipse at 50% 85%, rgba(255,120,0,.45) 0%, transparent 68%)",
                  borderRadius: "50%",
                }}
              />
              {/* Flame shape */}
              <div
                className="flame"
                style={{
                  width: "13px",
                  height: "24px",
                  background:
                    "linear-gradient(to top, #FF3300 0%, #FF8800 30%, #FFCC00 65%, rgba(255,248,160,.55) 100%)",
                  borderRadius: "50% 50% 28% 28%",
                  filter: "blur(.28px)",
                }}
              />
            </div>
            {/* Wick */}
            <div style={{ width: "2px", height: "5px", backgroundColor: "#352014", marginTop: "-2px" }} />
            {/* Candle body */}
            <div
              className="candle-body"
              style={{
                width: "24px",
                height: "64px",
                position: "relative",
                background:
                  "linear-gradient(to right, rgba(255,254,242,.96) 0%, rgba(255,250,225,.98) 50%, rgba(248,235,195,.92) 100%)",
                borderRadius: "3px 3px 2px 2px",
                border: "1px solid rgba(210,178,115,.55)",
                overflow: "hidden",
              }}
            >
              {/* Wax drip */}
              <div
                style={{
                  position: "absolute",
                  top: "10px",
                  left: "-3px",
                  width: "7px",
                  height: "14px",
                  background: "rgba(255,250,230,.88)",
                  borderRadius: "0 0 50% 50%",
                }}
              />
            </div>
            {/* Base drip */}
            <div
              style={{
                width: "11px",
                height: "7px",
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
            height: "12px",
            marginTop: "3px",
            background: [
              "repeating-linear-gradient(90deg, transparent, transparent 20px, rgba(0,0,0,.04) 20px, rgba(0,0,0,.04) 21px)",
              "linear-gradient(to bottom, #8B5A26 0%, #6B4018 55%, #4A2C0E 100%)",
            ].join(", "),
            borderRadius: "1px 6px 0 0",
            boxShadow: "0 5px 18px rgba(0,0,0,.38), inset 0 1px 0 rgba(255,185,80,.22)",
          }}
        />
        {/* Shadow under table */}
        <div
          style={{
            height: "7px",
            background: "linear-gradient(to bottom, rgba(0,0,0,.22), transparent)",
            marginLeft: "10px",
            marginRight: "10px",
            borderRadius: "0 0 4px 4px",
          }}
        />
      </div>
      {/* end shrine */}

      {/* ── Shelf "This week" ── */}
      <div className="px-5 mb-4 fade-up relative z-10">
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
                    src={card.memberPhoto}
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

      {/* ── Fixed bottom bar — glass filters + CTAs ── */}
      <div
        className="fixed bottom-0 left-0 right-0 z-20"
        style={{
          background: "linear-gradient(to top, rgba(210,180,140,1) 0%, rgba(210,180,140,.95) 65%, transparent 100%)",
          paddingBottom: "24px",
          paddingTop: "8px",
        }}
      >
        {/* Glass filter bar */}
        <div
          style={{
            margin: "0 16px 10px",
            padding: "7px 10px",
            borderRadius: "20px",
            background: "rgba(255,255,255,.26)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,.42)",
            display: "flex",
            gap: "7px",
            overflowX: "auto",
            alignItems: "center",
          }}
          className="hide-scroll"
        >
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className="shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all"
              style={
                activeFilter === f.id
                  ? { backgroundColor: "#E8742A", color: "#fff", boxShadow: "0 3px 12px rgba(232,116,42,.45)" }
                  : {
                      backgroundColor: "rgba(255,255,255,.44)",
                      color: "#3D2B1A",
                      border: "1px solid rgba(180,140,80,.38)",
                    }
              }
            >
              {f.label}
            </button>
          ))}
          <button
            onClick={handleCopyLink}
            className="shrink-0 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 ml-auto"
            style={
              copied
                ? { backgroundColor: "rgba(16,185,129,.25)", color: "#065f46", border: "1px solid rgba(16,185,129,.4)" }
                : {
                    backgroundColor: "rgba(255,255,255,.44)",
                    color: "#3D2B1A",
                    border: "1px solid rgba(180,140,80,.38)",
                  }
            }
          >
            {copied ? <Check size={11} /> : <Copy size={11} />}
            {copied ? "Copied!" : "Share"}
          </button>
        </div>

        {/* CTAs */}
        <div className="px-5 flex flex-col gap-2">
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
          <button
            onClick={handleWhatsApp}
            className="w-full py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2"
            style={{ background: "linear-gradient(135deg,#25D366,#128C7E)", color: "#fff" }}
          >
            <span>💬</span> Invite your family on WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
};

export default Circle;
