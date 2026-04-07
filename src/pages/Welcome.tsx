import { useNavigate, useLocation } from "react-router-dom";
import infeelit from "@/assets/infeelit-logo.png";

const Welcome = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const incomingQuestion = location.state?.question as string | undefined;
  const context = location.state?.context as string | undefined;

  const getTitle = () => {
    if (context === "forever") return "You wanted to create a legacy";
    if (incomingQuestion) return "You wanted to answer";
    return "Some memories deserve to be felt again.";
  };

  const getSubtitle = () => {
    if (context === "forever")
      return "Create your account to send a message to the future. It will reach its destination at the right moment.";
    if (incomingQuestion) return "Create your account to record this memory and share it with your family circle.";
    return "Don't write your story. Live it out loud.";
  };

  const getCTA = () => {
    if (context === "forever") return "Create my legacy — it's free";
    if (incomingQuestion) return "Record this memory";
    return "Create my account";
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gradient-canvas px-6">
      <div className="flex-1 flex flex-col items-center justify-center gap-8">
        <img
          src={infeelit}
          alt="Infeelit"
          className="w-[280px] md:w-[350px] max-w-[80vw] h-auto object-contain mx-auto"
          style={{ imageRendering: "-webkit-optimize-contrast" as any }}
        />

        {/* Contexte émotionnel selon la bulle cliquée */}
        <div className="text-center max-w-sm space-y-3 px-4">
          {/* Badge contextuel */}
          {(incomingQuestion || context === "forever") && (
            <p
              className="text-[10px] font-black uppercase tracking-[0.3em]"
              style={{ color: context === "forever" ? "rgba(107,78,155,1)" : "#E8742A" }}
            >
              {getTitle()}
            </p>
          )}

          {/* Question ou tagline */}
          {incomingQuestion ? (
            <p className="text-lg font-bold leading-snug italic" style={{ color: "#1A3B47" }}>
              "{incomingQuestion}"
            </p>
          ) : (
            <p
              className="text-xl text-primary leading-relaxed"
              style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
            >
              Some memories deserve to be felt again.
            </p>
          )}

          {/* Sous-titre */}
          <p className="text-sm font-medium leading-relaxed pt-2" style={{ color: "#1A1A1A" }}>
            {getSubtitle()}
          </p>
        </div>
      </div>

      <div className="w-full max-w-sm pb-12 space-y-6">
        {/* CTA principal — couleur selon contexte */}
        <button
          onClick={() => navigate("/signup", { state: location.state })}
          className="w-[85%] mx-auto block py-4 rounded-full font-bold text-base tracking-wide transition-transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
          style={{
            background:
              context === "forever"
                ? "linear-gradient(135deg, #38bdf8, #6B4E9B)"
                : "linear-gradient(135deg, #E8742A, #D4621A)",
            color: "#FFFFFF",
          }}
        >
          {getCTA()}
        </button>

        <p className="text-center text-[10px] text-muted-foreground/60 px-4">
          By continuing, you agree to our <span className="underline cursor-pointer">Terms</span> and{" "}
          <span className="underline cursor-pointer">Privacy Policy</span>.
        </p>

        <div className="flex items-center justify-center gap-1 text-sm">
          <span className="text-muted-foreground">Already have an account?</span>
          <button onClick={() => navigate("/login")} className="font-bold text-foreground underline underline-offset-2">
            Log In
          </button>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
