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
  onClick?: () => void;
}

const categoryConfig: Record<BubbleCategory, { glow: string; icon: string; gradient: string }> = {
  past: {
    glow: "bubble-glow-past",
    icon: "💜",
    gradient: "from-purple-400/20 via-purple-300/10 to-transparent",
  },
  future: {
    glow: "bubble-glow-future",
    icon: "🔥",
    gradient: "from-orange-400/20 via-orange-300/10 to-transparent",
  },
  family: {
    glow: "bubble-glow-family",
    icon: "✨",
    gradient: "from-amber-400/20 via-yellow-300/10 to-transparent",
  },
};

const MemoryBubble = ({
  question,
  size,
  x,
  y,
  category,
  animationClass,
  delay = "0s",
  onClick,
}: MemoryBubbleProps) => {
  const [hovered, setHovered] = useState(false);
  const config = categoryConfig[category];
  const isSmall = size < 80;

  return (
    <div
      className={`absolute ${animationClass} cursor-pointer group`}
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: size,
        height: size,
        animationDelay: delay,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
    >
      <div
        className={`w-full h-full rounded-full glass-surface overflow-hidden transition-all duration-500 shadow-inner ${config.glow} ${
          hovered ? "scale-110 shadow-lg" : ""
        } flex items-center justify-center p-2`}
      >
        {/* Colored gradient overlay */}
        <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${config.gradient} pointer-events-none`} />

        {/* Glassy highlight */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/25 via-transparent to-transparent pointer-events-none" />

        {isSmall ? (
          <span className="text-lg relative z-[1]">{config.icon}</span>
        ) : (
          <div className="relative z-[1] flex flex-col items-center gap-1 px-2">
            <span className="text-base">{config.icon}</span>
            <p
              className={`text-center leading-tight font-semibold text-primary-foreground text-shadow-soft transition-opacity duration-300 ${
                hovered ? "opacity-100" : "opacity-80"
              }`}
              style={{ fontSize: size < 120 ? "9px" : "11px" }}
            >
              {question}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MemoryBubble;
