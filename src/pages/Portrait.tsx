import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Check } from "lucide-react";

// Assets
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
      { label: "To those who follow", sub: "My children & those carrying my name." },
      { label: "To those who came before", sub: "My parents & the voices I want to find." },
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
        // REDIRECTION VERS LA PAGE LOADING
        navigate("/loading");
      } catch (error) {
        console.error("Error saving profile:", error);
        navigate("/loading");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen gradient-canvas flex flex-col overflow-hidden relative bg-[#FDFCFB]">
      <style>{`
        @keyframes orbit-float { 0%, 100% { transform: translate(0,0); } 50% { transform: translate(15px, -20px); } }
        .o-bubble { animation: orbit-float 22s ease-in-out infinite; }
        @keyframes pulse-orange { 0% { box-shadow: 0 0 0 0 rgba(232, 116, 42, 0.4); } 70% { box-shadow: 0 0 0 12px rgba(232, 116, 42, 0); } 100% { box-shadow: 0 0 0 0 rgba(232, 116, 42, 0); } }
        .pulse-active { animation: pulse-orange 2s infinite; }
      `}</style>

      {/* 1. ZONE DES BULLES COMPACTE */}
      <div className="relative h-[18vh] w-full pt-1 opacity-40 pointer-events-none">
        {LIFE_IMAGES.map((img, i) => (
          <div
            key={i}
            className="absolute rounded-full border border-white/60 shadow-sm overflow-hidden o-bubble bg-[#F1F5F9]"
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

      {/* 2. LE QUESTIONNAIRE RÉACTIF */}
      <div className="px-6 flex flex-col flex-1 z-20 -mt-4 bg-[#FDFCFB]/98 backdrop-blur-3xl pt-5 rounded-t-[40px] shadow-2xl relative">
        <p className="text-[10px] font-black text-center text-[#E8742A] uppercase tracking-[0.3em] mb-1">
          {STEPS[currentStep].stepLabel} — Step {currentStep + 1} of 3
        </p>

        <h1 className="text-2xl font-black text-center text-[#1A4D4D] mb-4 tracking-tight leading-none">
          Who is speaking today?
        </h1>

        <div className="flex gap-2 justify-center mb-5">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-[10px] rounded-full transition-all duration-500 ${i === currentStep ? "w-10 bg-[#E8742A]" : "w-[10px] bg-[#9CA3AF]/30"}`}
            />
          ))}
        </div>

        <div className="flex flex-col flex-1 w-full max-w-sm mx-auto">
          <p className="text-[#6B7280] text-[15px] font-bold text-center mb-5 leading-tight">
            {STEPS[currentStep].title}
          </p>

          <div className="space-y-2 pb-32">
            {STEPS[currentStep].options.map((opt) => (
              <button
                key={opt.label}
                onClick={() => setSelectedOption(opt.label)}
                className={`w-full min-h-[60px] px-5 py-3 rounded-[20px] transition-all text-left border-l-[4px] border-y border-r flex items-center justify-between ${
                  selectedOption === opt.label
                    ? "bg-[#F0EBF8] border-l-[#E8742A] border-y-[#F0EBF8] border-r-[#F0EBF8] shadow-md translate-x-1"
                    : "bg-white border-white/80 border-l-transparent shadow-sm active:bg-gray-50"
                }`}
              >
                <div>
                  <div
                    className={`text-[11px] font-black uppercase tracking-wider ${selectedOption === opt.label ? "text-[#4A2D7A]" : "text-[#1A4D4D]"}`}
                  >
                    {opt.label}
                  </div>
                  <div
                    className={`text-[9px] font-medium italic ${selectedOption === opt.label ? "text-[#4A2D7A]/70" : "text-[#4A5568] opacity-60"}`}
                  >
                    {opt.sub}
                  </div>
                </div>
                {selectedOption === opt.label && <Check className="w-5 h-5 text-[#E8742A]" />}
              </button>
            ))}
          </div>

          <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#FDFCFB] via-[#FDFCFB] to-transparent pt-10 flex flex-col items-center">
            <button
              onClick={handleNext}
              disabled={!selectedOption || loading}
              className={`w-full py-4 rounded-full font-black text-sm uppercase tracking-widest shadow-xl transition-all active:scale-95 ${
                selectedOption
                  ? "bg-[#E8742A] text-white opacity-100 pulse-active"
                  : "bg-[#9CA3AF] text-white cursor-not-allowed opacity-80"
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
                className="mt-4 text-[9px] font-black text-[#1A4D4D]/40 uppercase tracking-[0.2em] hover:text-[#1A4D4D]"
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
