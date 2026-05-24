```tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import BubbleCanvas from "@/components/BubbleCanvas";
import CurvedBottomNav from "@/components/CurvedBottomNav";
import SparkBubble from "@/components/SparkBubble";
import imgMarry from "@/assets/marry.jpg";
import type { Timeline } from "@/types/timeline";
import type { BubbleCategory } from "@/components/MemoryBubble";

const DEMO_BUBBLES = {
  foreverInMemories: {
    question: "On the day you get married, I want you to know that I am proud of every step you took to get there.",
    badge: "FOR 2045",
    type: "forever-in-memories" as const,
  },
  legacyInForever: {
    question: "The day I understood that building a business is just another way of saying I love my family.",
    badge: "LEGACY",
    type: "legacy-in-forever" as const,
  },
};

const Index = () => {
  const navigate = useNavigate();
  const [activeTimeline, setActiveTimeline] = useState<Timeline>("memories");
  const [showForeverOverlay, setShowForeverOverlay] = useState(false);
  const [sparkForced, setSparkForced] = useState(false);
  const [circleBadge, setCircleBadge] = useState(0);

  useEffect(() => {
    const entryTime = Date.now();
    return () => {
      const timeSpent = Date.now() - entryTime;
      const prev = Number(localStorage.getItem("infeelit_feed_time") || 0);
      localStorage.setItem("infeelit_feed_time", String(prev + timeSpent));
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      const { data: memberships } = await supabase.from("circle_members").select("circle_id, user_id").eq("user_id", session.user.id).limit(1);
      const m = memberships?.[0];
      if (!m) return;
      const { data: allMembers } = await supabase.from("circle_members").select("user_id").eq("circle_id", m.circle_id);
      const ids = (allMembers ?? []).map((x: any) => x.user_id).filter((u: string) => u !== session.user.id);
      if (ids.length === 0) return;
      const since = localStorage.getItem("infeelit_circle_last_visit") || new Date(Date.now() - 7 * 86400000).toISOString();
      const { count } = await supabase.from("memories").select("id", { count: "exact", head: true }).in("user_id", ids).gt("created_at", since);
      if (!cancelled) setCircleBadge(count ?? 0);
    })();
    return () => { cancelled = true; };
  }, []);

  const handleTimelineChange = async (timeline: Timeline) => {
    if (timeline === "forever") {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setShowForeverOverlay(true); return; }
    }
    setActiveTimeline(timeline);
  };

  const handleBubbleClick = async (question: string, category: BubbleCategory) => {
    if (!question) return;
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      navigate("/record", { state: { question, category } });
      return;
    }
    navigate("/welcome", { state: { question, context: "answer" } });
  };

  const handleDemoBubbleClick = async (type: "forever-in-memories" | "legacy-in-forever") => {
    const { data: { session } } = await supabase.auth.getSession();
    const q = type === "forever-in-memories" ? DEMO_BUBBLES.foreverInMemories.question : DEMO_BUBBLES.legacyInForever.question;
    if (session) {
      navigate("/record", { state: { question: q } });
      return;
    }
    navigate("/welcome", { state: { question: q, context: type === "forever-in-memories" ? "forever" : "answer" } });
  };

  const handleJoin = () => {
    setShowForeverOverlay(false);
    navigate("/welcome");
  };

  const getBackground = () => {
    if (activeTimeline === "forever") return "linear-gradient(180deg, #020818 0%, #041434 40%, #0a1628 70%, #1a1040 100%)";
    if (activeTimeline === "instant") return "linear-gradient(180deg, #1A3B47 0%, #2d6a4f 40%, #E8742A 100%)";
    return "linear-gradient(180deg, #7ec8c8 0%, #a8d8c8 30%, #f0e6d3 70%, #E8742A 100%)";
  };

  return (
    <div className="relative w-full h-screen overflow-hidden transition-all duration-700" style={{ background: getBackground() }}>
      <style>{`
        @keyframes twinkle { 0%, 100% { opacity: 0.3; transform: scale(1); } 50% { opacity: 1; transform: scale(1.5); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideUp { from { transform: translateY(60px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes wander1 { 0% { transform: translate(0px, 0px); } 20% { transform: translate(50px, -60px); } 40% { transform: translate(90px, -20px); } 60% { transform: translate(60px, 55px); } 80% { transform: translate(-30px, 40px); } 100% { transform: translate(0px, 0px); } }
        @keyframes wander3 { 0% { transform: translate(0px, 0px); } 25% { transform: translate(70px, 55px); } 50% { transform: translate(30px, -70px); } 75% { transform: translate(-55px, -40px); } 100% { transform: translate(0px, 0px); } }
        @keyframes pulseViolet { 0%, 100% { box-shadow: 0 0 15px rgba(107,78,155,0.6), 0 0 30px rgba(107,78,155,0.3); } 50% { box-shadow: 0 0 30px rgba(107,78,155,1), 0 0 60px rgba(107,78,155,0.5); } }
        @keyframes pulseGold { 0%, 100% { box-shadow: 0 0 15px rgba(232,116,42,0.5); } 50% { box-shadow: 0 0 30px rgba(232,116,42,0.9); } }
        .fade-in-up { animation: fadeInUp 0.4s ease forwards; }
        .slide-up { animation: slideUp 0.4s ease forwards; }
        .bubble-demo-violet { animation: wander3 10s ease-in-out infinite, pulseViolet 2.5s ease-in-out infinite; }
        .bubble-demo-gold { animation: wander1 14s ease-in-out infinite, pulseGold 2.5s ease-in-out infinite; }
      `}</style>

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute top-1/4 -right-16 w-64 h-64 rounded-full bg-white/5 blur-3xl" style={{ animationDelay: "4s" }} />
        <div className="absolute bottom-1/3 -left-10 w-56 h-56 rounded-full bg-white/5 blur-3xl" style={{ animationDelay: "8s" }} />
        {activeTimeline === "forever" && [...Array(30)].map((_, i) => (<div key={i} className="absolute rounded-full bg-white" style={{ width: Math.random() * 2 + 1 + "px", height: Math.random() * 2 + 1 + "px", left: Math.random() * 100 + "%", top: Math.random() * 70 + "%", opacity: Math.random() * 0.7 + 0.3, animation: `twinkle ${Math.random() * 3 + 2}s ease-in-out infinite`, animationDelay: Math.random() * 3 + "s" }} />))}
      </div>

      <Header activeTimeline={activeTimeline} onTimelineChange={handleTimelineChange} />
      <BubbleCanvas onBubbleClick={handleBubbleClick} activeTimeline={activeTimeline} />
      <SparkBubble forceOpen={sparkForced} onSparkClose={() => setSparkForced(false)} />

      {activeTimeline === "memories" && (
        <button onClick={() => handleDemoBubbleClick("forever-in-memories")} className="absolute z-[2] cursor-pointer bubble-demo-violet" style={{ width: "85px", height: "85px", left: "68%", top: "58%", borderRadius: "50%", overflow: "hidden", border: "2px solid rgba(107,78,155,0.9)" }}>
          <img src={imgMarry} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: "grayscale(20%) sepia(30%)" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(160deg, rgba(107,78,155,0.65), rgba(2,8,40,0.45))" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 50%)" }} />
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "4px" }}>
            <span style={{ fontSize: "6px", color: "#FFFFFF", fontWeight: 900, backgroundColor: "rgba(107,78,155,0.9)", padding: "2px 6px", borderRadius: "999px", whiteSpace: "nowrap", letterSpacing: "0.05em" }}>FOR 2045</span>
            <span style={{ fontSize: "20px", color: "rgba(200,160,255,1)", textShadow: "0 0 15px rgba(107,78,155,1)", lineHeight: 1 }}>✦</span>
          </div>
        </button>
      )}
      {activeTimeline === "forever" && (
        <button onClick={() => handleDemoBubbleClick("legacy-in-forever")} className="absolute z-[2] cursor-pointer bubble-demo-gold" style={{ width: "75px", height: "75px", left: "12%", top: "58%", borderRadius: "50%", border: "2px solid rgba(232,116,42,0.9)", background: "radial-gradient(circle at 35% 35%, rgba(232,116,42,0.4), rgba(20,10,5,0.9))", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "3px", padding: "8px" }}>
          <span style={{ fontSize: "7px", color: "#FFFFFF", fontWeight: 900, backgroundColor: "rgba(232,116,42,0.9)", padding: "1px 5px", borderRadius: "999px", whiteSpace: "nowrap", lineHeight: 1.5 }}>LEGACY</span>
          <span style={{ fontSize: "20px", color: "rgba(232,116,42,1)", textShadow: "0 0 15px rgba(232,116,42,0.9)", lineHeight: 1 }}>?</span>
        </button>
      )}

      <CurvedBottomNav onPlusClick={() => setSparkForced(true)} circleBadge={circleBadge} />

      {showForeverOverlay && (
        <div className="absolute inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)" }} onClick={() => setShowForeverOverlay(false)}>
          <div className="fade-in-up w-full max-w-sm mx-6 rounded-3xl px-8 py-8 text-center" style={{ backgroundColor: "#020818", border: "1px solid rgba(56,189,248,0.3)" }} onClick={(e) => e.stopPropagation()}>
            <span className="text-4xl mb-4 block" style={{ textShadow: "0 0 20px rgba(56,189,248,0.8)" }}>✦</span>
            <p className="font-black text-[10px] uppercase tracking-[0.3em] mb-3" style={{ color: "rgba(56,189,248,0.9)" }}>The Forever timeline</p>
            <h2 className="text-white font-bold text-xl leading-tight mb-4">Messages to the future are created by members.</h2>
            <p className="text-white/50 text-sm mb-6 leading-relaxed">You can listen to any message in Forever. To send your own voice to the future, create your account.</p>
            <button onClick={() => { setShowForeverOverlay(false); handleJoin(); }} className="w-full py-4 rounded-full font-bold text-base mb-3" style={{ background: "linear-gradient(135deg, #38bdf8, #6B4E9B)", color: "#FFFFFF" }}>Create my legacy — it's free</button>
            <button onClick={() => { setShowForeverOverlay(false); setActiveTimeline("forever"); }} className="w-full py-3 text-white/40 text-sm font-medium">Just listen for now</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
```