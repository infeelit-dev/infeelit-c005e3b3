import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const COUNTRIES = [
  { name: "France", flag: "🇫🇷", code: "+33" },
  { name: "Ghana", flag: "🇬🇭", code: "+233" },
  { name: "Cameroon", flag: "🇨🇲", code: "+237" },
  { name: "Niger", flag: "🇳🇪", code: "+227" },
  { name: "Ukraine", flag: "🇺🇦", code: "+380" },
  { name: "United States", flag: "🇺🇸", code: "+1" },
  { name: "Canada", flag: "🇨🇦", code: "+1" },
  { name: "Germany", flag: "🇩🇪", code: "+49" },
  { name: "United Kingdom", flag: "🇬🇧", code: "+44" },
  { name: "Belgium", flag: "🇧🇪", code: "+32" },
  { name: "Switzerland", flag: "🇨🇭", code: "+41" },
];

const Signup = () => {
  const navigate = useNavigate();
  const [selectedCountry, setSelectedCountry] = useState<typeof COUNTRIES[0] | null>(null);
  const [phone, setPhone] = useState("");
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [phoneFocused, setPhoneFocused] = useState(false);

  // Attempt IP geolocation on mount
  useEffect(() => {
    const detectCountry = async () => {
      try {
        const res = await fetch("https://ipapi.co/json/");
        if (res.ok) {
          const data = await res.json();
          const code = data.country_calling_code; // e.g. "+33"
          const match = COUNTRIES.find((c) => c.code === code);
          if (match) {
            setSelectedCountry(match);
            return;
          }
        }
      } catch {
        // silent fail
      }
    };
    detectCountry();
  }, []);

  const handleNext = async () => {
    setError("");
    if (!selectedCountry) {
      setError("Please select your country.");
      return;
    }
    if (!phone.trim()) {
      setError("Phone number is required.");
      return;
    }

    const fullPhone = `${selectedCountry.code}${phone.replace(/\s/g, "")}`;
    setLoading(true);

    try {
      const { error: authError } = await supabase.auth.signInWithOtp({
        phone: fullPhone,
      });

      if (authError) {
        setError(authError.message);
      } else {
        navigate("/verify", { state: { phone: fullPhone } });
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const hasPhoneValue = phone.length > 0;

  return (
    <div className="min-h-screen relative flex flex-col items-center px-6 pt-16 overflow-hidden">
      {/* Subtle sunrise gradient backdrop */}
      <div className="absolute inset-0 gradient-canvas opacity-[0.12] pointer-events-none" />
      <div className="absolute inset-0 bg-white/90 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-sm flex flex-col flex-1">
        <h1 className="text-3xl font-extrabold text-center text-foreground mb-6">
          Sign Up
        </h1>
        <p className="text-center text-muted-foreground text-base font-medium mb-12 max-w-xs mx-auto leading-relaxed">
          Your mobile number is the key to your private circle.
          <br />
          We secure your account via SMS.
        </p>

        {/* Country selector — glassmorphism */}
        <button
          onClick={() => setShowCountryPicker(!showCountryPicker)}
          className={`w-full text-left rounded-2xl px-4 py-3.5 mb-3 backdrop-blur-md transition-all border ${
            error && !selectedCountry
              ? "border-destructive/60 bg-white/40"
              : "border-white/50 bg-white/30 hover:bg-white/40"
          }`}
        >
          {selectedCountry ? (
            <div className="flex items-center gap-3">
              <span className="text-xl w-7 h-7 flex items-center justify-center rounded-full bg-white/50">
                {selectedCountry.flag}
              </span>
              <span className="text-foreground font-semibold text-base">
                {selectedCountry.name}
              </span>
              <span className="text-muted-foreground text-sm ml-auto">
                {selectedCountry.code}
              </span>
            </div>
          ) : (
            <span className="text-muted-foreground text-base font-medium">Select your country</span>
          )}
        </button>

        {/* Country picker dropdown */}
        {showCountryPicker && (
          <div className="mb-3 rounded-2xl overflow-hidden backdrop-blur-lg bg-white/60 border border-white/50 shadow-lg max-h-64 overflow-y-auto">
            {COUNTRIES.map((country) => (
              <button
                key={country.name}
                onClick={() => {
                  setSelectedCountry(country);
                  setShowCountryPicker(false);
                  setError("");
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-white/50 ${
                  selectedCountry?.name === country.name
                    ? "bg-secondary/10"
                    : ""
                }`}
              >
                <span className="text-lg w-7 h-7 flex items-center justify-center rounded-full bg-white/50">
                  {country.flag}
                </span>
                <span className="text-foreground font-medium text-sm">{country.name}</span>
                <span className="text-muted-foreground text-xs ml-auto">{country.code}</span>
              </button>
            ))}
          </div>
        )}

        {/* Phone input — glassmorphism with floating label */}
        <div
          className={`relative w-full rounded-2xl px-4 py-3.5 backdrop-blur-md transition-all border ${
            phoneFocused
              ? "border-secondary/60 bg-white/40 shadow-[0_0_20px_-4px_hsl(var(--brand-orange)/0.25)]"
              : error && !phone.trim()
                ? "border-destructive/60 bg-white/40"
                : "border-white/50 bg-white/30"
          }`}
        >
          {/* Floating label */}
          <span
            className={`absolute left-4 transition-all pointer-events-none ${
              hasPhoneValue || phoneFocused
                ? "top-1.5 text-[10px] font-bold text-secondary"
                : "top-3.5 text-sm text-muted-foreground"
            }`}
          >
            Phone number
          </span>
          <input
            type="tel"
            value={phone}
            onFocus={() => setPhoneFocused(true)}
            onBlur={() => setPhoneFocused(false)}
            onChange={(e) => {
              setPhone(e.target.value);
              setError("");
            }}
            className={`w-full bg-transparent outline-none text-foreground text-base ${
              hasPhoneValue || phoneFocused ? "pt-3" : "pt-0"
            }`}
          />
        </div>

        {/* Error message */}
        {error && (
          <div className="flex items-center gap-1.5 mt-3">
            <span className="w-4 h-4 rounded-full bg-destructive text-primary-foreground flex items-center justify-center text-[10px] font-bold shrink-0">!</span>
            <span className="text-destructive text-xs">{error}</span>
          </div>
        )}

        {/* Privacy text */}
        <p className="text-[11px] text-muted-foreground mt-4 text-center leading-relaxed">
          We'll text you to confirm your number.{" "}
          <button className="underline font-medium">Privacy Policy</button>
        </p>

        {/* Next button — centered pill with glow */}
        <div className="flex justify-center mt-8">
          <button
            onClick={handleNext}
            disabled={loading}
            className="px-16 py-4 rounded-full gradient-orange text-primary-foreground font-bold text-base transition-all hover:scale-[1.03] active:scale-[0.97] disabled:opacity-50 shadow-[0_0_24px_-2px_hsl(var(--brand-orange)/0.5)] hover:shadow-[0_0_32px_0px_hsl(var(--brand-orange)/0.6)]"
          >
            {loading ? "Sending..." : "Next"}
          </button>
        </div>

        {/* Footer */}
        <div className="mt-auto pb-8 flex items-center justify-center gap-1">
          <span className="text-muted-foreground text-[11px] tracking-wide">Already have an account?</span>
          <button
            onClick={() => navigate("/welcome")}
            className="text-[11px] font-semibold text-foreground underline underline-offset-2 tracking-wide"
          >
            Sign in
          </button>
        </div>
      </div>
    </div>
  );
};

export default Signup;
