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
        // Check if user already completed onboarding
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
    <div className="min-h-screen bg-white flex flex-col px-6 pt-16">
      <h1 className="text-2xl font-bold text-center text-foreground mb-16">
        Sign Up
      </h1>

      <p className="text-foreground text-base mb-2">
        Enter the code we've sent via SMS to{" "}
        <span className="font-semibold">{phone}</span>:
      </p>

      {/* OTP inputs */}
      <div className="flex gap-3 justify-center my-6" onPaste={handlePaste}>
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
            className={`w-11 h-14 text-center text-xl font-bold border-b-2 bg-transparent outline-none transition-colors ${
              error ? "border-destructive" : digit ? "border-foreground" : "border-muted-foreground/40"
            }`}
          />
        ))}
      </div>

      {error && <p className="text-destructive text-sm mb-4">{error}</p>}

      <button
        onClick={handleResend}
        className="text-sm text-foreground mb-8"
      >
        Haven't received a code?{" "}
        <span className="font-bold underline underline-offset-2">Send again</span>
      </button>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Next button */}
      <button
        onClick={handleVerify}
        disabled={loading}
        className="w-full py-4 rounded-full gradient-orange text-primary-foreground font-bold text-base transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 mb-8"
      >
        {loading ? "Verifying..." : "Next"}
      </button>
    </div>
  );
};

export default Verify;
