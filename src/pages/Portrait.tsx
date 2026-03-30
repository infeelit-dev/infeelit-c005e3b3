import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

// Tes 10 images réelles
import imgRelax from "@/assets/relax.jpg";
import imgTravel from "@/assets/travel.jpg";
import imgPicnic from "@/assets/picnic.jpg";
import imgGrandfather from "@/assets/grandfather.jpg";
import imgHouse from "@/assets/house.jpg";
import imgMarry from "@/assets/marry.jpg";
import imgLove from "@/assets/love.jpg";
import imgGraduate from "@/assets/graduate.jpg";
import imgChild from "@/assets/child.jpg";
import imgBirth from "@/assets/birth.jpg";

const LIFE_IMAGES = [
  imgBirth,
  imgChild,
  imgGraduate,
  imgMarry,
  imgHouse,
  imgLove,
  imgGrandfather,
  imgPicnic,
  imgTravel,
  imgRelax,
];

const STEPS = [
  {
    id: "era",
    stepLabel: "Origin",
    title: "When did your story begin?",
    options: [
      { label: "Silent Generation", sub: "The keepers of unseen memories." },
      { label: "Baby Boomers", sub: "Witnesses of the great transformation." },
      { label: "Generation X", sub: "The bridge between two eras." },
      { label: "Millennials", sub: "Architects of a changing world." },
      { label: "Gen Z", sub: "Digital souls, infinite voices." },
      { label: "Gen Alpha", sub: "The first page of a new book." },
    ],
  },
  {
    id: "audience",
    stepLabel: "Audience",
    title: "Who are you writing for?",
    options: [
      { label: "To those who follow", sub: "My children & the ones carrying my name." },
      { label: "To those who came before", sub: "My parents & the voices I want to find again." },
      { label: "To my own soul", sub: "I need to understand my path." },
      { label: "To everyone I love", sub: "My story belongs to the world." },
    ],
  },
  {
    id: "priority",
    stepLabel: "Priority",
    title: "What is your heart's priority?",
    options: [
      { label: "A voice I'm afraid to lose", sub: "Capture a story before it fades." },
      { label: "A legacy already gone", sub: "Bring back the ones who live inside me." },
      { label: "My own truth", sub: "Decipher who I am and where I come from." },
      { label: "A lesson to pass on", sub: "I know something that must survive me." },
    ],
  },
];

const Portrait = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleNext = async () => {
    if (!selectedOption) return;

    const newAnswers = { ...answers, [STEPS[currentStep].id]: selectedOption };
    setAnswers(newAnswers);
    setSelectedOption(null);

    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setLoading(true);
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          await supabase
            .from("profiles")
            .update({
              generation: newAnswers.era,
              onboarding_completed: true,
            })
            .eq("user_id", user.id);
        }
        navigate("/feed");
      } catch {
        navigate("/feed");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen gradient-canvas flex flex-col overflow-hidden relative bg-[#FDFCFB]">
      {/* 1. ZONE DES BULLES COMPACTE (20vh) */}
      <div className="relative h-[18vh] w-full pt-1 opacity-40 pointer-events-none">
        <style>{`
          @keyframes orbit-float { 0%, 100% { transform: translate(0,0); } 50% { transform: translate(15px, -20px); } }
          .o-bubble { animation: orbit-float 22s ease-in-out infinite; }
        `}</style>
        {LIFE_IMAGES.map((img, i) => (
          <div
            key={i}
            className="absolute rounded-full border border-white/40 shadow-sm overflow-hidden o-bubble bg-[#F1F5F9]"
            style={{
              width: `clamp(40px, ${7 + i}vw, 70px)`,
              height: `clamp(40px, ${7 + i}vw, 70px)`,
              top: `${2 + Math.random() * 20}%`,
              left: `${2 + i * 10}%`,
              animationDelay: `${i * -3.5}s`,
              zIndex: 10 + i,
            }}
          >
            <img src={img} className="w-full h-full object-cover grayscale-[15%]" alt="" />
          </div>
        ))}
      </div>

      {/* 2. LE QUESTIONNAIRE COMPACT */}
      <div className="px-6 flex flex-col flex-1 z-20 -mt-4 bg-[#FDFCFB]/98 backdrop-blur-3xl pt-5 rounded-t-[40px] shadow-2xl relative">
        <p className="text-[9px] font-black text-center text-[#F97316] uppercase tracking-[0.3em] mb-1">
          {STEPS[currentStep].stepLabel} — Step {currentStep + 1} of 3
        </p>

        <h1 className="text-2xl font-black text-center text-[#1A4D4D] mb-4 tracking-tight leading-none">
          Who is speaking today?
        </h1>

        {/* Barre de progression */}
        <div className="flex gap-1 justify-center mb-4">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all duration-500 ${i === currentStep ? "w-8 bg-[#F97316]" : "w-2 bg-[#1A4D4D]/10"}`}
            />
          ))}
        </div>

        <div className="flex flex-col flex-1 w-full max-w-sm mx-auto">
          <p className="text-[#1A4D4D] text-[15px] font-bold text-center mb-4 opacity-80 leading-tight">
            {STEPS[currentStep].title}
          </p>

          {/* Liste des options (Padding 12px / État Violet & Orange) */}
          <div className="space-y-1.5 pb-32">
            {STEPS[currentStep].options.map((opt) => (
              <button
                key={opt.label}
                onClick={() => setSelectedOption(opt.label)}
                className={`w-full p-3 px-4 rounded-[16px] transition-all text-left border-l-[4px] border-y border-r ${
                  selectedOption === opt.label
                    ? "bg-[#6B4E9B] border-l-[#F97316] border-[#6B4E9B] shadow-lg translate-x-1"
                    : "bg-white border-white/60 border-l-transparent shadow-sm"
                }`}
              >
                <div
                  className={`text-[11px] font-black uppercase tracking-wider ${selectedOption === opt.label ? "text-white" : "text-[#1A4D4D]"}`}
                >
                  {opt.label}
                </div>
                <div
                  className={`text-[9px] font-medium italic ${selectedOption === opt.label ? "text-white/70" : "text-[#4A5568] opacity-60"}`}
                >
                  {opt.sub}
                </div>
              </button>
            ))}
          </div>

          {/* BOUTON FIXE CONTINUE */}
          <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#FDFCFB] via-[#FDFCFB] to-transparent pt-10 flex flex-col items-center">
            <button
              onClick={handleNext}
              disabled={!selectedOption || loading}
              className={`w-full py-4 rounded-full font-black text-sm uppercase tracking-widest shadow-xl transition-all active:scale-95 ${
                selectedOption
                  ? "bg-[#F97316] text-white opacity-100"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
              }`}
            >
              {loading ? "Saving..." : "Continue →"}
            </button>

            {currentStep > 0 && !loading && (
              <button
                onClick={() => {
                  setCurrentStep(currentStep - 1);
                  setSelectedOption(null);
                }}
                className="mt-4 text-[9px] font-black text-[#1A4D4D]/30 uppercase tracking-[0.2em] hover:text-[#1A4D4D]"
              >
                ← Previous step
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Portrait;
