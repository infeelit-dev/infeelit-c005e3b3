import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import BubbleCanvas from "@/components/BubbleCanvas";
import CurvedBottomNav from "@/components/CurvedBottomNav";
import type { Timeline } from "@/types/timeline";
import type { BubbleCategory } from "@/components/MemoryBubble";

// Bulles ambassadrices de démonstration
const DEMO_BUBBLES = {
  // Bulle Forever dans Memories — lueur violette
  foreverInMemories: {
    question: "On the day you get married, I want you to know that I am proud of every step you took to get there.",
    badge: "Message for 2045",
    type: "forever-in-memories" as const,
  },
  // Bulle Legacy dans Forever — lueur dorée
  legacyInForever: {
    question: "The day I understood that building a business is just another way of saying I love my family.",
    badge: "Legacy",
    type: "legacy-in-forever" as const,
  },
};

const Index = () => {
  const navigate = useNavigate();
  const [activeTimeline, setActiveTimeline] = useState<Timeline>("memories");
  const [showInterstitial, setShowInterstitial] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [showForeverOverlay, setShowForeverOverlay] = useState(false);
  const [pendingQuestion, setPendingQuestion] = useState("");
  const [pendingCategory, setPendingCategory] = useState<BubbleCategory>("past");
  const [interstitialContext, setInterstitialContext] = useState<"answer" | "forever" | "timer">("answer");

  // Trigger 3 — Bannière douce après 60 secondes
  useEffect(() => {
    const timer = setTimeout(async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) setShowBanner(true);
    }, 60000);
    return () => clearTimeout(timer);
  }, []);

  // Vérification session au changement de timeline
  const handleTimelineChange = async (timeline: Timeline) => {
    if (timeline === "forever") {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        setShowForeverOverlay(true);
        return;
      }
    }
    setActiveTimeline(timeline);
  };

  // Trigger 1 — Clic sur une bulle
  const handleBubbleClick = async (question: string, category: BubbleCategory) => {
    if (!question) return;

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session) {
      navigate("/record", { state: { question, category } });
      return;
    }

    // Non connecté → interstitiel avec la question
    setPendingQuestion(question);
    setPendingCategory(category);
    setInterstitialContext("answer");
    setShowBanner(false);
    setShowInterstitial(true);
  };

  // Clic sur bulle ambassadrice Forever
  const handleDemoBubbleClick = async (type: "forever-in-memories" | "legacy-in-forever") => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (type === "forever-in-memories") {
      setPendingQuestion(DEMO_BUBBLES.foreverInMemories.question);
      setInterstitialContext("forever");
    } else {
      setPendingQuestion(DEMO_BUBBLES.legacyInForever.question);
      setInterstitialContext("answer");
    }

    if (session) {
      navigate("/record", { state: { question: pendingQuestion } });
      return;
    }

    setShowBanner(false);
    setShowInterstitial(true);
  };

  const handleJoin = () => {
    setShowInterstitial(false);
    setShowForeverOverlay(false);
    setShowBanner(false);
    navigate("/welcome", {
      state: {
        question: pendingQuestion,
        context: interstitialContext,
      },
    });
  };

  const getBackground = () => {
    if (activeTimeline === "forever")
      return "linear-gradient(180deg, #020818 0%, #041434 40%, #0a1628 70%, #1a1040 100%)";
    if (activeTimeline === "instant") return "linear-gradient(180deg, #1A3B47 0%, #2d6a4f 40%, #E8742A 100%)";
    return "linear-gradient(180deg, #7ec8c8 0%, #a8d8c8 30%, #f0e6d3 70%, #E8742A 100%)";
  };

  const getInterstitialTitle = () => {
    if (interstitialContext === "forever") return "You wanted to create a legacy";
    return "You wanted to answer";
  };

  const getInterstitialBody = () => {
    if (interstitialContext === "forever")
      return "Create your account to record your own message to the future. It will reach its destination at the right moment.";
    return "Create your account to record this memory and share it with your family circle.";
  };

  const getInterstitialCTA = () => {
    if (interstitialContext === "forever") return "Create my legacy — it's free";
    return "Record this memory — it's free";
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
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(100%); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseViolet {
          0%, 100% { box-shadow: 0 0 20px rgba(107,78,155,0.6); }
          50% { box-shadow: 0 0 40px rgba(107,78,155,1); }
        }
        @keyframes pulseGold {
          0%, 100% { box-shadow: 0 0 20px rgba(232,116,42,0.6); }
          50% { box-shadow: 0 0 40px rgba(232,116,42,1); }
        }
        .fade-in-up { animation: fadeInUp 0.4s ease forwards; }
        .slide-up { animation: slideUp 0.4s ease forwards; }
        .pulse-violet { animation: pulseViolet 2.5s ease-in-out infinite; }
        .pulse-gold { animation: pulseGold 2.5s ease-in-out infinite; }
      `}</style>

      {/* Fond animé */}
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

      <Header activeTimeline={activeTimeline} onTimelineChange={handleTimelineChange} />
      <BubbleCanvas onBubbleClick={handleBubbleClick} activeTimeline={activeTimeline} />

      {/* Bulles ambassadrices — superposées au BubbleCanvas */}

      {/* Bulle Forever dans Memories — lueur violette */}
      {activeTimeline === "memories" && (
        <button
          onClick={() => handleDemoBubbleClick("forever-in-memories")}
          className="absolute z-[2] pulse-violet cursor-pointer rounded-full overflow-hidden"
          style={{
            width: "100px",
            height: "100px",
            left: "72%",
            top: "60%",
            border: "2px solid rgba(107,78,155,0.9)",
            background: "radial-gradient(circle at 35% 35%, rgba(107,78,155,0.8), rgba(2,8,40,0.9))",
          }}
        >
          {/* Badge */}
          <div className="absolute top-2 left-0 right-0 flex justify-center">
            <span
              className="text-white font-black px-2 py-0.5 rounded-full"
              style={{
                fontSize: "7px",
                backgroundColor: "rgba(107,78,155,0.9)",
                letterSpacing: "0.05em",
              }}
            >
              MESSAGE FOR 2045
            </span>
          </div>
          {/* Icône */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className="font-black"
              style={{
                fontSize: "22px",
                color: "rgba(107,78,155,1)",
                textShadow: "0 0 20px rgba(107,78,155,0.9)",
              }}
            >
              ✦
            </span>
          </div>
        </button>
      )}

      {/* Bulle Legacy dans Forever — lueur dorée */}
      {activeTimeline === "forever" && (
        <button
          onClick={() => handleDemoBubbleClick("legacy-in-forever")}
          className="absolute z-[2] pulse-gold cursor-pointer rounded-full overflow-hidden"
          style={{
            width: "110px",
            height: "110px",
            left: "15%",
            top: "55%",
            border: "2px solid rgba(232,116,42,0.9)",
            background: "radial-gradient(circle at 35% 35%, rgba(232,116,42,0.4), rgba(20,10,5,0.9))",
          }}
        >
          {/* Badge */}
          <div className="absolute top-2 left-0 right-0 flex justify-center">
            <span
              className="text-white font-black px-2 py-0.5 rounded-full"
              style={{
                fontSize: "8px",
                backgroundColor: "rgba(232,116,42,0.9)",
                letterSpacing: "0.05em",
              }}
            >
              LEGACY
            </span>
          </div>
          {/* Icône */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className="font-black"
              style={{
                fontSize: "22px",
                color: "rgba(232,116,42,1)",
                textShadow: "0 0 20px rgba(232,116,42,0.9)",
              }}
            >
              ?
            </span>
          </div>
        </button>
      )}

      <CurvedBottomNav />

      {/* Trigger 3 — Bannière douce après 60 secondes */}
      {showBanner && !showInterstitial && !showForeverOverlay && (
        <div className="absolute bottom-24 left-4 right-4 z-30 slide-up">
          <div
            className="rounded-2xl px-5 py-4 flex items-center justify-between gap-4"
            style={{
              backgroundColor: "rgba(15,15,15,0.95)",
              border: "1px solid rgba(232,116,42,0.3)",
            }}
          >
            <div>
              <p className="text-white font-bold text-sm">2,400 families preserving their voices.</p>
              <p className="text-white/50 text-xs mt-0.5">Join them for free.</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={handleJoin}
                className="px-4 py-2 rounded-full gradient-orange font-bold text-xs"
                style={{ color: "#FFFFFF" }}
              >
                Join
              </button>
              <button
                onClick={() => setShowBanner(false)}
                className="px-3 py-2 rounded-full bg-white/10 text-white/50 text-xs"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Trigger 2 — Overlay Forever réservé aux créateurs */}
      {showForeverOverlay && (
        <div
          className="absolute inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)" }}
          onClick={() => setShowForeverOverlay(false)}
        >
          <div
            className="fade-in-up w-full max-w-sm mx-6 rounded-3xl px-8 py-8 text-center"
            style={{
              backgroundColor: "#020818",
              border: "1px solid rgba(56,189,248,0.3)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <span className="text-4xl mb-4 block" style={{ textShadow: "0 0 20px rgba(56,189,248,0.8)" }}>
              ✦
            </span>
            <p
              className="font-black text-[10px] uppercase tracking-[0.3em] mb-3"
              style={{ color: "rgba(56,189,248,0.9)" }}
            >
              The Forever timeline
            </p>
            <h2 className="text-white font-bold text-xl leading-tight mb-4">
              Messages to the future are created by members.
            </h2>
            <p className="text-white/50 text-sm mb-6 leading-relaxed">
              You can listen to any message in Forever. To send your own voice to the future, create your account.
            </p>
            <button
              onClick={() => {
                setShowForeverOverlay(false);
                setInterstitialContext("forever");
                setPendingQuestion("");
                handleJoin();
              }}
              className="w-full py-4 rounded-full font-bold text-base mb-3"
              style={{
                background: "linear-gradient(135deg, #38bdf8, #6B4E9B)",
                color: "#FFFFFF",
              }}
            >
              Create my legacy — it's free
            </button>
            <button
              onClick={() => {
                setShowForeverOverlay(false);
                setActiveTimeline("forever");
              }}
              className="w-full py-3 text-white/40 text-sm font-medium"
            >
              Just listen for now
            </button>
          </div>
        </div>
      )}

      {/* Trigger 1 — Interstitiel principal */}
      {showInterstitial && (
        <div
          className="absolute inset-0 z-50 flex items-end justify-center pb-12"
          style={{ background: "rgba(0,0,0,0.80)", backdropFilter: "blur(10px)" }}
          onClick={() => setShowInterstitial(false)}
        >
          <div
            className="fade-in-up w-full max-w-sm mx-6 rounded-3xl px-8 py-8 text-center"
            style={{
              backgroundColor: "#0f0f0f",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <p className="font-black text-[10px] uppercase tracking-[0.3em] mb-3" style={{ color: "#E8742A" }}>
              {getInterstitialTitle()}
            </p>

            {pendingQuestion && (
              <p className="text-white font-bold text-base italic leading-snug mb-4">"{pendingQuestion}"</p>
            )}

            <p className="text-white/50 text-sm mb-6 leading-relaxed">{getInterstitialBody()}</p>

            <button
              onClick={handleJoin}
              className="w-full py-4 rounded-full gradient-orange font-bold text-base mb-3"
              style={{ color: "#FFFFFF" }}
            >
              {getInterstitialCTA()}
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
