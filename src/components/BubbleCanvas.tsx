import MemoryBubble, { BubbleCategory } from "./MemoryBubble";
import type { Timeline } from "@/types/timeline";
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
  timeline: Timeline;
  isSealed?: boolean;
}

const bubbles: QuestionBubble[] = [
  {
    question: "What was the smell of your childhood home?",
    size: 130,
    x: 5,
    y: 15,
    category: "past",
    anim: "animate-float-slow",
    delay: "0s",
    image: imgGrandfather,
    timeline: "memories",
  },
  {
    question: "A lesson your father taught you?",
    size: 110,
    x: 55,
    y: 10,
    category: "family",
    anim: "animate-float-medium",
    delay: "1.2s",
    image: imgChild,
    timeline: "memories",
  },
  {
    question: "A promise you want to keep forever?",
    size: 140,
    x: 25,
    y: 38,
    category: "future",
    anim: "animate-float-slow",
    delay: "0.5s",
    image: imgMarry,
    timeline: "memories",
  },
  {
    question: "Your grandmother's best advice?",
    size: 90,
    x: 5,
    y: 52,
    category: "family",
    anim: "animate-float-medium",
    delay: "0.8s",
    image: imgPicnic,
    timeline: "memories",
  },
  {
    question: "What moment changed your life forever?",
    size: 115,
    x: 45,
    y: 68,
    category: "past",
    anim: "animate-float-slow",
    delay: "2s",
    image: imgLove,
    timeline: "memories",
  },
  {
    question: "What did home feel like as a child?",
    size: 100,
    x: 65,
    y: 55,
    category: "past",
    anim: "animate-float-medium",
    delay: "1.8s",
    image: imgTravel,
    timeline: "memories",
  },
  {
    question: "Who made you feel safe without a word?",
    size: 95,
    x: 70,
    y: 20,
    category: "past",
    anim: "animate-float-medium",
    delay: "2.8s",
    image: imgRelax,
    timeline: "memories",
  },
  {
    question: "",
    size: 40,
    x: 88,
    y: 8,
    category: "past",
    anim: "animate-float-fast",
    delay: "1.5s",
    image: imgBirth,
    timeline: "memories",
  },
  {
    question: "",
    size: 35,
    x: 3,
    y: 88,
    category: "family",
    anim: "animate-float-fast",
    delay: "2.5s",
    image: imgGraduate,
    timeline: "memories",
  },

  {
    question: "Record a 30-second story for someone you love.",
    size: 130,
    x: 10,
    y: 18,
    category: "future",
    anim: "animate-float-slow",
    delay: "0s",
    image: imgLove,
    timeline: "instant",
  },
  {
    question: "What are you grateful for right now?",
    size: 110,
    x: 55,
    y: 12,
    category: "past",
    anim: "animate-float-medium",
    delay: "1s",
    image: imgChild,
    timeline: "instant",
  },
  {
    question: "What would you say to your 10-year-old self?",
    size: 95,
    x: 70,
    y: 35,
    category: "family",
    anim: "animate-float-slow",
    delay: "1.5s",
    image: imgPicnic,
    timeline: "instant",
  },
  {
    question: "What is the most important lesson you learned this year?",
    size: 120,
    x: 20,
    y: 50,
    category: "past",
    anim: "animate-float-medium",
    delay: "0.5s",
    image: imgTravel,
    timeline: "instant",
  },
  {
    question: "Who deserves to hear I love you from you today?",
    size: 100,
    x: 60,
    y: 65,
    category: "family",
    anim: "animate-float-slow",
    delay: "2s",
    image: imgMarry,
    timeline: "instant",
  },
  {
    question: "",
    size: 45,
    x: 85,
    y: 70,
    category: "past",
    anim: "animate-float-fast",
    delay: "0.8s",
    image: imgRelax,
    timeline: "instant",
  },
  {
    question: "",
    size: 35,
    x: 5,
    y: 80,
    category: "family",
    anim: "animate-float-fast",
    delay: "3s",
    image: imgHouse,
    timeline: "instant",
  },

  {
    question: "A message for my child on their 18th birthday.",
    size: 140,
    x: 8,
    y: 20,
    category: "future",
    anim: "animate-float-slow",
    delay: "0s",
    image: imgBirth,
    timeline: "forever",
    isSealed: true,
  },
  {
    question: "What I want my grandchildren to know about me.",
    size: 120,
    x: 55,
    y: 15,
    category: "family",
    anim: "animate-float-medium",
    delay: "1s",
    image: imgGrandfather,
    timeline: "forever",
    isSealed: true,
  },
  {
    question: "A letter to open on your wedding day.",
    size: 130,
    x: 25,
    y: 42,
    category: "future",
    anim: "animate-float-slow",
    delay: "0.5s",
    image: imgMarry,
    timeline: "forever",
    isSealed: true,
  },
  {
    question: "Everything I never said but always felt.",
    size: 100,
    x: 68,
    y: 45,
    category: "past",
    anim: "animate-float-medium",
    delay: "1.8s",
    image: imgLove,
    timeline: "forever",
    isSealed: true,
  },
  {
    question: "What mattered most in my life.",
    size: 110,
    x: 15,
    y: 65,
    category: "family",
    anim: "animate-float-slow",
    delay: "2s",
    image: imgGraduate,
    timeline: "forever",
    isSealed: true,
  },
  {
    question: "A message to open in 10 years.",
    size: 90,
    x: 58,
    y: 68,
    category: "future",
    anim: "animate-float-medium",
    delay: "2.5s",
    image: imgChild,
    timeline: "forever",
    isSealed: true,
  },
  {
    question: "",
    size: 38,
    x: 85,
    y: 25,
    category: "past",
    anim: "animate-float-fast",
    delay: "1.5s",
    image: imgHouse,
    timeline: "forever",
  },
  {
    question: "",
    size: 30,
    x: 3,
    y: 75,
    category: "family",
    anim: "animate-float-fast",
    delay: "0.8s",
    image: imgPicnic,
    timeline: "forever",
  },
];

interface BubbleCanvasProps {
  onBubbleClick: (question: string, category: BubbleCategory) => void;
  activeTimeline: Timeline;
}

const BubbleCanvas = ({ onBubbleClick, activeTimeline }: BubbleCanvasProps) => {
  const filtered = bubbles.filter((b) => b.timeline === activeTimeline);

  return (
    <div className="absolute inset-0 z-[1] overflow-hidden">
      {filtered.map((b, i) => (
        <MemoryBubble
          key={`${activeTimeline}-${i}`}
          question={b.question}
          size={b.size}
          x={b.x}
          y={b.y}
          category={b.category}
          animationClass={b.anim}
          delay={b.delay}
          image={b.image}
          timeline={activeTimeline}
          isSealed={b.isSealed}
          onClick={() => b.question && onBubbleClick(b.question, b.category)}
        />
      ))}
    </div>
  );
};

export default BubbleCanvas;
