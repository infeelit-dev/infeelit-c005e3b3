import { useState } from "react";

export type BubbleCategory = "past" | "future" | "family";

interface MemoryBubbleProps {
  question: string;
  size: number;
  x: number;
  y: number;
  category: BubbleCategory;
  animationClass: string;
  delay?: string;
  image: string;
  onClick?: () => void;
}

const categoryBorder: Record<BubbleCategory, string> = {
  past: "border-purple-300/50",
  future: "border-orange-300/50",
  family: "border-amber-300/50",
};

const categoryGlow: Record<BubbleCategory, string> = {
  past: "shadow-[0_0_30px_8px_hsla(270,60%,50%,0.2)]",
  future: "shadow-[0_0_30px_8px_hsla(20,90%,48%,0.2)]",
  family: "shadow-[0_0_30px_8px_hsla(42,90%,50%,0.2)]",
};

const MemoryBubble = ({
  question,
  size,
  x,
  y,
  category,
  animationClass,
  delay = "0s",
  image,
  onClick,
}: MemoryBubbleProps) => {
  const [expanded, setExpanded] = useState(false);

  const handleClick = () => {
    if (!expanded) {
      setExpanded(true);
    }
  };

  const handleAnswer = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(false);
    onClick?.();
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(false);
  };

  return (
    <>
      {/* Expanded overlay */}
      {expanded && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm animate-fade-in"
          onClick={handleClose}
        >
          <div
            className="relative rounded-full overflow-hidden border-2 border-white/50 animate-scale-in"
            style={{ width: Math.min(320, size * 2.5), height: Math.min(320, size * 2.5) }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Bokeh image */}
            <img
              src={image}
              alt=""
              className="absolute inset-0 w-full h-full object-cover scale-110 blur-[2px]"
            />
            {/* Glass overlay */}
            <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px]" />
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent" />

            {/* Question text + Answer button */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <p className="text-primary-foreground text-center font-bold text-sm leading-snug text-shadow-soft mb-4">
                {question}
              </p>
              <button
                onClick={handleAnswer}
                className="px-6 py-2 rounded-full gradient-orange text-primary-foreground text-xs font-bold tracking-wider uppercase fab-glow transition-transform duration-200 hover:scale-105 active:scale-95"
              >
                Answer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating bubble */}
      <div
        className={`absolute ${animationClass} cursor-pointer`}
        style={{
          left: `${x}%`,
          top: `${y}%`,
          width: size,
          height: size,
          animationDelay: delay,
        }}
        onClick={handleClick}
      >
        <div
          className={`w-full h-full rounded-full overflow-hidden border border-white/50 backdrop-blur-xl transition-all duration-500 hover:scale-110 hover:border-white/70 ${categoryBorder[category]} ${categoryGlow[category]}`}
        >
          {/* Bokeh background image */}
          <img
            src={image}
            alt=""
            loading="lazy"
            width={512}
            height={512}
            className="absolute inset-0 w-full h-full object-cover scale-110"
          />

          {/* Glass highlights */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/30 via-white/5 to-transparent pointer-events-none" />
          <div className="absolute inset-0 rounded-full bg-gradient-to-tl from-white/10 via-transparent to-transparent pointer-events-none" />

          {/* Inner shadow for depth */}
          <div className="absolute inset-0 rounded-full shadow-[inset_0_2px_8px_rgba(255,255,255,0.3),inset_0_-2px_8px_rgba(0,0,0,0.1)] pointer-events-none" />
        </div>
      </div>
    </>
  );
};

export default MemoryBubble;
