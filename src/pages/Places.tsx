import { useNavigate } from "react-router-dom";
import { MapPin, ArrowLeft } from "lucide-react";

const Places = () => {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #1a2a1a 0%, #2d4a2d 40%, #1a3a2a 100%)",
      }}
    >
      <style>{`
        @keyframes ping-slow {
          0% { transform: scale(1); opacity: 0.8; }
          70% { transform: scale(2.5); opacity: 0; }
          100% { transform: scale(1); opacity: 0; }
        }
        @keyframes float-pin {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .ping-slow { animation: ping-slow 2s ease-out infinite; }
        .float-pin { animation: float-pin 3s ease-in-out infinite; }
      `}</style>

      {/* Fond carte stylisée */}
      <div className="absolute inset-0 opacity-20">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute border border-white/20 rounded-lg"
            style={{
              left: `${(i * 13) % 80}%`,
              top: `${(i * 17) % 80}%`,
              width: `${((i * 7) % 120) + 60}px`,
              height: `${((i * 11) % 80) + 40}px`,
              backgroundColor: "rgba(255,255,255,0.03)",
            }}
          />
        ))}
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center gap-4 px-6 pt-14 pb-4">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-white/10 text-white">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-white font-bold text-lg">Places</h1>
      </div>

      {/* Contenu principal */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-8 text-center gap-8">
        {/* Icône animée */}
        <div className="relative flex items-center justify-center w-32 h-32">
          <div
            className="ping-slow absolute w-16 h-16 rounded-full"
            style={{ backgroundColor: "rgba(232,116,42,0.3)" }}
          />
          <div
            className="float-pin relative w-20 h-20 rounded-full flex items-center justify-center"
            style={{
              background: "radial-gradient(circle, rgba(232,116,42,0.3), rgba(10,10,10,0.8))",
              border: "2px solid rgba(232,116,42,0.6)",
              boxShadow: "0 0 30px rgba(232,116,42,0.3)",
            }}
          >
            <MapPin size={36} className="text-[#E8742A]" />
          </div>
        </div>

        {/* Texte */}
        <div className="space-y-4 max-w-xs">
          <p className="font-black text-[10px] uppercase tracking-[0.3em]" style={{ color: "#E8742A" }}>
            Coming Soon
          </p>
          <h2 className="text-white font-bold text-2xl leading-tight">Every memory has a place where it was born.</h2>
          <p className="text-white/50 text-sm leading-relaxed">
            Soon you'll be able to pin your memories on a map. Walk past a restaurant and discover that a father
            proposed there. Visit a school and hear the voice of a teacher who changed someone's life forever.
          </p>
        </div>

        {/* Exemples */}
        <div className="flex flex-col gap-3 w-full max-w-xs">
          {[
            { emoji: "💍", text: "This restaurant — where Dad proposed to Mom" },
            { emoji: "🏫", text: "This school — where everything changed" },
            { emoji: "🌳", text: "This park — where I became who I am" },
          ].map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-3 px-4 py-3 rounded-2xl text-left"
              style={{
                backgroundColor: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <span className="text-xl">{item.emoji}</span>
              <p className="text-white/60 text-xs italic">{item.text}</p>
            </div>
          ))}
        </div>

        <button
          onClick={() => navigate("/")}
          className="mt-4 px-8 py-3 rounded-full gradient-orange font-bold text-sm"
          style={{ color: "#FFFFFF" }}
        >
          Back to Feels
        </button>
      </div>
    </div>
  );
};

export default Places;
