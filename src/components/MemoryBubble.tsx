import { useState } from "react";
import type { Timeline } from "@/types/timeline";

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
  timeline?: Timeline;
  colorMode?: "sepia" | "color";
  onClick?: () => void;
}

const MINI_BUBBLES = [
  { angle: 0, distance: 80, size: 12, delay: 0 },
  { angle: 45, distance: 100, size: 8, delay: 0.05 },
  { angle: 90, distance: 90, size: 14, delay: 0.02 },
  { angle: 135, distance: 110, size: 10, delay: 0.08 },
  { angle: 180, distance: 85, size: 11, delay: 0.03 },
  { angle: 225, distance: 95, size: 9, delay: 0.06 },
  { angle: 270, distance: 105, size: 13, delay: 0.01 },
  { angle: 315, distance: 88, size: 7, delay: 0.07 },
  { angle: 22, distance: 120, size: 6, delay: 0.04 },
  { angle: 157, distance: 115, size: 8, delay: 0.09 },
  { angle: 202, distance: 100, size: 5, delay: 0.02 },
  { angle: 337, distance: 95, size: 9, delay: 0.06 },
];

const MemoryBubble = ({
  question,
  size,
  x,
  y,
  category,
  animationClass,
  delay = "0s",
  image,
  timeline = "memories",
  colorMode = "sepia",
  onClick,
}: MemoryBubbleProps) => {
  const [bursting, setBursting] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleClick = () => {
    if (!question) return;
    setBursting(true);
    setTimeout(() => {
      setBursting(false);
      setExpanded(true);
    }, 600);
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

  const getImageFilter = () => {
    if (timeline === "forever") return "opacity-70";
    if (colorMode === "color") return "";
    return "grayscale sepia";
  };

  const getStyle = () => {
    if (timeline === "forever") {
      return {
        border: "2px solid rgba(56,189,248,0.85)",
        boxShadow: "0 0 30px rgba(56,189,248,0.5), 0 0 60px rgba(56,189,248,0.15)",
        overlay: "linear-gradient(160deg, rgba(2,8,40,0.55) 0%, rgba(10,30,80,0.35) 100%)",
        miniBubbleColor: "rgba(56,189,248,0.9)",
        iconColor: "rgba(56,189,248,1)",
        iconGlow: "0 0 20px rgba(56,189,248,0.9)",
        icon: "✦",
        answerLabel: "Record this message",
        expandBg: "linear-gradient(135deg, rgba(2,8,40,0.85) 0%, rgba(4,20,60,0.7) 100%)",
      };
    }
    if (timeline === "instant") {
      return {
        border: "1.5px solid rgba(232,116,42,0.7)",
        boxShadow: "0 0 20px rgba(232,116,42,0.35), inset 0 2px 8px rgba(255,255,255,0.2)",
        overlay: "rgba(232,116,42,0.05)",
        miniBubbleColor: "rgba(232,116,42,0.8)",
        iconColor: "rgba(255,255,255,0.9)",
        iconGlow: "0 0 12px rgba(0,0,0,0.6)",
        icon: "●",
        answerLabel: "Answer now",
        expandBg: "rgba(0,0,0,0.5)",
      };
    }
    return {
      border: colorMode === "color" ? "1.5px solid rgba(255,255,255,0.6)" : "1px solid rgba(255,255,255,0.4)",
      boxShadow:
        colorMode === "color"
          ? "0 0 25px rgba(255,255,255,0.2), inset 0 2px 8px rgba(255,255,255,0.3)"
          : "0 0 20px rgba(255,255,255,0.1), inset 0 2px 8px rgba(255,255,255,0.2)",
      overlay: colorMode === "color" ? "rgba(0,0,0,0.08)" : "rgba(0,0,0,0.05)",
      miniBubbleColor: "rgba(255,255,255,0.7)",
      iconColor: "rgba(255,255,255,0.9)",
      iconGlow: "0 0 12px rgba(0,0,0,0.6)",
      icon: "?",
      answerLabel: "Answer",
      expandBg: "rgba(0,0,0,0.45)",
    };
  };

  const style = getStyle();

  return (
    <div>
      <style>{`
        @keyframes miniBubbleFloat {
          0%   { transform: translate(var(--tx), var(--ty)) scale(1); opacity: 1; }
          100% { transform: translate(calc(var(--tx) * 2.5), calc(var(--ty) * 2.5)) scale(0); opacity: 0; }
        }
        @keyframes mainBurstOut {
          0%   { transform: scale(1); opacity: 1; }
          40%  { transform: scale(1.2); opacity: 0.8; }
          100% { transform: scale(0); opacity: 0; }
        }
        @keyframes revealIn {
          0%   { transform: scale(0.2); opacity: 0; }
          60%  { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes foreverPulse {
          0%, 100% { box-shadow: 0 0 30px rgba(56,189,248,0.5), 0 0 60px rgba(56,189,248,0.15); }
          50%       { box-shadow: 0 0 50px rgba(56,189,248,0.8), 0 0 90px rgba(56,189,248,0.25); }
        }
        .burst-main    { animation: mainBurstOut 0.6s ease-out forwards; }
        .reveal-in     { animation: revealIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        .forever-pulse { animation: foreverPulse 2.5s ease-in-out infinite; }
      `}</style>

      {expanded && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={handleClose}
        >
          <div
            className="relative rounded-full overflow-hidden reveal-in"
            style={{
              width: Math.min(300, size * 2.4),
              height: Math.min(300, size * 2.4),
              border: timeline === "forever" ? "2px solid rgba(56,189,248,0.8)" : "2px solid rgba(255,255,255,0.6)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <img src={image} alt="" className={`absolute inset-0 w-full h-full object-cover ${getImageFilter()}`} />
            <div className="absolute inset-0" style={{ background: style.expandBg }} />
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent" />
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center gap-4">
              {timeline === "forever" && (
                <span
                  className="text-2xl font-black mb-1"
                  style={{
                    color: "rgba(56,189,248,1)",
                    textShadow: "0 0 20px rgba(56,189,248,0.9)",
                  }}
                >
                  ✦
                </span>
              )}
              <p className="text-white font-bold text-sm leading-snug">{question}</p>
              {timeline === "forever" && (
                <p className="text-xs italic mb-1" style={{ color: "rgba(56,189,248,0.7)" }}>
                  Record your own version of this message.
                </p>
              )}
              <button
                onClick={handleAnswer}
                className="px-6 py-2 rounded-full gradient-orange text-white text-xs font-bold tracking-wider uppercase"
              >
                {style.answerLabel}
              </button>
            </div>
          </div>
        </div>
      )}

      <div
        className={`absolute ${!bursting ? animationClass : ""} ${question ? "cursor-pointer" : "pointer-events-none"}`}
        style={{ left: `${x}%`, top: `${y}%`, animationDelay: delay }}
        onClick={handleClick}
      >
        {bursting &&
          MINI_BUBBLES.map((mini, i) => {
            const rad = (mini.angle * Math.PI) / 180;
            const tx = Math.cos(rad) * mini.distance;
            const ty = Math.sin(rad) * mini.distance;
            return (
              <div
                key={i}
                className="absolute rounded-full"
                style={
                  {
                    width: mini.size,
                    height: mini.size,
                    left: size / 2 - mini.size / 2,
                    top: size / 2 - mini.size / 2,
                    background: style.miniBubbleColor,
                    animation: `miniBubbleFloat 0.6s ease-out ${mini.delay}s forwards`,
                    "--tx": `${tx}px`,
                    "--ty": `${ty}px`,
                  } as React.CSSProperties
                }
              />
            );
          })}

        <div
          className={`rounded-full overflow-hidden relative transition-all duration-300 hover:scale-105 ${
            bursting ? "burst-main" : ""
          } ${timeline === "forever" ? "forever-pulse" : ""}`}
          style={{
            width: `${size}px`,
            height: `${size}px`,
            border: style.border,
            boxShadow: style.boxShadow,
          }}
        >
          <img
            src={image}
            alt=""
            loading="lazy"
            className={`absolute inset-0 w-full h-full object-cover ${getImageFilter()}`}
          />
          <div className="absolute inset-0 rounded-full" style={{ background: style.overlay }} />
          <div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.25) 0%, transparent 55%)",
            }}
          />
          <div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{ boxShadow: "inset 0 2px 10px rgba(255,255,255,0.3)" }}
          />
          {question && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span
                className="font-black"
                style={{
                  fontSize: size > 100 ? "22px" : "14px",
                  color: style.iconColor,
                  textShadow: style.iconGlow,
                }}
              >
                {style.icon}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MemoryBubble;
