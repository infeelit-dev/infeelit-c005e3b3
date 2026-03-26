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

      {/* ── Teaser: high-visibility photo bubbles ── */}
      <div className="relative z-10 w-full h-[300px] mt-4 mb-2 flex items-center justify-center overflow-hidden">
        <div
          className="absolute rounded-full animate-bokeh overflow-hidden"
          style={{
            width: 192,
            height: 192,
            top: "8%",
            left: "13%",
            opacity: 1,
            filter: "blur(0px)",
            border: "2px solid white",
            boxShadow:
              "0 0 18px hsl(0 0% 100% / 0.8), 0 10px 28px hsl(0 0% 0% / 0.25)",
            background: "hsl(var(--accent) / 0.25)",
            animationDelay: "0s",
          }}
        >
          <img
            src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=200&h=200&fit=crop&auto=format"
            alt="Memory teaser bubble one"
            className="w-full h-full object-cover rounded-full"
            style={{ opacity: 1 }}
          />
        </div>

        <div
          className="absolute rounded-full animate-bokeh overflow-hidden"
          style={{
            width: 156,
            height: 156,
            top: "4%",
            left: "49%",
            opacity: 1,
            filter: "blur(0px)",
            border: "2px solid white",
            boxShadow:
              "0 0 18px hsl(0 0% 100% / 0.8), 0 10px 26px hsl(0 0% 0% / 0.22)",
            background: "hsl(var(--primary) / 0.25)",
            animationDelay: "2.5s",
          }}
        >
          <img
            src="https://images.unsplash.com/photo-1511895426328-dc8714191300?w=200&h=200&fit=crop&auto=format"
            alt="Memory teaser bubble two"
            className="w-full h-full object-cover rounded-full"
            style={{ opacity: 1 }}
          />
        </div>

        <div
          className="absolute rounded-full animate-bokeh overflow-hidden"
          style={{
            width: 132,
            height: 132,
            top: "40%",
            left: "36%",
            opacity: 1,
            filter: "blur(0px)",
            border: "2px solid white",
            boxShadow:
              "0 0 15px hsl(0 0% 100% / 0.8), 0 8px 22px hsl(0 0% 0% / 0.2)",
            background: "hsl(var(--accent) / 0.2)",
            animationDelay: "5s",
          }}
        >
          <img
            src="https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=200&h=200&fit=crop&auto=format"
            alt="Memory teaser bubble three"
            className="w-full h-full object-cover rounded-full"
            style={{ opacity: 1 }}
          />
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
