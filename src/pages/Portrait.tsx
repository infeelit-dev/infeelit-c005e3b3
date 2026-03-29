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

// 10 IMAGES RÉALISTES (Zéro coucher de soleil - Forcé)
const LIFE_IMAGES = [
  "https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?w=200&q=80", // Famille
  "https://images.unsplash.com/photo-1476703993599-0035a21b17a9?w=200&q=80", // Enfants
  "https://images.unsplash.com/photo-1542037104857-ffbb0b9155fb?w=200&q=80", // Grand-parent
  "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=200&q=80", // Repas
  "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=200&q=80", // Jardin
  "https://images.unsplash.com/photo-1484662020986-75935d2ebc66?w=200&q=80", // Couple
  "https://images.unsplash.com/photo-1536640712247-c45474d61b31?w=200&q=80", // Lecture
  "https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=200&q=80", // Bébé
  "https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?w=200&q=80", // Pique-nique
  "https://images.unsplash.com/photo-1508847154043-be5407fcaa5a?w=200&q=80", // Mains
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
    <div className="min-h-screen gradient-canvas flex flex-col overflow-hidden relative">
      <style>{`
        @keyframes float-complex {
          0% { transform: translate(0, 0); }
          33% { transform: translate(30px, -20px); }
          66% { transform: translate(-20px, 20px); }
          100% { transform: translate(0, 0); }
        }
        .bubble-anim { animation: float-complex 15s ease-in-out infinite; }
      `}</style>

      {/* ZONE DE NUÉE RESPONSIVE (S'adapte automatiquement) */}
      <div className="relative h-[35vh] w-full pt-4">
        {LIFE_IMAGES.map((img, i) => (
          <div
            key={i}
            className="absolute rounded-full border border-white/60 shadow-xl overflow-hidden bubble-anim"
            style={{
              width: `clamp(35px, ${8 + i * 1}vw, 85px)`, // Taille intelligente : s'adapte à l'écran
              height: `clamp(35px, ${8 + i * 1}vw, 85px)`,
              top: `${10 + Math.random() * 60}%`,
              left: `${5 + i * 9}%`,
              animationDelay: `${i * -2.5}s`,
              animationDuration: `${12 + (i % 5)}s`,
              zIndex: 10 + i,
            }}
          >
            <img src={img} className="w-full h-full object-cover" alt="life" />
          </div>
        ))}
        {/* Voile de dégradé pour la lisibilité */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#FDFCFB] to-transparent z-10 pointer-events-none" />
      </div>

      <div className="px-6 flex flex-col flex-1 z-20 -mt-6">
        <h1 className="text-2xl md:text-3xl font-black text-center text-[#1A4D4D] mb-1 tracking-tight">
          A little bit about you
        </h1>
        <p className="text-center text-[#4A5568] text-[10px] mb-6 font-bold uppercase tracking-widest opacity-60">
          Personalizing your legacy
        </p>

        {/* Grille de générations */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {GENERATIONS.map((gen) => (
            <button
              key={gen}
              onClick={() => setGeneration(gen)}
              className={`px-2 py-3 rounded-xl transition-all text-[11px] font-bold border ${
                generation === gen
                  ? "bg-white border-[#F97316] text-[#F97316] shadow-md"
                  : "bg-white/40 border-white/30 text-[#1A4D4D]/70"
              }`}
            >
              {gen}
            </button>
          ))}
        </div>

        {/* Question Famille */}
        <div className="mb-6 text-center">
          <p className="text-[#1A4D4D] text-[10px] font-black mb-3 uppercase tracking-widest opacity-50">
            Family Circle
          </p>
          <div className="flex gap-8 justify-center">
            {[
              { label: "Yes", value: true },
              { label: "No", value: false },
            ].map((opt) => (
              <button
                key={opt.label}
                onClick={() => setHasChildren(opt.value)}
                className={`w-14 h-14 rounded-full flex items-center justify-center text-xs font-black border-2 transition-all ${
                  hasChildren === opt.value
                    ? "bg-[#F97316] border-[#F97316] text-white shadow-lg"
                    : "bg-white/40 border-white/40 text-[#1A4D4D]/60"
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
          className="w-full py-4 rounded-full bg-[#F97316] text-white font-black text-lg shadow-xl mb-10 disabled:opacity-20"
        >
          {loading ? "Creating..." : "Create my story"}
        </button>
      </div>
    </div>
  );
};

export default Portrait;
