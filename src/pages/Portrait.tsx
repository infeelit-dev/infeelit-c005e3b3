import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

// Import de tes 10 images réelles
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
    setSelectedOption(value); // Feedback visuel (Orange)

    // Délai de 400ms pour que l'utilisateur voit son choix avant de changer de page
    setTimeout(async () => {
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
    }, 400);
  };

  return (
    <div className="min-h-screen gradient-canvas flex flex-col overflow-hidden relative bg-[#FDFCFB]">
      {/* 1. ZONE DES BULLES RÉDUITE (Hauteur optimisée pour éviter le scroll) */}
      <div className="relative h-[22vh] w-full pt-2 opacity-60 pointer-events-none">
        <style>{`
          @keyframes orbit-float { 
            0%, 100% { transform: translate(0,0); } 
            50% { transform: translate(20px, -30px); } 
          }
          .o-bubble { animation: orbit-float 22s ease-in-out infinite; }
        `}</style>
        {LIFE_IMAGES.map((img, i) => (
          <div
            key={i}
            className="absolute rounded-full border border-white/70 shadow-lg overflow-hidden o-bubble bg-[#F1F5F9]"
            style={{
              width: `clamp(45px, ${8 + i}vw, 80px)`,
              height: `clamp(45px, ${8 + i}vw, 80px)`,
              top: `${5 + Math.random() * 30}%`,
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
      <div className="px-6 flex flex-col flex-1 z-20 -mt-4 bg-[#FDFCFB]/95 backdrop-blur-3xl pt-6 rounded-t-[45px] shadow-2xl">
        {/* Label d'étape intelligent */}
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

          {/* Liste des options sans scroll (Plus compacte) */}
          <div className="space-y-2 pb-4">
            {STEPS[currentStep].options.map((opt) => (
              <button
                key={opt.label}
                disabled={loading}
                onClick={() => handleSelect(opt.label)}
                className={`w-full p-3.5 rounded-[20px] transition-all text-left border ${
                  selectedOption === opt.label
                    ? "bg-[#F97316] border-[#F97316] shadow-lg scale-[1.02]"
                    : "bg-white border-white/60 shadow-sm"
                }`}
              >
                <div
                  className={`text-[11px] font-black uppercase tracking-wider ${selectedOption === opt.label ? "text-white" : "text-[#1A4D4D]"}`}
                >
                  {opt.label}
                </div>
                <div
                  className={`text-[9px] font-medium italic mt-0.5 ${selectedOption === opt.label ? "text-white/80" : "text-[#4A5568] opacity-60"}`}
                >
                  {opt.sub}
                </div>
              </button>
            ))}
          </div>

          {currentStep > 0 && !loading && (
            <button
              onClick={() => setCurrentStep(currentStep - 1)}
              className="mt-auto mb-6 text-[9px] font-black text-[#1A4D4D]/30 uppercase tracking-[0.3em] self-center hover:text-[#1A4D4D] transition-colors"
            >
              ← Previous
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Portrait;
