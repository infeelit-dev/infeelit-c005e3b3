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

// URLs pour 5 images de haute qualité
const BUBBLE_IMAGES = [
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=150",
  "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=150",
  "https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=150",
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=150",
  "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=150",
];

// URLs pour 5 motifs graphiques/textures élégantes
const BUBBLE_PATTERNS = [
  "https://images.unsplash.com/photo-1557683316-973673baf926?w=150", // Dégradé bleu/violet
  "https://images.unsplash.com/photo-1550684376-efcbd6e3f031?w=150", // Texture géométrique orange
  "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?w=150", // Motif abstrait vert
  "https://images.unsplash.com/photo-1599672688326-5a2e55d7862a?w=150", // Texture marbre
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150", // Motif vagues douces
];

// On fusionne les deux listes (10 éléments au total)
const ALL_BUBBLES = [...BUBBLE_IMAGES, ...BUBBLE_PATTERNS];

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
    <div className="min-h-screen gradient-canvas flex flex-col px-6 pt-2 overflow-hidden relative">
      <style>{`
        /* 4 animations de dérive différentes */
        @keyframes drift-1 { 0% { transform: translate(0, 0); } 50% { transform: translate(30px, -20px); } 100% { transform: translate(0, 0); } }
        @keyframes drift-2 { 0% { transform: translate(0, 0); } 50% { transform: translate(-25px, -10px); } 100% { transform: translate(0, 0); } }
        @keyframes drift-3 { 0% { transform: translate(0, 0); } 50% { transform: translate(20px, 15px); } 100% { transform: translate(0, 0); } }
        @keyframes drift-4 { 0% { transform: translate(0, 0); } 50% { transform: translate(-15px, 20px); } 100% { transform: translate(0, 0); } }

        .bubble-drift { animation-timing-function: ease-in-out; animation-iteration-count: infinite; }
        .bubble-anim-1 { animation-name: drift-1; animation-duration: 12s; }
        .bubble-anim-2 { animation-name: drift-2; animation-duration: 15s; }
        .bubble-anim-3 { animation-name: drift-3; animation-duration: 10s; }
        .bubble-anim-4 { animation-name: drift-4; animation-duration: 13s; }
      `}</style>

      {/* ZONE DES 10 BULLES RÉPARTIES (Hauteur 56 pour plus d'espace) */}
      <div className="relative h-56 w-full mb-1">
        {ALL_BUBBLES.map((img, i) => {
          // On assigne une animation et une taille aléatoire dans une fourchette
          const animClass = `bubble-anim-${(i % 4) + 1}`;
          const size = `${35 + i * 3}px`; // Tailles variées mais pas trop grosses
          const top = `${10 + Math.random() * 60}%`; // Position aléatoire
          const left = `${5 + i * 9}%`; // Position répartie sur la largeur
          const delay = `${i * -2.5}s`; // Délai de départ pour désynchroniser

          return (
            <div
              key={i}
              className={`absolute rounded-full border border-white/60 shadow-lg overflow-hidden bubble-drift ${animClass}`}
              style={{
                width: size,
                height: size,
                top: top,
                left: left,
                animationDelay: delay,
                opacity: 0.85,
              }}
            >
              <img src={img} className="w-full h-full object-cover" alt={`bubble-${i}`} />
            </div>
          );
        })}
      </div>

      <h1 className="text-2xl font-bold text-center text-[#1A4D4D] mb-1">A little bit about you</h1>
      <p className="text-center text-[#4A5568] text-[11px] mb-6 px-4">Help us personalize your experience.</p>

      {/* Grille de générations épurée */}
      <div className="grid grid-cols-2 gap-2 mb-6">
        {GENERATIONS.map((gen) => (
          <button
            key={gen}
            onClick={() => setGeneration(gen)}
            className={`px-2 py-3 rounded-xl transition-all text-[11px] font-semibold border ${
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
      <div className="mb-4 text-center">
        <p className="text-[#1A4D4D] text-xs font-bold mb-3">Do you have a family circle?</p>
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
                  : "bg-white/10 border-white/30 text-[#1A4D4D]/70"
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
