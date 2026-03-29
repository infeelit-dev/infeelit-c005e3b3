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

// Sources d'images durcies (Unsplash Source ID - Plus stable)
const LIFE_IMAGES = [
  "https://images.unsplash.com/photo-1484981138541-3d074aa97716?w=400&q=80",
  "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=400&q=80",
  "https://images.unsplash.com/photo-1544333346-64041d6365f6?w=400&q=80",
  "https://images.unsplash.com/photo-1506863530036-1efeddceb993?w=400&q=80",
  "https://images.unsplash.com/photo-1529391409740-59f2dea08bc6?w=400&q=80",
  "https://images.unsplash.com/photo-1464998857633-50e59fbf2fe6?w=400&q=80",
  "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=400&q=80",
  "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=400&q=80",
  "https://images.unsplash.com/photo-1536640712247-c45474d61b31?w=400&q=80",
  "https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=400&q=80",
];

const Portrait = () => {
  const navigate = useNavigate();
  const [generation, setGeneration] = useState("");
  const [hasChildren, setHasChildren] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen gradient-canvas flex flex-col overflow-hidden relative bg-[#FDFCFB]">
      <style>{`
        @keyframes wide-orbit {
          0% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(60px, -40px) rotate(2deg); }
          66% { transform: translate(-50px, -70px) rotate(-2deg); }
          100% { transform: translate(0, 0) rotate(0deg); }
        }
        .bubble-vibrant { 
          animation: wide-orbit linear infinite;
          background-color: #E2E8F0; /* Couleur de secours si l'image saute */
        }
      `}</style>

      {/* ZONE DE MOUVEMENT ESPACÉE (Haut d'écran) */}
      <div className="relative h-[45vh] w-full pt-4">
        {LIFE_IMAGES.map((img, i) => {
          const size = `clamp(50px, ${9 + i}vw, 115px)`;
          return (
            <div
              key={i}
              className="absolute rounded-full border-2 border-white shadow-2xl overflow-hidden bubble-vibrant"
              style={{
                width: size,
                height: size,
                // Espacement forcé : i * 11% pour bien répartir sur toute la largeur
                top: `${10 + Math.random() * 45}%`,
                left: `${2 + i * 10.5}%`,
                animationDuration: `${14 + i * 2.5}s`,
                animationDelay: `${i * -3.5}s`,
                zIndex: 10 + i,
              }}
            >
              <img
                src={img}
                className="w-full h-full object-cover"
                alt=""
                onError={(e) => {
                  // Si l'image bug encore, on met un fond de couleur Infeelit
                  e.currentTarget.style.display = "none";
                  e.currentTarget.parentElement!.style.backgroundColor = i % 2 === 0 ? "#1A4D4D" : "#F97316";
                }}
              />
            </div>
          );
        })}
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#FDFCFB] via-[#FDFCFB]/95 to-transparent z-10 pointer-events-none" />
      </div>

      <div className="px-6 flex flex-col flex-1 z-20 -mt-10 bg-[#FDFCFB]/85 backdrop-blur-xl pt-8 rounded-t-[45px] shadow-2xl">
        <h1 className="text-3xl font-black text-center text-[#1A4D4D] mb-1 tracking-tighter">A little bit about you</h1>
        <p className="text-center text-[#4A5568] text-[10px] mb-8 font-bold uppercase tracking-widest opacity-50">
          Personalizing your legacy
        </p>

        <div className="grid grid-cols-2 gap-3 mb-8">
          {GENERATIONS.map((gen) => (
            <button
              key={gen}
              onClick={() => setGeneration(gen)}
              className={`px-3 py-4 rounded-2xl transition-all text-[11px] font-bold border ${
                generation === gen
                  ? "bg-white border-[#F97316] text-[#F97316] shadow-xl scale-[1.02]"
                  : "bg-white/40 border-white/40 text-[#1A4D4D]/70 hover:bg-white/60"
              }`}
            >
              {gen}
            </button>
          ))}
        </div>

        <div className="mb-8 text-center">
          <p className="text-[#1A4D4D] text-[10px] font-black mb-4 uppercase tracking-[0.3em] opacity-40">
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
