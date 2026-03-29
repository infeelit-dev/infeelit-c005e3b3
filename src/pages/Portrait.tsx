import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import BubbleCanvas from "@/components/BubbleCanvas";

const GENERATIONS = [
  "Silent Generation",
  "Baby Boomers",
  "Generation X",
  "Millennials",
  "Generation Z",
  "Generation Alpha",
];

// Sélection Nostalgique : Noir & Blanc, Vintage, Mémoire
const NOSTALGIA_IMAGES = [
  "https://images.unsplash.com/photo-1550684376-efcbd6e3f031?w=150", // Vieille voiture
  "https://images.unsplash.com/photo-1526666923127-b2970f64b422?w=150", // Appareil photo ancien
  "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=150", // Art abstrait doux
  "https://images.unsplash.com/flagged/photo-1572392640988-ba48d1a74457?w=150", // Peinture classique
  "https://images.unsplash.com/photo-1582559930335-515456f9324e?w=150", // Paysage Noir & Blanc
  "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=150", // Polaroid vintage
  "https://images.unsplash.com/photo-1520182205149-1e5e4e7329b4?w=150", // Jouet en bois ancien
  "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=150", // Famille vintage
];

const Portrait = () => {
  const navigate = useNavigate();
  const [generation, setGeneration] = useState("");
  const [hasChildren, setHasChildren] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen gradient-canvas flex flex-col overflow-hidden relative">
      {/* MOTEUR DE BULLES NOSTALGIQUES */}
      <div className="relative h-[38vh] w-full">
        {/* On injecte des styles CSS pour booster la vitesse de BubbleCanvas uniquement ici */}
        <style>{`
          .portrait-canvas canvas {
            filter: contrast(1.1) saturate(0.8); /* Look un peu plus argentique */
          }
          /* Animation de pulsation douce pour les bulles */
          @keyframes subtle-pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
          }
          .bubble-portrait { animation: subtle-pulse 4s ease-in-out infinite; }
        `}</style>

        <div className="portrait-canvas h-full w-full">
          {/* Note: Si BubbleCanvas accepte des images en props, on les passe ici. 
              Sinon, on utilise le rendu par défaut mais avec le style booster */}
          <BubbleCanvas onBubbleClick={() => {}} />
        </div>

        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#FDFCFB] pointer-events-none" />
      </div>

      <div className="px-6 flex flex-col flex-1 z-10 -mt-8">
        <h1 className="text-3xl font-black text-center text-[#1A4D4D] mb-1 tracking-tight">A little bit about you</h1>
        <p className="text-center text-[#4A5568] text-xs mb-8 opacity-80">Personalizing your time capsule...</p>

        {/* Grille de générations épurée */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          {GENERATIONS.map((gen) => (
            <button
              key={gen}
              onClick={() => setGeneration(gen)}
              className={`px-3 py-4 rounded-2xl transition-all text-[11px] font-bold border backdrop-blur-md ${
                generation === gen
                  ? "bg-white/70 border-[#F97316] text-[#1A4D4D] shadow-xl scale-105"
                  : "bg-white/20 border-white/40 text-[#1A4D4D]/70 hover:bg-white/40"
              }`}
            >
              {gen}
            </button>
          ))}
        </div>

        {/* Question Famille */}
        <div className="mb-8 text-center">
          <p className="text-[#1A4D4D] text-sm font-black mb-4 uppercase tracking-widest opacity-70">Family Circle</p>
          <div className="flex gap-10 justify-center">
            {[
              { label: "Yes", value: true },
              { label: "No", value: false },
            ].map((opt) => (
              <button
                key={opt.label}
                onClick={() => setHasChildren(opt.value)}
                className={`w-14 h-14 rounded-full flex items-center justify-center text-xs font-black border-2 transition-all shadow-sm ${
                  hasChildren === opt.value
                    ? "bg-[#F97316] border-[#F97316] text-white shadow-orange-200 shadow-lg scale-110"
                    : "bg-white/30 border-white/50 text-[#1A4D4D]/60"
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
          className="w-full py-4 rounded-full gradient-orange text-white font-black text-lg shadow-2xl mb-10 transform transition-all active:scale-95 disabled:opacity-20"
        >
          Create my story
        </button>
      </div>
    </div>
  );
};

export default Portrait;
