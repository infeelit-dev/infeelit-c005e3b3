import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import BubbleCanvas from "@/components/BubbleCanvas"; // ON IMPORTE LE COMPOSANT PARFAIT

const GENERATIONS = [
  "Silent Generation",
  "Baby Boomers",
  "Generation X",
  "Millennials",
  "Generation Z",
  "Generation Alpha",
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
      navigate("/"); // Redirige vers le Dashboard
    } catch {
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-canvas flex flex-col overflow-hidden relative">
      {/* ZONE DES BULLES PARFAITES (On importe le moteur) */}
      <div className="relative h-[40vh] w-full border-b border-white/10 shadow-inner">
        <BubbleCanvas onBubbleClick={() => {}} />

        {/* Voile dégradé vers le bas pour fondre les bulles */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#FDFCFB] to-transparent z-10 pointer-events-none" />
      </div>

      <div className="px-6 flex flex-col flex-1 z-20 -mt-6">
        <h1 className="text-3xl font-extrabold text-center text-[#1A4D4D] mt-2 mb-1 tracking-tighter">
          A little bit about you
        </h1>
        <p className="text-center text-[#4A5568] text-[10px] mb-8 font-bold uppercase tracking-widest opacity-60">
          Personalizing your legacy
        </p>

        {/* Grille de générations en Verre Dépoli */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          {GENERATIONS.map((gen) => (
            <button
              key={gen}
              onClick={() => setGeneration(gen)}
              className={`px-3 py-4 rounded-2xl transition-all text-[11px] font-bold border backdrop-blur-md ${
                generation === gen
                  ? "bg-white/70 border-[#F97316] text-[#F97316] shadow-xl scale-105"
                  : "bg-white/20 border-white/40 text-[#1A4D4D]/70 hover:bg-white/50"
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
                    : "bg-white/30 border-white/50 text-[#1A4D4D]/60"
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
          className="w-full py-5 rounded-full bg-[#F97316] text-white font-black text-lg shadow-2xl mb-10 transform transition-all active:scale-95 disabled:opacity-20"
        >
          {loading ? "Creating..." : "Create my story"}
        </button>
      </div>
    </div>
  );
};

export default Portrait;
