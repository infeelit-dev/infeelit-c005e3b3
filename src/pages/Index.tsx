import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import BubbleCanvas from "@/components/BubbleCanvas";
import CurvedBottomNav from "@/components/CurvedBottomNav";
import type { BubbleCategory } from "@/components/MemoryBubble";

const Index = () => {
  const navigate = useNavigate();

  const handleBubbleClick = (question: string, category: BubbleCategory) => {
    if (question) {
      navigate("/record", { state: { question, category } });
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden gradient-canvas">
      {/* Floating cloud shapes */}
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
        <div
          className="absolute top-1/2 right-1/4 w-48 h-48 rounded-full bg-white/5 blur-3xl animate-bokeh"
          style={{ animationDelay: "6s" }}
        />
        <div
          className="absolute -bottom-10 right-10 w-60 h-60 rounded-full bg-white/5 blur-3xl animate-bokeh"
          style={{ animationDelay: "10s" }}
        />
      </div>

      <Header />

      {/* Centre émotionnel */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-[5] px-8 pointer-events-none">
        <h1 className="text-2xl font-extrabold text-primary text-center">Welcome home</h1>
        <p className="mt-2 text-sm font-medium text-[#1A1A1A] text-center">Your most precious moments are safe here.</p>
      </div>

      <BubbleCanvas onBubbleClick={handleBubbleClick} />
      <CurvedBottomNav />
    </div>
  );
};

export default Index;
