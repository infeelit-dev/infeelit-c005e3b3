import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUserName } from "@/hooks/useUserName";
import { Link2, PlusCircle, Eye } from "lucide-react";

interface OnboardingChoiceProps {
  onClose: () => void;
}

const OnboardingChoice = ({ onClose }: OnboardingChoiceProps) => {
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const userName = useUserName();

  const texts = {
    title:
      lang === "ar"
        ? userName
          ? userName + "، كيف وصلت إلى هنا ؟"
          : "كيف وصلت إلى هنا ؟"
        : lang === "fr"
          ? userName
            ? userName + ", comment tu arrives ici ?"
            : "Comment tu arrives ici ?"
          : userName
            ? userName + ", how do you arrive here?"
            : "How do you arrive here?",
    card1Title: lang === "ar" ? "تلقيت دعوة" : lang === "fr" ? "J'ai reçu une invitation" : "I received an invitation",
    card1Sub: lang === "ar" ? "شخص ما ينتظرني" : lang === "fr" ? "Quelqu'un m'attend" : "Someone is waiting for me",
    card2Title:
      lang === "ar"
        ? "أريد إنشاء مساحتنا"
        : lang === "fr"
          ? "Je veux créer notre espace"
          : "I want to create our space",
    card2Sub: lang === "ar" ? "أجمع عائلتي" : lang === "fr" ? "Je rassemble ma famille" : "I'm gathering my family",
    card3Title: lang === "ar" ? "أبدأ وحدي" : lang === "fr" ? "Je commence seul" : "I start alone",
    card3Sub:
      lang === "ar"
        ? "يمكنني دعوة عائلتي لاحقاً"
        : lang === "fr"
          ? "Je pourrai inviter ma famille plus tard"
          : "I can invite my family later",
    inputPlaceholder: lang === "ar" ? "الصق الرمز هنا" : lang === "fr" ? "Colle ton code ici" : "Paste your code here",
    joinButton: lang === "ar" ? "انضمام" : lang === "fr" ? "Rejoindre" : "Join",
  };

  const handleJoinWithCode = () => {
    const code = prompt(texts.inputPlaceholder);
    if (code && code.trim()) {
      navigate("/join/" + code.trim());
    }
  };

  return (
    <div
      className="fixed inset-0 z-[300] flex flex-col items-center justify-center px-6"
      style={{ backgroundColor: "rgba(255,249,242,0.97)", backdropFilter: "blur(8px)" }}
    >
      {" "}
      <div className="w-full max-w-sm flex flex-col items-center gap-6">
        {" "}
        <p className="text-5xl">✦</p>{" "}
        <h1 className="text-xl font-bold text-center" style={{ color: "#3D2B1F", fontFamily: "Georgia, serif" }}>
          {texts.title}
        </h1>{" "}
        <div className="flex flex-col gap-3 w-full">
          {" "}
          <button
            onClick={handleJoinWithCode}
            className="w-full p-5 rounded-2xl text-left transition-all active:scale-[0.98] flex items-center gap-4"
            style={{ backgroundColor: "rgba(107,78,155,0.08)", border: "1px solid rgba(107,78,155,0.2)" }}
          >
            {" "}
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "rgba(107,78,155,0.15)" }}
            >
              <Link2 size={20} color="#6B4E9B" />
            </div>{" "}
            <div>
              {" "}
              <p className="text-sm font-bold" style={{ color: "#3D2B1F" }}>
                {texts.card1Title}
              </p>{" "}
              <p className="text-xs" style={{ color: "rgba(61,43,31,0.4)" }}>
                {texts.card1Sub}
              </p>{" "}
            </div>{" "}
          </button>
          <button
            onClick={() => navigate("/create-circle")}
            className="w-full p-5 rounded-2xl text-left transition-all active:scale-[0.98] flex items-center gap-4"
            style={{ backgroundColor: "rgba(232,116,42,0.08)", border: "1px solid rgba(232,116,42,0.2)" }}
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "rgba(232,116,42,0.15)" }}
            >
              <PlusCircle size={20} color="#E8742A" />
            </div>{" "}
            <div>
              {" "}
              <p className="text-sm font-bold" style={{ color: "#3D2B1F" }}>
                {texts.card2Title}
              </p>{" "}
              <p className="text-xs" style={{ color: "rgba(61,43,31,0.4)" }}>
                {texts.card2Sub}
              </p>{" "}
            </div>{" "}
          </button>
          <button
            onClick={() => {
              onClose();
            }}
            className="w-full p-5 rounded-2xl text-left transition-all active:scale-[0.98] flex items-center gap-4"
            style={{ backgroundColor: "rgba(61,43,31,0.04)", border: "1px solid rgba(61,43,31,0.08)" }}
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "rgba(61,43,31,0.06)" }}
            >
              <Eye size={20} color="#3D2B1F" />
            </div>{" "}
            <div>
              {" "}
              <p className="text-sm font-bold" style={{ color: "#3D2B1F" }}>
                {texts.card3Title}
              </p>{" "}
              <p className="text-xs" style={{ color: "rgba(61,43,31,0.4)" }}>
                {texts.card3Sub}
              </p>{" "}
            </div>{" "}
          </button>{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
};
export default OnboardingChoice;
