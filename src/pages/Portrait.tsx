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
    <div className="min-h-screen gradient-canvas flex flex-col px-6 pt-10 overflow-hidden relative">
      {/* STYLE CSS POUR L'ANIMATION (Injecté direct) */}
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px) translateX(-40px) rotate(-10deg); }
          50% { transform: translateY(-10px) translateX(-35px) rotate(-8deg); }
          100% { transform: translateY(0px) translateX(-40px) rotate(-10deg); }
        }
        @keyframes float-main {
          0% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-15px) scale(1.05); }
          100% { transform: translateY(0px) scale(1); }
        }
        .animate-float-custom { animation: float 4s ease-in-out infinite; }
        .animate-float-main { animation: float-main 5s ease-in-out infinite; }
      `}</style>

      {/* TEASER BUBBLES - Libérées et mobiles */}
      <div className="relative h-40 mb-2 flex justify-center items-center">
        <div className="absolute w-20 h-20 rounded-full border-2 border-white/40 shadow-xl overflow-hidden z-10 animate-float-custom">
          <img
            src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=200"
            className="w-full h-full object-cover opacity-80"
          />
        </div>
        <div className="absolute w-28 h-28 rounded-full border-4 border-white/90 shadow-2xl z-20 overflow-hidden animate-float-main">
          <img
            src="https://images.unsplash.com/photo-1511895426328-dc8714191300?w=300"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute w-16 h-16 rounded-full border-2 border-white/40 shadow-xl overflow-hidden z-10 translate-x-20 -translate-y-4 animate-bounce-slow">
          <img
            src="https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=200"
            className="w-full h-full object-cover opacity-70"
          />
        </div>
      </div>

      <h1 className="text-3xl font-bold text-center text-[#1A4D4D] mb-1">A little bit about you</h1>
      <p className="text-center text-[#4A5568] text-sm mb-8">Help us personalize your experience.</p>

      <div className="grid grid-cols-2 gap-3 mb-8">
        {GENERATIONS.map((gen) => (
          <button
            key={gen}
            onClick={() => setGeneration(gen)}
            className={`px-3 py-4 rounded-2xl transition-all text-xs font-semibold border ${
              generation === gen
                ? "bg-white/50 border-[#F97316] shadow-lg scale-105"
                : "bg-white/10 border-white/20 text-[#1A4D4D]/70"
            }`}
          >
            {gen}
          </button>
        ))}
      </div>

      <div className="mb-8 text-center">
        <p className="text-[#1A4D4D] font-bold mb-4">Do you have a family circle?</p>
        <div className="flex gap-8 justify-center">
          {[
            { label: "Yes", value: true },
            { label: "No", value: false },
          ].map((opt) => (
            <button
              key={opt.label}
              onClick={() => setHasChildren(opt.value)}
              className={`w-16 h-16 rounded-full flex items-center justify-center text-sm font-bold border-2 ${
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

      <button
        onClick={handleFinish}
        disabled={!generation || hasChildren === null || loading}
        className="w-full py-4 rounded-full bg-[#F97316] text-white font-bold text-lg shadow-xl mt-auto mb-10 disabled:opacity-30"
      >
        {loading ? "Creating..." : "Create my story"}
      </button>
    </div>
  );
};

export default Portrait;
