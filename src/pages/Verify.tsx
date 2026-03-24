import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const OTP_LENGTH = 6;

const Verify = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const phone = (location.state as { phone?: string })?.phone || "";

  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!phone) navigate("/signup", { replace: true });
  }, [phone, navigate]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError("");

    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    const newOtp = [...otp];
    text.split("").forEach((char, i) => {
      newOtp[i] = char;
    });
    setOtp(newOtp);
    const nextEmpty = newOtp.findIndex((v) => !v);
    inputRefs.current[nextEmpty === -1 ? OTP_LENGTH - 1 : nextEmpty]?.focus();
  };

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length < OTP_LENGTH) {
      setError("Please enter the full code.");
      return;
    }

    setLoading(true);
    try {
      const { error: authError } = await supabase.auth.verifyOtp({
        phone,
        token: code,
        type: "sms",
      });

      if (authError) {
        setError(authError.message);
      } else {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("display_name, onboarding_completed")
            .eq("user_id", user.id)
            .single();

          if (profile?.onboarding_completed) {
            navigate("/", { replace: true });
          } else if (profile?.display_name) {
            navigate("/portrait", { replace: true });
          } else {
            navigate("/identity", { replace: true });
          }
        }
      }
    } catch {
      setError("Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    await supabase.auth.signInWithOtp({ phone });
  };

  return (
    <div
      className="min-h-screen relative flex flex-col items-center px-6 pt-16 overflow-hidden"
      style={{ backgroundColor: "#FAF8F6" }}
    >
      {/* Ethereal corner clouds */}
      <div className="absolute -top-32 -left-32 w-[420px] h-[420px] rounded-full bg-[hsl(187_40%_82%)] opacity-[0.06] blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-[500px] h-[500px] rounded-full bg-[hsl(25_90%_65%)] opacity-[0.08] blur-[120px] pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-sm flex flex-col flex-1">
        <h1
          className="text-3xl font-bold text-center mb-6"
          style={{ fontFamily: "'Georgia', 'Times New Roman', serif", color: "hsl(var(--brand-teal))" }}
        >
          Verification
        </h1>

        <p className="text-center text-base font-medium mb-12 max-w-xs mx-auto leading-relaxed text-muted-foreground">
          We've sent a 6-digit code via SMS to
          <br />
          <span className="font-bold text-foreground">{phone}</span>
        </p>

        {/* OTP inputs — frosted glass squares */}
        <div className="flex gap-3 justify-center mb-6" onPaste={handlePaste}>
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              type="tel"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className={`w-12 h-14 text-center text-xl font-bold rounded-lg backdrop-blur-sm border outline-none transition-all bg-white/90 ${
                error
                  ? "border-destructive/50"
                  : digit
                    ? "border-secondary/40 shadow-[0_0_16px_-4px_hsl(var(--brand-orange)/0.2)]"
                    : "border-gray-300"
              } focus:border-gray-300 focus:shadow-[0_0_20px_-2px_hsl(var(--brand-orange)/0.25)]`}
            />
          ))}
        </div>

        {/* Error message */}
        {error && (
          <div className="flex items-center gap-1.5 mb-4 justify-center">
            <span className="w-4 h-4 rounded-full bg-destructive text-primary-foreground flex items-center justify-center text-[10px] font-bold shrink-0">!</span>
            <span className="text-destructive text-xs">{error}</span>
          </div>
        )}

        {/* Resend */}
        <button
          onClick={handleResend}
          className="text-sm text-muted-foreground text-center mb-8"
        >
          Haven't received a code?{" "}
          <span className="font-bold text-foreground underline underline-offset-2">Send again</span>
        </button>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Verify button */}
        <div className="flex justify-center mb-8">
          <button
            onClick={handleVerify}
            disabled={loading}
            className="px-24 py-5 rounded-full gradient-orange text-white font-bold text-lg transition-all hover:scale-[1.03] active:scale-[0.97] disabled:opacity-50 shadow-[0_0_28px_-2px_hsl(var(--brand-orange)/0.5)] hover:shadow-[0_0_36px_0px_hsl(var(--brand-orange)/0.6)]"
          >
            {loading ? "Verifying..." : "Verify"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Verify;
