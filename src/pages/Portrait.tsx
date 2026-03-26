import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const GENERATIONS = [
  { label: "Silent", range: "1928–1945" },
  { label: "Boomers", range: "1946–1964" },
  { label: "Gen X", range: "1965–1980" },
  { label: "Millennials", range: "1981–1996" },
  { label: "Gen Z", range: "1997–2012" },
  { label: "Gen Alpha", range: "2013+" },
];

const Portrait = () => {
  const navigate = useNavigate();
  const [generation, setGeneration] = useState("");
  const [hasFamily, setHasFamily] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  const canContinue = generation !== "";

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
            has_children: hasFamily,
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
    <div className="min-h-screen gradient-canvas flex flex-col items-center px-6 pt-20 pb-10 relative overflow-hidden">
      {/* Floating clouds — subtle & numerous */}
      <div className="absolute top-[-80px] left-[-50px] w-60 h-60 rounded-full bg-white/8 blur-3xl animate-bokeh pointer-events-none" />
      <div className="absolute top-[10%] right-[-60px] w-36 h-36 rounded-full bg-white/6 blur-3xl animate-bokeh pointer-events-none" style={{ animationDelay: "2s" }} />
      <div className="absolute top-[35%] left-[10%] w-28 h-28 rounded-full bg-accent/5 blur-3xl animate-bokeh pointer-events-none" style={{ animationDelay: "5s" }} />
      <div className="absolute top-[55%] right-[5%] w-32 h-32 rounded-full bg-white/6 blur-3xl animate-bokeh pointer-events-none" style={{ animationDelay: "7s" }} />
      <div className="absolute bottom-[15%] left-[-40px] w-44 h-44 rounded-full bg-white/5 blur-3xl animate-bokeh pointer-events-none" style={{ animationDelay: "9s" }} />
      <div className="absolute bottom-[-30px] right-[20%] w-24 h-24 rounded-full bg-accent/4 blur-3xl animate-bokeh pointer-events-none" style={{ animationDelay: "11s" }} />

      {/* Title only */}
      <h1 className="text-[1.75rem] font-semibold text-primary text-center mb-16 relative z-10">
        A little bit about you
      </h1>

      {/* 3x2 Generation grid */}
      <div className="grid grid-cols-3 gap-3 w-full max-w-[320px] mb-16 relative z-10">
        {GENERATIONS.map((gen) => {
          const isSelected = generation === gen.label;
          return (
            <button
              key={gen.label}
              onClick={() => setGeneration(gen.label)}
              className={`flex flex-col items-center justify-center py-4 rounded-2xl backdrop-blur-md border transition-all duration-300 ${
                isSelected
                  ? "bg-white/20 border-accent/70 shadow-[0_0_20px_4px_hsl(var(--accent)/0.35)]"
                  : "bg-white/8 border-white/20 hover:bg-white/14 hover:border-white/40"
              }`}
            >
              <span className={`text-xs font-semibold ${isSelected ? "text-foreground" : "text-foreground/65"}`}>
                {gen.label}
              </span>
              <span className={`text-[10px] mt-0.5 ${isSelected ? "text-foreground/70" : "text-foreground/40"}`}>
                {gen.range}
              </span>
            </button>
          );
        })}
      </div>

      {/* Family circle — two minimal pills */}
      <div className="flex gap-5 mb-6 relative z-10">
        {[
          { label: "Yes", value: true },
          { label: "No", value: false },
        ].map((opt) => {
          const isSelected = hasFamily === opt.value;
          return (
            <button
              key={opt.label}
              onClick={() => setHasFamily(opt.value)}
              className={`w-20 h-20 rounded-full backdrop-blur-md border flex items-center justify-center transition-all duration-300 ${
                isSelected
                  ? "bg-white/20 border-accent/70 shadow-[0_0_20px_4px_hsl(var(--accent)/0.35)]"
                  : "bg-white/8 border-white/20 hover:bg-white/14 hover:border-white/40"
              }`}
            >
              <span className={`text-sm font-semibold ${isSelected ? "text-foreground" : "text-foreground/60"}`}>
                {opt.label}
              </span>
            </button>
          );
        })}
      </div>
      <p className="text-[11px] text-foreground/40 mb-auto relative z-10">Family circle</p>

      {/* CTA */}
      <button
        onClick={handleFinish}
        disabled={!canContinue || loading}
        className="w-full max-w-[300px] py-4 rounded-full gradient-orange font-bold text-base transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 relative z-10"
        style={{ color: "#1A1A1A" }}
      >
        {loading ? "Saving..." : "Create my story"}
      </button>
    </div>
  );
};

export default Portrait;
