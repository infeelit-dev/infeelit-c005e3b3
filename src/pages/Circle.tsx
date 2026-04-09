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

// ─── Types ────────────────────────────────────────────────────────────────────

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
  count: number;
  memType: string;
  left: number;
  top: number;
  size: number;
  isPet?: boolean;
}

interface DeceasedFrame {
  id: string;
  name: string;
  subtitle: string;
  photo: string;
  voices: number;
  left: number;
  top: number;
}

interface BgBubble {
  photo: string;
  size: number;
  x: number;
  y: number;
  anim: string;
  delay: string;
  opacity: number;
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

// ─── Static data ──────────────────────────────────────────────────────────────

const AI_QUESTION = "What is the most beautiful lesson of courage your father ever gave you?";

const DEMO_MEMBERS: DemoMember[] = [
  {
    id: "fatima",
    name: "Fatima",
    subtitle: "34 · 12 voices",
    photo: marryImg,
    hasNew: true,
    count: 12,
    memType: "voices",
    left: 16,
    top: 22,
    size: 76,
  },
  {
    id: "karim",
    name: "Karim",
    subtitle: "28 · 8 voices",
    photo: loveImg,
    hasNew: true,
    count: 8,
    memType: "voices",
    left: 240,
    top: 14,
    size: 72,
  },
  {
    id: "mother",
    name: "Mother",
    subtitle: "60 · 8 moments",
    photo: relaxImg,
    hasNew: true,
    count: 8,
    memType: "moments",
    left: 298,
    top: 128,
    size: 68,
  },
  {
    id: "father",
    name: "Father",
    subtitle: "62 · 5 moments",
    photo: houseImg,
    hasNew: false,
    count: 5,
    memType: "moments",
    left: 6,
    top: 140,
    size: 66,
  },
  {
    id: "nadia",
    name: "A. Nadia",
    subtitle: "5 moments",
    photo: birthImg,
    hasNew: false,
    count: 5,
    memType: "moments",
    left: 286,
    top: 254,
    size: 62,
  },
  {
    id: "hassan",
    name: "U. Hassan",
    subtitle: "3 voices",
    photo: picnicImg,
    hasNew: false,
    count: 3,
    memType: "voices",
    left: 10,
    top: 262,
    size: 60,
  },
  {
    id: "sara",
    name: "Sara",
    subtitle: "22 · 6 moments",
    photo: graduateImg,
    hasNew: true,
    count: 6,
    memType: "moments",
    left: 146,
    top: 6,
    size: 62,
  },
  {
    id: "adam",
    name: "Adam",
    subtitle: "19 · 4 voices",
    photo: travelImg,
    hasNew: false,
    count: 4,
    memType: "voices",
    left: 290,
    top: 358,
    size: 58,
  },
  {
    id: "sultan",
    name: "Sultan",
    subtitle: "3 moments",
    photo: childImg,
    hasNew: false,
    count: 3,
    memType: "moments",
    left: 196,
    top: 366,
    size: 60,
    isPet: true,
  },
  {
    id: "mimi",
    name: "Mimi",
    subtitle: "2 moments",
    photo: birthImg,
    hasNew: false,
    count: 2,
    memType: "moments",
    left: 56,
    top: 370,
    size: 54,
    isPet: true,
  },
];

const DECEASED: DeceasedFrame[] = [
  {
    id: "grandfather",
    name: "Grandfather",
    subtitle: "1942 – 2018",
    photo: grandfatherImg,
    voices: 4,
    left: 28,
    top: 448,
  },
  { id: "grandmother", name: "Grandmother", subtitle: "1948 – 2021", photo: marryImg, voices: 2, left: 178, top: 448 },
];

const BG_BUBBLES: BgBubble[] = [
  { photo: grandfatherImg, size: 68, x: 2, y: 5, anim: "bg-float-slow", delay: "0s", opacity: 0.18 },
  { photo: loveImg, size: 52, x: 78, y: 8, anim: "bg-float-medium", delay: "1.5s", opacity: 0.14 },
  { photo: relaxImg, size: 44, x: 88, y: 55, anim: "bg-float-slow", delay: "3s", opacity: 0.13 },
  { photo: travelImg, size: 38, x: 4, y: 72, anim: "bg-float-medium", delay: "0.8s", opacity: 0.12 },
  { photo: graduateImg, size: 56, x: 60, y: 80, anim: "bg-float-slow", delay: "2s", opacity: 0.15 },
  { photo: picnicImg, size: 34, x: 82, y: 28, anim: "bg-float-medium", delay: "4s", opacity: 0.11 },
  { photo: houseImg, size: 30, x: 42, y: 92, anim: "bg-float-slow", delay: "1.2s", opacity: 0.1 },
  { photo: childImg, size: 46, x: 12, y: 45, anim: "bg-float-medium", delay: "2.8s", opacity: 0.13 },
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

  // ── Fetch ─────────────────────────────────────────────────────────────────
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

  // ── Sphere alternation ────────────────────────────────────────────────────
  useEffect(() => {
    sphereTimerRef.current = setInterval(() => {
      setSphereMode((p) => (p === "question" ? "memory" : "question"));
    }, 6000);
    return () => {
      if (sphereTimerRef.current) clearInterval(sphereTimerRef.current);
    };
  }, []);

  // ── Handlers ─────────────────────────────────────────────────────────────
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

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen flex flex-col relative overflow-x-hidden"
      style={{
        background: [
          "radial-gradient(ellipse at 50% 34%, rgba(255,210,120,0.5) 0%, transparent 52%)",
          "linear-gradient(175deg, #F7EDD4 0%, #EDD9A3 25%, #D4B478 52%, #9E7538 76%, #2C4A52 100%)",
        ].join(", "),
        backgroundColor: "#F0E4C4",
      }}
    >
      {/* ── Keyframes ─────────────────────────────────────────────────────── */}
      <style>{`
        @keyframes bgFloatSlow {
          0%   { transform: translate(0,0); }
          25%  { transform: translate(30px,-40px); }
          50%  { transform: translate(55px,15px); }
          75%  { transform: translate(20px,50px); }
          100% { transform: translate(0,0); }
        }
        @keyframes bgFloatMed {
          0%   { transform: translate(0,0); }
          25%  { transform: translate(-40px,-30px); }
          50%  { transform: translate(-60px,25px); }
          75%  { transform: translate(-25px,55px); }
          100% { transform: translate(0,0); }
        }
        @keyframes goldRing {
          0%,100% { box-shadow: 0 0 0 3px rgba(255,200,50,.95), 0 0 18px rgba(255,170,0,.7); }
          50%      { box-shadow: 0 0 0 4px rgba(255,225,80,1),   0 0 28px rgba(255,200,0,.9); }
        }
        @keyframes spherePulse {
          0%,100% { box-shadow: 0 0 40px rgba(255,185,60,.6),  0 0 80px rgba(232,116,42,.3); }
          50%      { box-shadow: 0 0 72px rgba(255,210,80,.88), 0 0 130px rgba(232,116,42,.5); }
        }
        @keyframes sphereTextSwap {
          0%,42%  { opacity: 1; transform: translateY(0); }
          48%     { opacity: 0; transform: translateY(-8px); }
          52%     { opacity: 0; transform: translateY(8px); }
          58%,100%{ opacity: 1; transform: translateY(0); }
        }
        @keyframes flicker {
          0%   { transform: scaleX(1)    scaleY(1)    translateY(0);      opacity: 1; }
          20%  { transform: scaleX(.91)  scaleY(1.09) translateY(-1px);   opacity: .87; }
          40%  { transform: scaleX(1.07) scaleY(.93)  translateY(.5px);   opacity: 1; }
          60%  { transform: scaleX(.95)  scaleY(1.07) translateY(-1.5px); opacity: .91; }
          80%  { transform: scaleX(1.04) scaleY(.96)  translateY(0);      opacity: .97; }
          100% { transform: scaleX(1)    scaleY(1)    translateY(0);      opacity: 1; }
        }
        @keyframes candleGlow {
          0%,100% { box-shadow: 0 0 12px rgba(255,140,0,.7), 0 0 25px rgba(255,100,0,.35); }
          50%      { box-shadow: 0 0 22px rgba(255,165,0,.9), 0 0 42px rgba(255,120,0,.5); }
        }
        @keyframes sepiaGlow {
          0%,100% { box-shadow: 0 0 0 3px rgba(212,175,55,.8), 0 0 16px rgba(212,175,55,.4); }
          50%      { box-shadow: 0 0 0 3px rgba(255,210,80,1),  0 0 26px rgba(212,175,55,.7); }
        }
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(16px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .bg-float-slow   { animation: bgFloatSlow 22s ease-in-out infinite; }
        .bg-float-medium { animation: bgFloatMed  16s ease-in-out infinite; }
        .gold-ring       { animation: goldRing    2s  ease-in-out infinite; }
        .sphere-glow     { animation: spherePulse 3s  ease-in-out infinite; }
        .sphere-text     { animation: sphereTextSwap 12s ease-in-out infinite; }
        .flame           { animation: flicker     1.8s ease-in-out infinite; }
        .candle-body     { animation: candleGlow  2s  ease-in-out infinite; }
        .sepia-glow      { animation: sepiaGlow   3s  ease-in-out infinite; }
        .fade-up         { animation: fadeUp      .5s ease forwards; }
        .hide-scroll     { scrollbar-width:none; }
        .hide-scroll::-webkit-scrollbar { display:none; }
      `}</style>

      {/* ── Background floating bubbles ────────────────────────────────────── */}
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
                border: "1px solid rgba(212,175,55,.25)",
                boxShadow: "inset 0 2px 8px rgba(255,255,255,.2)",
                opacity: b.opacity,
              }}
            >
              <img
                src={b.photo}
                alt=""
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  filter: "sepia(.8) brightness(.85) contrast(.9)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, rgba(255,220,140,.18) 0%, transparent 55%)",
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="relative z-10 flex items-center justify-between px-5 pt-14 pb-2">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full"
          style={{ backgroundColor: "rgba(61,43,26,.12)", color: "#3D2B1A" }}
        >
          ←
        </button>

        <div className="text-center">
          <h1 className="font-bold text-lg" style={{ color: "#3D2B1A", fontFamily: "Georgia, serif" }}>
            Al-Fassi Family
          </h1>
          <p className="text-xs" style={{ color: "rgba(61,43,26,.45)" }}>
            Our Circle of Life · 12 members
          </p>
        </div>

        <div
          className="px-3 py-1 rounded-full text-xs font-bold"
          style={{ backgroundColor: "rgba(107,78,155,.15)", border: "1px solid rgba(107,78,155,.4)", color: "#6B4E9B" }}
        >
          🔒 Private
        </div>
      </div>

      {/* ── Constellation ─────────────────────────────────────────────────── */}
      <div className="relative mx-auto z-10" style={{ width: "370px", height: "570px" }}>
        {/* Orbit rings */}
        {[108, 132, 155].map((r, i) => (
          <div
            key={i}
            className="absolute rounded-full pointer-events-none"
            style={{
              width: r * 2 + "px",
              height: r * 2 + "px",
              left: 185 - r + "px",
              top: 188 - r + "px",
              border: `1px solid rgba(61,43,26,${0.05 + i * 0.03})`,
            }}
          />
        ))}

        {/* ── Central sphere ──────────────────────────────────────────────── */}
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
          <div className="sphere-text w-full h-full absolute inset-0 flex flex-col items-center justify-center px-3">
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
          </div>
          {/* Gloss */}
          <div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{ background: "linear-gradient(135deg, rgba(255,255,255,.28) 0%, transparent 55%)" }}
          />
        </div>

        {/* ── Living members ───────────────────────────────────────────────── */}
        {DEMO_MEMBERS.map((m) => {
          const isNew = m.hasNew && !seenMembers.has(m.id);
          return (
            <div
              key={m.id}
              className="absolute"
              style={{ left: `${m.left}px`, top: `${m.top}px`, width: `${m.size}px`, zIndex: 5, cursor: "pointer" }}
              onClick={() => handleMemberClick(m.id)}
            >
              <div
                className={isNew ? "gold-ring" : ""}
                style={{
                  width: `${m.size}px`,
                  height: `${m.size}px`,
                  borderRadius: "50%",
                  overflow: "hidden",
                  position: "relative",
                  border: isNew ? "none" : "2.5px solid rgba(255,255,255,.55)",
                }}
              >
                <img src={m.photo} alt={m.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
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
                      border: "2px solid #F5E8C8",
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
                      border: "2px solid #F5E8C8",
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
                  textShadow: "0 1px 3px rgba(255,255,255,.85)",
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

        {/* ── Deceased frames ──────────────────────────────────────────────── */}
        {DECEASED.map((d) => (
          <div key={d.id} className="absolute" style={{ left: `${d.left}px`, top: `${d.top}px`, zIndex: 5 }}>
            <div
              className="sepia-glow"
              style={{
                width: "76px",
                height: "94px",
                borderRadius: "4px",
                overflow: "hidden",
                border: "3px solid rgba(212,175,55,.92)",
                backgroundColor: "#8B6914",
                cursor: "pointer",
              }}
              onClick={() => toast.info(`${d.name}'s voice — coming soon`)}
            >
              <img
                src={d.photo}
                alt={d.name}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  filter: "sepia(1) contrast(.88) brightness(.8)",
                }}
              />
              {/* Frame gloss */}
              <div
                className="absolute inset-0"
                style={{ background: "linear-gradient(135deg,rgba(255,210,80,.12) 0%,transparent 50%)" }}
              />
            </div>
            <p style={{ fontSize: "9px", fontWeight: 700, color: "#3D2B1A", textAlign: "center", marginTop: "4px" }}>
              {d.name}
            </p>
            <p style={{ fontSize: "7px", color: "rgba(61,43,26,.42)", textAlign: "center" }}>{d.voices} voices</p>
          </div>
        ))}

        {/* ── CSS Candle — between the two frames ─────────────────────────── */}
        <div
          className="absolute"
          style={{
            left: "138px",
            top: "456px",
            zIndex: 5,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {/* Flame */}
          <div
            className="flame"
            style={{
              width: "11px",
              height: "20px",
              background: "linear-gradient(to top, #FF5500 0%, #FF9500 40%, #FFE055 80%, rgba(255,240,140,.5) 100%)",
              borderRadius: "50% 50% 20% 20%",
              filter: "blur(.35px)",
            }}
          />
          {/* Wick */}
          <div style={{ width: "2px", height: "6px", backgroundColor: "#4A3728", marginTop: "-1px" }} />
          {/* Body */}
          <div
            className="candle-body"
            style={{
              width: "20px",
              height: "58px",
              background:
                "linear-gradient(to right, rgba(255,252,235,.92), rgba(255,242,205,.96), rgba(242,228,185,.88))",
              borderRadius: "3px 3px 2px 2px",
              border: "1px solid rgba(212,182,125,.6)",
            }}
          />
          {/* Wax drip */}
          <div
            style={{
              width: "9px",
              height: "9px",
              backgroundColor: "rgba(255,248,225,.82)",
              borderRadius: "0 0 50% 50%",
              marginTop: "-2px",
              marginLeft: "-5px",
            }}
          />
        </div>
      </div>
      {/* end constellation */}

      {/* ── Shelf "This week" ─────────────────────────────────────────────── */}
      <div className="px-5 mb-5 fade-up relative z-10">
        <div className="flex items-center justify-between mb-3">
          <p
            style={{
              fontSize: "10px",
              fontWeight: 900,
              letterSpacing: ".16em",
              textTransform: "uppercase",
              color: "rgba(61,43,26,.4)",
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
                backgroundColor: "rgba(255,255,255,.42)",
                border: "1px solid rgba(212,180,122,.48)",
                backdropFilter: "blur(4px)",
              }}
              onClick={() => navigate("/treasure")}
            >
              <img src={card.thumbnail} alt="" style={{ width: "100%", height: "70px", objectFit: "cover" }} />
              {/* Type + duration */}
              <div
                className="absolute top-1.5 right-1.5 rounded-full px-1.5 py-0.5 flex items-center gap-1"
                style={{ backgroundColor: "rgba(0,0,0,.52)" }}
              >
                {card.type === "audio" ? <Volume2 size={8} color="#fff" /> : <Video size={8} color="#fff" />}
                <span style={{ fontSize: "7px", color: "#fff", fontWeight: 700 }}>{card.duration}</span>
              </div>
              {/* Footer */}
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

      {/* ── Filter pills ──────────────────────────────────────────────────── */}
      <div className="px-5 mb-5 relative z-10">
        <div className="flex gap-2 overflow-x-auto pb-1 hide-scroll">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className="shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all"
              style={
                activeFilter === f.id
                  ? { backgroundColor: "#E8742A", color: "#fff", boxShadow: "0 4px 14px rgba(232,116,42,.4)" }
                  : {
                      backgroundColor: "rgba(255,255,255,.52)",
                      color: "#3D2B1A",
                      border: "1px solid rgba(212,180,122,.5)",
                    }
              }
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Invite ────────────────────────────────────────────────────────── */}
      <div className="px-5 pb-36 relative z-10">
        <div
          className="flex items-center gap-3 p-4 rounded-2xl mb-3"
          style={{ backgroundColor: "rgba(255,255,255,.4)", border: "1px solid rgba(212,180,122,.4)" }}
        >
          <div className="flex-1 min-w-0">
            <p
              style={{
                fontSize: "9px",
                textTransform: "uppercase",
                letterSpacing: ".1em",
                color: "rgba(61,43,26,.38)",
                marginBottom: "2px",
              }}
            >
              Your invite link
            </p>
            <p className="font-mono truncate text-sm" style={{ color: "#3D2B1A" }}>
              {inviteLink}
            </p>
          </div>
          <button
            onClick={handleCopyLink}
            className="shrink-0 p-2.5 rounded-xl"
            style={
              copied
                ? { backgroundColor: "rgba(16,185,129,.2)", border: "1px solid rgba(16,185,129,.4)" }
                : { backgroundColor: "rgba(255,255,255,.6)", border: "1px solid rgba(212,180,122,.4)" }
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
          className="w-full py-3.5 rounded-2xl font-bold text-base flex items-center justify-center gap-3"
          style={{ background: "linear-gradient(135deg, #25D366, #128C7E)", color: "#fff" }}
        >
          <span className="text-lg">💬</span>
          Invite your family on WhatsApp
        </button>

        <p className="text-center text-xs mt-2" style={{ color: "rgba(61,43,26,.28)" }}>
          Your circle is private. Only invited members can see your memories.
        </p>
      </div>

      {/* ── Fixed CTA ─────────────────────────────────────────────────────── */}
      <div
        className="fixed bottom-0 left-0 right-0 px-5 pb-8 pt-4 z-20"
        style={{ background: "linear-gradient(to top, rgba(240,228,196,1) 60%, transparent)" }}
      >
        <button
          onClick={() => navigate("/record")}
          className="w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-3"
          style={{
            background: "linear-gradient(135deg, #E8742A, #D4621A)",
            color: "#fff",
            boxShadow: "0 0 30px rgba(232,116,42,.4)",
          }}
        >
          <Mic size={20} />+ Add a voice to the circle
        </button>
      </div>
    </div>
  );
};

export default Circle;
