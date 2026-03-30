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

  const handleSelect = (value: string) => {
    setSelectedOption(value); // Feedback visuel instantané (Violet/Orange)

    // Délai de 400ms pour que l'utilisateur voie sa sélection avant de passer au step suivant
    setTimeout(() => {
      handleNext(value);
    }, 400);
  };

  const handleNext = async (value: string) => {
    if (!value) return;
    const newAnswers = { ...answers, [STEPS[currentStep].id]: value };
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
      {/* 1. ZONE DES BULLES (Hauteur optimisée pour éviter le scroll) */}
      <div className="relative h-[22vh] w-full pt-1 opacity-50 pointer-events-none">
        <style>{`
          @keyframes orbit-float { 0%, 100% { transform: translate(0,0); } 50% { transform: translate(15px, -20px); } }
          .o-bubble { animation: orbit-float 22s ease-in-out infinite; }
        `}</style>
        {LIFE_IMAGES.map((img, i) => (
          <div
            key={i}
            className="absolute rounded-full border border-white/60 shadow-lg overflow-hidden o-bubble bg-[#F1F5F9]"
            style={{
              width: `clamp(40px, ${7 + i}vw, 75px)`,
              height: `clamp(40px, ${7 + i}vw, 75px)`,
              top: `${5 + Math.random() * 25}%`,
              left: `${2 + i * 10}%`,
              animationDelay: `${i * -3.5}s`,
              zIndex: 10 + i,
            }}
          >
            <img src={img} className="w-full h-full object-cover grayscale-[5%]" alt="" />
          </div>
        ))}
      </div>

      {/* 2. LE QUESTIONNAIRE COMPACT */}
      <div className="px-6 flex flex-col flex-1 z-20 -mt-4 bg-[#FDFCFB]/95 backdrop-blur-3xl pt-6 rounded-t-[45px] shadow-[0_-15px_40px_-15px_rgba(0,0,0,0.1)] relative">
        <p className="text-[10px] font-black text-center text-[#F97316] uppercase tracking-[0.3em] mb-1">
          {STEPS[currentStep].stepLabel} — Step {currentStep + 1} of 3
        </p>

        <h1 className="text-2xl font-black text-center text-[#1A4D4D] mb-4 tracking-tight leading-none">
          Who is speaking today?
        </h1>

        {/* Barre de progression resserrée */}
        <div className="flex gap-1.5 justify-center mb-6">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all duration-500 ${i === currentStep ? "w-10 bg-[#F97316]" : "w-2 bg-[#1A4D4D]/10"}`}
            />
          ))}
        </div>

        <div className="flex flex-col flex-1 w-full max-w-sm mx-auto">
          <p className="text-[#1A4D4D] text-md font-bold text-center mb-5 px-4 opacity-90 leading-tight">
            {STEPS[currentStep].title}
          </p>

          {/* Liste des options (Feedback Instantané Violet & Orange) */}
          <div className="space-y-2 pb-28">
            {STEPS[currentStep].options.map((opt) => (
              <button
                key={opt.label}
                onClick={() => handleSelect(opt.label)}
                className={`w-full p-3.5 rounded-[20px] transition-all text-left border-l-[3px] border-y border-r shadow-sm ${
                  selectedOption === opt.label
                    ? "bg-[#F5F0FF] border-l-[#F97316] border-y-[#F5F0FF] border-r-[#F5F0FF] scale-[1.01]"
                    : "bg-white border-white/60 hover:border-[#F97316]/30"
                }`}
              >
                <div
                  className={`text-[11px] font-black uppercase tracking-wider ${selectedOption === opt.label ? "text-[#6B4E9B]" : "text-[#1A4D4D]"}`}
                >
                  {opt.label}
                </div>
                <div
                  className={`text-[9px] font-medium italic mt-0.5 ${selectedOption === opt.label ? "text-[#6B4E9B]/80" : "text-[#4A5568] opacity-60"}`}
                >
                  {opt.sub}
                </div>
              </button>
            ))}
          </div>

          {/* BOUTON FIXE CONTINUE (Amélioré Gris Foncé vs Orange) */}
          <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#FDFCFB] via-[#FDFCFB] to-transparent pt-10 flex flex-col items-center">
            <button
              onClick={() => handleNext(selectedOption!)}
              disabled={!selectedOption || loading}
              className={`w-full py-4 rounded-full font-black text-sm uppercase tracking-widest shadow-xl transition-all active:scale-95 ${
                selectedOption
                  ? "bg-[#F97316] text-white opacity-100"
                  : "bg-gray-300 text-white cursor-not-allowed shadow-none"
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
                className="mt-4 text-[9px] font-black text-[#1A4D4D]/30 uppercase tracking-[0.3em] hover:text-[#F97316] transition-colors"
              >
                ← Back
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Portrait;
