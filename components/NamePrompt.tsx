import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import infeelit from "@/assets/infeelit-logo.png";

interface NamePromptProps {
  onComplete: () => void;
}

const NamePrompt = ({ onComplete }: NamePromptProps) => {
  const { lang } = useLanguage();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [focused, setFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed.length < 1) return;
    localStorage.setItem("infeelit_user_name", trimmed);
    onComplete();
  };

  const texts = {
    title: lang === "ar" ? "ما اسمك ؟" : lang === "fr" ? "Comment tu t'appelles ?" : "What's your name?",
    placeholder: lang === "ar" ? "اسمك الأول" : lang === "fr" ? "Ton prénom" : "Your first name",
    button: lang === "ar" ? "دخول إلى Infeelit" : lang === "fr" ? "Entrer dans Infeelit" : "Enter Infeelit",
    signin:
      lang === "ar"
        ? "عضو بالفعل؟ تسجيل الدخول"
        : lang === "fr"
          ? "Déjà membre ? Se connecter"
          : "Already a member? Sign in",
  };

  return (
    <div
      className="fixed inset-0 z-[300] flex flex-col items-center justify-center px-8"
      style={{ backgroundColor: "#FFF9F2" }}
    >
      <style>{`
        @keyframes gentleFadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .gentle-in { animation: gentleFadeIn 0.6s ease-out forwards; }
      `}</style>

      <div className="gentle-in w-full max-w-sm flex flex-col items-center gap-8">
        <img
          src={infeelit}
          alt="Infeelit"
          className="w-[180px] h-auto object-contain"
          style={{ mixBlendMode: "multiply" }}
        />

        <h1 className="text-2xl font-semibold text-center" style={{ color: "#3D2B1F", fontFamily: "Georgia, serif" }}>
          {texts.title}
        </h1>

        <form onSubmit={handleSubmit} className="w-full flex flex-col items-center gap-5">
          <div
            className={`relative w-full max-w-[280px] rounded-full px-6 py-4 transition-all border bg-white ${focused ? "border-[#E8742A] shadow-[0_0_20px_rgba(232,116,42,0.1)]" : "border-[#D4A853]/30"}`}
          >
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder={texts.placeholder}
              className="w-full bg-transparent outline-none text-[#3D2B1F] text-lg text-center font-serif"
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={name.trim().length < 1}
            className="w-full max-w-[280px] py-4 rounded-full font-bold text-base transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: "linear-gradient(135deg, #E8742A, #D4621A)",
              color: "#fff",
              boxShadow: "0 4px 20px rgba(232,116,42,0.3)",
            }}
          >
            {texts.button}
          </button>
        </form>

        <button
          onClick={() => navigate("/welcome")}
          className="text-sm underline underline-offset-2 transition-colors hover:opacity-70"
          style={{ color: "rgba(61,43,31,0.5)", background: "none", border: "none", cursor: "pointer" }}
        >
          {texts.signin}
        </button>
      </div>
    </div>
  );
};

export default NamePrompt;
