import { useState } from "react";

interface MemoryBubbleProps {
  image: string;
  size: number;
  x: number;
  y: number;
  label?: string;
  glowColor?: "orange" | "teal";
  animationClass: string;
  delay?: string;
}

const MemoryBubble = ({
  image,
  size,
  x,
  y,
  label,
  glowColor,
  animationClass,
  delay = "0s",
}: MemoryBubbleProps) => {
  const [hovered, setHovered] = useState(false);

  const glowClass = glowColor === "orange" ? "bubble-glow-orange" : glowColor === "teal" ? "bubble-glow-teal" : "";

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
    >
      <div
        className={`w-full h-full rounded-full glass-surface overflow-hidden transition-all duration-500 shadow-inner ${glowClass} ${
          hovered ? "scale-110 border-white/70 shadow-lg" : ""
        }`}
      >
        <img
          src={image}
          alt={label || "Memory"}
          loading="lazy"
          className={`w-full h-full object-cover rounded-full transition-all duration-500 ${
            hovered ? "opacity-100 scale-105" : "opacity-80"
          }`}
        />
        {/* Glassy overlay */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none" />
      </div>
      {label && hovered && (
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 glass-surface-strong rounded-full px-3 py-0.5 text-[11px] font-semibold text-primary-foreground whitespace-nowrap text-shadow-soft">
          {label}
        </div>
      )}
    </div>
  );
};

export default MemoryBubble;
