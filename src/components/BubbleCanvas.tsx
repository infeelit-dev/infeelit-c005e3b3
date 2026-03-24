import MemoryBubble, { BubbleCategory } from "./MemoryBubble";

import bokehWarmWindow from "@/assets/bokeh-warm-window.jpg";
import bokehOldTree from "@/assets/bokeh-old-tree.jpg";
import bokehSunset from "@/assets/bokeh-sunset.jpg";
import bokehFamily from "@/assets/bokeh-family.jpg";
import bokehMusic from "@/assets/bokeh-music.jpg";
import bokehHorizon from "@/assets/bokeh-horizon.jpg";
import bokehGarden from "@/assets/bokeh-garden.jpg";
import bokehRain from "@/assets/bokeh-rain.jpg";

interface QuestionBubble {
  question: string;
  size: number;
  x: number;
  y: number;
  category: BubbleCategory;
  anim: string;
  delay: string;
  image: string;
}

const bubbles: QuestionBubble[] = [
  // Past (Purple)
  { question: "What was the smell of your childhood home?", size: 140, x: 5, y: 18, category: "past", anim: "animate-float-slow", delay: "0s", image: bokehWarmWindow },
  { question: "A song that takes you back instantly?", size: 100, x: 60, y: 8, category: "past", anim: "animate-float-medium", delay: "1.2s", image: bokehMusic },
  { question: "Your first heartbreak — what did it teach you?", size: 65, x: 80, y: 42, category: "past", anim: "animate-float-fast", delay: "2.8s", image: bokehRain },

  // Future / Forever (Orange)
  { question: "A promise you want to keep forever?", size: 150, x: 30, y: 42, category: "future", anim: "animate-float-slow", delay: "0.5s", image: bokehSunset },
  { question: "What does your dream morning look like?", size: 85, x: 70, y: 62, category: "future", anim: "animate-float-medium", delay: "1.8s", image: bokehHorizon },
  { question: "Where do you see yourself in 10 years?", size: 55, x: 15, y: 72, category: "future", anim: "animate-float-fast", delay: "3.2s", image: bokehGarden },

  // Family Circle (Gold)
  { question: "A lesson your father taught you?", size: 120, x: 52, y: 72, category: "family", anim: "animate-float-slow", delay: "2s", image: bokehOldTree },
  { question: "Your grandmother's best advice?", size: 95, x: 6, y: 52, category: "family", anim: "animate-float-medium", delay: "0.8s", image: bokehFamily },

  // Small ambient orbs
  { question: "", size: 40, x: 46, y: 5, category: "past", anim: "animate-float-fast", delay: "1.5s", image: bokehMusic },
  { question: "", size: 35, x: 90, y: 18, category: "family", anim: "animate-float-fast", delay: "2.5s", image: bokehFamily },
  { question: "", size: 45, x: 24, y: 88, category: "future", anim: "animate-float-fast", delay: "0.3s", image: bokehSunset },
];

interface BubbleCanvasProps {
  onBubbleClick: (question: string, category: BubbleCategory) => void;
}

const BubbleCanvas = ({ onBubbleClick }: BubbleCanvasProps) => {
  return (
    <div className="absolute inset-0 z-[1] overflow-hidden">
      {/* Soft bokeh background elements */}
      <div className="bokeh-circle w-72 h-72 bg-purple-200/20 top-[8%] left-[-8%] animate-bokeh" />
      <div className="bokeh-circle w-96 h-96 bg-orange-200/20 bottom-[10%] right-[-12%] animate-bokeh" style={{ animationDelay: "4s" }} />
      <div className="bokeh-circle w-56 h-56 bg-amber-200/15 top-[45%] left-[25%] animate-bokeh" style={{ animationDelay: "7s" }} />
      <div className="bokeh-circle w-40 h-40 bg-purple-300/15 top-[20%] right-[15%] animate-bokeh" style={{ animationDelay: "2s" }} />

      {/* Question bubbles */}
      {bubbles.map((b, i) => (
        <MemoryBubble
          key={i}
          question={b.question}
          size={b.size}
          x={b.x}
          y={b.y}
          category={b.category}
          animationClass={b.anim}
          delay={b.delay}
          image={b.image}
          onClick={() => b.question && onBubbleClick(b.question, b.category)}
        />
      ))}
    </div>
  );
};

export default BubbleCanvas;
