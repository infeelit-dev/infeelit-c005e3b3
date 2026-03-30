import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

// IMPORTS DE TES 10 IMAGES RÉELLES DANS ASSETS
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
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleSelect = async (value: string) => {
    const newAnswers = { ...answers, [STEPS[currentStep].id]: value };
    setAnswers(newAnswers);

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
              // On pourra ajouter d'autres colonnes dans Supabase pour audience et priority si besoin
            })
            .eq("user_id", user.id);
        }
        navigate("/feed");
      } catch (error) {
        navigate("/feed");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen gradient-canvas flex flex-col overflow-hidden relative bg-[#FDFCFB]">
      {/* 1. ZONE DES BULLES (Mouvement orbital indépendant préservé) */}
      <div className="relative h-[32vh] w-full pt-4 opacity-70 pointer-events-none">
        <style>{`
          @keyframes orbit-float { 
            0%, 100% { transform: translate(0,0); } 
            50% { transform: translate(30px, -50px); } 
          }
          .o-bubble { animation: orbit-float 20s ease-in-out infinite; }
        `}</style>
        {LIFE_IMAGES.map((img, i) => (
          <div
            key={i}
            className="absolute rounded-full border-2 border-white/80 shadow-2xl overflow-hidden o-bubble bg-[#F1F5F9]"
            style={{
              width: `clamp(55px, ${10 + i}vw, 100px)`,
              height: `clamp(55px, ${10 + i}vw, 100px)`,
              top: `${10 + Math.random() * 45}%`,
              left: `${2 + i * 10}%`,
              animationDelay: `${i * -3}s`,
              zIndex: 10 + i,
            }}
          >
            <img src={img} className="w-full h-full object-cover grayscale-[5%]" alt="" />
          </div>
        ))}
      </div>

      {/* 2. LE QUESTIONNAIRE ÉMOTIONNEL */}
      <div className="px-6 flex flex-col flex-1 z-20 -mt-6 bg-[#FDFCFB]/90 backdrop-blur-3xl pt-8 rounded-t-[50px] shadow-[0_-15px_40px_-15px_rgba(0,0,0,0.1)]">
        <h2 className="text-[10px] font-black text-center text-[#F97316] uppercase tracking-[0.4em] mb-2 opacity-60">
          Infeelit Journey
        </h2>
        <h1 className="text-3xl font-black text-center text-[#1A4D4D] mb-6 tracking-tight">Who is speaking today?</h1>

        {/* Barre de progression */}
        <div className="flex gap-2 justify-center mb-8">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i === currentStep ? "w-12 bg-[#F97316]" : "w-3 bg-[#1A4D4D]/10"
              }`}
            />
          ))}
        </div>

        {/* Question et Options */}
        <div className="flex flex-col flex-1 max-w-md mx-auto w-full">
          <p className="text-[#1A4D4D] text-lg font-bold text-center mb-8 px-4">{STEPS[currentStep].title}</p>

          <div className="space-y-3 pb-8">
            {STEPS[currentStep].options.map((opt) => (
              <button
                key={opt.label}
                onClick={() => handleSelect(opt.label)}
                disabled={loading}
                className="w-full p-5 rounded-[24px] bg-white border border-white/60 shadow-sm hover:shadow-md hover:border-[#F97316]/40 hover:bg-white transition-all text-left group active:scale-[0.98] disabled:opacity-50"
              >
                <div className="text-[12px] font-black text-[#1A4D4D] group-hover:text-[#F97316] transition-colors uppercase tracking-widest">
                  {opt.label}
                </div>
                <div className="text-[10px] text-[#4A5568] opacity-60 font-medium italic mt-1">{opt.sub}</div>
              </button>
            ))}
          </div>

          <div className="mt-auto pb-8 flex justify-center">
            {currentStep > 0 && (
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                className="text-[10px] font-black text-[#1A4D4D]/30 uppercase tracking-[0.3em] hover:text-[#1A4D4D] transition-colors"
              >
                ← Previous
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Portrait;
