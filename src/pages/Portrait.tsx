import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

const GENERATIONS = [
  "Silent Generation", "Baby Boomers", "Generation X", 
  "Millennials", "Generation Z", "Generation Alpha"
];

// 10 images de VRAIE VIE (Zéro coucher de soleil)
const LIFE_IMAGES = [
  "https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?w=200", // Famille
  "https://images.unsplash.com/photo-1476703993599-0035a21b17a9?w=200", // Enfants
  "https://images.unsplash.com/photo-1542037104857-ffbb0b9155fb?w=200", // Grand-parent
  "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=200", // Repas
  "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=200", // Jardin
  "https://images.unsplash.com/photo-1484662020986-75935d2ebc66?w=200", // Couple
  "https://images.unsplash.com/photo-1536640712247-c45474d61b31?w=200", // Lecture
  "https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=200", // Bébé
  "https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?w=200", // Pique-nique
  "https://images.unsplash.com/photo-1508847154043-be5407fcaa5a?w=200"  // Mains
];

const Portrait = () => {
  const navigate = useNavigate();
  const [generation, setGeneration] = useState("");
  const [hasChildren, setHasChildren] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Détection de la taille d'écran en temps réel
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
      
      {/* ZONE DE NUÉE RESPONSIVE */}
      <div className="relative h-[32vh] w-full pt-2">
        {LIFE_IMAGES.map((img, i) => {
          // Bulles beaucoup plus petites sur mobile (25-50px) vs Desktop (45-80px)
          const baseSize = isMobile ? 28 : 45;
          const size = baseSize + (i * (isMobile ? 3 : 6));
          
          return (
            <motion.div 
              key={i}
              className="absolute rounded-full border border-white/60 shadow-xl overflow-hidden backdrop-blur-[2px]"
              style={{
                width: `${size}px`,
                height: `${size}px`,
                top: `${15 + (Math.random() * 50)}%`,
                left: `${2 + (i * 9.5)}%`,
                zIndex: 10 + i,
              }}
              animate={{
                x: [0, (Math.random() - 0.5) * (isMobile ? 40 : 100), 0],
                y: [0, (Math.random() - 0.5) * (isMobile ? 30 : 80), 0],
              }}
              transition={{
                duration: 12 + i,
                ease: "easeInOut",
                repeat: Infinity,
              }}
            >
              <img src={img} className="w-full h-full object-cover grayscale-[10%]" alt="life" />
            </motion.div>
          ))}
        {/* Voile blanc plus prononcé pour la lisibilité */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#FDFCFB] via-[#FDFCFB]/80 to-transparent z-10 pointer-events-none" />
      </div>

      <div className="px-6 flex flex-col flex-1 z-20 -mt-6">
        <h1 className="text-2xl md:text-3xl font-black text-center text-[#1A4D4D] mb-1 tracking-tight">
          A little bit about you
        </h1>
        <p className="text-center text-[#4A5568] text-[10px] mb-6 font-bold uppercase tracking-widest opacity-60">
          Personalizing your legacy
        </p>

        <div className="grid grid-cols-2 gap-2 mb-6">
          {GENERATIONS.map((gen) => (
            <button key={gen} onClick={() => setGeneration(gen)}
              className={`px-2 py-3.5 rounded-xl transition-all text-[10px] font-bold border ${
                generation === gen 
                  ? "bg-white border-[#F97316] text-[#F97316] shadow-md scale-[1.02]" 
                  : "bg-white/40 border-white/30 text-[#1A4D4D]/70"
              }`}>{gen}</button>
          ))}
        </div>

        <div className="mb-6 text-center">
          <p className="text-[#1A4D4D] text-[10px] font-black mb-3 uppercase tracking-[0.2em] opacity-50">
            Family Circle
          </p>
          <div className="flex gap-10 justify-center">
            {[{ label: "Yes", value: true }, { label: "No", value: false }].map((opt) => (
              <button key={opt.label} onClick={() => setHasChildren(opt.value)}
                className={`w-12 h-12 rounded-full flex items-center justify-center text-[10px] font-black border-2 transition-all ${
                  hasChildren === opt.value 
                    ? "bg-[#F97316] border-[#F97316] text-white shadow-lg scale-110" 
                    : "bg-white/40 border-white/40 text-[#1A4D4D]/60"
                }`}>{opt.label}</button>
            ))}
          </div>
        </div>

        <div className="flex-1" />

        <button 
          onClick={handleFinish} 
          disabled={!generation || hasChildren === null || loading}
          className="w-full py-4 rounded-full bg-[#F97316] text-white font-black text-base shadow-xl mb-8 transform transition-all active:scale-95 disabled:opacity-20"
        >
          {loading ? "Creating..." : "Create my story"}
        </button>
      </div>
    </div>
  );
};

export default Portrait;