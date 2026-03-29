import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const GENERATIONS = [
  "Silent Generation",
  "Baby Boomers",
  "Generation X",
  "Millennials",
  "Generation Z",
  "Generation Alpha",
];

// 10 Images de vie ultra-stables (Sources variées pour éviter les blocages)
const LIFE_IMAGES = [
  "https://images.pexels.com/photos/1128318/pexels-photo-1128318.jpeg?auto=compress&w=300",
  "https://images.pexels.com/photos/1015568/pexels-photo-1015568.jpeg?auto=compress&w=300",
  "https://images.pexels.com/photos/1468370/pexels-photo-1468370.jpeg?auto=compress&w=300",
  "https://images.pexels.com/photos/931007/pexels-photo-931007.jpeg?auto=compress&w=300",
  "https://images.pexels.com/photos/1000445/pexels-photo-1000445.jpeg?auto=compress&w=300",
  "https://images.pexels.com/photos/1131975/pexels-photo-1131975.jpeg?auto=compress&w=300",
  "https://images.pexels.com/photos/1684151/pexels-photo-1684151.jpeg?auto=compress&w=300",
  "https://images.pexels.com/photos/1310166/pexels-photo-1310166.jpeg?auto=compress&w=300",
  "https://images.pexels.com/photos/1105191/pexels-photo-1105191.jpeg?auto=compress&w=300",
  "https://images.pexels.com/photos/1645634/pexels-photo-1645634.jpeg?auto=compress&w=300",
];

const Portrait = () => {
  const navigate = useNavigate();
  const [generation, setGeneration] = useState("");
  const [hasChildren, setHasChildren] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen gradient-canvas flex flex-col overflow-hidden relative bg-[#FDFCFB]">
      <style>{`
        /* 10 Animations distinctes pour forcer l'indépendance totale */
        @keyframes orbit-1 { 0%, 100% { transform: translate(0,0); } 50% { transform: translate(40px, -60px); } }
        @keyframes orbit-2 { 0%, 100% { transform: translate(0,0); } 50% { transform: translate(-50px, -40px); } }
        @keyframes orbit-3 { 0%, 100% { transform: translate(0,0); } 50% { transform: translate(30px, -80px); } }
        @keyframes orbit-4 { 0%, 100% { transform: translate(0,0); } 50% { transform: translate(-40px, -30px); } }
        @keyframes orbit-5 { 0%, 100% { transform: translate(0,0); } 50% { transform: translate(50px, -50px); } }
        @keyframes orbit-6 { 0%, 100% { transform: translate(0,0); } 50% { transform: translate(-30px, -70px); } }
        @keyframes orbit-7 { 0%, 100% { transform: translate(0,0); } 50% { transform: translate(45px, -35px); } }
        @keyframes orbit-8 { 0%, 100% { transform: translate(0,0); } 50% { transform: translate(-25px, -55px); } }
        @keyframes orbit-9 { 0%, 100% { transform: translate(0,0); } 50% { transform: translate(35px, -45px); } }
        @keyframes orbit-10 { 0%, 100% { transform: translate(0,0); } 50% { transform: translate(-55px, -65px); } }

        .b-1 { animation: orbit-1 16s ease-in-out infinite; }
        .b-2 { animation: orbit-2 19s ease-in-out infinite; }
        .b-3 { animation: orbit-3 14s ease-in-out infinite; }
        .b-4 { animation: orbit-4 22s ease-in-out infinite; }
        .b-5 { animation: orbit-5 17s ease-in-out infinite; }
        .b-6 { animation: orbit-6 20s ease-in-out infinite; }
        .b-7 { animation: orbit-7 15s ease-in-out infinite; }
        .b-8 { animation: orbit-8 23s ease-in-out infinite; }
        .b-9 { animation: orbit-9 18s ease-in-out infinite; }
        .b-10 { animation: orbit-10 21s ease-in-out infinite; }
      `}</style>

      <div className="relative h-[45vh] w-full pt-4">
        {LIFE_IMAGES.map((img, i) => {
          const size = `clamp(55px, ${10 + i}vw, 110px)`;
          return (
            <div
              key={i}
              className={`absolute rounded-full border-2 border-white/90 shadow-2xl overflow-hidden b-${i + 1} bg-[#F1F5F9]`}
              style={{
                width: size,
                height: size,
                top: `${15 + Math.random() * 40}%`,
                left: `${2 + i * 10}%`, // Espacement forcé
                zIndex: 10 + i,
              }}
            >
              <img
                src={img}
                className="w-full h-full object-cover grayscale-[5%]"
                alt=""
                onError={(e) => {
                  e.currentTarget.parentElement!.style.background = i % 2 === 0 ? "#1A4D4D" : "#F97316";
                }}
              />
            </div>
          );
        })}
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#FDFCFB] via-[#FDFCFB]/90 to-transparent z-10 pointer-events-none" />
      </div>

      <div className="px-6 flex flex-col flex-1 z-20 -mt-8 bg-[#FDFCFB]/80 backdrop-blur-xl pt-10 rounded-t-[50px] shadow-2xl">
        <h1 className="text-3xl font-black text-center text-[#1A4D4D] mb-1 tracking-tighter">A little bit about you</h1>
        <p className="text-center text-[#4A5568] text-[10px] mb-8 font-bold uppercase tracking-widest opacity-60">
          Personalizing your legacy journey...
        </p>

        <div className="grid grid-cols-2 gap-3 mb-8">
          {GENERATIONS.map((gen) => (
            <button
              key={gen}
              onClick={() => setGeneration(gen)}
              className={`px-3 py-4 rounded-2xl transition-all text-[11px] font-bold border ${
                generation === gen
                  ? "bg-white border-[#F97316] text-[#F97316] shadow-xl"
                  : "bg-white/40 border-white/40 text-[#1A4D4D]/70 hover:bg-white/60"
              }`}
            >
              {gen}
            </button>
          ))}
        </div>

        <div className="mb-8 text-center">
          <p className="text-[#1A4D4D] text-[10px] font-black mb-4 uppercase tracking-[0.3em] opacity-50">
            Family Circle
          </p>
          <div className="flex gap-12 justify-center">
            {[
              { label: "Yes", value: true },
              { label: "No", value: false },
            ].map((opt) => (
              <button
                key={opt.label}
                onClick={() => setHasChildren(opt.value)}
                className={`w-14 h-14 rounded-full flex items-center justify-center text-xs font-black border-2 transition-all ${
                  hasChildren === opt.value
                    ? "bg-[#F97316] border-[#F97316] text-white shadow-lg scale-110"
                    : "bg-white/40 border-white/50 text-[#1A4D4D]/60"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1" />

        <button
          onClick={() => navigate("/")}
          disabled={!generation || hasChildren === null}
          className="w-full py-5 rounded-full bg-[#F97316] text-white font-black text-lg shadow-2xl mb-10 active:scale-95 transition-all disabled:opacity-20"
        >
          Create my story
        </button>
      </div>
    </div>
  );
};

export default Portrait;
