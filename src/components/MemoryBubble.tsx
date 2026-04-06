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
  const [splashing, setSplashing] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleClick = () => {
    if (!question) return;
    setSplashing(true);
    setTimeout(() => {
      setSplashing(false);
      setExpanded(true);
    }, 500);
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
      <style>{`
        @keyframes wander1 {
          0%   { transform: translate(0px, 0px); }
          20%  { transform: translate(60px, -80px); }
          40%  { transform: translate(120px, -30px); }
          60%  { transform: translate(80px, 70px); }
          80%  { transform: translate(-40px, 50px); }
          100% { transform: translate(0px, 0px); }
        }
        @keyframes wander2 {
          0%   { transform: translate(0px, 0px); }
          20%  { transform: translate(-80px, -60px); }
          40%  { transform: translate(-120px, 40px); }
          60%  { transform: translate(-60px, 100px); }
          80%  { transform: translate(50px, 60px); }
          100% { transform: translate(0px, 0px); }
        }
        @keyframes wander3 {
          0%   { transform: translate(0px, 0px); }
          25%  { transform: translate(90px, 70px); }
          50%  { transform: translate(40px, -90px); }
          75%  { transform: translate(-70px, -50px); }
          100% { transform: translate(0px, 0px); }
        }
        @keyframes wander4 {
          0%   { transform: translate(0px, 0px); }
          25%  { transform: translate(-100px, 50px); }
          50%  { transform: translate(-50px, -80px); }
          75%  { transform: translate(80px, -40px); }
          100% { transform: translate(0px, 0px); }
        }
        @keyframes wander5 {
          0%   { transform: translate(0px, 0px); }
          20%  { transform: translate(70px, 90px); }
          40%  { transform: translate(-50px, 110px); }
          60%  { transform: translate(-100px, 20px); }
          80%  { transform: translate(-30px, -70px); }
          100% { transform: translate(0px, 0px); }
        }
        @keyframes splash {
          0%   { transform: scale(1); opacity: 1; }
          30%  { transform: scale(1.3); opacity: 0.8; }
          60%  { transform: scale(1.6); opacity: 0.4; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        @keyframes splashRing1 {
          0%   { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(2.5); opacity: 0; }
        }
        @keyframes splashRing2 {
          0%   { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(3.2); opacity: 0; }
        }
        @keyframes revealIn {
          0%   { transform: scale(0.3); opacity: 0; }
          60%  { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-float-slow  { animation: wander1 18s ease-in-out infinite; }
        .animate-float-medium { animation: wander2 14s ease-in-out infinite; }
        .animate-float-fast  { animation: wander3 10s ease-in-out infinite; }
        .wander4 { animation: wander4 16s ease-in-out infinite; }
        .wander5 { animation: wander5 12s ease-in-out infinite; }
        .splash-anim { animation: splash 0.5s ease-out forwards; }
        .ring-1 { animation: splashRing1 0.5s ease-out forwards; }
        .ring-2 { animation: splashRing2 0.6s ease-out 0.05s forwards; }
        .reveal-in { animation: revealIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
      `}</style>

      {/* Overlay expandé après splash */}
      {expanded && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={handleClose}
        >
          <div
            className="relative rounded-full overflow-hidden border-2 border-white/60 reveal-in"
            style={{
              width: Math.min(320, size * 2.5),
              height: Math.min(320, size * 2.5),
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <img src={image} alt="" className="absolute inset-0 w-full h-full object-cover grayscale sepia" />
            <div className="absolute inset-0 bg-black/40" />
            <div className="absolute inset-0 bg-gradient-to-br from-white/15 via-transparent to-transparent" />
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center gap-4">
              <p className="text-white font-bold text-sm leading-snug">{question}</p>
              <button
                onClick={handleAnswer}
                className="px-6 py-2 rounded-full gradient-orange text-white text-xs font-bold tracking-wider uppercase transition-transform hover:scale-105 active:scale-95"
              >
                Answer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulle flottante */}
      <div
        className={`absolute ${animationClass} ${question ? "cursor-pointer" : "pointer-events-none"}`}
        style={{
          left: `${x}%`,
          top: `${y}%`,
          animationDelay: delay,
        }}
        onClick={handleClick}
      >
        {/* Anneaux splash */}
        {splashing && (
          <>
            <div className="ring-1 absolute rounded-full border-2 border-white/60" style={{ inset: 0, zIndex: 10 }} />
            <div className="ring-2 absolute rounded-full border border-white/40" style={{ inset: 0, zIndex: 10 }} />
          </>
        )}

        {/* Corps de la bulle — CERCLE parfait */}
        <div
          className={`rounded-full overflow-hidden border border-white/40 relative transition-all duration-300 hover:scale-105 hover:border-white/70 ${
            splashing ? "splash-anim" : ""
          }`}
          style={{
            width: `${size}px`,
            height: `${size}px`,
            boxShadow: "0 0 20px rgba(255,255,255,0.1), inset 0 2px 8px rgba(255,255,255,0.2)",
          }}
        >
          {/* Photo noir et blanc sépia */}
          <img
            src={image}
            alt=""
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover grayscale sepia"
            style={{ borderRadius: "50%" }}
          />

          {/* Overlay couleur selon catégorie */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                category === "past"
                  ? "rgba(107,78,155,0.15)"
                  : category === "future"
                    ? "rgba(232,116,42,0.15)"
                    : "rgba(180,140,60,0.15)",
            }}
          />

          {/* Reflet glass */}
          <div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.25) 0%, transparent 60%)",
            }}
          />

          {/* Ombre intérieure */}
          <div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              boxShadow: "inset 0 2px 8px rgba(255,255,255,0.3), inset 0 -2px 8px rgba(0,0,0,0.1)",
            }}
          />

          {/* Point d'interrogation sur les bulles avec question */}
          {question && (
            <div className="absolute inset-0 flex items-center justify-center rounded-full">
              <span
                className="text-white/80 font-black"
                style={{
                  fontSize: size > 100 ? "24px" : "16px",
                  textShadow: "0 0 10px rgba(0,0,0,0.6)",
                }}
              >
                ?
              </span>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MemoryBubble;
