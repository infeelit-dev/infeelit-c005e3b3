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

// Sélection "Tranches de Vie" : Famille, enfants, authenticité
const LIFE_IMAGES = [
  "https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?w=200&h=200&fit=crop", // Famille qui rit
  "https://images.unsplash.com/photo-1476703993599-0035a21b17a9?w=200&h=200&fit=crop", // Enfants qui courent
  "https://images.unsplash.com/photo-1542037104857-ffbb0b9155fb?w=200&h=200&fit=crop", // Grand-parent et enfant
  "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=200&h=200&fit=crop", // Repas de famille
  "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=200&h=200&fit=crop", // Jeu dans le jardin
  "https://images.unsplash.com/photo-1484662020986-75935d2ebc66?w=200&h=200&fit=crop", // Couple qui partage un moment
  "https://images.unsplash.com/photo-1536640712247-c45474d61b31?w=200&h=200&fit=crop", // Enfant qui lit
  "https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=200&h=200&fit=crop", // Bébé et parent
  "https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?w=200&h=200&fit=crop", // Pique-nique
  "https://images.unsplash.com/photo-1508847154043-be5407fcaa5a?w=200&h=200&fit=crop", // Mains qui se tiennent
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
        @keyframes fall-and-drift {
          0% { transform: translateY(-20px) translateX(0); opacity: 0; }
          15% { opacity: 0.8; }
          50% { transform: translateY(10px) translateX(15px); }
          100% { transform: translateY(40px) translateX(-5px); opacity: 0.8; }
        }
        .bubble-life {
          animation: fall-and-drift 12s ease-in-out infinite alternate;
        }
      `}</style>

      {/* ZONE DE CASCADE (10 bulles de vie) */}
      <div className="relative h-[35vh] w-full pt-4">
        {LIFE_IMAGES.map((img, i) => (
          <div
            key={i}
            className="absolute rounded-full border-2 border-white/60 shadow-xl overflow-hidden bubble-life"
            style={{
              width: `${40 + i * 6}px`,
              height: `${40 + i * 6}px`,
              top: `${10 + Math.random() * 50}%`,
              left: `${5 + i * 9}%`,
              animationDelay: `${i * -2.8}s`,
              animationDuration: `${10 + (i % 3)}s`,
            }}
          >
            <img
              src={img}
              className="w-full h-full object-cover grayscale-[20%] hover:grayscale-0 transition-all duration-500"
              alt="life moment"
            />
          </div>
        ))}
        {/* Voile dégradé vers le bas pour la fusion */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#FDFCFB] to-transparent z-10" />
      </div>

      <div className="px-6 flex flex-col flex-1 z-20 -mt-4 bg-[#FDFCFB]/40 backdrop-blur-sm">
        <h1 className="text-3xl font-black text-center text-[#1A4D4D] mb-1 tracking-tight">A little bit about you</h1>
        <p className="text-center text-[#4A5568] text-[11px] mb-8 font-medium italic">
          Let's start your legacy journey...
        </p>

        <div className="grid grid-cols-2 gap-3 mb-8">
          {GENERATIONS.map((gen) => (
            <button
              key={gen}
              onClick={() => setGeneration(gen)}
              className={`px-3 py-4 rounded-2xl transition-all text-[11px] font-bold border ${
                generation === gen
                  ? "bg-white/90 border-[#F97316] text-[#F97316] shadow-lg scale-105"
                  : "bg-white/40 border-white/40 text-[#1A4D4D]/70 hover:bg-white/60"
              }`}
            >
              {gen}
            </button>
          ))}
        </div>

        <div className="mb-8 text-center">
          <p className="text-[#1A4D4D] text-xs font-black mb-4 uppercase tracking-[0.2em] opacity-80">Family Circle</p>
          <div className="flex gap-10 justify-center">
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
                    : "bg-white/50 border-white/50 text-[#1A4D4D]/60 shadow-sm"
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
          className="w-full py-4 rounded-full bg-[#F97316] text-white font-black text-lg shadow-2xl mb-10 transform transition-all active:scale-95 disabled:opacity-20"
        >
          {loading ? "Creating..." : "Create my story"}
        </button>
      </div>
    </div>
  );
};

export default Portrait;
