import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

// IMPORTS DES 10 IMAGES RÉELLES (Stockées dans tes assets)
import imgRelax from "@/assets/relax.jpg";
import imgTravel from "@/assets/travel.jpg";
import imgPicnic from "@/assets/picnic.jpg";
import imgGrandfather from "@/assets/grandfather.jpg";
import imgHouse from "@/assets/house.jpg";
import imgMarry from "@/assets/marry.jpg";
import imgLove from "@/assets/love.jpg";
import imgGraduate from "@/assets/graduate.jpg";
import imgChild from "@/assets/child.jpg";
import imgBirth from "@/assets/birth.jpg";

const GENERATIONS = [
  "Silent Generation",
  "Baby Boomers",
  "Generation X",
  "Millennials",
  "Generation Z",
  "Generation Alpha",
];

// Création de la liste des 10 sources d'images réelles
const LIFE_IMAGES = [
  imgBirth,
  imgChild,
  imgGraduate,
  imgMarry,
  imgHouse,
  imgLove,
  imgGrandfather,
  imgPicnic,
  imgTravel,
  imgRelax,
];

const Portrait = () => {
  const navigate = useNavigate();
  const [generation, setGeneration] = useState("");
  const [hasChildren, setHasChildren] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen gradient-canvas flex flex-col overflow-hidden relative bg-[#FDFCFB]">
      <style>{`
        /* TES 10 ANIMATIONS ORBITALES PARFAITES (ON NE TOUCHE RIEN) */
        @keyframes orbit-1 { 0%, 100% { transform: translate(0,0); } 50% { transform: translate(50px, -70px); } }
        @keyframes orbit-2 { 0%, 100% { transform: translate(0,0); } 50% { transform: translate(-60px, -40px); } }
        @keyframes orbit-3 { 0%, 100% { transform: translate(0,0); } 50% { transform: translate(40px, -90px); } }
        @keyframes orbit-4 { 0%, 100% { transform: translate(0,0); } 50% { transform: translate(-30px, -50px); } }
        @keyframes orbit-5 { 0%, 100% { transform: translate(0,0); } 50% { transform: translate(70px, -30px); } }
        @keyframes orbit-6 { 0%, 100% { transform: translate(0,0); } 50% { transform: translate(-45px, -80px); } }
        @keyframes orbit-7 { 0%, 100% { transform: translate(0,0); } 50% { transform: translate(25px, -65px); } }
        @keyframes orbit-8 { 0%, 100% { transform: translate(0,0); } 50% { transform: translate(-55px, -25px); } }
        @keyframes orbit-10 { 0%, 100% { transform: translate(0,0); } 50% { transform: translate(-10px, -75px); } }

        .o-1 { animation: orbit-1 15s ease-in-out infinite; }
        .o-2 { animation: orbit-2 18s ease-in-out infinite; }
        .o-3 { animation: orbit-3 14s ease-in-out infinite; }
        .o-4 { animation: orbit-4 21s ease-in-out infinite; }
        .o-5 { animation: orbit-5 16s ease-in-out infinite; }
        .o-6 { animation: orbit-6 19s ease-in-out infinite; }
        .o-7 { animation: orbit-7 13s ease-in-out infinite; }
        .o-8 { animation: orbit-8 22s ease-in-out infinite; }
        .o-10 { animation: orbit-10 20s ease-in-out infinite; }
      `}</style>

      {/* ZONE DE NUÉE AVEC TES IMAGES RÉELLES (Positions et tailles d'origine) */}
      <div className="relative h-[48vh] w-full pt-4">
        {LIFE_IMAGES.map((img, i) => {
          const size = `clamp(55px, ${10 + i}vw, 115px)`;
          return (
            <div
              key={i}
              className={`absolute rounded-full border-2 border-white/90 shadow-2xl overflow-hidden o-${i + 1} bg-[#F1F5F9]`}
              style={{
                width: size,
                height: size,
                top: `${12 + Math.random() * 48}%`,
                left: `${2 + i * 10}%`, // Espacement horizontal parfait (10%)
                zIndex: 10 + i,
              }}
            >
              <img src={img} className="w-full h-full object-cover shadow-inner grayscale-[5%]" alt="" />
            </div>
          );
        })}
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#FDFCFB] via-[#FDFCFB]/95 to-transparent z-10 pointer-events-none" />
      </div>

      <div className="px-6 flex flex-col flex-1 z-20 -mt-10 bg-[#FDFCFB]/85 backdrop-blur-xl pt-10 rounded-t-[50px] shadow-2xl">
        <h1 className="text-3xl font-black text-center text-[#1A4D4D] mb-1 tracking-tighter">A little bit about you</h1>
        <p className="text-center text-[#4A5568] text-[10px] mb-8 font-bold uppercase tracking-widest opacity-60">
          Personalizing your legacy journey...
        </p>

        {/* Grille de générations (D'origine) */}
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

        {/* Question Famille (D'origine) */}
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
                    : "bg-white/40 border-white/50 text-[#1A4D4D]/60 shadow-sm"
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
