import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import imgGrandfather from "@/assets/grandfather.jpg";
import imgChild from "@/assets/child.jpg";
import imgMarry from "@/assets/marry.jpg";
import imgRelax from "@/assets/relax.jpg";
import imgBirth from "@/assets/birth.jpg";
import imgLove from "@/assets/love.jpg";
import imgHouse from "@/assets/house.jpg";

type SelectionKey = "generation" | "audience" | "spark";

const Portrait = () => {
  const navigate = useNavigate();
  const { t, lang, rtl } = useLanguage();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [generation, setGeneration] = useState("");
  const [audience, setAudience] = useState("");
  const [spark, setSpark] = useState("");

  const getSelection = (key: SelectionKey) => {
    if (key === "generation") return generation;
    if (key === "audience") return audience;
    return spark;
  };

  const setSelection = (key: SelectionKey, value: string) => {
    if (key === "generation") setGeneration(value);
    else if (key === "audience") setAudience(value);
    else setSpark(value);
  };

  const isStepValid = () => {
    if (step === 1) return generation !== "";
    if (step === 2) return audience !== "";
    if (step === 3) return spark !== "";
    return false;
  };

  const handleNext = async () => {
    if (step < 3) setStep(step + 1);
    else saveAndNavigate();
  };

  const saveAndNavigate = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const defaultName = user.email?.split("@")[0] || "Member";

      // UPSERT — crée la ligne si elle n'existe pas, met à jour sinon
      const { error } = await supabase.from("profiles").upsert(
        {
          user_id: user.id,
          generation,
          audience,
          spark,
          display_name: defaultName,
          onboarding_completed: true,
        } as any,
        {
          onConflict: "user_id",
        },
      );

      if (error) {
        console.error("Upsert error:", error);
        throw error;
      }
      navigate("/loading");
    } catch (err) {
      console.error(err);
      toast.error(t.portraitError);
      setLoading(false);
    }
  };

  const Card = ({ id, title, subtitle, type }: { id: string; title: string; subtitle: string; type: SelectionKey }) => {
    const isSelected = getSelection(type) === id;
    return (
      <button
        onClick={() => setSelection(type, id)}
        style={{ textAlign: rtl ? "right" : "left" }}
        className={`w-full p-4 rounded-xl text-left transition-all border-l-4 mb-3 ${
          isSelected
            ? "bg-[#6B4E9B]/10 border-[#E8742A] shadow-md"
            : "bg-white border-transparent shadow-sm hover:border-gray-200"
        }`}
      >
        <p className={`font-bold text-sm ${isSelected ? "text-[#E8742A]" : "text-[#1A3B47]"}`}>{title}</p>
        <p className="text-[11px] text-[#1A3B47]/60 leading-tight mt-1 italic">"{subtitle}"</p>
      </button>
    );
  };

  const stepLabel = step === 1 ? t.portraitStep1Label : step === 2 ? t.portraitStep2Label : t.portraitStep3Label;

  const stepTitle = step === 1 ? t.portraitStep1Title : step === 2 ? t.portraitStep2Title : t.portraitStep3Title;

  const stepSub = step === 1 ? t.portraitStep1Sub : step === 2 ? t.portraitStep2Sub : t.portraitStep3Sub;

  return (
    <div
      className="min-h-screen bg-[#FAF8F6] flex flex-col font-sans relative overflow-hidden"
      dir={rtl ? "rtl" : "ltr"}
      style={{ fontFamily: lang === "ar" ? "'Noto Sans Arabic', Arial, sans-serif" : "inherit" }}
    >
      <style>{`
        @keyframes drift1{0%{transform:translate(0,0) rotate(-12deg) scale(1);}25%{transform:translate(18px,-20px) rotate(-5deg) scale(1.05);}50%{transform:translate(8px,-35px) rotate(5deg) scale(.97);}75%{transform:translate(-15px,-15px) rotate(-8deg) scale(1.03);}100%{transform:translate(0,0) rotate(-12deg) scale(1);}}
        @keyframes drift2{0%{transform:translate(0,0) rotate(0deg) scale(1);}25%{transform:translate(-20px,-25px) rotate(8deg) scale(1.06);}50%{transform:translate(-35px,-10px) rotate(-5deg) scale(.95);}75%{transform:translate(-10px,15px) rotate(10deg) scale(1.04);}100%{transform:translate(0,0) rotate(0deg) scale(1);}}
        @keyframes drift3{0%{transform:translate(0,0) rotate(6deg) scale(1);}25%{transform:translate(25px,20px) rotate(15deg) scale(.96);}50%{transform:translate(15px,-25px) rotate(-3deg) scale(1.07);}75%{transform:translate(-20px,-10px) rotate(8deg) scale(.98);}100%{transform:translate(0,0) rotate(6deg) scale(1);}}
        @keyframes drift4{0%{transform:translate(0,0) rotate(-3deg) scale(1);}25%{transform:translate(-25px,18px) rotate(-12deg) scale(1.04);}50%{transform:translate(10px,30px) rotate(5deg) scale(.96);}75%{transform:translate(22px,-12px) rotate(-7deg) scale(1.05);}100%{transform:translate(0,0) rotate(-3deg) scale(1);}}
        @keyframes drift5{0%{transform:translate(0,0) rotate(12deg) scale(1);}25%{transform:translate(15px,-30px) rotate(20deg) scale(.94);}50%{transform:translate(-18px,-20px) rotate(8deg) scale(1.08);}75%{transform:translate(-25px,10px) rotate(15deg) scale(.97);}100%{transform:translate(0,0) rotate(12deg) scale(1);}}
        @keyframes drift6{0%{transform:translate(0,0) rotate(-8deg) scale(1);}25%{transform:translate(30px,15px) rotate(-2deg) scale(1.05);}50%{transform:translate(20px,-28px) rotate(-15deg) scale(.95);}75%{transform:translate(-12px,-18px) rotate(-5deg) scale(1.03);}100%{transform:translate(0,0) rotate(-8deg) scale(1);}}
        @keyframes drift7{0%{transform:translate(0,0) rotate(4deg) scale(1);}25%{transform:translate(-22px,-22px) rotate(-3deg) scale(1.06);}50%{transform:translate(-30px,15px) rotate(10deg) scale(.96);}75%{transform:translate(10px,25px) rotate(6deg) scale(1.04);}100%{transform:translate(0,0) rotate(4deg) scale(1);}}
        .bubble-1{animation:drift1 6s ease-in-out infinite;}
        .bubble-2{animation:drift2 8s ease-in-out infinite;}
        .bubble-3{animation:drift3 7s ease-in-out infinite;}
        .bubble-4{animation:drift4 9s ease-in-out infinite;}
        .bubble-5{animation:drift5 5.5s ease-in-out infinite;}
        .bubble-6{animation:drift6 7.5s ease-in-out infinite;}
        .bubble-7{animation:drift7 6.5s ease-in-out infinite;}
      `}</style>

      {/* Floating bubbles */}
      <div className="h-44 relative flex items-center justify-center pt-6">
        <img
          src={imgBirth}
          className="bubble-1 absolute w-10 h-10 rounded-full object-cover border-2 border-white shadow-lg grayscale sepia opacity-60"
          style={{ left: "8%", top: "10px" }}
          alt=""
        />
        <img
          src={imgHouse}
          className="bubble-6 absolute w-8 h-8 rounded-full object-cover border-2 border-white shadow-lg grayscale sepia opacity-50"
          style={{ left: "18%", top: "70px" }}
          alt=""
        />
        <img
          src={imgChild}
          className="bubble-2 absolute w-16 h-16 rounded-full object-cover border-2 border-white shadow-lg grayscale sepia opacity-70"
          style={{ left: "28%", top: "20px" }}
          alt=""
        />
        <img
          src={imgGrandfather}
          className="bubble-3 absolute rounded-full object-cover border-2 border-white shadow-lg grayscale sepia opacity-75"
          style={{ left: "42%", top: "5px", width: "72px", height: "72px" }}
          alt=""
        />
        <img
          src={imgMarry}
          className="bubble-4 absolute w-14 h-14 rounded-full object-cover border-2 border-white shadow-lg grayscale sepia opacity-65"
          style={{ left: "62%", top: "25px" }}
          alt=""
        />
        <img
          src={imgLove}
          className="bubble-7 absolute w-10 h-10 rounded-full object-cover border-2 border-white shadow-lg grayscale sepia opacity-55"
          style={{ left: "78%", top: "8px" }}
          alt=""
        />
        <img
          src={imgRelax}
          className="bubble-5 absolute w-8 h-8 rounded-full object-cover border-2 border-white shadow-lg grayscale sepia opacity-50"
          style={{ left: "88%", top: "65px" }}
          alt=""
        />
      </div>

      {/* Step header */}
      <div className="px-8 mt-2 text-center">
        <p className="text-[#E8742A] text-[10px] font-black uppercase tracking-[0.3em] mb-2">{stepLabel}</p>
        <h1 className="text-xl font-bold text-[#1A3B47]">{stepTitle}</h1>
        <p className="text-sm text-[#1A3B47]/60 mt-1 italic">"{stepSub}"</p>
      </div>

      {/* Progress bar */}
      <div className="px-8 mt-4">
        <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#E8742A] transition-all duration-500 ease-out rounded-full"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
      </div>

      {/* Cards */}
      <div className="flex-1 px-8 pt-6 overflow-y-auto pb-32">
        {step === 1 && (
          <div className="flex flex-col">
            <Card type="generation" id="Silent" title={t.genSilent} subtitle={t.genSilentSub} />
            <Card type="generation" id="Boomer" title={t.genBoomer} subtitle={t.genBoomerSub} />
            <Card type="generation" id="GenX" title={t.genX} subtitle={t.genXSub} />
            <Card type="generation" id="Millennial" title={t.genMillennial} subtitle={t.genMillennialSub} />
            <Card type="generation" id="GenZ" title={t.genZ} subtitle={t.genZSub} />
            <Card type="generation" id="GenAlpha" title={t.genAlpha} subtitle={t.genAlphaSub} />
          </div>
        )}
        {step === 2 && (
          <div className="flex flex-col">
            <Card type="audience" id="Children" title={t.audChildren} subtitle={t.audChildrenSub} />
            <Card type="audience" id="Parents" title={t.audParents} subtitle={t.audParentsSub} />
            <Card type="audience" id="Self" title={t.audSelf} subtitle={t.audSelfSub} />
            <Card type="audience" id="All" title={t.audAll} subtitle={t.audAllSub} />
          </div>
        )}
        {step === 3 && (
          <div className="flex flex-col">
            <Card type="spark" id="Afraid" title={t.sparkAfraid} subtitle={t.sparkAfraidSub} />
            <Card type="spark" id="Presence" title={t.sparkPresence} subtitle={t.sparkPresenceSub} />
            <Card type="spark" id="Truth" title={t.sparkTruth} subtitle={t.sparkTruthSub} />
            <Card type="spark" id="Lesson" title={t.sparkLesson} subtitle={t.sparkLessonSub} />
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-[#FAF8F6] via-[#FAF8F6] to-transparent z-30">
        <button
          disabled={!isStepValid() || loading}
          onClick={handleNext}
          className={`w-full py-4 rounded-full font-bold text-lg transition-all shadow-xl flex items-center justify-center ${
            isStepValid() && !loading ? "gradient-orange" : "bg-gray-300 opacity-50 cursor-not-allowed shadow-none"
          }`}
          style={{ color: "#FFFFFF" }}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              {t.portraitSaving}
            </>
          ) : step < 3 ? (
            t.portraitContinue
          ) : (
            t.portraitFinish
          )}
        </button>
      </div>
    </div>
  );
};

export default Portrait;
