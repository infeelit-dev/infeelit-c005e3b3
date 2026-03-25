import { useNavigate } from "react-router-dom";
import infeelit from "@/assets/infeelit-logo.png";

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gradient-canvas px-6">
      {/* Logo & Mantra */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6">
        <img
          src={infeelit}
          alt="Infeelit"
          className="w-36 h-36 object-contain rounded-2xl"
          
        />

        <div className="text-center max-w-sm space-y-2">
          <p
            className="text-xl text-foreground/90 leading-relaxed"
            style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
          >
            Some memories deserve to be felt again.
          </p>
          <p className="text-sm font-semibold text-foreground/70 tracking-wide">
            Capture them. Share them. Keep them alive.
          </p>
        </div>
      </div>

      {/* Bottom section */}
      <div className="w-full max-w-sm pb-12 space-y-8">
        {/* Primary CTA — Phone */}
        <button
          onClick={() => navigate("/signup")}
          className="w-full py-4 rounded-full gradient-orange text-primary-foreground font-bold text-base tracking-wide transition-transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
        >
          Create my account
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-foreground/15" />
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-widest">
            or continue with
          </span>
          <div className="flex-1 h-px bg-foreground/15" />
        </div>

        {/* Social buttons — minimalist frosted glass circles */}
        <div className="flex items-center justify-center gap-5">
          {[
            {
              label: "Apple",
              svg: (
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-foreground">
                  <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C3.79 16.17 4.36 9.94 8.9 9.69c1.23.07 2.08.72 2.8.77.98-.2 1.92-.77 2.98-.7 1.27.1 2.22.6 2.84 1.53-2.6 1.56-1.98 4.98.42 5.94-.5 1.3-.74 1.9-1.89 3.05ZM12.05 9.6c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25Z" />
                </svg>
              ),
            },
            {
              label: "Google",
              svg: (
                <svg viewBox="0 0 24 24" className="w-5 h-5">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84Z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53Z" />
                </svg>
              ),
            },
          ].map((provider) => (
            <button
              key={provider.label}
              className="w-14 h-14 rounded-full bg-white/15 backdrop-blur-md border border-white/40 flex items-center justify-center transition-all hover:scale-110 hover:bg-white/25 active:scale-95"
              aria-label={`Sign in with ${provider.label}`}
            >
              {provider.svg}
            </button>
          ))}
        </div>

        {/* Sign in link */}
        <div className="flex items-center justify-center gap-1 text-sm">
          <span className="text-muted-foreground">Already have an account?</span>
          <button
            onClick={() => navigate("/login")}
            className="font-bold text-foreground underline underline-offset-2"
          >
            Log In
          </button>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
