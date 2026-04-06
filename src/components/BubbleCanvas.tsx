import MemoryBubble, { BubbleCategory } from "./MemoryBubble";
import imgGrandfather from "@/assets/grandfather.jpg";
import imgChild from "@/assets/child.jpg";
import imgMarry from "@/assets/marry.jpg";
import imgRelax from "@/assets/relax.jpg";
import imgBirth from "@/assets/birth.jpg";
import imgLove from "@/assets/love.jpg";
import imgHouse from "@/assets/house.jpg";
import imgPicnic from "@/assets/picnic.jpg";
import imgTravel from "@/assets/travel.jpg";
import imgGraduate from "@/assets/graduate.jpg";

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
  {
    question: "What was the smell of your childhood home?",
    size: 140,
    x: 5,
    y: 18,
    category: "past",
    anim: "animate-float-slow",
    delay: "0s",
    image: imgGrandfather,
  },
  {
    question: "A song that takes you back instantly?",
    size: 100,
    x: 60,
    y: 8,
    category: "past",
    anim: "animate-float-medium",
    delay: "1.2s",
    image: imgChild,
  },
  {
    question: "Your first heartbreak — what did it teach you?",
    size: 65,
    x: 80,
    y: 42,
    category: "past",
    anim: "animate-float-fast",
    delay: "2.8s",
    image: imgRelax,
  },
  {
    question: "A promise you want to keep forever?",
    size: 150,
    x: 30,
    y: 42,
    category: "future",
    anim: "animate-float-slow",
    delay: "0.5s",
    image: imgMarry,
  },
  {
    question: "What does your dream morning look like?",
    size: 85,
    x: 70,
    y: 62,
    category: "future",
    anim: "animate-float-medium",
    delay: "1.8s",
    image: imgTravel,
  },
  {
    question: "Where do you see yourself in 10 years?",
    size: 55,
    x: 15,
    y: 72,
    category: "future",
    anim: "animate-float-fast",
    delay: "3.2s",
    image: imgHouse,
  },
  {
    question: "A lesson your father taught you?",
    size: 120,
    x: 52,
    y: 72,
    category: "family",
    anim: "animate-float-slow",
    delay: "2s",
    image: imgLove,
  },
  {
    question: "Your grandmother's best advice?",
    size: 95,
    x: 6,
    y: 52,
    category: "family",
    anim: "animate-float-medium",
    delay: "0.8s",
    image: imgPicnic,
  },
  {
    question: "",
    size: 40,
    x: 46,
    y: 5,
    category: "past",
    anim: "animate-float-fast",
    delay: "1.5s",
    image: imgBirth,
  },
  {
    question: "",
    size: 35,
    x: 90,
    y: 18,
    category: "family",
    anim: "animate-float-fast",
    delay: "2.5s",
    image: imgGraduate,
  },
  {
    question: "",
    size: 45,
    x: 24,
    y: 88,
    category: "future",
    anim: "animate-float-fast",
    delay: "0.3s",
    image: imgRelax,
  },
];

interface BubbleCanvasProps {
  onBubbleClick: (question: string, category: BubbleCategory) => void;
}

const BubbleCanvas = ({ onBubbleClick }: BubbleCanvasProps) => {
  return (
    <div className="absolute inset-0 z-[1] overflow-hidden">
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
