import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { CHAPTERS } from "@/data/questions";
import infeeilitSymbol from "@/assets/logo_sparkl_4.png";

type Step = "chapters" | "categories" | "questions";

interface SparkBubbleProps {
  forceOpen?: boolean;
  onSparkClose?: () => void;
}

const getRandomPosition = () => {
  const newX = Math.random() > 0.5 ? 10 + Math.random() * 25 : 65 + Math.random() * 25;
  const newY = 15 + Math.random() * 45;
  return { x: newX, y: newY };
};

const SparkBubble = ({ forceOpen, onSparkClose }: SparkBubbleProps) => {
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const [userName, setUserName] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const [position, setPosition] = useState(getRandomPosition);
  const [expanded, setExpanded] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [sparkBalance, setSparkBalance] = useState(0);
  const [showNameInput, setShowNameInput] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [triggerApproach, setTriggerApproach] = useState(false);

  // Nouveaux states pour le système à 3 étapes
  const [currentStep, setCurrentStep] = useState<Step>("chapters");
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [cards, setCards] = useState<{ category: string; text: string }[]>([]);
  const [selectedCard, setSelectedCard] = useState(0);

  useEffect(() => {
    const getName = async () => {
      const local = localStorage.getItem("infeelit_user_name");
      if (local) {
        setUserName(local);
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();
      const name = session?.user?.user_metadata?.display_name || "";
      if (name) {
        localStorage.setItem("infeelit_user_name", name);
        setUserName(name);
      }
    };
    getName();
    setSparkBalance(Number(localStorage.getItem("infeelit_spark_balance") || 0));
  }, []);

  useEffect(() => {
    if (forceOpen) {
      setExpanded(true);
      setCurrentStep("chapters");
      setSelectedChapter(null);
      setSelectedCategory(null);
      if (!localStorage.getItem("infeelit_user_name")) setShowNameInput(true);
    }
  }, [forceOpen]);

  // 🔴 SUPPRIMÉ - Ce useEffect causait le redirect automatique vers les questions
  // useEffect(() => {
  //   if (!isLoggedIn && !expanded && !forceOpen) {
  //     const timer = setTimeout(() => {
  //       setExpanded(true);
  //       setCurrentStep("chapters");
  //       setSelectedChapter(null);
  //       setSelectedCategory(null);
  //     }, 1500);
  //     return () => clearTimeout(timer);
  //   }
  // }, [isLoggedIn, expanded, forceOpen]);

  useEffect(() => {
    const moveInterval = setInterval(() => {
      const newX = Math.random() > 0.5 ? 10 + Math.random() * 25 : 65 + Math.random() * 25;
      const newY = 15 + Math.random() * 45;
      setPosition({ x: newX, y: newY });
    }, 60000);
    return () => clearInterval(moveInterval);
  }, []);

  useEffect(() => {
    const checkTrigger = () => {
      const savedName = localStorage.getItem("infeelit_user_name");
      if (savedName) return;
      const watched = Number(localStorage.getItem("infeelit_videos_watched") || 0);
      const feedTime = Number(localStorage.getItem("infeelit_feed_time") || 0);
      if (watched >= 3 || feedTime >= 5 * 60 * 1000) {
        setTriggerApproach(true);
      }
    };
    const interval = setInterval(checkTrigger, 30000);
    const handler = () => checkTrigger();
    window.addEventListener("infeelit_video_watched", handler);
    checkTrigger();
    return () => {
      clearInterval(interval);
      window.removeEventListener("infeelit_video_watched", handler);
    };
  }, []);

  // FIX: Trigger approach ne doit PAS ouvrir la popup automatiquement
  useEffect(() => {
    if (triggerApproach && !expanded) {
      const timer = setTimeout(() => {
        setTriggerApproach(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [triggerApproach, expanded]);

  useEffect(() => {
    if (expanded) {
      const timer = setTimeout(() => setShowButton(true), 2000);
      return () => clearTimeout(timer);
    } else {
      setShowButton(false);
      setSelectedCard(0);
      setShowNameInput(false);
      setNameInput("");
      setCurrentStep("chapters");
      setSelectedChapter(null);
      setSelectedCategory(null);
    }
  }, [expanded]);

  const getRandomQuestions = (categoryId: string, language: string, name: string) => {
    const chapter = CHAPTERS.find((ch) => ch.categories.some((cat) => cat.id === categoryId));
    const category = chapter?.categories.find((cat) => cat.id === categoryId);
    if (!category) return [];

    const langKey = language as "fr" | "en" | "ar";
    const seenKey = `infeelit_seen_${categoryId}`;
    const seen = JSON.parse(localStorage.getItem(seenKey) || "[]");

    let available = category.questions.filter((_, i) => !seen.includes(i));

    if (available.length < 3) {
      localStorage.removeItem(seenKey);
      available = category.questions;
    }

    const shuffled = [...available].sort(() => Math.random() - 0.5).slice(0, 3);
    const indices = shuffled.map((q) => category.questions.indexOf(q));
    localStorage.setItem(seenKey, JSON.stringify([...seen, ...indices]));

    return shuffled.map((q) => ({
      text: q[langKey].replace("{name}", name || "toi"),
      bubble: q[`bubble_${langKey}` as keyof typeof q] as string,
    }));
  };

  const handleChapterSelect = (chapterId: string) => {
    setSelectedChapter(chapterId);
    setCurrentStep("categories");
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    const questions = getRandomQuestions(categoryId, lang, userName);
    setCards(questions.map((q, i) => ({ category: categoryId, text: q.text })));
    setCurrentStep("questions");
  };

  const handleRecord = () => {
    const card = cards[selectedCard];
    if (!card) return;
    setExpanded(false);
    if (onSparkClose) onSparkClose();
    navigate("/record", { state: { question: card.text, category: "past", fromSpark: true } });
  };

  const handleFreeModeNavigate = (mode: "instant" | "forever") => {
    setExpanded(false);
    if (onSparkClose) onSparkClose();
    navigate(`/record?mode=${mode}`);
  };

  const handleBackToChapters = () => {
    setCurrentStep("chapters");
    setSelectedChapter(null);
    setSelectedCategory(null);
  };

  const handleBackToCategories = () => {
    setCurrentStep("categories");
    setSelectedCategory(null);
  };

  const handleClose = () => {
    setExpanded(false);
    setCurrentStep("chapters");
    setSelectedChapter(null);
    setSelectedCategory(null);
    if (onSparkClose) onSparkClose();
  };

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = nameInput.trim();
    if (trimmed.length < 1) return;
    localStorage.setItem("infeelit_user_name", trimmed);
    setShowNameInput(false);
    setShowButton(false);
    const timer = setTimeout(() => setShowButton(true), 2000);
    return () => clearTimeout(timer);
  };

  const getLangText = (chapter: any, field: string) => {
    const key = `${field}_${lang}` as keyof typeof chapter;
    return chapter[key] || chapter[`${field}_en`];
  };

  const watched = Number(localStorage.getItem("infeelit_videos_watched") || 0);
  const threshold = 3;
  const progress = Math.min(watched, threshold);
  const showBadge = !userName && progress > 0 && progress < threshold;

  return (
    <>
      <style>{`
        @keyframes heartbeatPulse{0%,100%{transform:scale(1);box-shadow:0 0 25px rgba(255,180,40,0.5),0 0 50px rgba(232,116,42,0.3),0 0 80px rgba(255,200,60,0.15)}8%{transform:scale(1.08);box-shadow:0 0 35px rgba(255,200,60,0.8),0 0 70px rgba(232,116,42,0.5),0 0 100px rgba(255,220,80,0.3)}16%{transform:scale(1);box-shadow:0 0 25px rgba(255,180,40,0.5),0 0 50px rgba(232,116,42,0.3),0 0 80px rgba(255,200,60,0.15)}24%{transform:scale(1.06);box-shadow:0 0 30px rgba(255,200,60,0.6),0 0 55px rgba(232,116,42,0.4),0 0 85px rgba(255,220,80,0.2)}32%{transform:scale(1);box-shadow:0 0 25px rgba(255,180,40,0.5),0 0 50px rgba(232,116,42,0.3),0 0 80px rgba(255,200,60,0.15)}}
        @keyframes heartbeat{0%,100%{transform:scale(1)}14%{transform:scale(1.18)}28%{transform:scale(1)}42%{transform:scale(1.10)}70%{transform:scale(1)}}
        @keyframes particleUp{0%{transform:translateY(0) translateX(0) scale(1);opacity:1}100%{transform:translateY(-50px) translateX(var(--dx)) scale(0);opacity:0}}
        @keyframes innerGlowRotate{0%{opacity:.6;transform:rotate(0deg)}100%{opacity:1;transform:rotate(360deg)}}
        @keyframes expandIn{0%{transform:scale(.2);opacity:0}60%{transform:scale(1.05);opacity:1}100%{transform:scale(1);opacity:1}}
        @keyframes gentleApproach{0%{transform:translate(-50%,-50%) scale(1);box-shadow:0 0 25px rgba(255,180,40,0.5)}50%{transform:translate(-50%,-50%) scale(1.4);box-shadow:0 0 60px rgba(255,180,40,0.8),0 0 120px rgba(232,116,42,0.4)}100%{transform:translate(-50%,-50%) scale(1.2);box-shadow:0 0 80px rgba(255,200,60,0.9),0 0 150px rgba(232,116,42,0.5)}}
        .heartbeat-pulse{animation:heartbeatPulse 2.5s ease-in-out infinite}
        .heartbeat-symbol{animation:heartbeat 0.86s ease-in-out infinite}
        .inner-glow-rotate{animation:innerGlowRotate 6s linear infinite}
        .expand-in{animation:expandIn .5s cubic-bezier(0.175,0.885,0.32,1.275) forwards}
        .gentle-approach{animation:gentleApproach 3s ease-in-out infinite}
        .snap-scroll{scroll-snap-type:x mandatory}
        .snap-card{scroll-snap-align:center}
        .hide-scroll{scrollbar-width:none}
        .hide-scroll::-webkit-scrollbar{display:none}
      `}</style>

      {!expanded && !forceOpen && (
        <button
          onClick={() => setExpanded(true)}
          className={`absolute z-[15] cursor-pointer transition-transform active:scale-90 bg-transparent border-none p-0 ${triggerApproach ? "gentle-approach" : ""}`}
          style={{
            left: `${position.x}%`,
            top: `${position.y}%`,
            width: "90px",
            height: "90px",
            transition: "left 8s ease-in-out, top 8s ease-in-out",
            transform: "translate(-50%,-50%)",
          }}
        >
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              style={
                {
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  width: i % 3 === 0 ? "4px" : "2.5px",
                  height: i % 3 === 0 ? "4px" : "2.5px",
                  borderRadius: "50%",
                  background: `hsl(${35 + i * 4},90%,${60 + i * 2}%)`,
                  boxShadow: "0 0 5px rgba(255,200,60,0.9)",
                  animation: `particleUp ${2.5 + Math.random() * 2}s ease-out infinite`,
                  animationDelay: `${i * 0.35}s`,
                  "--dx": `${(Math.random() - 0.5) * 40}px`,
                } as React.CSSProperties
              }
            />
          ))}
          <div
            className="heartbeat-pulse absolute rounded-full"
            style={{
              width: "90px",
              height: "90px",
              background:
                "radial-gradient(circle at 45% 45%, rgba(255,220,80,0.95) 0%, rgba(255,180,40,0.85) 25%, rgba(232,116,42,0.5) 55%, rgba(180,70,10,0.15) 100%)",
              border: "2px solid rgba(255,200,60,0.7)",
            }}
          >
            <div
              className="inner-glow-rotate absolute inset-0 rounded-full"
              style={{
                background:
                  "conic-gradient(from 0deg, transparent 0%, rgba(255,255,255,0.4) 25%, transparent 50%, rgba(255,255,255,0.2) 75%, transparent 100%)",
                opacity: 0.7,
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <img
                src={infeeilitSymbol}
                alt="Infeelit"
                style={{
                  width: "200px",
                  height: "200px",
                  objectFit: "contain",
                  animation: "heartbeat 0.86s ease-in-out infinite",
                  filter: "drop-shadow(0 0 14px rgba(255,200,60,0.95))",
                  mixBlendMode: "screen",
                  position: "absolute",
                }}
              />
            </div>
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
            {showBadge && (
              <div
                className="absolute -top-2 -left-2 px-1.5 py-0.5 rounded-full flex items-center justify-center"
                style={{ background: "rgba(232,116,42,0.9)", boxShadow: "0 0 6px rgba(232,116,42,0.4)" }}
              >
                <span style={{ fontSize: "8px", color: "#fff", fontWeight: 700, lineHeight: 1 }}>
                  {progress}/{threshold} ✦
                </span>
              </div>
            )}
          </div>
        </button>
      )}

      {(expanded || forceOpen) && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center"
          style={{ background: "rgba(253,248,240,0.97)", backdropFilter: "blur(20px)" }}
          onClick={handleClose}
        >
          <div
            className="expand-in w-full max-w-md mx-6 rounded-3xl px-6 py-8 text-center relative"
            style={{
              background: "linear-gradient(160deg, rgba(232,116,42,0.08) 0%, #FFF9F2 40%)",
              border: "1px solid rgba(212,168,83,0.2)",
              boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-[#3D2B1F]/[.05] text-[#3D2B1F]/40 hover:bg-[#3D2B1F]/[.1] transition-colors border-none cursor-pointer"
            >
              <X size={18} />
            </button>

            {/* Image thématique en haut */}
            <div
              style={{
                width: "100%",
                height: "120px",
                borderRadius: "16px",
                overflow: "hidden",
                marginBottom: "16px",
                position: "relative",
              }}
            >
              <img
                src={infeeilitSymbol}
                alt=""
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  opacity: 0.15,
                  filter: "blur(8px)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "radial-gradient(circle, rgba(232,116,42,0.2), transparent)",
                }}
              >
                <img
                  src={infeeilitSymbol}
                  alt="Infeelit"
                  style={{
                    width: "80px",
                    height: "80px",
                    objectFit: "contain",
                    animation: "heartbeat 0.86s ease-in-out infinite",
                    filter: "drop-shadow(0 0 14px rgba(255,200,60,0.95))",
                    mixBlendMode: "screen",
                  }}
                />
              </div>
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
                <button
                  type="submit"
                  disabled={nameInput.trim().length < 1}
                  className="w-full max-w-[260px] py-4 rounded-full font-bold text-base transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed border-none cursor-pointer"
                  style={{
                    background: "linear-gradient(135deg, #E8742A, #D4621A)",
                    color: "#fff",
                    boxShadow: "0 4px 20px rgba(232,116,42,0.3)",
                  }}
                >
                  {lang === "ar" ? "اكتشف قصصك" : lang === "fr" ? "Découvre tes histoires" : "Discover your stories"}
                </button>
              </form>
            ) : (
              <>
                {/* ÉTAPE 1 — Chapitres */}
                {currentStep === "chapters" && (
                  <>
                    <p className="text-[#E8742A] text-[10px] font-black uppercase tracking-[0.3em] mb-1">
                      {lang === "ar"
                        ? "عم تريد أن تتحدث ؟"
                        : lang === "fr"
                          ? "De quoi tu veux parler ?"
                          : "What do you want to talk about?"}
                    </p>
                    <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto">
                      {CHAPTERS.map((chapter) => (
                        <button
                          key={chapter.id}
                          onClick={() => handleChapterSelect(chapter.id)}
                          style={{
                            width: "100%",
                            padding: "16px",
                            borderRadius: "16px",
                            background: "rgba(255,255,255,0.06)",
                            border: "1px solid rgba(232,116,42,0.2)",
                            cursor: "pointer",
                            textAlign: "left",
                            display: "flex",
                            alignItems: "center",
                            gap: "14px",
                            marginBottom: "8px",
                          }}
                        >
                          <span style={{ fontSize: "28px" }}>{chapter.icon}</span>
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "2px" }}>
                              <p style={{ fontSize: "16px", fontWeight: 700, color: "#3D2B1F" }}>
                                {chapter[lang as "fr" | "en" | "ar"]}
                              </p>
                              <span
                                style={{
                                  fontSize: "10px",
                                  color: "rgba(61,43,31,0.4)",
                                  backgroundColor: "rgba(61,43,31,0.06)",
                                  padding: "2px 8px",
                                  borderRadius: "999px",
                                }}
                              >
                                {chapter[`age_${lang}` as keyof typeof chapter] as string}
                              </span>
                            </div>
                            <p
                              style={{
                                fontSize: "11px",
                                color: "rgba(61,43,31,0.5)",
                                fontStyle: "italic",
                                fontFamily: "Georgia, serif",
                              }}
                            >
                              {chapter[`tagline_${lang}` as keyof typeof chapter] as string}
                            </p>
                          </div>
                          <span style={{ marginLeft: "auto", color: "rgba(61,43,31,0.3)", fontSize: "16px" }}>›</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {/* ÉTAPE 2 — Catégories */}
                {currentStep === "categories" && selectedChapter && (
                  <>
                    <button
                      onClick={handleBackToChapters}
                      style={{
                        background: "none",
                        border: "none",
                        color: "rgba(61,43,31,0.5)",
                        fontSize: "13px",
                        cursor: "pointer",
                        marginBottom: "12px",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      ← {lang === "ar" ? "رجوع" : lang === "fr" ? "Retour" : "Back"}
                    </button>
                    <p className="text-[#E8742A] text-[10px] font-black uppercase tracking-[0.3em] mb-1">
                      {lang === "ar"
                        ? "أي مرحلة من حياتك ؟"
                        : lang === "fr"
                          ? "Quel moment de ta vie ?"
                          : "Which part of your life?"}
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center max-h-[400px] overflow-y-auto pb-2">
                      {(() => {
                        const chapter = CHAPTERS.find((ch) => ch.id === selectedChapter);
                        return chapter?.categories.map((cat) => (
                          <button
                            key={cat.id}
                            onClick={() => handleCategorySelect(cat.id)}
                            style={{
                              padding: "10px 18px",
                              borderRadius: "999px",
                              background: "rgba(61,43,31,0.06)",
                              border: "1px solid rgba(61,43,31,0.12)",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                              fontSize: "13px",
                              fontWeight: 600,
                              color: "#3D2B1F",
                              whiteSpace: "nowrap",
                            }}
                          >
                            <span>{cat.icon}</span>
                            <span>{cat[lang as "fr" | "en" | "ar"]}</span>
                          </button>
                        ));
                      })()}
                    </div>
                  </>
                )}

                {/* ÉTAPE 3 — Questions */}
                {currentStep === "questions" && selectedCategory && (
                  <>
                    <button
                      onClick={handleBackToCategories}
                      style={{
                        background: "none",
                        border: "none",
                        color: "rgba(61,43,31,0.5)",
                        fontSize: "13px",
                        cursor: "pointer",
                        marginBottom: "12px",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      ← {lang === "ar" ? "رجوع" : lang === "fr" ? "Retour" : "Back"}
                    </button>
                    <p className="text-[#E8742A] text-[10px] font-black uppercase tracking-[0.3em] mb-1">
                      {lang === "ar" ? "اختر قصتك" : lang === "fr" ? "Choisis ton histoire" : "Choose your story"}
                    </p>
                    <p
                      style={{
                        color: "#E8742A",
                        fontSize: "13px",
                        fontStyle: "italic",
                        fontFamily: "Georgia, serif",
                        marginBottom: "16px",
                      }}
                    >
                      {lang === "ar"
                        ? userName
                          ? `${userName}، احكِ لهم.`
                          : "احكِ لهم."
                        : lang === "fr"
                          ? userName
                            ? `${userName}, raconte-leur.`
                            : "Raconte-leur."
                          : userName
                            ? `${userName}, tell them.`
                            : "Tell them."}
                    </p>

                    <div ref={scrollRef} className="flex gap-4 overflow-x-auto snap-scroll pb-4 pt-2 hide-scroll">
                      {cards.map((card, idx) => {
                        const isSelected = selectedCard === idx;
                        return (
                          <button
                            key={idx}
                            onClick={() => setSelectedCard(idx)}
                            className={`snap-card shrink-0 flex flex-col justify-center items-start text-left p-5 rounded-[20px] transition-all duration-300 cursor-pointer border-none ${isSelected ? "scale-[1.02]" : ""}`}
                            style={{
                              width: "85%",
                              maxWidth: "300px",
                              background: isSelected ? "rgba(232,116,42,0.06)" : "#FFFFFF",
                              border: isSelected ? "1px solid rgba(232,116,42,0.6)" : "1px solid rgba(232,116,42,0.25)",
                              boxShadow: isSelected ? "0 4px 16px rgba(232,116,42,0.1)" : "none",
                            }}
                          >
                            <span
                              className="text-[8px] font-black uppercase tracking-widest mb-2"
                              style={{ color: isSelected ? "#E8742A" : "rgba(61,43,31,0.4)" }}
                            >
                              {lang === "ar" ? "✦ مستوى النور" : lang === "fr" ? "✦ Niveau Essence" : "✦ Level"}
                            </span>
                            <p className="text-sm font-serif leading-relaxed italic" style={{ color: "#3D2B1F" }}>
                              "{card.text}"
                            </p>
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex justify-center gap-2 mt-2 mb-4">
                      {[0, 1, 2].map((i) => (
                        <div
                          key={i}
                          className="w-2 h-2 rounded-full transition-all duration-300"
                          style={{
                            background: selectedCard === i ? "#E8742A" : "rgba(61,43,31,0.15)",
                            transform: selectedCard === i ? "scale(1.3)" : "scale(1)",
                          }}
                        />
                      ))}
                    </div>

                    {showButton && (
                      <button
                        onClick={handleRecord}
                        className="w-full py-4 rounded-full font-bold text-base transition-all hover:scale-[1.02] active:scale-[0.98] border-none cursor-pointer"
                        style={{
                          background: "linear-gradient(135deg, #E8742A, #D4621A)",
                          color: "#fff",
                          boxShadow: "0 4px 20px rgba(232,116,42,0.3)",
                        }}
                      >
                        {lang === "ar"
                          ? userName
                            ? `${userName}، احكِ لهم`
                            : "احكِ لهم"
                          : lang === "fr"
                            ? userName
                              ? `${userName}, raconte-leur`
                              : "Raconte-leur"
                            : userName
                              ? `${userName}, tell them`
                              : "Tell them"}
                      </button>
                    )}

                    {!showButton && (
                      <div className="flex justify-center">
                        <div className="w-8 h-8 border-2 border-[#E8742A]/20 border-t-[#E8742A] rounded-full animate-spin" />
                      </div>
                    )}

                    <div
                      style={{
                        width: "100%",
                        height: "1px",
                        background: "rgba(61,43,31,0.12)",
                        margin: "16px 0",
                      }}
                    />

                    <button
                      onClick={() => handleFreeModeNavigate("instant")}
                      style={{
                        width: "100%",
                        padding: "16px 20px",
                        borderRadius: "16px",
                        background: "rgba(232,116,42,0.15)",
                        border: "1px solid rgba(232,116,42,0.3)",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "14px",
                        marginBottom: "10px",
                      }}
                    >
                      <span style={{ fontSize: "24px" }}>⚡</span>
                      <div style={{ textAlign: "left" }}>
                        <p style={{ fontSize: "15px", fontWeight: 700, color: "#3D2B1F", margin: 0 }}>
                          {lang === "fr" ? "Enregistrer maintenant" : lang === "ar" ? "سجّل الآن" : "Record now"}
                        </p>
                        <p style={{ fontSize: "12px", color: "rgba(61,43,31,0.55)", margin: "2px 0 0" }}>
                          {lang === "fr"
                            ? "Sans question guidée · Instant"
                            : lang === "ar"
                              ? "بدون سؤال · آني"
                              : "No guided question · Instant"}
                        </p>
                      </div>
                    </button>

                    <button
                      onClick={() => handleFreeModeNavigate("forever")}
                      style={{
                        width: "100%",
                        padding: "16px 20px",
                        borderRadius: "16px",
                        background: "rgba(61,43,31,0.08)",
                        border: "1px solid rgba(212,175,55,0.35)",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "14px",
                      }}
                    >
                      <span style={{ fontSize: "24px" }}>✉️</span>
                      <div style={{ textAlign: "left" }}>
                        <p style={{ fontSize: "15px", fontWeight: 700, color: "#3D2B1F", margin: 0 }}>
                          {lang === "fr" ? "Message pour plus tard" : lang === "ar" ? "رسالة للمستقبل" : "Message for later"}
                        </p>
                        <p style={{ fontSize: "12px", color: "rgba(61,43,31,0.55)", margin: "2px 0 0" }}>
                          {lang === "fr"
                            ? "Livré à une date choisie · Forever"
                            : lang === "ar"
                              ? "يُسلَّم في تاريخ تختاره · للأبد"
                              : "Delivered on a chosen date · Forever"}
                        </p>
                      </div>
                    </button>
                  </>
                )}

                {sparkBalance > 0 && currentStep === "chapters" && (
                  <p className="text-[#3D2B1F]/30 text-[9px] mt-3">
                    {lang === "ar"
                      ? `لديك ${sparkBalance} شرارات`
                      : lang === "fr"
                        ? `Tu as ${sparkBalance} étincelles`
                        : `You have ${sparkBalance} sparks`}
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
