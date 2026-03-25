import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import infeelit from "@/assets/infeelit-logo.png";

const OTP_LENGTH = 6;

const Verify = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const phone = (location.state as { phone?: string })?.phone || "";

  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // TODO: Re-enable redirect after UI tweaks
  // useEffect(() => {
  //   if (!phone) navigate("/signup", { replace: true });
  // }, [phone, navigate]);

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
    <div className="min-h-screen relative flex flex-col items-center justify-center px-6 overflow-hidden" style={{ backgroundColor: "#FAF8F6" }}>
      {/* Ethereal corner clouds */}
      <div className="absolute -top-32 -left-32 w-[420px] h-[420px] rounded-full bg-[hsl(187_40%_82%)] opacity-[0.06] blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-[500px] h-[500px] rounded-full bg-[hsl(25_90%_65%)] opacity-[0.08] blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-sm flex flex-col items-center">
        {/* Logo */}
        <img
          src={infeelit}
          alt="Infeelit"
          className="w-[875px] max-w-[90vw] h-auto object-contain mx-auto mb-10"
          style={{ imageRendering: "-webkit-optimize-contrast" as any, mixBlendMode: "multiply" }}
        />

        {/* Title */}
        <h1
          className="text-4xl font-semibold text-center mb-4"
          style={{ fontFamily: "'Inter', sans-serif", color: '#1A3B47' }}
        >
          Secure Access
        </h1>

        {/* Sub-heading */}
        <p className="text-center text-base font-medium mb-10 max-w-xs mx-auto leading-relaxed" style={{ color: '#1A1A1A' }}>
          Enter the 6-digit code sent to your phone
        </p>

        {/* OTP inputs — frosted glass boxes */}
        <div className="w-full max-w-[100vw] px-4 my-10 mx-auto">
          <div className="flex w-full gap-2" onPaste={handlePaste}>
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
                className={`flex-1 min-w-0 aspect-square text-center text-2xl font-bold rounded-full backdrop-blur-md border outline-none transition-all bg-white/70 ${
                  error
                    ? "border-destructive/50"
                    : digit
                      ? "border-[#1A3B47] shadow-[0_0_16px_-4px_hsl(var(--brand-orange)/0.2)]"
                      : "border-gray-200"
                } focus:border-[#1A3B47] focus:shadow-[0_0_20px_-2px_hsl(var(--brand-orange)/0.25)]`}
              />
            ))}
          </div>
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

        {/* Verify button */}
        <div className="flex justify-center mt-16 mb-4 w-full">
          <button
            onClick={handleVerify}
            disabled={loading}
            className="w-[80%] px-5 py-4 rounded-full gradient-orange font-bold text-2xl text-center transition-all hover:scale-[1.03] active:scale-[0.97] disabled:opacity-50 shadow-[0_0_28px_-2px_hsl(var(--brand-orange)/0.5)] hover:shadow-[0_0_36px_0px_hsl(var(--brand-orange)/0.6)]"
            style={{ color: '#1A1A1A' }}
          >
            {loading ? "Verifying..." : "Access my memories"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Verify;
