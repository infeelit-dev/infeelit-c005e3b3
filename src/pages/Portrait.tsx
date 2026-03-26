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

  const canContinue = generation && hasChildren !== null;

  const handleFinish = async () => {
    if (!canContinue) return;
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
      navigate("/dashboard", { replace: true });
    } catch {
      navigate("/dashboard", { replace: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-canvas flex flex-col px-6 pt-10 overflow-hidden">
      {/* TEASER BUBBLES - High Visibility */}
      <div className="relative h-32 mb-4 flex justify-center items-center">
        <div className="absolute w-24 h-24 rounded-full border-2 border-white/50 shadow-xl rotate-[-10deg] translate-x-[-40px] overflow-hidden z-10 animate-float">
          <img
            src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=200&h=200&fit=crop"
            className="w-full h-full object-cover"
            alt="teaser"
          />
        </div>
        <div className="absolute w-28 h-28 rounded-full border-2 border-white/80 shadow-2xl z-20 overflow-hidden animate-float-delayed">
          <img
            src="https://images.unsplash.com/photo-1511895426328-dc8714191300?w=300&h=300&fit=crop"
            className="w-full h-full object-cover"
            alt="teaser"
          />
        </div>
        <div className="absolute w-20 h-20 rounded-full border-2 border-white/50 shadow-xl rotate-[15deg] translate-x-[50px] overflow-hidden z-10 animate-float">
          <img
            src="https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=200&h=200&fit=crop"
            className="w-full h-full object-cover"
            alt="teaser"
          />
        </div>
      </div>

      <h1 className="text-3xl font-bold text-center text-[#1A4D4D] mb-2">A little bit about you</h1>
      <p className="text-center text-[#4A5568] text-sm mb-10">Help us personalize your experience.</p>

      {/* Generation Grid */}
      <div className="grid grid-cols-2 gap-3 mb-10">
        {GENERATIONS.map((gen) => (
          <button
            key={gen}
            onClick={() => setGeneration(gen)}
            className={`px-3 py-4 rounded-2xl transition-all text-xs font-semibold backdrop-blur-md border ${
              generation === gen
                ? "bg-white/40 border-[#F97316] text-[#1A4D4D] shadow-lg scale-105"
                : "bg-white/10 border-white/20 text-[#1A4D4D]/80 hover:bg-white/20"
            }`}
          >
            {gen}
          </button>
        ))}
      </div>

      {/* Family Circle */}
      <div className="mb-12 text-center">
        <p className="text-[#1A4D4D] font-bold mb-4">Do you have a family circle?</p>
        <div className="flex gap-8 justify-center">
          {[
            { label: "Yes", value: true },
            { label: "No", value: false },
          ].map((opt) => (
            <button
              key={opt.label}
              onClick={() => setHasChildren(opt.value)}
              className={`w-20 h-20 rounded-full flex items-center justify-center text-sm font-bold transition-all border-2 backdrop-blur-lg ${
                hasChildren === opt.value
                  ? "bg-[#F97316] border-[#F97316] text-white shadow-xl scale-110"
                  : "bg-white/10 border-white/30 text-[#1A4D4D]/70"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1" />

      {/* Final Button */}
      <button
        onClick={handleFinish}
        disabled={!canContinue || loading}
        className="w-full py-4 rounded-full bg-[#F97316] text-white font-bold text-lg shadow-2xl transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-30 mb-10"
      >
        {loading ? "Creating..." : "Create my story"}
      </button>
    </div>
  );
};

export default Portrait;
