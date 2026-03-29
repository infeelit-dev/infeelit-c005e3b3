import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import BubbleCanvas from "@/components/BubbleCanvas"; // On importe le moteur du dashboard

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
      {/* MOTEUR DE BULLES DU DASHBOARD (Limité au haut) */}
      <div className="relative h-[35vh] w-full border-b border-white/10 shadow-inner">
        <BubbleCanvas onBubbleClick={() => {}} />
        {/* Le voile dégradé pour fondre les bulles dans le texte */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#FDFCFB]/80 pointer-events-none" />
      </div>

      <div className="px-6 flex flex-col flex-1 z-10">
        <h1 className="text-2xl font-extrabold text-center text-[#1A4D4D] mt-4 mb-1">A little bit about you</h1>
        <p className="text-center text-[#4A5568] text-xs mb-6 px-4">Help us personalize your experience.</p>

        {/* Grille de générations en Verre Dépoli */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {GENERATIONS.map((gen) => (
            <button
              key={gen}
              onClick={() => setGeneration(gen)}
              className={`px-2 py-4 rounded-2xl transition-all text-[11px] font-bold border backdrop-blur-md ${
                generation === gen
                  ? "bg-white/60 border-[#F97316] text-[#1A4D4D] shadow-lg scale-105"
                  : "bg-white/20 border-white/30 text-[#1A4D4D]/70 hover:bg-white/30"
              }`}
            >
              {gen}
            </button>
          ))}
        </div>

        {/* Question Famille Style Cercles */}
        <div className="mb-6 text-center">
          <p className="text-[#1A4D4D] text-sm font-extrabold mb-4">Do you have a family circle?</p>
          <div className="flex gap-8 justify-center">
            {[
              { label: "Yes", value: true },
              { label: "No", value: false },
            ].map((opt) => (
              <button
                key={opt.label}
                onClick={() => setHasChildren(opt.value)}
                className={`w-16 h-16 rounded-full flex items-center justify-center text-sm font-black border-2 transition-all backdrop-blur-lg ${
                  hasChildren === opt.value
                    ? "bg-[#F97316] border-[#F97316] text-white shadow-xl scale-110"
                    : "bg-white/20 border-white/40 text-[#1A4D4D]/70"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1" />

        {/* Bouton Signature Orange */}
        <button
          onClick={handleFinish}
          disabled={!generation || hasChildren === null || loading}
          className="w-full py-4 rounded-full gradient-orange text-white font-bold text-lg shadow-2xl mb-8 transition-transform active:scale-95 disabled:opacity-30"
        >
          {loading ? "Creating..." : "Create my story"}
        </button>
      </div>
    </div>
  );
};

export default Portrait;
