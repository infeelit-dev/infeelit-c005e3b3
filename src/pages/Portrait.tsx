import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Portrait = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // User selections state
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
        .eq("id", user.id);

      if (error) throw error;

      navigate("/loading");
    } catch (err) {
      console.error(err);
      toast.error("Error saving your portrait selections.");
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
        className={`w-full p-4 rounded-xl text-left transition-all border-l-4 mb-3 animate-in fade-in slide-in-from-bottom-2 duration-300 ${
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
      {/* DECORATIVE HEADER: Noir & Blanc / Sepia Portrait Bubbles */}
      <div className="h-40 relative flex items-center justify-center gap-4 px-6 pt-8 opacity-40 grayscale">
        <img
          src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120"
          className="w-12 h-12 rounded-full object-cover -rotate-12 border-2 border-white shadow-lg"
          alt=""
        />
        <img
          src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&h=150"
          className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-lg"
          alt=""
        />
        <img
          src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=130&h=130"
          className="w-14 h-14 rounded-full object-cover rotate-6 border-2 border-white shadow-lg"
          alt=""
        />
      </div>

      {/* TITLES & PROGRESS */}
      <div className="px-8 mt-4 text-center">
        <p className="text-[#E8742A] text-[10px] font-black uppercase tracking-[0.3em] mb-2">
          Portrait Step {step} of 3
        </p>

        {step === 1 && (
          <div className="animate-in fade-in duration-500">
            <h1 className="text-2xl font-bold text-[#1A3B47]">Who is speaking today?</h1>
            <p className="text-sm text-[#1A3B47]/60 mt-1 italic">"When did your story begin?"</p>
          </div>
        )}
        {step === 2 && (
          <div className="animate-in fade-in duration-500">
            <h1 className="text-2xl font-bold text-[#1A3B47]">Whose heart are you speaking to?</h1>
            <p className="text-sm text-[#1A3B47]/60 mt-1 italic">"Your message needs a destination."</p>
          </div>
        )}
        {step === 3 && (
          <div className="animate-in fade-in duration-500">
            <h1 className="text-2xl font-bold text-[#1A3B47]">What brought your voice here?</h1>
            <p className="text-sm text-[#1A3B47]/60 mt-1 italic">"The spark that lit the fire."</p>
          </div>
        )}
      </div>

      {/* SELECTION LIST */}
      <div className="flex-1 px-8 pt-8 overflow-y-auto pb-32">
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

      {/* BOTTOM ACTION BUTTON */}
      <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-[#FAF8F6] via-[#FAF8F6] to-transparent z-30">
        <button
          disabled={!isStepValid() || loading}
          onClick={handleNext}
          className={`w-full py-4 rounded-full font-bold text-lg transition-all shadow-xl flex items-center justify-center ${
            isStepValid() && !loading
              ? "gradient-orange scale-100 opacity-100"
              : "bg-gray-300 text-white scale-95 opacity-50 cursor-not-allowed shadow-none"
          }`}
          style={isStepValid() && !loading ? { color: "#FFFFFF" } : {}}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Preparing your journey...
            </>
          ) : (
            "Continue"
          )}
        </button>
      </div>
    </div>
  );
};

export default Portrait;
