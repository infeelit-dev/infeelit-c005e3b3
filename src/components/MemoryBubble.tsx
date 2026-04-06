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
        .splash-anim { animation: splash 0.5s ease-out forwards; }
        .ring-1 { animation: splashRing1 0.5s ease-out forwards; }
        .ring-2 { animation: splashRing2 0.6s ease-out 0.05s forwards; }
        .reveal-in { animation: revealIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
      `}</style>

      {/* Expanded overlay après splash */}
      {expanded && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          style={{ animation: "fadeIn 0.3s ease forwards" }}
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
            {/* Photo en noir et blanc sépia */}
            <img src={image} alt="" className="absolute inset-0 w-full h-full object-cover scale-110 grayscale sepia" />
            {/* Overlay sombre */}
            <div className="absolute inset-0 bg-black/40" />
            {/* Highlight glass */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/15 via-transparent to-transparent" />

            {/* Question + bouton */}
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
          width: size,
          height: size,
          animationDelay: delay,
        }}
        onClick={handleClick}
      >
        {/* Anneaux splash */}
        {splashing && (
          <>
            <div className="ring-1 absolute inset-0 rounded-full border-2 border-white/60" style={{ zIndex: 10 }} />
            <div className="ring-2 absolute inset-0 rounded-full border border-white/40" style={{ zIndex: 10 }} />
          </>
        )}

        {/* Corps de la bulle */}
        <div
          className={`w-full h-full rounded-full overflow-hidden border border-white/40 transition-all duration-300 hover:scale-105 hover:border-white/70 ${
            splashing ? "splash-anim" : ""
          }`}
          style={{
            boxShadow: "0 0 20px rgba(255,255,255,0.1), inset 0 2px 8px rgba(255,255,255,0.2)",
          }}
        >
          {/* Photo noir et blanc sépia */}
          <img
            src={image}
            alt=""
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover scale-110 grayscale sepia"
          />

          {/* Overlay couleur subtil selon catégorie */}
          <div
            className="absolute inset-0"
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
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/25 via-white/5 to-transparent pointer-events-none" />
          <div className="absolute inset-0 rounded-full shadow-[inset_0_2px_8px_rgba(255,255,255,0.3)] pointer-events-none" />

          {/* Point d'interrogation sur les bulles avec question */}
          {question && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span
                className="text-white/70 font-black"
                style={{ fontSize: size > 100 ? "24px" : "16px", textShadow: "0 0 10px rgba(0,0,0,0.5)" }}
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
