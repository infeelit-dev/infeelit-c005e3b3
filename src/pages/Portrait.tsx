import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import BubbleCanvas from "@/components/BubbleCanvas";

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
    <div className="min-h-screen gradient-canvas flex flex-col overflow-hidden relative">
      <style>{`
        .portrait-canvas canvas {
          filter: contrast(1.1) saturate(0.8);
        }
        @keyframes subtle-pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        .bubble-portrait { animation: subtle-pulse 4s ease-in-out infinite; }
      `}</style>

      <div className="relative h-[38vh] w-full">
        <div className="portrait-canvas h-full w-full">
          <BubbleCanvas onBubbleClick={() => {}} />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#FDFCFB] pointer-events-none" />
      </div>

      <div className="px-6 flex flex-col flex-1 z-10 -mt-8">
        <h1 className="text-3xl font-black text-center text-[#1A4D4D] mb-1 tracking-tight">A little bit about you</h1>
        <p className="text-center text-[#4A5568] text-xs mb-8 opacity-80">Personalizing your time capsule...</p>

        <div className="grid grid-cols-2 gap-3 mb-8">
          {GENERATIONS.map((gen) => (
            <button
              key={gen}
              onClick={() => setGeneration(gen)}
              className={`px-3 py-4 rounded-2xl transition-all text-[11px] font-bold border backdrop-blur-md ${
                generation === gen
                  ? "bg-white/70 border-[#F97316] text-[#1A4D4D] shadow-xl scale-105"
                  : "bg-white/20 border-white/40 text-[#1A4D4D]/70 hover:bg-white/40"
              }`}
            >
              {gen}
            </button>
          ))}
        </div>

        <div className="mb-8 text-center">
          <p className="text-[#1A4D4D] text-sm font-black mb-4 uppercase tracking-widest opacity-70">Family Circle</p>
          <div className="flex gap-10 justify-center">
            {[
              { label: "Yes", value: true },
              { label: "No", value: false },
            ].map((opt) => (
              <button
                key={opt.label}
                onClick={() => setHasChildren(opt.value)}
                className={`w-14 h-14 rounded-full flex items-center justify-center text-xs font-black border-2 transition-all shadow-sm ${
                  hasChildren === opt.value
                    ? "bg-[#F97316] border-[#F97316] text-white shadow-orange-200 shadow-lg scale-110"
                    : "bg-white/30 border-white/50 text-[#1A4D4D]/60"
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

// LA LIGNE MANQUANTE ÉTAIT ICI :
export default Portrait;
