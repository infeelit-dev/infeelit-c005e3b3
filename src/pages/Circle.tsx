import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Copy, Check, Mic, Play, Volume2, Video } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Assets
import grandfatherImg from "@/assets/grandfather.jpg";
import marryImg from "@/assets/marry.jpg";
import loveImg from "@/assets/love.jpg";
import relaxImg from "@/assets/relax.jpg";
import birthImg from "@/assets/birth.jpg";
import picnicImg from "@/assets/picnic.jpg";
import travelImg from "@/assets/travel.jpg";
import childImg from "@/assets/child.jpg";

// --- Types ---
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

// --- Static Data ---
const AI_QUESTION = "What is the most beautiful lesson of courage your father ever gave you?";

const DEMO_MEMBERS = [
  {
    id: "fatima",
    name: "Fatima",
    count: 12,
    memType: "voices",
    photo: marryImg,
    hasNew: true,
    left: 32,
    top: 28,
    size: 80,
    float: "mf-a",
  },
  {
    id: "karim",
    name: "Karim",
    count: 8,
    memType: "voices",
    photo: loveImg,
    hasNew: true,
    left: 262,
    top: 16,
    size: 75,
    float: "mf-b",
  },
  {
    id: "mother",
    name: "Mother",
    count: 8,
    memType: "moments",
    photo: relaxImg,
    hasNew: true,
    left: 298,
    top: 140,
    size: 70,
    float: "mf-c",
  },
  {
    id: "nadia",
    name: "A. Nadia",
    count: 5,
    memType: "moments",
    photo: birthImg,
    hasNew: false,
    left: 14,
    top: 156,
    size: 65,
    float: "mf-a",
  },
  {
    id: "sultan",
    name: "Sultan",
    count: 3,
    memType: "moments",
    photo: childImg,
    hasNew: false,
    left: 278,
    top: 268,
    size: 62,
    isPet: true,
    float: "mf-b",
  },
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
    title: "Memories of Agadir 1987",
    duration: "3 min",
    type: "video",
    thumbnail: grandfatherImg,
    photo: marryImg,
    timeAgo: "1d",
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

  useEffect(() => {
    sphereTimerRef.current = setInterval(() => {
      setSphereMode((prev) => (prev === "question" ? "memory" : "question"));
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

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-x-hidden"
      style={{
        background: "radial-gradient(ellipse at 50% 36%, rgba(255,210,120,0.4) 0%, #EDD9A8 100%)",
        backgroundColor: "#F0E4C8",
      }}
    >
      <style>{`
        @keyframes mfA { 0%,100% { transform: translate(0,0); } 50% { transform: translate(6px,-10px); } }
        @keyframes mfB { 0%,100% { transform: translate(0,0); } 50% { transform: translate(-8px,8px); } }
        @keyframes mfC { 0%,100% { transform: translate(0,0); } 50% { transform: translate(5px,10px); } }
        .mf-a { animation: mfA 8s ease-in-out infinite; }
        .mf-b { animation: mfB 10s ease-in-out infinite; }
        .mf-c { animation: mfC 12s ease-in-out infinite; }
        @keyframes goldRing { 0%,100% { box-shadow: 0 0 0 3px rgba(255,200,50,.9), 0 0 15px rgba(255,170,0,.5); } 50% { box-shadow: 0 0 0 4px rgba(255,220,80,1), 0 0 25px rgba(255,200,0,.8); } }
        @keyframes flicker { 0%,100% { transform: scale(1); opacity: 1; } 50% { transform: scale(0.9) translateY(-1px); opacity: 0.8; } }
        .gold-ring { animation: goldRing 2s ease-in-out infinite; }
        .flame { animation: flicker 0.2s ease-in-out infinite; }
        .hide-scroll::-webkit-scrollbar { display: none; }
      `}</style>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-5 pt-14 pb-2">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-stone-900/10 text-stone-800">
          ←
        </button>
        <div className="text-center">
          <h1 className="font-bold text-lg font-serif text-stone-900">Al-Fassi Family</h1>
          <p className="text-[10px] uppercase tracking-widest opacity-40">Our Circle of Life</p>
        </div>
        <div className="px-3 py-1 bg-purple-100 border border-purple-200 text-purple-700 rounded-full text-[10px] font-bold">
          🔒 Private
        </div>
      </div>

      {/* Constellation */}
      <div className="relative mx-auto" style={{ width: "370px", height: "440px" }}>
        {/* Sphère Centrale */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-32 h-32 rounded-full flex items-center justify-center p-1 bg-gradient-to-br from-amber-300 to-orange-500 shadow-2xl"
          style={{ boxShadow: "0 0 40px rgba(232,116,42,0.4)" }}
        >
          <div className="w-full h-full rounded-full bg-white/10 backdrop-blur-md flex flex-col items-center justify-center p-4 text-center">
            {sphereMode === "question" ? (
              <p className="text-[10px] font-bold text-white italic">"{AI_QUESTION}"</p>
            ) : (
              <div className="text-white">
                <Play size={20} className="mx-auto mb-1" />
                <p className="text-[9px] font-bold">New Memory</p>
              </div>
            )}
          </div>
        </div>

        {/* Membres Vivants */}
        {DEMO_MEMBERS.map((m) => (
          <div key={m.id} className={`absolute ${m.float}`} style={{ left: m.left, top: m.top, width: m.size }}>
            <div
              className={`rounded-full overflow-hidden relative ${m.hasNew ? "gold-ring" : "border-2 border-white/50"}`}
              style={{ width: m.size, height: m.size }}
            >
              <img src={m.photo} className="w-full h-full object-cover" />
              {m.isPet && (
                <div className="absolute bottom-0 right-0 bg-orange-600 rounded-full p-1 text-[10px] border-2 border-white">
                  🐾
                </div>
              )}
            </div>
            <p className="text-[9px] font-bold text-center mt-1">{m.name}</p>
          </div>
        ))}

        {/* Papa Défunt & Bougie */}
        <div className="absolute" style={{ left: "22px", top: "300px", zIndex: 5 }}>
          <div className="w-[72px] h-[90px] rounded-sm overflow-hidden border-2 border-amber-500/80 shadow-xl grayscale sepia-[0.5] brightness-90">
            <img src={grandfatherImg} className="w-full h-full object-cover" />
          </div>
          <p className="text-[9px] font-bold text-center mt-1">Father</p>
        </div>

        <div className="absolute flex flex-col items-center" style={{ left: "110px", top: "315px", zIndex: 5 }}>
          <div className="flame w-2 h-4 bg-orange-500 rounded-full blur-[1px] shadow-[0_0_10px_orange]" />
          <div className="w-4 h-12 bg-stone-100 rounded-t-sm shadow-inner" />
        </div>
      </div>

      {/* Shelf "This Week" (Le bas que tu voulais garder) */}
      <div className="px-5 mb-6 relative z-10">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-black uppercase tracking-widest opacity-40">This week in your circle</p>
          <button className="text-[10px] font-bold text-orange-600">See all →</button>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 hide-scroll">
          {DEMO_SHELF.map((card) => (
            <div
              key={card.id}
              className="shrink-0 w-36 h-28 bg-white/30 backdrop-blur-md rounded-2xl border border-white/40 overflow-hidden shadow-sm"
            >
              <img src={card.thumbnail} className="w-full h-16 object-cover" />
              <div className="p-2">
                <div className="flex items-center gap-1 mb-1">
                  <img src={card.photo} className="w-3 h-3 rounded-full object-cover" />
                  <span className="text-[8px] font-bold">{card.memberName}</span>
                </div>
                <p className="text-[9px] font-bold truncate">{card.title}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filtres & CTA */}
      <div className="px-5 mb-6">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={`px-4 py-2 rounded-full text-xs font-bold ${activeFilter === f.id ? "bg-orange-600 text-white" : "bg-white/50 text-stone-800"}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 pb-32 space-y-3">
        <div className="p-4 bg-white/40 rounded-2xl border border-white/50 flex items-center justify-between">
          <div className="truncate">
            <p className="text-[8px] uppercase opacity-40">Invite Link</p>
            <p className="text-xs font-mono truncate">infeelit.com/join/demo</p>
          </div>
          <button onClick={handleCopyLink} className="p-2 bg-white/60 rounded-xl">
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </button>
        </div>
        <button
          onClick={handleWhatsApp}
          className="w-full py-4 bg-[#25D366] text-white rounded-2xl font-bold flex items-center justify-center gap-2"
        >
          💬 Invite family on WhatsApp
        </button>
      </div>

      {/* Fixed CTA Bas */}
      <div className="fixed bottom-0 left-0 right-0 px-5 pb-8 pt-4 bg-gradient-to-t from-[#F0E4C8] to-transparent">
        <button
          onClick={() => navigate("/record")}
          className="w-full py-4 bg-orange-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-2xl"
        >
          <Mic size={20} /> + Add a voice to the circle
        </button>
      </div>
    </div>
  );
};

export default Circle;
