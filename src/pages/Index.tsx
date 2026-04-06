import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header, { Timeline } from "@/components/Header";
import BubbleCanvas from "@/components/BubbleCanvas";
import CurvedBottomNav from "@/components/CurvedBottomNav";
import type { BubbleCategory } from "@/components/MemoryBubble";

const Index = () => {
  const navigate = useNavigate();
  const [activeTimeline, setActiveTimeline] = useState<Timeline>("memories");

  const handleBubbleClick = (question: string, category: BubbleCategory) => {
    if (question) {
      navigate("/record", { state: { question, category } });
    }
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
      `}</style>

      {/* Nuages flous */}
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

        {/* Étoiles pour Forever */}
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
    </div>
  );
};

export default Index;
