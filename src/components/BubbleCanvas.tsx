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
}

const bubbles: QuestionBubble[] = [
  // ═══════════════════════════════════
  // MEMORIES — passé sépia
  // ═══════════════════════════════════
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
    question: "A lesson your father taught you without words.",
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
    question: "The most beautiful thing your mother ever told you.",
    size: 140,
    x: 25,
    y: 38,
    category: "past",
    anim: "animate-float-slow",
    delay: "0.5s",
    image: imgMarry,
    timeline: "memories",
  },
  {
    question: "Your grandmother's best advice that still guides you.",
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
    question: "What moment changed everything in your family?",
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
    question: "What did home feel like when you were a child?",
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
    question: "Who made you feel safe without saying a word?",
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

  // ═══════════════════════════════════
  // INSTANT — présent vivant
  // ═══════════════════════════════════
  {
    question: "Record a 30-second story for someone you love right now.",
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
    question: "What are you most grateful for at this moment?",
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
    question: "What would you say to your 10-year-old self today?",
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

  // ═══════════════════════════════════
  // FOREVER — messages futurs inspirants
  // Situations précises de la vie future
  // Visibles par tous — inspire à créer
  // ═══════════════════════════════════
  {
    question: "What would you tell your daughter the day she gets her diploma?",
    size: 140,
    x: 8,
    y: 18,
    category: "future",
    anim: "animate-float-slow",
    delay: "0s",
    image: imgGraduate,
    timeline: "forever",
  },
  {
    question: "Your son just launched his first business. What do you say to him?",
    size: 120,
    x: 58,
    y: 12,
    category: "family",
    anim: "animate-float-medium",
    delay: "1s",
    image: imgHouse,
    timeline: "forever",
  },
  {
    question: "Your brother just lost his job. What do you want him to hear from you?",
    size: 130,
    x: 22,
    y: 40,
    category: "family",
    anim: "animate-float-slow",
    delay: "0.5s",
    image: imgRelax,
    timeline: "forever",
  },
  {
    question: "Your child is about to get married. What is the one thing they must know?",
    size: 105,
    x: 68,
    y: 42,
    category: "future",
    anim: "animate-float-medium",
    delay: "1.8s",
    image: imgMarry,
    timeline: "forever",
  },
  {
    question: "Your daughter just had her first heartbreak. What would you tell her?",
    size: 115,
    x: 12,
    y: 62,
    category: "family",
    anim: "animate-float-slow",
    delay: "2s",
    image: imgLove,
    timeline: "forever",
  },
  {
    question: "Your grandson is born. What do you want him to know about you?",
    size: 100,
    x: 55,
    y: 65,
    category: "future",
    anim: "animate-float-medium",
    delay: "2.5s",
    image: imgBirth,
    timeline: "forever",
  },
  {
    question: "Your parents are growing old. What do you want to say before it's too late?",
    size: 110,
    x: 72,
    y: 28,
    category: "family",
    anim: "animate-float-slow",
    delay: "1.3s",
    image: imgGrandfather,
    timeline: "forever",
  },
  {
    question: "Your best friend is going through a divorce. What would you tell them?",
    size: 90,
    x: 35,
    y: 72,
    category: "past",
    anim: "animate-float-medium",
    delay: "0.7s",
    image: imgPicnic,
    timeline: "forever",
  },
  {
    question: "",
    size: 38,
    x: 85,
    y: 55,
    category: "future",
    anim: "animate-float-fast",
    delay: "1.5s",
    image: imgTravel,
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
    image: imgChild,
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
          onClick={() => b.question && onBubbleClick(b.question, b.category)}
        />
      ))}
    </div>
  );
};

export default BubbleCanvas;
