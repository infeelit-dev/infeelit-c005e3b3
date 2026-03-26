import { useState } from "react";
import { Shield } from "lucide-react";
import Header from "@/components/Header";
import BubbleCanvas from "@/components/BubbleCanvas";
import CurvedBottomNav from "@/components/CurvedBottomNav";
import CaptureScreen from "@/components/CaptureScreen";
import type { BubbleCategory } from "@/components/MemoryBubble";

interface CapturePrompt {
  question: string;
  category: BubbleCategory;
}

const Index = () => {
  const [capturePrompt, setCapturePrompt] = useState<CapturePrompt | null>(null);

  const handleBubbleClick = (question: string, category: BubbleCategory) => {
    if (question) {
      setCapturePrompt({ question, category });
    }
  };

  const handleSave = (videoBlob: Blob) => {
    console.log("Video saved:", videoBlob.size, "bytes");
    setCapturePrompt(null);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden gradient-canvas">
      {/* Floating cloud shapes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-white/5 blur-3xl animate-bokeh" />
        <div className="absolute top-1/4 -right-16 w-64 h-64 rounded-full bg-white/5 blur-3xl animate-bokeh" style={{ animationDelay: "4s" }} />
        <div className="absolute bottom-1/3 -left-10 w-56 h-56 rounded-full bg-white/5 blur-3xl animate-bokeh" style={{ animationDelay: "8s" }} />
        <div className="absolute top-1/2 right-1/4 w-48 h-48 rounded-full bg-white/5 blur-3xl animate-bokeh" style={{ animationDelay: "6s" }} />
        <div className="absolute -bottom-10 right-10 w-60 h-60 rounded-full bg-white/5 blur-3xl animate-bokeh" style={{ animationDelay: "10s" }} />
      </div>

      <Header />

      {/* Emotional center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-[5] px-8">
        <h1 className="text-2xl font-extrabold text-primary text-center text-shadow-soft">
          Welcome home
        </h1>
        <p className="mt-2 text-sm font-medium text-[#1A1A1A] text-center">
          Your most precious moments are safe here.
        </p>

        {/* Sanctuary icon */}
        <div className="mt-8 flex flex-col items-center gap-2">
          <div className="w-16 h-16 rounded-full bg-white/15 backdrop-blur-md border border-white/40 flex items-center justify-center">
            <Shield className="w-7 h-7 text-primary" />
          </div>
          <span className="text-xs font-medium text-muted-foreground tracking-wide">
            Preserving your story
          </span>
        </div>

        {/* Capture button */}
        <button
          onClick={() => handleBubbleClick("What moment would you like to capture?", "future")}
          className="mt-10 w-4/5 py-3.5 rounded-full gradient-orange text-primary-foreground font-bold text-base tracking-wide shadow-lg transition-transform duration-200 hover:scale-105 active:scale-95"
        >
          Capture a moment
        </button>
      </div>

      <BubbleCanvas onBubbleClick={handleBubbleClick} />
      <CurvedBottomNav />

      {capturePrompt && (
        <CaptureScreen
          question={capturePrompt.question}
          category={capturePrompt.category}
          onClose={() => setCapturePrompt(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default Index;
