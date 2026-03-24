import MemoryBubble, { BubbleCategory } from "./MemoryBubble";

interface QuestionBubble {
  question: string;
  size: number;
  x: number;
  y: number;
  category: BubbleCategory;
  anim: string;
  delay: string;
}

const bubbles: QuestionBubble[] = [
  // Past (Purple)
  { question: "What was the smell of your childhood home?", size: 150, x: 6, y: 22, category: "past", anim: "animate-float-slow", delay: "0s" },
  { question: "A song that takes you back instantly?", size: 110, x: 58, y: 10, category: "past", anim: "animate-float-medium", delay: "1.2s" },
  { question: "Your first heartbreak — what did it teach you?", size: 55, x: 82, y: 38, category: "past", anim: "animate-float-fast", delay: "2.8s" },

  // Future / Forever (Orange)
  { question: "A promise you want to keep forever?", size: 160, x: 32, y: 44, category: "future", anim: "animate-float-slow", delay: "0.5s" },
  { question: "What does your dream morning look like?", size: 90, x: 72, y: 58, category: "future", anim: "animate-float-medium", delay: "1.8s" },
  { question: "Where do you see yourself in 10 years?", size: 45, x: 18, y: 68, category: "future", anim: "animate-float-fast", delay: "3.2s" },

  // Family Circle (Gold)
  { question: "A lesson your father taught you?", size: 130, x: 55, y: 70, category: "family", anim: "animate-float-slow", delay: "2s" },
  { question: "Your grandmother's best advice?", size: 100, x: 8, y: 55, category: "family", anim: "animate-float-medium", delay: "0.8s" },

  // Small ambient
  { question: "", size: 35, x: 45, y: 12, category: "past", anim: "animate-float-fast", delay: "1.5s" },
  { question: "", size: 30, x: 88, y: 20, category: "family", anim: "animate-float-fast", delay: "2.5s" },
  { question: "", size: 40, x: 25, y: 85, category: "future", anim: "animate-float-fast", delay: "0.3s" },
];

interface BubbleCanvasProps {
  onBubbleClick: (question: string, category: BubbleCategory) => void;
}

const BubbleCanvas = ({ onBubbleClick }: BubbleCanvasProps) => {
  return (
    <div className="absolute inset-0 z-[1] overflow-hidden">
      {/* Bokeh background elements */}
      <div className="bokeh-circle w-60 h-60 bg-purple-200/30 top-[10%] left-[-5%] animate-bokeh" />
      <div className="bokeh-circle w-80 h-80 bg-orange-200/30 bottom-[15%] right-[-10%] animate-bokeh" style={{ animationDelay: "4s" }} />
      <div className="bokeh-circle w-48 h-48 bg-amber-200/25 top-[50%] left-[30%] animate-bokeh" style={{ animationDelay: "7s" }} />
      <div className="bokeh-circle w-36 h-36 bg-purple-300/20 top-[25%] right-[20%] animate-bokeh" style={{ animationDelay: "2s" }} />

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
          onClick={() => onBubbleClick(b.question, b.category)}
        />
      ))}
    </div>
  );
};

export default BubbleCanvas;
