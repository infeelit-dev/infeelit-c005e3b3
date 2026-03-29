import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const GENERATIONS = [
  "Silent Generation", "Baby Boomers", "Generation X", 
  "Millennials", "Generation Z", "Generation Alpha"
];

// URLs pour 10 images réelles et vibrantes (Vérifiées)
const LIFE_IMAGES = [
  "https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?w=400&q=80", // Famille rit
  "https://images.unsplash.com/photo-1476703993599-0035a21b17a9?w=400&q=80", // Enfants jouent
  "https://images.unsplash.com/photo-1542037104857-ffbb0b9155fb?w=400&q=80", // Grand-parent
  "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=400&q=80", // Repas
  "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=400&q=80", // Jardin
  "https://images.unsplash.com/photo-1484662020986-75935d2ebc66?w=400&q=80", // Couple
  "https://images.unsplash.com/photo-1536640712247-c45474d61b31?w=400&q=80", // Lecture
  "https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=400&q=80", // Bébé
  "https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?w=400&q=80", // Pique-nique
  "https://images.unsplash.com/photo-1508847154043-be5407fcaa5a?w=400&q=80"  // Mains
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
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("profiles").update({
          generation, has_children: hasChildren, onboarding_completed: true,
        }).eq("user_id", user.id);
      }
      navigate("/"); 
    } catch { navigate("/"); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen gradient-canvas flex flex-col overflow-hidden relative">
      <style>{`
        @keyframes flow-down {
          0% { transform: translateY(-30px); opacity: 0; }
          15% { opacity: 0.9; }
          85% { opacity: 0.9; }
          100% { transform: translateY(40px); opacity: 0; }
        }
        .bubble-flow { animation: flow-down 18s linear infinite; }
      `}</style>
      
      {/* ZONE DE CASCADE IMMERSIVE (Remplir tout le haut) */}
      <div className="relative h-[45vh] w-full pt-4">
        {LIFE_IMAGES.map((img, i) => {
          // Taille Responsive Inteligente (Grande sur Desktop, Moyenne sur Mobile)
          const size = `clamp(45px, ${10 + i * 1}vw, 110px)`;
          return (
            <div 
              key={i}
              className="absolute rounded-full border-2 border-white/70 shadow-2xl overflow-hidden bubble-flow"
              style={{
                width: size,
                height: size,
                // Positionnement aléatoire pour remplir tout le volume h-[45vh]
                top: `${5 + (Math.random() * 75)}%`,
                left: `${2 + (i * 9.5)}%`,
                animationDelay: `${i * -3s}`, // Désynchronisation totale
                zIndex: 10 + i,
              }}
            >
              <img src={img} className="w-full h-full object-cover grayscale-[10%]" alt="life" />
            </div>
          );
        })}
        {/* Voile de dégradé plus large pour adoucir la fusion */}
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#FDFCFB] via-[#FDFCFB]/80 to-transparent z-10 pointer-events-none" />
      </div>

      <div className="px-6 flex flex-col flex-1 z-20 -mt-10 bg-[#FDFCFB]/60 backdrop-blur-sm pt-4 rounded-t-3xl shadow-inner">
        <h1 className="text-3xl font-black text-center text-[#1A4D4D] mb-1 tracking-tight">
          A little bit about you
        </h1>
        <p className="text-center text-[#4A5568] text-[11px] mb-8 font-medium">
          Let's start your legacy journey...
        </p>

        {/* Grille de générations */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          {GENERATIONS.map((gen) => (
            <button key={gen} onClick={() => setGeneration(gen)}
              className={`px-3 py-4 rounded-2xl transition-all text-[11px] font-bold borderbackdrop-blur-md ${
                generation === gen 
                  ? "bg-white border-[#F97316] text-[#F97316] shadow-xl scale-[1.02]" 
                  : "bg-white/40 border-white/40 text-[#1A4D4D]/70 hover:bg-white/60"
              }`}>{gen}</button>
          ))}
        </div>

        {/* Question Famille */}
        <div className="mb-8 text-center">
          <p className="text-[#1A4D4D] text-xs font-black mb-4 uppercase tracking-[0.2em] opacity-80">
            Family Circle
          </p>
          <div className="flex gap-10 justify-center">
            {[{ label: "Yes", value: true }, { label: "No", value: false }].map((opt) => (
              <button key={opt.label} onClick={() => setHasChildren(opt.value)}
                className={`w-14 h-14 rounded-full flex items-center justify-center text-xs font-black border-2 transition-all ${
                  hasChildren === opt.value 
                    ? "bg-[#F97316] border-[#F97316] text-white shadow-lg" 
                    : "bg-white/50 border-white/50 text-[#1A4D4D]/60 shadow-sm"
                }`}>{opt.label}</button>
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