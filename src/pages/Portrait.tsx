import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import imgGrandfather from "@/assets/grandfather.jpg";
import imgChild from "@/assets/child.jpg";
import imgMarry from "@/assets/marry.jpg";
import imgRelax from "@/assets/relax.jpg";
import imgBirth from "@/assets/birth.jpg";
import imgLove from "@/assets/love.jpg";
import imgHouse from "@/assets/house.jpg";

const Portrait = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [selections, setSelections] = useState({
    generation: "",
    audience: "",
    spark: "",
  });

  const isStepValid = () => {
    if (step === 1) return selections.generation !== "";
    if (step === 2) return selections.audience !== "";
    if (step === 3) return selections.spark !== "";
    return false;
  };

  const handleNext = async () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      saveAndNavigate();
    }
  };

  const saveAndNavigate = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { error } = await supabase
        .from("profiles")
        .update({
          generation: selections.generation,
          audience: selections.audience,
          spark: selections.spark,
        })
        .eq("user_id", user.id);

      if (error) throw error;

      navigate("/loading");
    } catch (err) {
      console.error(err);
      toast.error("Error saving your profile. Please try again.");
      setLoading(false);
    }
  };

  const Card = ({
    id,
    title,
    subtitle,
    type,
  }: {
    id: string;
    title: string;
    subtitle: string;
    type: keyof typeof selections;
  }) => {
    const isSelected = selections[type] === id;
    return (
      <button
        onClick={() => setSelections({ ...selections, [type]: id })}
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

  return (
    <div className="min-h-screen bg-[#FAF8F6] flex flex-col font-sans relative overflow-hidden">
      <style>{`
        @keyframes drift1 {
          0%   { transform: translate(0px, 0px) rotate(-12deg) scale(1); }
          25%  { transform: translate(18px, -20px) rotate(-5deg) scale(1.05); }
          50%  { transform: translate(8px, -35px) rotate(5deg) scale(0.97); }
          75%  { transform: translate(-15px, -15px) rotate(-8deg) scale(1.03); }
          100% { transform: translate(0px, 0px) rotate(-12deg) scale(1); }
        }
        @keyframes drift2 {
          0%   { transform: translate(0px, 0px) rotate(0deg) scale(1); }
          25%  { transform: translate(-20px, -25px) rotate(8deg) scale(1.06); }
          50%  { transform: translate(-35px, -10px) rotate(-5deg) scale(0.95); }
          75%  { transform: translate(-10px, 15px) rotate(10deg) scale(1.04); }
          100% { transform: translate(0px, 0px) rotate(0deg) scale(1); }
        }
        @keyframes drift3 {
          0%   { transform: translate(0px, 0px) rotate(6deg) scale(1); }
          25%  { transform: translate(25px, 20px) rotate(15deg) scale(0.96); }
          50%  { transform: translate(15px, -25px) rotate(-3deg) scale(1.07); }
          75%  { transform: translate(-20px, -10px) rotate(8deg) scale(0.98); }
          100% { transform: translate(0px, 0px) rotate(6deg) scale(1); }
        }
        @keyframes drift4 {
          0%   { transform: translate(0px, 0px) rotate(-3deg) scale(1); }
          25%  { transform: translate(-25px, 18px) rotate(-12deg) scale(1.04); }
          50%  { transform: translate(10px, 30px) rotate(5deg) scale(0.96); }
          75%  { transform: translate(22px, -12px) rotate(-7deg) scale(1.05); }
          100% { transform: translate(0px, 0px) rotate(-3deg) scale(1); }
        }
        @keyframes drift5 {
          0%   { transform: translate(0px, 0px) rotate(12deg) scale(1); }
          25%  { transform: translate(15px, -30px) rotate(20deg) scale(0.94); }
          50%  { transform: translate(-18px, -20px) rotate(8deg) scale(1.08); }
          75%  { transform: translate(-25px, 10px) rotate(15deg) scale(0.97); }
          100% { transform: translate(0px, 0px) rotate(12deg) scale(1); }
        }
        @keyframes drift6 {
          0%   { transform: translate(0px, 0px) rotate(-8deg) scale(1); }
          25%  { transform: translate(30px, 15px) rotate(-2deg) scale(1.05); }
          50%  { transform: translate(20px, -28px) rotate(-15deg) scale(0.95); }
          75%  { transform: translate(-12px, -18px) rotate(-5deg) scale(1.03); }
          100% { transform: translate(0px, 0px) rotate(-8deg) scale(1); }
        }
        @keyframes drift7 {
          0%   { transform: translate(0px, 0px) rotate(4deg) scale(1); }
          25%  { transform: translate(-22px, -22px) rotate(-3deg) scale(1.06); }
          50%  { transform: translate(-30px, 15px) rotate(10deg) scale(0.96); }
          75%  { transform: translate(10px, 25px) rotate(6deg) scale(1.04); }
          100% { transform: translate(0px, 0px) rotate(4deg) scale(1); }
        }
        .bubble-1 { animation: drift1 6s ease-in-out infinite; }
        .bubble-2 { animation: drift2 8s ease-in-out infinite; }
        .bubble-3 { animation: drift3 7s ease-in-out infinite; }
        .bubble-4 { animation: drift4 9s ease-in-out infinite; }
        .bubble-5 { animation: drift5 5.5s ease-in-out infinite; }
        .bubble-6 { animation: drift6 7.5s ease-in-out infinite; }
        .bubble-7 { animation: drift7 6.5s ease-in-out infinite; }
      `}</style>

      {/* Header bulles flottantes */}
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

      {/* Progress + Title — text-xl corrigé */}
      <div className="px-8 mt-2 text-center">
        <p className="text-[#E8742A] text-[10px] font-black uppercase tracking-[0.3em] mb-2">
          {step === 1 && "Origin — Step 1 of 3"}
          {step === 2 && "Audience — Step 2 of 3"}
          {step === 3 && "Spark — Step 3 of 3"}
        </p>

        {step === 1 && (
          <div>
            <h1 className="text-xl font-bold text-[#1A3B47]">Who is speaking today?</h1>
            <p className="text-sm text-[#1A3B47]/60 mt-1 italic">"When did your story begin?"</p>
          </div>
        )}
        {step === 2 && (
          <div>
            <h1 className="text-xl font-bold text-[#1A3B47]">Whose heart are you speaking to?</h1>
            <p className="text-sm text-[#1A3B47]/60 mt-1 italic">"Your message needs a destination."</p>
          </div>
        )}
        {step === 3 && (
          <div>
            <h1 className="text-xl font-bold text-[#1A3B47]">What brought your voice here?</h1>
            <p className="text-sm text-[#1A3B47]/60 mt-1 italic">"The spark that lit the fire."</p>
          </div>
        )}
      </div>

      {/* Cards */}
      <div className="flex-1 px-8 pt-6 overflow-y-auto pb-32">
        {step === 1 && (
          <div className="flex flex-col">
            <Card type="generation" id="Silent" title="Silent Generation" subtitle="The keepers of unseen memories." />
            <Card
              type="generation"
              id="Boomer"
              title="Baby Boomers"
              subtitle="Witnesses of the great transformation."
            />
            <Card type="generation" id="GenX" title="Generation X" subtitle="The bridge between two eras." />
            <Card type="generation" id="Millennial" title="Millennials" subtitle="Architects of a changing world." />
            <Card type="generation" id="GenZ" title="Gen Z" subtitle="Digital souls, infinite voices." />
            <Card type="generation" id="GenAlpha" title="Gen Alpha" subtitle="The first page of a new book." />
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col">
            <Card
              type="audience"
              id="Children"
              title="To those who follow"
              subtitle="My children. The ones who carry my voice forward."
            />
            <Card
              type="audience"
              id="Parents"
              title="To those who came before"
              subtitle="My parents. The voices I still want to hear."
            />
            <Card
              type="audience"
              id="Self"
              title="To my own soul"
              subtitle="I need to speak my truth before I share it."
            />
            <Card
              type="audience"
              id="All"
              title="To everyone I love"
              subtitle="Some voices are too important to keep to one heart."
            />
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col">
            <Card
              type="spark"
              id="Afraid"
              title="A voice I'm afraid to lose"
              subtitle="Someone I love is still here. Their story must never fade."
            />
            <Card
              type="spark"
              id="Presence"
              title="A presence that lives on"
              subtitle="They're gone. But their voice still lives inside me."
            />
            <Card
              type="spark"
              id="Truth"
              title="My own truth"
              subtitle="I need to hear myself speak to understand who I am."
            />
            <Card
              type="spark"
              id="Lesson"
              title="A lesson that must survive me"
              subtitle="I know something important. It deserves to be heard forever."
            />
          </div>
        )}
      </div>

      {/* Bottom button */}
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
              Preparing your journey...
            </>
          ) : step < 3 ? (
            "Continue"
          ) : (
            "Begin my story"
          )}
        </button>
      </div>
    </div>
  );
};

export default Portrait;
