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

// 10 IMAGES ULTRA-RÉALISTES ET FIABLES (Zéro flou, Zéro coucher de soleil)
const LIFE_IMAGES = [
  "https://cdn.pixabay.com/photo/2016/11/29/03/36/baby-1867104_1280.jpg", // Pieds de bébé
  "https://cdn.pixabay.com/photo/2017/08/02/00/49/people-2569234_1280.jpg", // Mains qui se tiennent
  "https://cdn.pixabay.com/photo/2015/03/15/13/59/grave-674443_1280.jpg", // Enfant rit aux éclats
  "https://cdn.pixabay.com/photo/2016/11/23/18/12/couple-1854148_1280.jpg", // Vieux couple
  "https://cdn.pixabay.com/photo/2014/11/26/15/20/girl-546419_1280.jpg", // Enfant lit
  "https://cdn.pixabay.com/photo/2017/09/26/22/02/family-2790246_1280.jpg", // Repas de famille
  "https://cdn.pixabay.com/photo/2015/07/31/15/07/people-869213_1280.jpg", // Groupe d'amis
  "https://cdn.pixabay.com/photo/2016/11/29/05/03/adult-1867451_1280.jpg", // Personne âgée
  "https://cdn.pixabay.com/photo/2017/08/07/20/12/children-2607361_1280.jpg", // Enfants jouent
  "https://cdn.pixabay.com/photo/2014/11/02/21/53/father-and-son-514518_1280.jpg", // Père et fils
];

const Portrait = () => {
  const navigate = useNavigate();
  const [generation, setGeneration] = useState("");
  const [hasChildren, setHasChildren] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen gradient-canvas flex flex-col overflow-hidden relative bg-[#FDFCFB]">
      <style>{`
        /* 10 Animations uniques pour l'indépendance totale */
        @keyframes orbit-1 { 0%, 100% { transform: translate(0,0); } 50% { transform: translate(50px, -70px); } }
        @keyframes orbit-2 { 0%, 100% { transform: translate(0,0); } 50% { transform: translate(-60px, -40px); } }
        @keyframes orbit-3 { 0%, 100% { transform: translate(0,0); } 50% { transform: translate(40px, -90px); } }
        @keyframes orbit-4 { 0%, 100% { transform: translate(0,0); } 50% { transform: translate(-30px, -50px); } }
        @keyframes orbit-5 { 0%, 100% { transform: translate(0,0); } 50% { transform: translate(70px, -30px); } }
        @keyframes orbit-6 { 0%, 100% { transform: translate(0,0); } 50% { transform: translate(-45px, -80px); } }
        @keyframes orbit-7 { 0%, 100% { transform: translate(0,0); } 50% { transform: translate(25px, -65px); } }
        @keyframes orbit-8 { 0%, 100% { transform: translate(0,0); } 50% { transform: translate(-55px, -25px); } }
        @keyframes orbit-9 { 0%, 100% { transform: translate(0,0); } 50% { transform: translate(15px, -45px); } }
        @keyframes orbit-10 { 0%, 100% { transform: translate(0,0); } 50% { transform: translate(-10px, -75px); } }

        .o-1 { animation: orbit-1 15s ease-in-out infinite; }
        .o-2 { animation: orbit-2 18s ease-in-out infinite; }
        .o-3 { animation: orbit-3 14s ease-in-out infinite; }
        .o-4 { animation: orbit-4 21s ease-in-out infinite; }
        .o-5 { animation: orbit-5 16s ease-in-out infinite; }
        .o-6 { animation: orbit-6 19s ease-in-out infinite; }
        .o-7 { animation: orbit-7 13s ease-in-out infinite; }
        .o-8 { animation: orbit-8 22s ease-in-out infinite; }
        .o-9 { animation: orbit-9 17s ease-in-out infinite; }
        .o-10 { animation: orbit-10 20s ease-in-out infinite; }
      `}</style>

      {/* ZONE DE NUÉE AVEC DE LA VRAIE VIE */}
      <div className="relative h-[48vh] w-full pt-4">
        {LIFE_IMAGES.map((img, i) => {
          const size = `clamp(55px, ${11 + i}vw, 120px)`;
          return (
            <div
              key={i}
              className={`absolute rounded-full border border-white/80 shadow-2xl overflow-hidden o-${i + 1} bg-[#F1F5F9]`}
              style={{
                width: size,
                height: size,
                top: `${10 + Math.random() * 55}%`,
                left: `${2 + i * 10.5}%`,
                zIndex: 10 + i,
              }}
            >
              <img src={img} className="w-full h-full object-cover" alt="" />
            </div>
          );
        })}
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#FDFCFB] via-[#FDFCFB]/95 to-transparent z-10 pointer-events-none" />
      </div>

      <div className="px-6 flex flex-col flex-1 z-20 -mt-12 bg-[#FDFCFB]/85 backdrop-blur-xl pt-10 rounded-t-[50px] shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
        <h1 className="text-3xl font-black text-center text-[#1A4D4D] mb-1 tracking-tighter">A little bit about you</h1>
        <p className="text-center text-[#4A5568] text-[10px] mb-8 font-bold uppercase tracking-widest opacity-60">
          Personalizing your legacy journey...
        </p>

        <div className="grid grid-cols-2 gap-3 mb-8">
          {GENERATIONS.map((gen) => (
            <button
              key={gen}
              onClick={() => setGeneration(gen)}
              className={`px-3 py-4 rounded-2xl transition-all text-[11px] font-bold borderbackdrop-blur-md ${
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
                className={`w-14 h-14 rounded-full flex items-center justify-center text-xs font-black border-2 transition-all backdrop-blur-lg ${
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
