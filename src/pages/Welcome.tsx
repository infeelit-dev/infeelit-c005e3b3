import { useNavigate } from "react-router-dom";
import infeelit from "@/assets/infeelit-logo.jpg";

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gradient-canvas px-6">
      {/* Logo */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <img
          src={infeelit}
          alt="Infeelit"
          className="w-40 h-40 object-contain mb-4"
        />
        <h1 className="text-3xl font-bold tracking-wide text-foreground" style={{ fontFamily: "'Nunito', sans-serif" }}>
          Inf<span className="text-secondary">ee</span>lit
        </h1>
      </div>

      {/* Bottom section */}
      <div className="w-full max-w-sm pb-12 space-y-6">
        <p className="text-center text-muted-foreground font-semibold text-sm">
          Continue with
        </p>

        {/* Social buttons */}
        <div className="flex items-center justify-center gap-4">
          {[
            { icon: "🍎", label: "Apple" },
            { icon: "f", label: "Facebook" },
            { icon: "G", label: "Google" },
            { icon: "𝕏", label: "Twitter" },
          ].map((provider) => (
            <button
              key={provider.label}
              className="w-14 h-14 rounded-full bg-foreground text-primary-foreground flex items-center justify-center text-xl font-bold transition-transform hover:scale-105 active:scale-95"
              aria-label={`Sign in with ${provider.label}`}
            >
              {provider.icon}
            </button>
          ))}
        </div>

        {/* Sign up / Sign in links */}
        <div className="flex items-center justify-center gap-1 text-sm">
          <span className="text-muted-foreground">Already have an account?</span>
          <button
            onClick={() => navigate("/signup")}
            className="font-bold text-foreground underline underline-offset-2"
          >
            Sign in
          </button>
        </div>

        <button
          onClick={() => navigate("/signup")}
          className="w-full py-4 rounded-full gradient-orange text-primary-foreground font-bold text-base transition-transform hover:scale-[1.02] active:scale-[0.98]"
        >
          Sign Up
        </button>
      </div>
    </div>
  );
};

export default Welcome;
