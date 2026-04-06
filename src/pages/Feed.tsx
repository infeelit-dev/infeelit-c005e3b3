import { useNavigate } from "react-router-dom";
import { Plus, User } from "lucide-react";
import infeelit from "@/assets/infeelit-logo.png";

const QUESTIONS = [
  "What smell instantly brings you back to your childhood home?",
  "What is the last thing you wish you had said to someone you lost?",
  "What lesson did your grandparents teach you without words?",
  "What was the bravest thing someone in your family ever did?",
  "What story do you always tell about your parents?",
  "What did home feel like when you were a child?",
  "Who made you feel safe without saying a word?",
  "What would you tell your younger self today?",
  "What memory do you never want to forget?",
  "What did your family never say out loud but always showed?",
];

const BUBBLES = [
  { id: 1, type: "question", size: 110, x: 8, y: 12, animDuration: 6, animDelay: 0, questionIndex: 0 },
  { id: 2, type: "question", size: 90, x: 55, y: 5, animDuration: 8, animDelay: 1, questionIndex: 1 },
  { id: 3, type: "question", size: 130, x: 25, y: 35, animDuration: 7, animDelay: 2, questionIndex: 2 },
  { id: 4, type: "question", size: 95, x: 70, y: 30, animDuration: 9, animDelay: 0.5, questionIndex: 3 },
  { id: 5, type: "question", size: 115, x: 10, y: 58, animDuration: 6.5, animDelay: 1.5, questionIndex: 4 },
  { id: 6, type: "question", size: 85, x: 60, y: 55, animDuration: 7.5, animDelay: 3, questionIndex: 5 },
  { id: 7, type: "question", size: 120, x: 35, y: 68, animDuration: 8.5, animDelay: 0.8, questionIndex: 6 },
  { id: 8, type: "question", size: 100, x: 75, y: 72, animDuration: 5.5, animDelay: 2, questionIndex: 7 },
  { id: 9, type: "question", size: 80, x: 5, y: 82, animDuration: 9.5, animDelay: 1.2, questionIndex: 8 },
  { id: 10, type: "question", size: 105, x: 48, y: 85, animDuration: 7, animDelay: 2.5, questionIndex: 9 },
];

const Feed = () => {
  const navigate = useNavigate();

  const handleBubbleClick = (questionIndex: number) => {
    navigate("/record", {
      state: { question: QUESTIONS[questionIndex] },
    });
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: "#0A0A0A" }}>
      <style>{`
        @keyframes bubbleFloat1 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          25%       { transform: translate(12px, -18px) scale(1.03); }
          50%       { transform: translate(-8px, -28px) scale(0.97); }
          75%       { transform: translate(-15px, -10px) scale(1.02); }
        }
        @keyframes bubbleFloat2 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          25%       { transform: translate(-18px, -22px) scale(1.04); }
          50%       { transform: translate(-25px, -8px) scale(0.96); }
          75%       { transform: translate(-10px, 12px) scale(1.03); }
        }
        @keyframes bubbleFloat3 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          25%       { transform: translate(20px, 15px) scale(0.97); }
          50%       { transform: translate(10px, -22px) scale(1.05); }
          75%       { transform: translate(-18px, -8px) scale(0.98); }
        }
        @keyframes bubbleFloat4 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          25%       { transform: translate(-20px, 15px) scale(1.03); }
          50%       { transform: translate(8px, 25px) scale(0.96); }
          75%       { transform: translate(18px, -10px) scale(1.04); }
        }
        @keyframes bubbleFloat5 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          25%       { transform: translate(15px, -25px) scale(0.95); }
          50%       { transform: translate(-12px, -18px) scale(1.06); }
          75%       { transform: translate(-20px, 8px) scale(0.98); }
        }
        @keyframes bubblePulse {
          0%, 100% { opacity: 0.85; }
          50%       { opacity: 1; }
        }
        .float-1 { animation: bubbleFloat1 var(--dur) ease-in-out infinite var(--delay); }
        .float-2 { animation: bubbleFloat2 var(--dur) ease-in-out infinite var(--delay); }
        .float-3 { animation: bubbleFloat3 var(--dur) ease-in-out infinite var(--delay); }
        .float-4 { animation: bubbleFloat4 var(--dur) ease-in-out infinite var(--delay); }
        .float-5 { animation: bubbleFloat5 var(--dur) ease-in-out infinite var(--delay); }
        .bubble-pulse { animation: bubblePulse 3s ease-in-out infinite; }
      `}</style>

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 px-6 pt-12 pb-4 flex justify-between items-center">
        <img
          src={infeelit}
          alt="Infeelit"
          className="w-[100px] h-auto object-contain"
          style={{ mixBlendMode: "screen" }}
        />
        <button
          onClick={() => navigate("/profile")}
          className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center"
        >
          <User size={18} className="text-white" />
        </button>
      </div>

      {/* Ocean de bulles */}
      <div className="absolute inset-0">
        {BUBBLES.map((bubble, index) => {
          const floatClass = `float-${(index % 5) + 1}`;
          const questionText = QUESTIONS[bubble.questionIndex];
          const shortQuestion = questionText.length > 40 ? questionText.substring(0, 40) + "..." : questionText;

          return (
            <button
              key={bubble.id}
              onClick={() => handleBubbleClick(bubble.questionIndex)}
              className={`absolute rounded-full ${floatClass} bubble-pulse active:scale-95 transition-transform`}
              style={
                {
                  left: `${bubble.x}%`,
                  top: `${bubble.y}%`,
                  width: `${bubble.size}px`,
                  height: `${bubble.size}px`,
                  "--dur": `${bubble.animDuration}s`,
                  "--delay": `${bubble.animDelay}s`,
                  background: "radial-gradient(circle at 35% 35%, rgba(107,78,155,0.9), rgba(107,78,155,0.4))",
                  border: "1.5px solid rgba(232,116,42,0.4)",
                  backdropFilter: "blur(8px)",
                  boxShadow: "0 0 20px rgba(107,78,155,0.3), inset 0 0 20px rgba(255,255,255,0.05)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "10px",
                } as React.CSSProperties
              }
            >
              <span className="text-[#E8742A] font-black mb-1" style={{ fontSize: "16px", lineHeight: 1 }}>
                ?
              </span>
              <span
                className="text-white text-center leading-tight"
                style={{ fontSize: bubble.size > 105 ? "9px" : "8px" }}
              >
                {shortQuestion}
              </span>
            </button>
          );
        })}
      </div>

      {/* Bouton central Capture */}
      <div className="absolute bottom-24 left-0 right-0 flex justify-center z-20">
        <button
          onClick={() => navigate("/record")}
          className="w-16 h-16 rounded-full flex items-center justify-center shadow-2xl active:scale-95 transition-transform"
          style={{
            background: "linear-gradient(135deg, #E8742A, #D4621A)",
            boxShadow: "0 0 30px rgba(232,116,42,0.5)",
          }}
        >
          <Plus size={28} className="text-white" />
        </button>
      </div>

      {/* Bottom navigation */}
      <div
        className="absolute bottom-0 left-0 right-0 z-20 px-8 py-4 flex justify-around items-center"
        style={{ backgroundColor: "rgba(10,10,10,0.9)", borderTop: "1px solid rgba(255,255,255,0.08)" }}
      >
        <button onClick={() => navigate("/feed")} className="flex flex-col items-center gap-1">
          <div className="w-6 h-6 rounded-full bg-[#E8742A]" />
          <span className="text-[10px] text-[#E8742A] font-bold uppercase tracking-widest">Ocean</span>
        </button>
        <button onClick={() => navigate("/circle")} className="flex flex-col items-center gap-1">
          <div className="w-6 h-6 rounded-full bg-white/20" />
          <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Circle</span>
        </button>
        <button onClick={() => navigate("/profile")} className="flex flex-col items-center gap-1">
          <div className="w-6 h-6 rounded-full bg-white/20" />
          <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Me</span>
        </button>
      </div>
    </div>
  );
};

export default Feed;
