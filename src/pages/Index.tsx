import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import BubbleCanvas from "@/components/BubbleCanvas";
import CurvedBottomNav from "@/components/CurvedBottomNav";
import type { Timeline } from "@/types/timeline";
import type { BubbleCategory } from "@/components/MemoryBubble";

const Index = () => {
  const navigate = useNavigate();
  const [activeTimeline, setActiveTimeline] = useState<Timeline>("memories");
  const [showInterstitial, setShowInterstitial] = useState(false);
  const [pendingQuestion, setPendingQuestion] = useState("");
  const [pendingCategory, setPendingCategory] = useState<BubbleCategory>("past");

  const handleBubbleClick = async (question: string, category: BubbleCategory) => {
    if (!question) return;

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session) {
      navigate("/record", { state: { question, category } });
    } else {
      setPendingQuestion(question);
      setPendingCategory(category);
      setShowInterstitial(true);
    }
  };

  const handleJoin = () => {
    setShowInterstitial(false);
    navigate("/welcome", {
      state: { question: pendingQuestion, category: pendingCategory },
    });
  };

  const getBackground = () => {
    if (activeTimeline === "forever") {
      return "linear-gradient(180deg, #020818 0%, #041434 40%, #0a1628 70%, #1a1040 100%)";
    }
    if (activeTimeline === "instant") {
      return "linear-gradient(180deg, #1A3B47 0%, #2d6a4f 40%, #E8742A 100%)";
    }
    return "linear-gradient(180deg, #7ec8c8 0%, #a8d8c8 30%, #f0e6d3 70%, #E8742A 100%)";
  };

  return (
    <div
      className="relative w-full h-screen overflow-hidden transition-all duration-700"
      style={{ background: getBackground() }}
    >
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.5); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-in-up { animation: fadeInUp 0.4s ease forwards; }
      `}</style>

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-white/5 blur-3xl animate-bokeh" />
        <div
          className="absolute top-1/4 -right-16 w-64 h-64 rounded-full bg-white/5 blur-3xl animate-bokeh"
          style={{ animationDelay: "4s" }}
        />
        <div
          className="absolute bottom-1/3 -left-10 w-56 h-56 rounded-full bg-white/5 blur-3xl animate-bokeh"
          style={{ animationDelay: "8s" }}
        />
        {activeTimeline === "forever" &&
          [...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                width: Math.random() * 2 + 1 + "px",
                height: Math.random() * 2 + 1 + "px",
                left: Math.random() * 100 + "%",
                top: Math.random() * 70 + "%",
                opacity: Math.random() * 0.7 + 0.3,
                animation: `twinkle ${Math.random() * 3 + 2}s ease-in-out infinite`,
                animationDelay: Math.random() * 3 + "s",
              }}
            />
          ))}
      </div>

      <Header activeTimeline={activeTimeline} onTimelineChange={setActiveTimeline} />
      <BubbleCanvas onBubbleClick={handleBubbleClick} activeTimeline={activeTimeline} />
      <CurvedBottomNav />

      {/* Interstitiel — apparaît quand non connecté */}
      {showInterstitial && (
        <div
          className="absolute inset-0 z-50 flex items-end justify-center pb-12"
          style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
          onClick={() => setShowInterstitial(false)}
        >
          <div
            className="fade-in-up w-full max-w-sm mx-6 rounded-3xl px-8 py-8 text-center"
            style={{ backgroundColor: "#0f0f0f", border: "1px solid rgba(255,255,255,0.1)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Question qui a motivé l'utilisateur */}
            <p className="text-[#E8742A] text-[10px] font-black uppercase tracking-[0.3em] mb-3">
              You wanted to answer
            </p>
            <p className="text-white font-bold text-base italic leading-snug mb-6">"{pendingQuestion}"</p>

            <p className="text-white/50 text-sm mb-6 leading-relaxed">
              Join 2,400 families preserving their voices on Infeelit. Your memory deserves to be heard.
            </p>

            <button
              onClick={handleJoin}
              className="w-full py-4 rounded-full gradient-orange font-bold text-base mb-3"
              style={{ color: "#FFFFFF" }}
            >
              Create my account — it's free
            </button>

            <button
              onClick={() => setShowInterstitial(false)}
              className="w-full py-3 text-white/40 text-sm font-medium"
            >
              Continue exploring
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
