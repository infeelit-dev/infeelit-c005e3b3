import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import BubbleCanvas from "@/components/BubbleCanvas"; // Ton moteur de bulles du Dashboard
import Header from "@/components/Header";

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
      navigate("/");
    } catch {
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden gradient-canvas">
      {/* 1. TON HEADER (Comme sur le Dashboard) */}
      <Header />

      {/* 2. TON MOTEUR DE BULLES (Physique et mouvement parfaits) */}
      <div className="absolute inset-0 z-0">
        <BubbleCanvas onBubbleClick={() => {}} />
      </div>

      {/* 3. TON FORMULAIRE (Positionné par-dessus les bulles) */}
      <div className="absolute inset-0 flex flex-col items-center justify-end pb-12 z-10 px-6">
        {/* Voile de lisibilité pour le texte */}
        <div className="w-full max-w-md bg-white/40 backdrop-blur-xl p-8 rounded-[40px] shadow-2xl border border-white/40">
          <h1 className="text-2xl font-black text-center text-[#1A4D4D] mb-1">A little bit about you</h1>
          <p className="text-center text-[#4A5568] text-[10px] mb-6 font-bold uppercase tracking-widest opacity-60">
            Personalizing your legacy
          </p>

          {/* Grille de générations */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {GENERATIONS.map((gen) => (
              <button
                key={gen}
                onClick={() => setGeneration(gen)}
                className={`px-2 py-3.5 rounded-2xl transition-all text-[10px] font-bold border ${
                  generation === gen
                    ? "bg-[#F97316] border-[#F97316] text-white shadow-lg scale-105"
                    : "bg-white/50 border-white/30 text-[#1A4D4D]/70 hover:bg-white/80"
                }`}
              >
                {gen}
              </button>
            ))}
          </div>

          {/* Question Famille */}
          <div className="mb-6 text-center">
            <p className="text-[#1A4D4D] text-[10px] font-black mb-4 uppercase tracking-[0.2em] opacity-50">
              Family Circle
            </p>
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
                      ? "bg-[#1A4D4D] border-[#1A4D4D] text-white shadow-xl scale-110"
                      : "bg-white/60 border-white/40 text-[#1A4D4D]/60"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleFinish}
            disabled={!generation || hasChildren === null || loading}
            className="w-full py-4 rounded-full bg-[#F97316] text-white font-black text-lg shadow-2xl transform transition-all active:scale-95 disabled:opacity-20"
          >
            {loading ? "Creating..." : "Create my story"}
          </button>
        </div>
      </div>

      {/* Effet de fondu en haut pour le Header */}
      <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-[#FDFCFB] to-transparent pointer-events-none z-[1]" />
    </div>
  );
};

export default Portrait;
