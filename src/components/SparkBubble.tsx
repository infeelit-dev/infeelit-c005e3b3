import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import infeeilitSymbol from "@/assets/logo_sparkl_final_Infeelit.png";

const SPARK_INVITATIONS = {
  objet: {
    fr: ["{name}, raconte-nous le jouet que tu n'aurais jamais voulu perdre.", "{name}, raconte-nous le cadeau qui t'a laissé sans voix.", "{name}, raconte-nous l'objet que tu gardes encore aujourd'hui."],
    en: ["{name}, tell us about the toy you never wanted to lose.", "{name}, tell us about the gift that left you speechless.", "{name}, tell us about the object you still keep to this day."],
    ar: ["{name}، احكِ لنا عن اللعبة التي لم تكن تريد أن تفقدها أبداً.", "{name}، احكِ لنا عن الهدية التي أبهرتك وتركتك بلا كلام.", "{name}، احكِ لنا عن الشيء الذي لا تزال تحتفظ به حتى اليوم."],
  },
  moment: {
    fr: ["{name}, raconte-nous ton premier spectacle devant tout le monde.", "{name}, raconte-nous le match ou le jour dont tu es le plus fier.", "{name}, raconte-nous la fête de famille que tu n'oublieras jamais."],
    en: ["{name}, tell us about your first performance in front of everyone.", "{name}, tell us about the game or the day you are most proud of.", "{name}, tell us about the family celebration you'll never forget."],
    ar: ["{name}، احكِ لنا عن أول عرض قدمته أمام الجميع.", "{name}، احكِ لنا عن المباراة أو اليوم الذي تفخر به أكثر.", "{name}، احكِ لنا عن احتفال العائلة الذي لن تنساه أبداً."],
  },
  personne: {
    fr: ["{name}, raconte-nous le geste de tes parents qui valait mille mots.", "{name}, raconte-nous la personne qui t'a appris quelque chose d'essentiel.", "{name}, raconte-nous le moment où tu as senti que tu étais vraiment aimé."],
    en: ["{name}, tell us about the gesture of your parents that said everything.", "{name}, tell us about the person who taught you something essential.", "{name}, tell us about the moment you felt truly loved."],
    ar: ["{name}، احكِ لنا عن لفتة والديك التي كانت تساوي ألف كلمة.", "{name}، احكِ لنا عن الشخص الذي علّمك شيئاً لا يُنسى.", "{name}، احكِ لنا عن اللحظة التي شعرت فيها بالحب الحقيقي."],
  },
};

type Category = "objet" | "moment" | "personne";

const getCardsForHour = (): Category[] => {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12) return ["objet", "moment", "personne"];
  if (hour >= 12 && hour < 18) return ["moment", "personne", "objet"];
  if (hour >= 18 && hour < 24) return ["personne", "objet", "moment"];
  return ["personne", "personne", "personne"];
};

const getSparkBalance = (): number => Number(localStorage.getItem("infeelit_spark_balance") || 0);

const SparkBubble = () => {
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 50, y: 30 });
  const [expanded, setExpanded] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [sparkBalance, setSparkBalance] = useState(0);
  const [userName, setUserName] = useState("");
  const [selectedCard, setSelectedCard] = useState(0);
  const [cards, setCards] = useState<{ category: Category; text: string }[]>([]);
  const [showNameInput, setShowNameInput] = useState(false);
  const [nameInput, setNameInput] = useState("");

  useEffect(() => {
    const savedName = localStorage.getItem("infeelit_user_name") || "";
    setUserName(savedName);
    setSparkBalance(getSparkBalance());
  }, []);

  useEffect(() => {
    if (!userName) return;
    const categories = getCardsForHour();
    const langKey = (lang === "fr" ? "fr" : lang === "ar" ? "ar" : "en") as "fr" | "en" | "ar";
    const selectedCards = categories.map((cat) => {
      const pool = SPARK_INVITATIONS[cat][langKey];
      const randomText = pool[Math.floor(Math.random() * pool.length)];
      return { category: cat, text: randomText.replace("{name}", userName) };
    });
    setCards(selectedCards);
  }, [lang, userName, expanded]);

  useEffect(() => {
    const moveInterval = setInterval(() => {
      const newX = Math.random() > 0.5 ? (10 + Math.random() * 25) : (65 + Math.random() * 25);
      const newY = 15 + Math.random() * 45;
      setPosition({ x: newX, y: newY });
    }, 60000);
    return () => clearInterval(moveInterval);
  }, []);

  useEffect(() => {
    if (expanded) { const timer = setTimeout(() => setShowButton(true), 2000); return () => clearTimeout(timer); }
    else { setShowButton(false); setSelectedCard(0); setShowNameInput(false); setNameInput(""); }
  }, [expanded]);

  const handleBubbleClick = () => {
    setExpanded(true);
    if (!localStorage.getItem("infeelit_user_name")) {
      setShowNameInput(true);
    }
  };

  const handleClose = () => setExpanded(false);

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = nameInput.trim();
    if (trimmed.length < 1) return;
    localStorage.setItem("infeelit_user_name", trimmed);
    setUserName(trimmed);
    setShowNameInput(false);
    setShowButton(false);
    const timer = setTimeout(() => setShowButton(true), 2000);
    return () => clearTimeout(timer);
  };

  const handleCardSelect = (idx: number) => {
    setSelectedCard(idx);
    if (scrollRef.current) { const cw = scrollRef.current.children[0]?.clientWidth || 280; scrollRef.current.scrollTo({ left: idx * (cw + 16), behavior: "smooth" }); }
  };

  const handleRecord = () => {
    const card = cards[selectedCard];
    setExpanded(false);
    navigate("/record", { state: { question: card?.text || "", category: "past", fromSpark: true } });
  };

  const getButtonText = () => {
    if (lang === "ar") return `${userName}، احكِ لنا`;
    if (lang === "fr") return `${userName}, raconte-nous`;
    return `${userName}, tell us`;
  };

  const getBadgeText = (cat: Category) => {
    if (lang === "ar") return cat === "objet" ? "✦ مستوى النور" : cat === "moment" ? "✦ مستوى الكنز" : "✦ مستوى الجوهر";
    if (lang === "fr") return cat === "objet" ? "✦ Niveau Lumière" : cat === "moment" ? "✦ Niveau Trésor" : "✦ Niveau Essence";
    return cat === "objet" ? "✦ Light Level" : cat === "moment" ? "✦ Treasure Level" : "✦ Essence Level";
  };

  return (
    <>
      <style>{`
        @keyframes heartbeatPulse {
          0%,100%{transform:scale(1);box-shadow:0 0 25px rgba(255,180,40,0.5),0 0 50px rgba(232,116,42,0.3),0 0 80px rgba(255,200,60,0.15)}
          8%{transform:scale(1.08);box-shadow:0 0 35px rgba(255,200,60,0.8),0 0 70px rgba(232,116,42,0.5),0 0 100px rgba(255,220,80,0.3)}
          16%{transform:scale(1);box-shadow:0 0 25px rgba(255,180,40,0.5),0 0 50px rgba(232,116,42,0.3),0 0 80px rgba(255,200,60,0.15)}
          24%{transform:scale(1.06);box-shadow:0 0 30px rgba(255,200,60,0.6),0 0 55px rgba(232,116,42,0.4),0 0 85px rgba(255,220,80,0.2)}
          32%{transform:scale(1);box-shadow:0 0 25px rgba(255,180,40,0.5),0 0 50px rgba(232,116,42,0.3),0 0 80px rgba(255,200,60,0.15)}
        }
        @keyframes heartbeat {
          0%, 100% { transform: scale(1); }
          14% { transform: scale(1.18); }
          28% { transform: scale(1); }
          42% { transform: scale(1.10); }
          70% { transform: scale(1); }
        }
        @keyframes particleUp{0%{transform:translateY(0) translateX(0) scale(1);opacity:1}100%{transform:translateY(-50px) translateX(var(--dx)) scale(0);opacity:0}}
        @keyframes innerGlowRotate{0%{opacity:.6;transform:rotate(0deg)}100%{opacity:1;transform:rotate(360deg)}}
        @keyframes expandIn{0%{transform:scale(.2);opacity:0}60%{transform:scale(1.05);opacity:1}100%{transform:scale(1);opacity:1}}
        .heartbeat-pulse{animation:heartbeatPulse 2.5s ease-in-out infinite}
        .heartbeat-symbol{animation:heartbeat 0.86s ease-in-out infinite}
        .inner-glow-rotate{animation:innerGlowRotate 6s linear infinite}
        .expand-in{animation:expandIn .5s cubic-bezier(0.175,0.885,0.32,1.275) forwards}
        .snap-scroll{scroll-snap-type:x mandatory}
        .snap-card{scroll-snap-align:center}
        .hide-scroll{scrollbar-width:none}
        .hide-scroll::-webkit-scrollbar{display:none}
      `}</style>

      {!expanded && (
        <button onClick={handleBubbleClick} className="absolute z-[15] cursor-pointer transition-transform active:scale-90 bg-transparent border-none p-0" style={{ left: `${position.x}%`, top: `${position.y}%`, width: "90px", height: "90px", transition: "left 8s ease-in-out, top 8s ease-in-out", transform: "translate(-50%,-50%)" }}>
          {[...Array(10)].map((_, i) => (
            <div key={i} style={{ position: "absolute", top: "50%", left: "50%", width: i % 3 === 0 ? "4px" : "2.5px", height: i % 3 === 0 ? "4px" : "2.5px", borderRadius: "50%", background: `hsl(${35 + i * 4},90%,${60 + i * 2}%)`, boxShadow: "0 0 5px rgba(255,200,60,0.9)", animation: `particleUp ${2.5 + Math.random() * 2}s ease-out infinite`, animationDelay: `${i * 0.35}s`, "--dx": `${(Math.random() - 0.5) * 40}px` } as React.CSSProperties} />
          ))}
          <div className="heartbeat-pulse absolute rounded-full" style={{ width: "90px", height: "90px", background: "radial-gradient(circle at 45% 45%, rgba(255,220,80,0.95) 0%, rgba(255,180,40,0.85) 25%, rgba(232,116,42,0.5) 55%, rgba(180,70,10,0.15) 100%)", border: "2px solid rgba(255,200,60,0.7)" }}>
            <div className="inner-glow-rotate absolute inset-0 rounded-full" style={{ background: "conic-gradient(from 0deg, transparent 0%, rgba(255,255,255,0.4) 25%, transparent 50%, rgba(255,255,255,0.2) 75%, transparent 100%)", opacity: 0.7 }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <img
                src={infeeilitSymbol}
                alt="Infeelit"
                style={{
                  width: "54px",
                  height: "54px",
                  objectFit: "contain",
                  animation: "heartbeat 0.86s ease-in-out infinite",
                  filter: "drop-shadow(0 0 10px rgba(255,200,60,0.9))",
                  position: "absolute",
                }}
              />
            </div>
            {sparkBalance > 0 && (
              <div className="absolute -top-2 -right-2 px-1.5 py-0.5 rounded-full flex items-center justify-center" style={{ background: "rgba(0,0,0,0.7)", border: "1px solid rgba(255,200,60,0.6)", boxShadow: "0 0 8px rgba(255,200,60,0.4)" }}><span style={{ fontSize: "9px", color: "#FFD700", fontWeight: 700, lineHeight: 1, textShadow: "0 0 4px rgba(255,200,60,0.8)" }}>✦{sparkBalance}</span></div>
            )}
          </div>
        </button>
      )}

      {expanded && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(20px)" }} onClick={handleClose}>
          <div className="expand-in w-full max-w-md mx-6 rounded-3xl px-6 py-8 text-center relative" style={{ background: "#FFF9F2", border: "1px solid rgba(212,168,83,0.2)", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }} onClick={(e) => e.stopPropagation()}>
            <button onClick={handleClose} className="absolute top-4 right-4 p-2 rounded-full bg-[#3D2B1F]/[.05] text-[#3D2B1F]/40 hover:bg-[#3D2B1F]/[.1] transition-colors border-none cursor-pointer"><X size={18} /></button>

            <div className="flex justify-center mb-4">
              <img
                src={infeeilitSymbol}
                alt="Infeelit"
                style={{
                  width: "62px",
                  height: "62px",
                  objectFit: "contain",
                  animation: "heartbeat 0.86s ease-in-out infinite",
                  filter: "drop-shadow(0 0 12px rgba(255,200,60,0.9))",
                }}
              />
            </div>

            {showNameInput ? (
              <form onSubmit={handleNameSubmit} className="flex flex-col items-center gap-5">
                <p className="text-[#E8742A] text-[10px] font-black uppercase tracking-[0.3em]">
                  {lang === "ar" ? "ما اسمك ؟" : lang === "fr" ? "Comment tu t'appelles ?" : "What's your name?"}
                </p>
                <div className="relative w-full max-w-[260px] rounded-full px-6 py-4 transition-all border bg-[#FFFFFF] border-[#D4A853]/30 focus-within:border-[#E8742A] focus-within:shadow-[0_0_20px_rgba(232,116,42,0.1)]">
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder={lang === "ar" ? "اسمك الأول" : lang === "fr" ? "Ton prénom" : "Your first name"}
                    className="w-full bg-transparent outline-none text-[#3D2B1F] text-lg text-center font-serif"
                    autoFocus
                  />
                </div>
                <button type="submit" disabled={nameInput.trim().length < 1} className="w-full max-w-[260px] py-4 rounded-full font-bold text-base transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed border-none cursor-pointer" style={{ background: "linear-gradient(135deg, #E8742A, #D4621A)", color: "#fff", boxShadow: "0 4px 20px rgba(232,116,42,0.3)" }}>
                  {lang === "ar" ? "اكتشف قصصك" : lang === "fr" ? "Découvre tes histoires" : "Discover your stories"}
                </button>
              </form>
            ) : (
              <>
                <p className="text-[#E8742A] text-[10px] font-black uppercase tracking-[0.3em] mb-3">
                  {lang === "ar" ? "اختر قصتك" : lang === "fr" ? "Choisis ton histoire" : "Choose your story"}
                </p>

                <div ref={scrollRef} className="flex gap-4 overflow-x-auto snap-scroll pb-4 pt-2 hide-scroll">
                  {cards.map((card, idx) => {
                    const isSelected = selectedCard === idx;
                    return (
                      <button key={idx} onClick={() => handleCardSelect(idx)} className={`snap-card shrink-0 flex flex-col justify-center items-start text-left p-5 rounded-[20px] transition-all duration-300 cursor-pointer border-none ${isSelected ? "scale-[1.02]" : ""}`} style={{ width: "85%", maxWidth: "300px", background: isSelected ? "rgba(232,116,42,0.06)" : "#FFFFFF", border: isSelected ? "1px solid rgba(232,116,42,0.6)" : "1px solid rgba(232,116,42,0.25)", boxShadow: isSelected ? "0 4px 16px rgba(232,116,42,0.1)" : "none" }}>
                        <span className="text-[8px] font-black uppercase tracking-widest mb-2" style={{ color: isSelected ? "#E8742A" : "rgba(61,43,31,0.4)" }}>{getBadgeText(card.category)}</span>
                        <p className="text-sm font-serif leading-relaxed italic" style={{ color: "#3D2B1F" }}>"{card.text}"</p>
                      </button>
                    );
                  })}
                </div>

                <div className="flex justify-center gap-2 mt-2 mb-4">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="w-2 h-2 rounded-full transition-all duration-300" style={{ background: selectedCard === i ? "#E8742A" : "rgba(61,43,31,0.15)", transform: selectedCard === i ? "scale(1.3)" : "scale(1)" }} />
                  ))}
                </div>

                {showButton && (
                  <button onClick={handleRecord} className="w-full py-4 rounded-full font-bold text-base transition-all hover:scale-[1.02] active:scale-[0.98] border-none cursor-pointer" style={{ background: "linear-gradient(135deg, #E8742A, #D4621A)", color: "#fff", boxShadow: "0 4px 20px rgba(232,116,42,0.3)" }}>{getButtonText()}</button>
                )}
                {!showButton && (
                  <div className="flex justify-center"><div className="w-8 h-8 border-2 border-[#E8742A]/20 border-t-[#E8742A] rounded-full animate-spin" /></div>
                )}

                {sparkBalance > 0 && (
                  <p className="text-[#3D2B1F]/30 text-[9px] mt-3">
                    {lang === "ar" ? `لديك ${sparkBalance} شرارات` : lang === "fr" ? `Tu as ${sparkBalance} étincelles` : `You have ${sparkBalance} sparks`}
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default SparkBubble;
