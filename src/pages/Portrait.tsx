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

const CHILDREN_OPTIONS = [
  { label: "Yes", value: true as boolean | null },
  { label: "No", value: false as boolean | null },
  { label: "Prefer not to say", value: null as boolean | null },
];

const Portrait = () => {
  const navigate = useNavigate();
  const [generation, setGeneration] = useState("");
  const [childrenAnswer, setChildrenAnswer] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const canContinue = generation !== "";

  const handleFinish = async () => {
    if (!canContinue) return;
    setLoading(true);

    const hasChildren =
      childrenAnswer === "Yes" ? true : childrenAnswer === "No" ? false : null;

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
    <div className="min-h-screen gradient-canvas flex flex-col px-6 pt-14 pb-6 relative overflow-hidden">
      {/* Floating cloud shapes */}
      <div className="absolute top-[-60px] left-[-40px] w-52 h-52 rounded-full bg-white/10 blur-3xl animate-bokeh pointer-events-none" />
      <div className="absolute top-[30%] right-[-50px] w-44 h-44 rounded-full bg-accent/8 blur-3xl animate-bokeh pointer-events-none" style={{ animationDelay: "4s" }} />
      <div className="absolute bottom-[10%] left-[-30px] w-40 h-40 rounded-full bg-white/8 blur-3xl animate-bokeh pointer-events-none" style={{ animationDelay: "8s" }} />

      {/* Header */}
      <h1 className="text-3xl font-semibold text-center text-primary mb-2">
        Portrait de Vie
      </h1>
      <p className="text-center text-muted-foreground text-sm mb-10 max-w-[280px] mx-auto leading-relaxed">
        Tell us a bit about yourself to personalize your sanctuary.
      </p>

      {/* Generation picker */}
      <div className="mb-8 relative z-10">
        <label className="text-sm font-semibold text-foreground mb-3 block">
          Which generation do you belong to?
        </label>
        <div className="flex flex-wrap gap-2">
          {GENERATIONS.map((gen) => {
            const isSelected = generation === gen;
            return (
              <button
                key={gen}
                onClick={() => setGeneration(gen)}
                className={`px-4 py-2.5 rounded-full text-xs font-semibold transition-all backdrop-blur-md border ${
                  isSelected
                    ? "bg-white/25 border-white/60 text-foreground shadow-[0_0_16px_4px_rgba(255,255,255,0.25)]"
                    : "bg-white/10 border-white/30 text-foreground/75 hover:bg-white/18"
                }`}
              >
                {gen}
              </button>
            );
          })}
        </div>
      </div>

      {/* Children question */}
      <div className="mb-8 relative z-10">
        <label className="text-sm font-semibold text-foreground mb-3 block">
          Do you have children?
        </label>
        <div className="flex gap-3">
          {CHILDREN_OPTIONS.map((opt) => {
            const isSelected = childrenAnswer === opt.label;
            return (
              <button
                key={opt.label}
                onClick={() => setChildrenAnswer(opt.label)}
                className={`flex-1 py-3 rounded-full text-xs font-bold transition-all backdrop-blur-md border ${
                  isSelected
                    ? "bg-white/25 border-white/60 text-foreground shadow-[0_0_16px_4px_rgba(255,255,255,0.25)]"
                    : "bg-white/10 border-white/30 text-foreground/75 hover:bg-white/18"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Continue button */}
      <button
        onClick={handleFinish}
        disabled={!canContinue || loading}
        className="w-full py-4 rounded-full gradient-orange text-primary-foreground font-bold text-base transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 relative z-10"
      >
        {loading ? "Saving..." : "Continue my story"}
      </button>
    </div>
  );
};

export default Portrait;
