import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const GENERATIONS = [
  "Silent Generation (1928–1945)",
  "Baby Boomers (1946–1964)",
  "Generation X (1965–1980)",
  "Millennials (1981–1996)",
  "Generation Z (1997–2012)",
  "Generation Alpha (2013+)",
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
      const { data: { user } } = await supabase.auth.getUser();
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
      navigate("/", { replace: true });
    } catch {
      navigate("/", { replace: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-canvas flex flex-col px-6 pt-16">
      <h1 className="text-2xl font-bold text-center text-foreground mb-2">
        Portrait de Vie
      </h1>
      <p className="text-center text-muted-foreground text-sm mb-10">
        Help us personalize your experience
      </p>

      {/* Generation picker */}
      <div className="mb-8">
        <label className="text-sm font-semibold text-foreground mb-3 block">
          Which generation do you belong to?
        </label>
        <div className="space-y-2">
          {GENERATIONS.map((gen) => (
            <button
              key={gen}
              onClick={() => setGeneration(gen)}
              className={`w-full text-left px-4 py-3 rounded-xl transition-all text-sm font-medium ${
                generation === gen
                  ? "glass-surface-strong border-secondary/60 text-foreground shadow-md"
                  : "glass-surface text-foreground/80 hover:bg-white/20"
              }`}
            >
              {gen}
            </button>
          ))}
        </div>
      </div>

      {/* Children question */}
      <div className="mb-8">
        <label className="text-sm font-semibold text-foreground mb-3 block">
          Do you have children?
        </label>
        <div className="flex gap-3">
          {[
            { label: "Yes", value: true },
            { label: "No", value: false },
          ].map((opt) => (
            <button
              key={opt.label}
              onClick={() => setHasChildren(opt.value)}
              className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
                hasChildren === opt.value
                  ? "gradient-orange text-primary-foreground shadow-md"
                  : "glass-surface text-foreground/80 hover:bg-white/20"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Finish button */}
      <button
        onClick={handleFinish}
        disabled={!canContinue || loading}
        className="w-full py-4 rounded-full gradient-orange text-primary-foreground font-bold text-base transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 mb-8"
      >
        {loading ? "Saving..." : "Start Exploring"}
      </button>
    </div>
  );
};

export default Portrait;
