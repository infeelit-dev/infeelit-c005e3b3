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
    <div className="min-h-screen gradient-canvas flex flex-col items-center relative overflow-hidden">
      {/* Ambient clouds */}
      {[
        { w: 56, h: 56, t: "-70px", l: "-40px", o: 0.07, d: "0s" },
        { w: 32, h: 32, t: "12%", r: "-30px", o: 0.05, d: "3s" },
        { w: 24, h: 24, t: "40%", l: "8%", o: 0.04, d: "6s" },
        { w: 28, h: 28, t: "60%", r: "5%", o: 0.05, d: "8s" },
        { w: 40, h: 40, b: "10%", l: "-20px", o: 0.06, d: "10s" },
        { w: 20, h: 20, b: "5%", r: "15%", o: 0.04, d: "12s" },
      ].map((c, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white blur-3xl animate-bokeh pointer-events-none"
          style={{
            width: `${c.w * 4}px`,
            height: `${c.h * 4}px`,
            top: c.t,
            left: c.l,
            right: c.r,
            bottom: c.b,
            opacity: c.o,
            animationDelay: c.d,
          }}
        />
      ))}

      {/* ── Teaser: vibrant photo bubble cluster ── */}
      <div className="relative w-full h-[150px] mt-4 mb-1 flex items-center justify-center">
        {/* Bubble 1 — large, left */}
        <div
          className="absolute rounded-full animate-bokeh overflow-hidden"
          style={{
            width: 80, height: 80,
            top: "15%", left: "20%",
            filter: "blur(2px)",
            animationDelay: "0s",
          }}
        >
          <div className="w-full h-full rounded-full" style={{
            background: "linear-gradient(135deg, hsl(20 90% 55% / 0.6), hsl(35 95% 60% / 0.4))",
            border: "1.5px solid rgba(255,255,255,0.3)",
            boxShadow: "0 4px 20px hsl(20 90% 55% / 0.3), inset 0 0 20px rgba(255,255,255,0.15)",
          }} />
        </div>
        {/* Bubble 2 — medium, center-top */}
        <div
          className="absolute rounded-full animate-bokeh overflow-hidden"
          style={{
            width: 60, height: 60,
            top: "5%", left: "48%",
            filter: "blur(1.5px)",
            animationDelay: "2s",
          }}
        >
          <div className="w-full h-full rounded-full" style={{
            background: "linear-gradient(135deg, hsl(var(--primary) / 0.5), hsl(195 40% 45% / 0.35))",
            border: "1.5px solid rgba(255,255,255,0.25)",
            boxShadow: "0 4px 20px hsl(var(--primary) / 0.25), inset 0 0 16px rgba(255,255,255,0.12)",
          }} />
        </div>
        {/* Bubble 3 — small, right */}
        <div
          className="absolute rounded-full animate-bokeh overflow-hidden"
          style={{
            width: 50, height: 50,
            top: "35%", left: "65%",
            filter: "blur(2.5px)",
            animationDelay: "4s",
          }}
        >
          <div className="w-full h-full rounded-full" style={{
            background: "linear-gradient(135deg, hsl(30 85% 58% / 0.55), hsl(15 80% 50% / 0.35))",
            border: "1.5px solid rgba(255,255,255,0.25)",
            boxShadow: "0 4px 16px hsl(30 85% 58% / 0.25), inset 0 0 14px rgba(255,255,255,0.1)",
          }} />
        </div>
        {/* Bubble 4 — tiny accent */}
        <div
          className="absolute rounded-full animate-bokeh overflow-hidden"
          style={{
            width: 36, height: 36,
            top: "55%", left: "35%",
            filter: "blur(1.5px)",
            animationDelay: "6s",
          }}
        >
          <div className="w-full h-full rounded-full" style={{
            background: "linear-gradient(135deg, hsl(var(--accent) / 0.45), hsl(25 90% 52% / 0.3))",
            border: "1px solid rgba(255,255,255,0.2)",
            boxShadow: "0 3px 12px hsl(var(--accent) / 0.2), inset 0 0 10px rgba(255,255,255,0.1)",
          }} />
        </div>
      </div>

      {/* ── Title ── */}
      <h1 className="text-[1.85rem] font-semibold text-primary text-center mb-10 relative z-10 px-6">
        A little bit about you
      </h1>

      {/* ── 3×2 Generation grid ── */}
      <div className="grid grid-cols-3 gap-2.5 w-full max-w-[300px] px-2 mb-12 relative z-10">
        {GENERATIONS.map((gen) => {
          const isSelected = generation === gen.label;
          return (
            <button
              key={gen.label}
              onClick={() => setGeneration(gen.label)}
              className="flex flex-col items-center justify-center py-3.5 rounded-2xl backdrop-blur-md border transition-all duration-300"
              style={{
                background: isSelected ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.06)",
                borderColor: isSelected ? "hsl(var(--accent) / 0.7)" : "rgba(255,255,255,0.15)",
                boxShadow: isSelected ? "0 0 18px 3px hsl(var(--accent) / 0.3)" : "none",
              }}
            >
              <span
                className="text-[11px] font-semibold"
                style={{ color: isSelected ? "hsl(var(--foreground))" : "hsl(var(--foreground) / 0.55)" }}
              >
                {gen.label}
              </span>
              <span
                className="text-[9px] mt-0.5"
                style={{ color: isSelected ? "hsl(var(--foreground) / 0.6)" : "hsl(var(--foreground) / 0.3)" }}
              >
                {gen.range}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Family circle ── */}
      <div className="flex gap-8 mb-3 relative z-10">
        {[
          { label: "Yes", value: true },
          { label: "No", value: false },
        ].map((opt) => {
          const isSelected = hasFamily === opt.value;
          return (
            <button
              key={opt.label}
              onClick={() => setHasFamily(opt.value)}
              className="w-[72px] h-[72px] rounded-full backdrop-blur-md border flex items-center justify-center transition-all duration-300"
              style={{
                background: isSelected ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.06)",
                borderColor: isSelected ? "hsl(var(--accent) / 0.7)" : "rgba(255,255,255,0.15)",
                boxShadow: isSelected ? "0 0 18px 3px hsl(var(--accent) / 0.3)" : "none",
              }}
            >
              <span
                className="text-sm font-semibold"
                style={{ color: isSelected ? "hsl(var(--foreground))" : "hsl(var(--foreground) / 0.5)" }}
              >
                {opt.label}
              </span>
            </button>
          );
        })}
      </div>
      <p className="text-[10px] tracking-wide uppercase relative z-10" style={{ color: "hsl(var(--foreground) / 0.3)" }}>
        Family circle
      </p>

      {/* Spacer */}
      <div className="flex-1" />

      {/* ── CTA ── */}
      <div className="w-full px-8 pb-10 relative z-10">
        <button
          onClick={handleFinish}
          disabled={!canContinue || loading}
          className="w-full py-4 rounded-full gradient-orange font-bold text-base transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40"
          style={{ color: "#1A1A1A" }}
        >
          {loading ? "Saving..." : "Create my story"}
        </button>
      </div>
    </div>
  );
};

export default Portrait;
