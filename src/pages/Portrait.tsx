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

// URLs ULTRA-FIABLES (Scènes de vie authentiques)
const LIFE_IMAGES = [
  "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=300",
  "https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?auto=format&fit=crop&w=300",
  "https://images.unsplash.com/photo-1542037104857-ffbb0b9155fb?auto=format&fit=crop&w=300",
  "https://images.unsplash.com/photo-1476703993599-0035a21b17a9?auto=format&fit=crop&w=300",
  "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=300",
  "https://images.unsplash.com/photo-1484662020986-75935d2ebc66?auto=format&fit=crop&w=300",
  "https://images.unsplash.com/photo-1536640712247-c45474d61b31?auto=format&fit=crop&w=300",
  "https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=300",
  "https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?auto=format&fit=crop&w=300",
  "https://images.unsplash.com/photo-1508847154043-be5407fcaa5a?auto=format&fit=crop&w=300",
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
        @keyframes orbit {
          0% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(40px, -50px) scale(1.1); }
          50% { transform: translate(-30px, -80px) scale(0.9); }
          75% { transform: translate(-50px, -20px) scale(1.05); }
          100% { transform: translate(0, 0) scale(1); }
        }
        .bubble-active { animation: orbit linear infinite; }
      `}</style>

      {/* ZONE DE MOUVEMENT TOTAL (Haut d'écran rempli) */}
      <div className="relative h-[48vh] w-full pt-6">
        {LIFE_IMAGES.map((img, i) => {
          // Taille dynamique pour l'effet de profondeur
          const size = `clamp(55px, ${12 + i}vw, 120px)`;
          return (
            <div
              key={i}
              className="absolute rounded-full border-2 border-white/80 shadow-2xl overflow-hidden bubble-active"
              style={{
                width: size,
                height: size,
                top: `${15 + Math.random() * 50}%`,
                left: `${5 + i * 9}%`,
                animationDuration: `${18 + i * 2}s`,
                animationDelay: `${i * -4}s`,
                zIndex: 10 + i,
              }}
            >
              <img src={img} className="w-full h-full object-cover shadow-inner" alt="" loading="eager" />
            </div>
          );
        })}
        {/* Voile de fusion élégant */}
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#FDFCFB] via-[#FDFCFB]/90 to-transparent z-10 pointer-events-none" />
      </div>

      <div className="px-6 flex flex-col flex-1 z-20 -mt-12 bg-[#FDFCFB]/80 backdrop-blur-md pt-6 rounded-t-[40px] shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
        <h1 className="text-3xl font-black text-center text-[#1A4D4D] mb-1 tracking-tight">A little bit about you</h1>
        <p className="text-center text-[#4A5568] text-[11px] mb-8 font-bold uppercase tracking-widest opacity-50">
          Personalizing your legacy
        </p>

        {/* Grille de générations */}
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

        {/* Question Famille */}
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
          onClick={handleFinish}
          disabled={!generation || hasChildren === null || loading}
          className="w-full py-5 rounded-full bg-[#F97316] text-white font-black text-lg shadow-2xl mb-10 active:scale-95 disabled:opacity-20 transition-all"
        >
          {loading ? "Creating..." : "Create my story"}
        </button>
      </div>
    </div>
  );
};

export default Portrait;
