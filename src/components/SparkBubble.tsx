import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const QUESTIONS = {
  night: {
    en: [
      "The voice you would give anything to hear again...",
      "What did the silence of your childhood sound like?",
      "A face that comes back to you in dreams...",
    ],
    fr: [
      "La voix que tu donnerais tout pour réentendre...",
      "À quoi ressemblait le silence de ton enfance ?",
      "Un visage qui te revient en rêve...",
    ],
    ar: ["الصوت الذي تقدم كل شيء لتسمعه مجدداً...", "كيف كان يبدو صمت طفولتك؟", "وجه يعود إليك في أحلامك..."],
  },
  morning: {
    en: [
      "What lesson from your father still guides you today?",
      "The bravest person in your family...",
      "A morning ritual you'll never forget...",
    ],
    fr: [
      "Quelle leçon de ton père te guide encore aujourd'hui ?",
      "La personne la plus courageuse de ta famille...",
      "Un rituel du matin que tu n'oublieras jamais...",
    ],
    ar: ["ما الدرس الذي علمك إياه والدك وما زال يرشدك؟", "أشجع شخص في عائلتك...", "طقوس صباحية لن تنساها أبداً..."],
  },
  afternoon: {
    en: [
      "Who loved you without ever saying the words?",
      "The first heartbreak that shaped you...",
      "A love letter never sent...",
    ],
    fr: [
      "Qui t'a aimé sans jamais le dire ?",
      "Le premier chagrin d'amour qui t'a façonné...",
      "Une lettre d'amour jamais envoyée...",
    ],
    ar: ["من أحبك دون أن ينطق الكلمة أبداً؟", "أول انكسار قلب شكّلك...", "رسالة حب لم تُرسل أبداً..."],
  },
  evening: {
    en: [
      "What will your grandchildren wish you had recorded?",
      "The wisdom you're afraid will die with you...",
      "What does the word 'home' smell like to you?",
    ],
    fr: [
      "Qu'est-ce que tes petits-enfants voudraient que tu aies enregistré ?",
      "La sagesse que tu as peur d'emporter avec toi...",
      "Quelle est l'odeur du mot 'maison' pour toi ?",
    ],
    ar: ["ماذا سيتمنى أحفادك لو سجلته لهم؟", "الحكمة التي تخشى أن تموت معك...", "ما هي رائحة كلمة 'بيت' بالنسبة لك؟"],
  },
};

const getQuestionByHour = (lang: "en" | "fr" | "ar") => {
  const hour = new Date().getHours();
  let key: "night" | "morning" | "afternoon" | "evening";
  if (hour >= 0 && hour < 6) key = "night";
  else if (hour >= 6 && hour < 12) key = "morning";
  else if (hour >= 12 && hour < 18) key = "afternoon";
  else key = "evening";
  const pool = QUESTIONS[key][lang] || QUESTIONS[key].en;
  return pool[Math.floor(Math.random() * pool.length)];
};

const getSparkBalance = (): number => {
  return Number(localStorage.getItem("infeelit_spark_balance") || 0);
};

const SparkBubble = () => {
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const [position, setPosition] = useState({ x: 50, y: 30 });
  const [expanded, setExpanded] = useState(false);
  const [question, setQuestion] = useState("");
  const [showButton, setShowButton] = useState(false);
  const [sparkBalance, setSparkBalance] = useState(0);

  useEffect(() => {
    setQuestion(getQuestionByHour(lang as "en" | "fr" | "ar"));
    setSparkBalance(getSparkBalance());
  }, [lang]);

  useEffect(() => {
    const moveInterval = setInterval(() => {
      const newX = Math.random() > 0.5 ? 10 + Math.random() * 25 : 65 + Math.random() * 25;
      const newY = 15 + Math.random() * 45;
      setPosition({ x: newX, y: newY });
    }, 60000);
    return () => clearInterval(moveInterval);
  }, []);

  useEffect(() => {
    if (expanded) {
      const timer = setTimeout(() => setShowButton(true), 2000);
      return () => clearTimeout(timer);
    } else {
      setShowButton(false);
    }
  }, [expanded]);

  const handleBubbleClick = () => setExpanded(true);
  const handleClose = () => setExpanded(false);
  const handleRecord = () => {
    setExpanded(false);
    navigate("/record", { state: { question, category: "past", fromSpark: true } });
  };

  return (
    <>
      <style>{`
        @keyframes heartbeatPulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 25px rgba(255,180,40,0.5), 0 0 50px rgba(232,116,42,0.3), 0 0 80px rgba(255,200,60,0.15); }
          8% { transform: scale(1.08); box-shadow: 0 0 35px rgba(255,200,60,0.8), 0 0 70px rgba(232,116,42,0.5), 0 0 100px rgba(255,220,80,0.3); }
          16% { transform: scale(1); box-shadow: 0 0 25px rgba(255,180,40,0.5), 0 0 50px rgba(232,116,42,0.3), 0 0 80px rgba(255,200,60,0.15); }
          24% { transform: scale(1.06); box-shadow: 0 0 30px rgba(255,200,60,0.6), 0 0 55px rgba(232,116,42,0.4), 0 0 85px rgba(255,220,80,0.2); }
          32% { transform: scale(1); box-shadow: 0 0 25px rgba(255,180,40,0.5), 0 0 50px rgba(232,116,42,0.3), 0 0 80px rgba(255,200,60,0.15); }
        }
        @keyframes sparkleFloat {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(-12px, -20px) scale(1.05); }
          50% { transform: translate(15px, -8px) scale(0.96); }
          75% { transform: translate(8px, 15px) scale(1.04); }
        }
        @keyframes innerGlowRotate {
          0% { opacity: 0.6; transform: rotate(0deg); }
          100% { opacity: 1; transform: rotate(360deg); }
        }
        @keyframes particleUp {
          0% { transform: translateY(0) translateX(0) scale(1); opacity: 1; }
          100% { transform: translateY(-40px) translateX(var(--dx)) scale(0); opacity: 0; }
        }
        @keyframes expandIn {
          0% { transform: scale(0.2); opacity: 0; }
          60% { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes haloSpin {
          0% { transform: translate(-50%,-50%) rotate(0deg) scale(1); }
          50% { transform: translate(-50%,-50%) rotate(180deg) scale(1.15); }
          100% { transform: translate(-50%,-50%) rotate(360deg) scale(1); }
        }
        .heartbeat { animation: heartbeatPulse 2.5s ease-in-out infinite; }
        .sparkle-float { animation: sparkleFloat 10s ease-in-out infinite; }
        .inner-glow-rotate { animation: innerGlowRotate 6s linear infinite; }
        .expand-in { animation: expandIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
      `}</style>

      {!expanded && (
        <button
          onClick={handleBubbleClick}
          className="absolute z-[15] cursor-pointer transition-transform active:scale-90"
          style={{
            left: `${position.x}%`,
            top: `${position.y}%`,
            width: "90px",
            height: "90px",
            transition: "left 8s ease-in-out, top 8s ease-in-out",
            transform: "translate(-50%,-50%)",
          }}
        >
          {/* Particules qui s'échappent */}
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              style={
                {
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  width: "3px",
                  height: "3px",
                  borderRadius: "50%",
                  background: `hsl(${35 + i * 5}, 90%, ${60 + i * 3}%)`,
                  boxShadow: "0 0 4px rgba(255,200,60,0.8)",
                  animation: `particleUp ${2 + Math.random() * 2}s ease-out infinite`,
                  animationDelay: `${i * 0.3}s`,
                  "--dx": `${(Math.random() - 0.5) * 30}px`,
                } as React.CSSProperties
              }
            />
          ))}

          {/* Halo tournant */}
          <div
            className="heartbeat absolute rounded-full"
            style={{
              width: "90px",
              height: "90px",
              background:
                "radial-gradient(circle at 45% 45%, rgba(255,220,80,0.95) 0%, rgba(255,180,40,0.85) 25%, rgba(232,116,42,0.5) 55%, rgba(180,70,10,0.15) 100%)",
              border: "2px solid rgba(255,200,60,0.7)",
            }}
          >
            {/* Reflet interne tournant */}
            <div
              className="inner-glow-rotate absolute inset-0 rounded-full"
              style={{
                background:
                  "conic-gradient(from 0deg, transparent 0%, rgba(255,255,255,0.4) 25%, transparent 50%, rgba(255,255,255,0.2) 75%, transparent 100%)",
                opacity: 0.7,
              }}
            />

            {/* Point lumineux central */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  background:
                    "radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(255,220,80,0.6) 40%, transparent 70%)",
                  boxShadow: "0 0 15px rgba(255,255,255,0.8), 0 0 30px rgba(255,200,60,0.6)",
                }}
              />
              <Sparkles
                size={22}
                color="#fff"
                style={{
                  position: "absolute",
                  filter: "drop-shadow(0 0 8px rgba(255,200,60,1)) drop-shadow(0 0 20px rgba(255,180,40,0.6))",
                }}
              />
            </div>

            {/* Compteur de Sparks */}
            {sparkBalance > 0 && (
              <div
                className="absolute -top-2 -right-2 px-1.5 py-0.5 rounded-full flex items-center justify-center"
                style={{
                  background: "rgba(0,0,0,0.7)",
                  border: "1px solid rgba(255,200,60,0.6)",
                  boxShadow: "0 0 8px rgba(255,200,60,0.4)",
                }}
              >
                <span
                  style={{
                    fontSize: "9px",
                    color: "#FFD700",
                    fontWeight: 700,
                    lineHeight: 1,
                    textShadow: "0 0 4px rgba(255,200,60,0.8)",
                  }}
                >
                  ✦{sparkBalance}
                </span>
              </div>
            )}
          </div>
        </button>
      )}

      {expanded && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.93)", backdropFilter: "blur(20px)" }}
          onClick={handleClose}
        >
          <div
            className="expand-in w-full max-w-sm mx-6 rounded-3xl px-8 py-10 text-center relative"
            style={{
              background: "radial-gradient(ellipse at 50% 30%, rgba(232,116,42,0.2) 0%, rgba(0,0,0,0.95) 70%)",
              border: "1px solid rgba(232,116,42,0.35)",
              boxShadow: "0 0 80px rgba(232,116,42,0.2), 0 0 150px rgba(232,116,42,0.08)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white/50 hover:bg-white/20 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="flex justify-center mb-6">
              <div
                className="heartbeat rounded-full flex items-center justify-center"
                style={{
                  width: "80px",
                  height: "80px",
                  background:
                    "radial-gradient(circle at 45% 45%, rgba(255,220,80,1) 0%, rgba(255,180,40,0.9) 35%, rgba(232,116,42,0.5) 100%)",
                  border: "2px solid rgba(255,200,60,0.8)",
                  boxShadow: "0 0 40px rgba(255,200,60,0.6), 0 0 80px rgba(255,180,40,0.3)",
                }}
              >
                <Sparkles
                  size={34}
                  color="#fff"
                  style={{
                    filter: "drop-shadow(0 0 10px rgba(255,200,60,1)) drop-shadow(0 0 25px rgba(255,180,40,0.7))",
                  }}
                />
              </div>
            </div>

            <p className="text-[#E8742A] text-[10px] font-black uppercase tracking-[0.3em] mb-4">
              {lang === "ar" ? "شرارة اليوم" : lang === "fr" ? "L'étincelle du jour" : "Today's Spark"}
            </p>

            <h2 className="text-white text-xl font-bold leading-relaxed mb-8 italic font-serif">"{question}"</h2>

            {showButton && (
              <button
                onClick={handleRecord}
                className="w-full py-4 rounded-full font-bold text-base transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: "linear-gradient(135deg, #E8742A, #D4621A)",
                  color: "#fff",
                  boxShadow: "0 0 35px rgba(232,116,42,0.6), 0 0 70px rgba(232,116,42,0.25)",
                }}
              >
                {lang === "ar" ? "أتذكر" : lang === "fr" ? "Je me souviens" : "I remember"}
              </button>
            )}

            {!showButton && (
              <div className="flex justify-center">
                <div className="w-8 h-8 border-2 border-[#E8742A]/30 border-t-[#E8742A] rounded-full animate-spin" />
              </div>
            )}

            <p className="text-white/20 text-[10px] mt-6">
              {lang === "ar"
                ? "سجّل ذكراك واكسب شرارة"
                : lang === "fr"
                  ? "Enregistre ton souvenir et gagne une étincelle"
                  : "Record your memory and earn a spark"}
            </p>

            {sparkBalance > 0 && (
              <p className="text-[#FFD700]/40 text-[9px] mt-2">
                {lang === "ar"
                  ? `لديك ${sparkBalance} شرارات`
                  : lang === "fr"
                    ? `Tu as ${sparkBalance} étincelles`
                    : `You have ${sparkBalance} sparks`}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default SparkBubble;
