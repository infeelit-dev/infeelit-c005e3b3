import { useState, useEffect } from "react";
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

// Sources d'images PEXELS (Ultra-fiables sur Lovable)
const LIFE_IMAGES = [
  "https://images.pexels.com/photos/1128318/pexels-photo-1128318.jpeg?auto=compress&cs=tinysrgb&w=300", // Famille rit
  "https://images.pexels.com/photos/1015568/pexels-photo-1015568.jpeg?auto=compress&cs=tinysrgb&w=300", // Enfants jouent
  "https://images.pexels.com/photos/1468370/pexels-photo-1468370.jpeg?auto=compress&cs=tinysrgb&w=300", // Grand-parent
  "https://images.pexels.com/photos/931007/pexels-photo-931007.jpeg?auto=compress&cs=tinysrgb&w=300", // Repas de famille
  "https://images.pexels.com/photos/1000445/pexels-photo-1000445.jpeg?auto=compress&cs=tinysrgb&w=300", // Jardin
  "https://images.pexels.com/photos/1131975/pexels-photo-1131975.jpeg?auto=compress&cs=tinysrgb&w=300", // Couple
  "https://images.unsplash.com/photo-1536640712247-c45474d61b31?w=300&q=80", // Lecture
  "https://images.pexels.com/photos/1310166/pexels-photo-1310166.jpeg?auto=compress&cs=tinysrgb&w=300", // Bébé
  "https://images.pexels.com/photos/1105191/pexels-photo-1105191.jpeg?auto=compress&cs=tinysrgb&w=300", // Pique-nique
  "https://images.pexels.com/photos/1645634/pexels-photo-1645634.jpeg?auto=compress&cs=tinysrgb&w=300", // Mains
];

const Portrait = () => {
  const navigate = useNavigate();
  const [generation, setGeneration] = useState("");
  const [hasChildren, setHasChildren] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFinish = async () => {
    if (!generation || hasChildren === null) return;
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from("profiles")
          .update({
            generation,
            has_children: hasChildren,
            onboarding_completed: true,
          })
          .eq("user_id", user.id);
      }
      navigate("/");
    } catch {
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-canvas flex flex-col overflow-hidden relative bg-[#FDFCFB]">
      <style>{`
        @keyframes wide-orbit {
          0% { transform: translate(0, 0) rotate(0deg) scale(1); }
          33% { transform: translate(60px, -40px) rotate(2deg) scale(1.05); }
          66% { transform: translate(-50px, -80px) rotate(-2deg) scale(0.95); }
          100% { transform: translate(0, 0) rotate(0deg) scale(1); }
        }
        .bubble-vibrant { 
          animation: wide-orbit linear infinite;
          background-color: #F8FAFC; /* Couleur de secours neutre */
        }
      `}</style>

      {/* ZONE DE NUÉE ESPACÉE ET VIBRANTE (Haut d'écran) */}
      <div className="relative h-[48vh] w-full pt-4">
        {LIFE_IMAGES.map((img, i) => {
          // Tailles Responsive d'origine
          const size = `clamp(55px, ${10 + i}vw, 115px)`;
          return (
            <div
              key={i}
              className="absolute rounded-full border-2 border-white/80 shadow-2xl overflow-hidden bubble-vibrant"
              style={{
                width: size,
                height: size,
                // Espacement horizontal d'origine (i * 10.5%)
                top: `${10 + Math.random() * 45}%`,
                left: `${2 + i * 10.5}%`,
                // Vitesses désynchronisées d'origine
                animationDuration: `${14 + i * 2.5}s`,
                animationDelay: `${i * -3.5}s`,
                zIndex: 10 + i,
              }}
            >
              <img
                src={img}
                className="w-full h-full object-cover shadow-inner grayscale-[10%]"
                alt=""
                onError={(e) => {
                  // Si l'image bug encore, on met un fond coloré Infeelit Teal/Orange
                  e.currentTarget.style.display = "none";
                  e.currentTarget.parentElement!.style.backgroundColor = i % 2 === 0 ? "#1A4D4D" : "#F97316";
                }}
              />
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

        {/* Grille de générations */}
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

        {/* Question Famille */}
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
          onClick={handleFinish}
          disabled={!generation || hasChildren === null || loading}
          className="w-full py-5 rounded-full bg-[#F97316] text-white font-black text-lg shadow-2xl mb-10 transform transition-all active:scale-95 disabled:opacity-20"
        >
          {loading ? "Creating..." : "Create my story"}
        </button>
      </div>
    </div>
  );
};

export default Portrait;
