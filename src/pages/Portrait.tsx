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

// 10 images de "VRAIE VIE" (Authentique, Famille, Enfants)
const LIFE_IMAGES = [
  "https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?w=200", // Famille rit
  "https://images.unsplash.com/photo-1476703993599-0035a21b17a9?w=200", // Enfants jouent
  "https://images.unsplash.com/photo-1542037104857-ffbb0b9155fb?w=200", // Grand-parent
  "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=200", // Repas
  "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=200", // Jardin
  "https://images.unsplash.com/photo-1484662020986-75935d2ebc66?w=200", // Couple
  "https://images.unsplash.com/photo-1536640712247-c45474d61b31?w=200", // Lecture
  "https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=200", // Bébé
  "https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?w=200", // Pique-nique
  "https://images.unsplash.com/photo-1508847154043-be5407fcaa5a?w=200", // Mains
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
        @keyframes drift-1 { 0% { transform: translate(0, 0); } 50% { transform: translate(25px, -30px); } 100% { transform: translate(0, 0); } }
        @keyframes drift-2 { 0% { transform: translate(0, 0); } 50% { transform: translate(-30px, 15px); } 100% { transform: translate(0, 0); } }
        @keyframes drift-3 { 0% { transform: translate(0, 0); } 50% { transform: translate(15px, 25px); } 100% { transform: translate(0, 0); } }
        @keyframes drift-4 { 0% { transform: translate(0, 0); } 50% { transform: translate(-20px, -20px); } 100% { transform: translate(0, 0); } }

        .bubble-physics { animation-timing-function: ease-in-out; animation-iteration-count: infinite; }
        .anim-1 { animation-name: drift-1; animation-duration: 14s; }
        .anim-2 { animation-name: drift-2; animation-duration: 18s; }
        .anim-3 { animation-name: drift-3; animation-duration: 12s; }
        .anim-4 { animation-name: drift-4; animation-duration: 16s; }
      `}</style>

      {/* NUÉE DE 10 BULLES DE VIE */}
      <div className="relative h-[38vh] w-full pt-4">
        {LIFE_IMAGES.map((img, i) => {
          const animClass = `anim-${(i % 4) + 1}`;
          const size = `${38 + i * 4}px`;
          return (
            <div
              key={i}
              className={`absolute rounded-full border-2 border-white/70 shadow-2xl overflow-hidden bubble-physics ${animClass}`}
              style={{
                width: size,
                height: size,
                top: `${10 + Math.random() * 55}%`,
                left: `${2 + i * 9.5}%`,
                animationDelay: `${i * -3.2}s`,
                opacity: 0.9,
              }}
            >
              <img
                src={img}
                className="w-full h-full object-cover grayscale-[15%] hover:grayscale-0 transition-all duration-700"
                alt="life"
              />
            </div>
          );
        })}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#FDFCFB] to-transparent z-10" />
      </div>

      <div className="px-6 flex flex-col flex-1 z-20 -mt-6">
        <h1 className="text-3xl font-black text-center text-[#1A4D4D] mb-1 tracking-tighter">A little bit about you</h1>
        <p className="text-center text-[#4A5568] text-[10px] mb-8 font-bold uppercase tracking-widest opacity-60">
          Personalizing your legacy
        </p>

        <div className="grid grid-cols-2 gap-3 mb-8">
          {GENERATIONS.map((gen) => (
            <button
              key={gen}
              onClick={() => setGeneration(gen)}
              className={`px-3 py-4 rounded-2xl transition-all text-[11px] font-bold border backdrop-blur-md ${
                generation === gen
                  ? "bg-white/80 border-[#F97316] text-[#F97316] shadow-xl scale-105"
                  : "bg-white/30 border-white/40 text-[#1A4D4D]/70 hover:bg-white/50"
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
          className="w-full py-5 rounded-full bg-[#F97316] text-white font-black text-lg shadow-2xl mb-10 transform transition-all active:scale-95 disabled:opacity-20"
        >
          {loading ? "Creating..." : "Create my story"}
        </button>
      </div>
    </div>
  );
};

export default Portrait;
