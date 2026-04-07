import { useNavigate, useLocation } from "react-router-dom";
import infeelit from "@/assets/infeelit-logo.png";

const Welcome = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const incomingQuestion = location.state?.question as string | undefined;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gradient-canvas px-6">
      <div className="flex-1 flex flex-col items-center justify-center gap-8">
        <img
          src={infeelit}
          alt="Infeelit"
          className="w-[280px] md:w-[350px] max-w-[80vw] h-auto object-contain mx-auto"
          style={{ imageRendering: "-webkit-optimize-contrast" as any }}
        />

        {/* Question contextuelle si l'utilisateur vient d'une bulle */}
        {incomingQuestion ? (
          <div className="text-center max-w-sm space-y-3">
            <p className="text-[10px] text-[#E8742A] font-black uppercase tracking-[0.3em]">You wanted to answer</p>
            <p className="text-lg font-bold leading-snug italic" style={{ color: "#1A3B47" }}>
              "{incomingQuestion}"
            </p>
            <p className="text-sm text-[#1A1A1A]/60 pt-2">Create your account to record this memory.</p>
          </div>
        ) : (
          <div className="text-center max-w-sm space-y-3">
            <p
              className="text-xl text-primary leading-relaxed"
              style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
            >
              Some memories deserve to be felt again.
            </p>
            <p className="text-sm font-medium tracking-wide py-4" style={{ color: "#1A1A1A" }}>
              Don't write your story. Live it out loud.
            </p>
          </div>
        )}
      </div>

      <div className="w-full max-w-sm pb-12 space-y-6">
        <button
          onClick={() => navigate("/signup", { state: location.state })}
          className="w-[85%] mx-auto block py-4 rounded-full gradient-orange text-primary-foreground font-bold text-base tracking-wide transition-transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
          style={{ color: "#FFFFFF" }}
        >
          {incomingQuestion ? "Record this memory" : "Create my account"}
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
