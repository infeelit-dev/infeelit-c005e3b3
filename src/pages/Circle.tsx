import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Copy, Check, Mic, Play, Volume2, Video, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

// Assets
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

// --- Types & Data ---
type SphereMode = "question" | "memory";
const AI_QUESTION = "What is the most beautiful lesson of courage your father ever gave you?";

const DEMO_MEMBERS = [
  {
    id: "fatima",
    name: "Fatima",
    subtitle: "34 · 12 voices",
    photo: marryImg,
    hasNew: true,
    left: 20,
    top: 40,
    size: 80,
    delay: 0,
  },
  {
    id: "karim",
    name: "Karim",
    subtitle: "28 · 8 voices",
    photo: loveImg,
    hasNew: true,
    left: 260,
    top: 20,
    size: 75,
    delay: 1,
  },
  {
    id: "mother",
    name: "Mother",
    subtitle: "60 · 8 moments",
    photo: relaxImg,
    hasNew: true,
    left: 280,
    top: 160,
    size: 70,
    delay: 2,
  },
  {
    id: "sultan",
    name: "Sultan",
    subtitle: "Pet",
    photo: childImg,
    hasNew: false,
    left: 180,
    top: 320,
    size: 65,
    isPet: true,
    delay: 1.5,
  },
];

const SHELF_DATA = [
  {
    id: "s1",
    memberName: "Karim",
    title: "The day of the exam",
    duration: "2 min",
    type: "video",
    thumbnail: travelImg,
    photo: loveImg,
  },
  {
    id: "s2",
    memberName: "Mother",
    title: "The tajine recipe",
    duration: "4 min",
    type: "audio",
    thumbnail: picnicImg,
    photo: relaxImg,
  },
];

// --- Component ---
const Circle = () => {
  const navigate = useNavigate();
  const [sphereMode, setSphereMode] = useState<SphereMode>("question");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setSphereMode((prev) => (prev === "question" ? "memory" : "question"));
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const handleCopyLink = () => {
    navigator.clipboard.writeText("https://infeelit.com/join/family");
    setCopied(true);
    toast.success("Link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-x-hidden"
      style={{ background: "radial-gradient(circle at 50% 40%, #FDF6E9 0%, #D2B48C 100%)" }}
    >
      {/* 1. Texture Murale */}
      <div
        className="absolute inset-0 opacity-30 mix-blend-multiply pointer-events-none z-0"
        style={{ backgroundImage: `url("https://www.transparenttextures.com/patterns/natural-paper.png")` }}
      />

      {/* 2. Header */}
      <header className="relative z-20 px-6 pt-12 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="p-2 bg-stone-900/10 rounded-full">
          ←
        </button>
        <div className="text-center">
          <h1 className="font-serif font-bold text-stone-900">Al-Fassi Family</h1>
          <p className="text-[10px] uppercase tracking-widest opacity-50 font-bold">Circle of Life</p>
        </div>
        <div className="px-3 py-1 bg-purple-100 border border-purple-200 text-purple-700 rounded-full text-[10px] font-bold">
          🔒 Private
        </div>
      </header>

      {/* 3. Constellation & Sphère */}
      <div className="relative mx-auto mt-4" style={{ width: 370, height: 420 }}>
        {/* Sphère Centrale */}
        <motion.div
          animate={{
            scale: [1, 1.05, 1],
            boxShadow: [
              "0 0 40px rgba(232,116,42,0.3)",
              "0 0 70px rgba(232,116,42,0.5)",
              "0 0 40px rgba(232,116,42,0.3)",
            ],
          }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute left-1/2 top-40 -translate-x-1/2 -translate-y-1/2 z-10 w-32 h-32 rounded-full flex items-center justify-center p-1 bg-gradient-to-br from-amber-300 to-orange-500 shadow-2xl"
          onClick={() => navigate("/record")}
        >
          <div className="w-full h-full rounded-full bg-white/10 backdrop-blur-md flex flex-col items-center justify-center p-4 text-center">
            <AnimatePresence mode="wait">
              <motion.div key={sphereMode} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {sphereMode === "question" ? (
                  <p className="text-[10px] font-bold text-white leading-tight italic">"{AI_QUESTION}"</p>
                ) : (
                  <div className="text-white">
                    <Play size={20} className="mx-auto mb-1" />
                    <p className="text-[9px] font-bold">Karim · 2h ago</p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Membres Flottants */}
        {DEMO_MEMBERS.map((m) => (
          <motion.div
            key={m.id}
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 4, repeat: Infinity, delay: m.delay }}
            className="absolute flex flex-col items-center"
            style={{ left: m.left, top: m.top }}
          >
            <div
              className={`relative rounded-full p-0.5 ${m.hasNew ? "bg-gradient-to-tr from-amber-400 to-yellow-200 shadow-lg shadow-amber-500/50" : "bg-white/50"}`}
            >
              <img src={m.photo} className="rounded-full object-cover" style={{ width: m.size, height: m.size }} />
              {m.isPet && (
                <div className="absolute bottom-0 right-0 bg-orange-600 rounded-full p-1 text-[10px] border-2 border-amber-100">
                  🐾
                </div>
              )}
            </div>
            <p className="text-[10px] font-bold mt-1 text-stone-900">{m.name}</p>
          </motion.div>
        ))}

        {/* 4. Le Sanctuaire (Papa & Bougie) - Remonté légèrement */}
        <div className="absolute left-4 top-[300px] z-20 flex items-end gap-3">
          <motion.div className="relative -rotate-3 p-1.5 bg-[#4A2E0A] rounded-sm shadow-2xl border-2 border-amber-600/30">
            <div className="w-20 h-28 overflow-hidden grayscale sepia-[0.4] brightness-90">
              <img src={grandfatherImg} className="w-full h-full object-cover" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            <p className="absolute bottom-1 left-0 right-0 text-[8px] text-white text-center font-serif italic">Papa</p>
          </motion.div>

          <div className="flex flex-col items-center pb-1">
            <motion.div
              animate={{ opacity: [0.8, 1, 0.8], scale: [1, 1.1, 1] }}
              transition={{ duration: 0.2, repeat: Infinity }}
              className="w-3 h-5 bg-orange-500 rounded-full blur-[2px] shadow-[0_0_15px_orange]"
            />
            <div className="w-5 h-14 bg-gradient-to-r from-stone-100 via-stone-50 to-stone-200 rounded-t-sm shadow-inner" />
          </div>
        </div>
      </div>

      {/* 5. Carrousel "This Week" */}
      <div className="relative z-20 px-6 mt-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[10px] font-black uppercase tracking-widest opacity-40">This week in your circle</h2>
          <button className="text-[10px] font-bold text-orange-600">See all →</button>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
          {SHELF_DATA.map((s) => (
            <div
              key={s.id}
              className="min-w-[160px] bg-white/30 backdrop-blur-md rounded-2xl border border-white/40 overflow-hidden shadow-sm"
            >
              <img src={s.thumbnail} className="w-full h-20 object-cover" />
              <div className="p-2">
                <div className="flex items-center gap-1.5 mb-1">
                  <img src={s.photo} className="w-4 h-4 rounded-full object-cover" />
                  <span className="text-[8px] font-bold">{s.memberName}</span>
                </div>
                <p className="text-[9px] font-bold truncate">{s.title}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Footer avec Filtres & CTA */}
      <footer className="mt-auto relative z-30 px-6 pb-12 space-y-4">
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-2">
          {["All", "🎙️ Voices", "🎬 Moments", "📖 Chronicles"].map((f) => (
            <button
              key={f}
              className={`px-4 py-2 rounded-full text-[10px] font-bold whitespace-nowrap ${f === "All" ? "bg-orange-600 text-white" : "bg-white/40"}`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          <button
            onClick={() => navigate("/record")}
            className="w-full py-4 bg-orange-600 text-white rounded-2xl font-bold flex items-center justify-center gap-3 shadow-[0_10px_20px_rgba(232,116,42,0.3)]"
          >
            <Mic size={20} /> + Add a voice to the circle
          </button>

          <button
            onClick={handleWhatsApp}
            className="w-full py-3 bg-[#25D366] text-white rounded-2xl font-bold flex items-center justify-center gap-2 text-sm"
          >
            💬 Invite your family on WhatsApp
          </button>
        </div>
      </footer>
    </div>
  );
};

export default Circle;
