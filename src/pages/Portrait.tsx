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

const BUBBLE_IMAGES = [
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=150",
  "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=150",
  "https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=150",
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=150",
  "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=150",
  "https://images.unsplash.com/photo-1433086566086-611b24466d3c?w=150",
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
    <div className="min-h-screen gradient-canvas flex flex-col px-6 pt-4 overflow-hidden relative">
      <style>{`
        @keyframes drift-1 {
          0% { transform: translate(0, 0); }
          50% { transform: translate(40px, -25px); }
          100% { transform: translate(0, 0); }
        }
        @keyframes drift-2 {
          0% { transform: translate(0, 0); }
          50% { transform: translate(-35px, -15px); }
          100% { transform: translate(0, 0); }
        }
        @keyframes drift-3 {
          0% { transform: translate(0, 0); }
          50% { transform: translate(25px, 20px); }
          100% { transform: translate(0, 0); }
        }
        .bubble-1 { animation: drift-1 12s ease-in-out infinite; }
        .bubble-2 { animation: drift-2 15s ease-in-out infinite; }
        .bubble-3 { animation: drift-3 10s ease-in-out infinite; }
      `}</style>

      {/* ZONE DES 6 BULLES INDÉPENDANTES */}
      <div className="relative h-48 w-full mb-2">
        {BUBBLE_IMAGES.map((img, i) => {
          // On alterne les animations pour casser la synchronisation
          const animClass = i % 3 === 0 ? "bubble-1" : i % 3 === 1 ? "bubble-2" : "bubble-3";
          return (
            <div
              key={i}
              className={`absolute rounded-full border-2 border-white/70 shadow-lg overflow-hidden ${animClass}`}
              style={{
                width: `${40 + i * 6}px`,
                height: `${40 + i * 6}px`,
                top: `${15 + i * 10}%`,
                left: `${10 + i * 15}%`,
                animationDelay: `${i * -3}s`, // Décale le départ de chaque bulle
                opacity: 0.85,
              }}
            >
              <img src={img} className="w-full h-full object-cover" alt="teaser" />
            </div>
          );
        })}
      </div>

      <h1 className="text-2xl font-bold text-center text-[#1A4D4D] mb-1">A little bit about you</h1>
      <p className="text-center text-[#4A5568] text-[11px] mb-6 px-4">Help us personalize your experience.</p>

      {/* Grille de générations */}
      <div className="grid grid-cols-2 gap-2 mb-6">
        {GENERATIONS.map((gen) => (
          <button
            key={gen}
            onClick={() => setGeneration(gen)}
            className={`px-2 py-3 rounded-xl transition-all text-[11px] font-semibold border ${
              generation === gen
                ? "bg-white/70 border-[#F97316] shadow-md scale-105"
                : "bg-white/10 border-white/20 text-[#1A4D4D]/70"
            }`}
          >
            {gen}
          </button>
        ))}
      </div>

      {/* Question Famille */}
      <div className="mb-4 text-center">
        <p className="text-[#1A4D4D] text-xs font-bold mb-3">Do you have a family circle?</p>
        <div className="flex gap-6 justify-center">
          {[
            { label: "Yes", value: true },
            { label: "No", value: false },
          ].map((opt) => (
            <button
              key={opt.label}
              onClick={() => setHasChildren(opt.value)}
              className={`w-14 h-14 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                hasChildren === opt.value
                  ? "bg-[#F97316] border-[#F97316] text-white shadow-lg scale-110"
                  : "bg-white/10 border-white/30 text-[#1A4D4D]/70"
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
        className="w-full py-4 rounded-full bg-[#F97316] text-white font-bold text-base shadow-xl mb-8 disabled:opacity-30"
      >
        {loading ? "Creating..." : "Create my story"}
      </button>
    </div>
  );
};

export default Portrait;
