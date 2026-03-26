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

// URLs d'images pour les bulles
const BUBBLE_IMAGES = [
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=150",
  "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=150",
  "https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=150",
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=150",
  "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=150",
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
      navigate("/dashboard");
    } catch {
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-canvas flex flex-col px-6 pt-4 overflow-hidden relative">
      {/* ANIMATION FLUIDE STYLE DASHBOARD */}
      <style>{`
        @keyframes float-around {
          0% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(30px, -15px) rotate(5deg); }
          66% { transform: translate(-20px, 10px) rotate(-5deg); }
          100% { transform: translate(0, 0) rotate(0deg); }
        }
        .bubble-float { animation: float-around 8s ease-in-out infinite; }
        .bubble-delay-1 { animation-delay: -2s; animation-duration: 10s; }
        .bubble-delay-2 { animation-delay: -4s; animation-duration: 12s; }
        .bubble-delay-3 { animation-delay: -1s; animation-duration: 9s; }
      `}</style>

      {/* ZONE DES BULLES TEASER (Toute la largeur du haut) */}
      <div className="relative h-48 w-full mb-2">
        {BUBBLE_IMAGES.map((img, i) => (
          <div
            key={i}
            className={`absolute rounded-full border-2 border-white/60 shadow-lg overflow-hidden bubble-float bubble-delay-${i % 4}`}
            style={{
              width: `${50 + i * 10}px`, // Tailles variées mais pas trop grosses
              height: `${50 + i * 10}px`,
              top: `${Math.random() * 40}%`,
              left: `${10 + i * 18}%`,
              opacity: 0.9,
            }}
          >
            <img src={img} className="w-full h-full object-cover" />
          </div>
        ))}
      </div>

      <h1 className="text-2xl font-bold text-center text-[#1A4D4D] mb-1">A little bit about you</h1>
      <p className="text-center text-[#4A5568] text-xs mb-6 px-4">Help us personalize your experience.</p>

      {/* Grille de générations épurée */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {GENERATIONS.map((gen) => (
          <button
            key={gen}
            onClick={() => setGeneration(gen)}
            className={`px-2 py-3 rounded-2xl transition-all text-[11px] font-semibold border ${
              generation === gen
                ? "bg-white/60 border-[#F97316] shadow-md scale-105"
                : "bg-white/10 border-white/20 text-[#1A4D4D]/70"
            }`}
          >
            {gen}
          </button>
        ))}
      </div>

      {/* Question Famille */}
      <div className="mb-6 text-center">
        <p className="text-[#1A4D4D] text-sm font-bold mb-3">Do you have a family circle?</p>
        <div className="flex gap-6 justify-center">
          {[
            { label: "Yes", value: true },
            { label: "No", value: false },
          ].map((opt) => (
            <button
              key={opt.label}
              onClick={() => setHasChildren(opt.value)}
              className={`w-14 h-14 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                hasChildren === opt.value
                  ? "bg-[#F97316] border-[#F97316] text-white shadow-lg scale-110"
                  : "bg-white/10 border-white/30"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1" />

      {/* Bouton Final */}
      <button
        onClick={handleFinish}
        disabled={!generation || hasChildren === null || loading}
        className="w-full py-4 rounded-full bg-[#F97316] text-white font-bold text-base shadow-xl mb-8 disabled:opacity-30"
      >
        {loading ? "Creating..." : "Create my story"}
      </button>
    </div>
  );
};

export default Portrait;
