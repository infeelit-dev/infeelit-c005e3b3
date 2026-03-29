import { useState, useEffect, useRef } from "react";
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

// Sources d'images PEXELS (Plus fiables que Unsplash sur Lovable)
const LIFE_IMAGES = [
  "https://images.pexels.com/photos/1128318/pexels-photo-1128318.jpeg?auto=compress&cs=tinysrgb&w=200", // Famille
  "https://images.pexels.com/photos/1015568/pexels-photo-1015568.jpeg?auto=compress&cs=tinysrgb&w=200", // Enfants jouent
  "https://images.pexels.com/photos/1468370/pexels-photo-1468370.jpeg?auto=compress&cs=tinysrgb&w=200", // Grand-parent
  "https://images.pexels.com/photos/931007/pexels-photo-931007.jpeg?auto=compress&cs=tinysrgb&w=200", // Repas de famille
  "https://images.pexels.com/photos/1000445/pexels-photo-1000445.jpeg?auto=compress&cs=tinysrgb&w=200", // Jardin
  "https://images.pexels.com/photos/1131975/pexels-photo-1131975.jpeg?auto=compress&cs=tinysrgb&w=200", // Couple
  "https://images.pexels.com/photos/1684151/pexels-photo-1684151.jpeg?auto=compress&cs=tinysrgb&w=200", // Lecture
  "https://images.pexels.com/photos/1310166/pexels-photo-1310166.jpeg?auto=compress&cs=tinysrgb&w=200", // Bébé
  "https://images.pexels.com/photos/1105191/pexels-photo-1105191.jpeg?auto=compress&cs=tinysrgb&w=200", // Pique-nique
  "https://images.pexels.com/photos/1645634/pexels-photo-1645634.jpeg?auto=compress&cs=tinysrgb&w=200", // Mains
];

const Portrait = () => {
  const navigate = useNavigate();
  const [generation, setGeneration] = useState("");
  const [hasChildren, setHasChildren] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  // Moteur d'animation JavaScript pour l'indépendance totale
  const bubbleRefs = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    // Initialisation des positions et trajectoires aléatoires
    const bubbles = bubbleRefs.current.filter(Boolean);
    const bubbleStates = bubbles.map(() => ({
      x: (Math.random() - 0.5) * 40, // Offset horizontal de départ
      y: (Math.random() - 0.5) * 30, // Offset vertical de départ
      vx: (Math.random() - 0.5) * 0.1, // Vitesse horizontale unique
      vy: (Math.random() - 0.5) * 0.1, // Vitesse verticale unique
      size: 40 + Math.random() * 40, // Taille unique
    }));

    // Boucle d'animation haute performance
    let animationFrameId: number;
    const animate = () => {
      bubbles.forEach((bubble, i) => {
        const state = bubbleStates[i];

        // Mise à jour de la position
        state.x += state.vx;
        state.y += state.vy;

        // Limites de mouvement (pour ne pas qu'elles s'échappent)
        if (state.x > 80 || state.x < -80) state.vx *= -1;
        if (state.y > 60 || state.y < -60) state.vy *= -1;

        // Application douce de la transformation
        bubble.style.transform = `translate(${state.x}px, ${state.y}px)`;
      });
      animationFrameId = requestAnimationFrame(animate);
    };

    // Attribution des tailles et positions initiales
    bubbles.forEach((bubble, i) => {
      const state = bubbleStates[i];
      bubble.style.width = `${state.size}px`;
      bubble.style.height = `${state.size}px`;
      bubble.style.left = `${5 + i * 9.5}%`;
      bubble.style.top = `${20 + Math.random() * 50}%`;
    });

    animate();

    // Nettoyage de l'animation
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

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
      {/* ZONE DE MOUVEMENT TOTALEMENT INDÉPENDANT (Haut d'écran) */}
      <div className="relative h-[38vh] w-full pt-4">
        {LIFE_IMAGES.map((img, i) => (
          <div
            key={i}
            ref={(el) => (bubbleRefs.current[i] = el!)}
            className="absolute rounded-full border-2 border-white/80 shadow-2xl overflow-hidden bg-[#E2E8F0] will-change-transform"
            style={{
              zIndex: 10 + i,
            }}
          >
            <img
              src={img}
              className="w-full h-full object-cover"
              alt="legacy moment"
              loading="lazy"
              onError={(e) => {
                // Secours ultime : couleurs Infeelit Teal/Orange
                e.currentTarget.style.display = "none";
                e.currentTarget.parentElement!.style.backgroundColor = i % 2 === 0 ? "#1A4D4D" : "#F97316";
              }}
            />
          </div>
        ))}
        {/* Voile de fusion élégant */}
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#FDFCFB] via-[#FDFCFB]/95 to-transparent z-10 pointer-events-none" />
      </div>

      <div className="px-6 flex flex-col flex-1 z-20 -mt-10 bg-[#FDFCFB]/85 backdrop-blur-xl pt-8 rounded-t-[45px] shadow-2xl">
        <h1 className="text-3xl font-black text-center text-[#1A4D4D] mb-1 tracking-tighter">A little bit about you</h1>
        <p className="text-center text-[#4A5568] text-[10px] mb-8 font-bold uppercase tracking-widest opacity-50">
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
          className="w-full py-5 rounded-full bg-[#F97316] text-white font-black text-lg shadow-2xl mb-10 active:scale-95 transition-all disabled:opacity-20"
        >
          {loading ? "Creating..." : "Create my story"}
        </button>
      </div>
    </div>
  );
};

export default Portrait;
