import { useState } from "react";
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
    // TODO: upload to storage, navigate to AI follow-up
    setCapturePrompt(null);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden gradient-canvas">
      <Header />
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
