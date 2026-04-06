import { useState } from "react";
import type { Timeline } from "@/pages/Index";

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
  isSealed?: boolean;
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
  isSealed = false,
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

  // Style selon la timeline
  const getStyle = () => {
    if (timeline === "forever") {
      return {
        border: "1.5px solid rgba(56,189,248,0.7)",
        boxShadow:
          "0 0 25px rgba(56,189,248,0.4), 0 0 50px rgba(56,189,248,0.1), inset 0 2px 8px rgba(255,255,255,0.15)",
        overlay: "rgba(2,8,24,0.4)",
        miniBubbleColor: "rgba(56,189,248,0.8)",
        icon: "✦",
      };
    }
    if (timeline === "instant") {
      return {
        border: "1.5px solid rgba(232,116,42,0.7)",
        boxShadow: "0 0 20px rgba(232,116,42,0.35), inset 0 2px 8px rgba(255,255,255,0.2)",
        overlay: "rgba(232,116,42,0.15)",
        miniBubbleColor: "rgba(232,116,42,0.8)",
        icon: "●",
      };
    }
    return {
      border: "1px solid rgba(255,255,255,0.4)",
      boxShadow: "0 0 20px rgba(255,255,255,0.1), inset 0 2px 8px rgba(255,255,255,0.2)",
      overlay: "rgba(0,0,0,0.05)",
      miniBubbleColor: "rgba(255,255,255,0.7)",
      icon: "?",
    };
  };

  const style = getStyle();

  return (
    <>
      <style>{`
        @keyframes wander1 {
          0%   { transform: translate(0px, 0px); }
          20%  { transform: translate(50px, -60px); }
          40%  { transform: translate(90px, -20px); }
          60%  { transform: translate(60px, 55px); }
          80%  { transform: translate(-30px, 40px); }
          100% { transform: translate(0px, 0px); }
        }
        @keyframes wander2 {
          0%   { transform: translate(0px, 0px); }
          20%  { transform: translate(-60px, -50px); }
          40%  { transform: translate(-90px, 30px); }
          60%  { transform: translate(-45px, 80px); }
          80%  { transform: translate(40px, 50px); }
          100% { transform: translate(0px, 0px); }
        }
        @keyframes wander3 {
          0%   { transform: translate(0px, 0px); }
          25%  { transform: translate(70px, 55px); }
          50%  { transform: translate(30px, -70px); }
          75%  { transform: translate(-55px, -40px); }
          100% { transform: translate(0px, 0px); }
        }
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
        @keyframes sealPulse {
          0%, 100% { box-shadow: 0 0 25px rgba(56,189,248,0.4), 0 0 50px rgba(56,189,248,0.1); }
          50%       { box-shadow: 0 0 40px rgba(56,189,248,0.7), 0 0 80px rgba(56,189,248,0.2); }
        }
        .animate-float-slow   { animation: wander1 18s ease-in-out infinite; }
        .animate-float-medium { animation: wander2 14s ease-in-out infinite; }
        .animate-float-fast   { animation: wander3 10s ease-in-out infinite; }
        .burst-main  { animation: mainBurstOut 0.6s ease-out forwards; }
        .reveal-in   { animation: revealIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        .seal-pulse  { animation: sealPulse 3s ease-in-out infinite; }
      `}</style>

      {/* Overlay expandé */}
      {expanded && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={handleClose}
        >
          <div
            className="relative rounded-full overflow-hidden border-2 border-white/60 reveal-in"
            style={{
              width: Math.min(300, size * 2.4),
              height: Math.min(300, size * 2.4),
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={image}
              alt=""
              className={`absolute inset-0 w-full h-full object-cover ${
                timeline === "memories" ? "grayscale sepia" : ""
              }`}
            />
            <div
              className="absolute inset-0"
              style={{
                background: timeline === "forever" ? "rgba(2,8,24,0.6)" : "rgba(0,0,0,0.45)",
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-white/15 via-transparent to-transparent" />
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center gap-4">
              {isSealed && <span className="text-2xl mb-1">🔒</span>}
              <p className="text-white font-bold text-sm leading-snug">{question}</p>
              {isSealed ? (
                <p className="text-white/60 text-xs italic">This message is sealed for its recipient.</p>
              ) : (
                <button
                  onClick={handleAnswer}
                  className="px-6 py-2 rounded-full gradient-orange text-white text-xs font-bold tracking-wider uppercase transition-transform hover:scale-105 active:scale-95"
                >
                  Answer
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bulle principale */}
      <div
        className={`absolute ${!bursting ? animationClass : ""} ${question ? "cursor-pointer" : "pointer-events-none"}`}
        style={{ left: `${x}%`, top: `${y}%`, animationDelay: delay }}
        onClick={handleClick}
      >
        {/* Petites bulles burst */}
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

        {/* Corps */}
        <div
          className={`rounded-full overflow-hidden relative transition-all duration-300 hover:scale-105 ${
            bursting ? "burst-main" : ""
          } ${isSealed && timeline === "forever" ? "seal-pulse" : ""}`}
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
            className={`absolute inset-0 w-full h-full object-cover ${
              timeline === "memories" ? "grayscale sepia" : timeline === "forever" ? "grayscale opacity-60" : ""
            }`}
          />

          {/* Overlay */}
          <div className="absolute inset-0 rounded-full" style={{ background: style.overlay }} />

          {/* Reflet glass */}
          <div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.25) 0%, transparent 55%)",
            }}
          />

          {/* Ombre intérieure */}
          <div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              boxShadow: "inset 0 2px 10px rgba(255,255,255,0.3)",
            }}
          />

          {/* Icône */}
          {question && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span
                className="font-black"
                style={{
                  fontSize: size > 100 ? "22px" : "14px",
                  color: timeline === "forever" ? "rgba(56,189,248,0.9)" : "rgba(255,255,255,0.8)",
                  textShadow: "0 0 12px rgba(0,0,0,0.6)",
                }}
              >
                {isSealed ? "🔒" : style.icon}
              </span>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MemoryBubble;
