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
    <div className="min-h-screen relative flex flex-col items-center px-6 pt-16 overflow-hidden" style={{ backgroundColor: "#FAFAFA" }}>
      {/* Ethereal corner clouds */}
      <div className="absolute -top-32 -left-32 w-[420px] h-[420px] rounded-full bg-[hsl(187_50%_78%)] opacity-[0.05] blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-[420px] h-[420px] rounded-full bg-[hsl(25_85%_70%)] opacity-[0.05] blur-[120px] pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-sm flex flex-col flex-1">
        <h1 className="text-3xl font-bold text-center text-foreground mb-8">
          Sign Up
        </h1>
        <p className="text-center text-muted-foreground text-xl font-medium mb-14 max-w-xs mx-auto leading-relaxed">
          Your mobile number is the key to your private circle.
          <br />
          We secure your account via SMS.
        </p>

        {/* Country selector — pill glassmorphism */}
        <button
          onClick={() => setShowCountryPicker(!showCountryPicker)}
          className={`w-full text-left rounded-full px-5 py-4 mb-3 backdrop-blur-sm transition-all border ${
            error && !selectedCountry
              ? "border-destructive/40 bg-white/70"
              : "border-gray-200 bg-white/70 hover:bg-white/80"
          }`}
        >
          {selectedCountry ? (
            <div className="flex items-center gap-3">
              <span className="text-xl w-8 h-8 flex items-center justify-center rounded-full bg-gray-100/80">
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
          <div className="mb-3 rounded-2xl overflow-hidden bg-white/90 backdrop-blur-sm border border-gray-200 shadow-lg max-h-64 overflow-y-auto">
            {COUNTRIES.map((country) => (
              <button
                key={country.name}
                onClick={() => {
                  setSelectedCountry(country);
                  setShowCountryPicker(false);
                  setError("");
                }}
                className={`w-full flex items-center gap-3 px-5 py-3 text-left transition-colors hover:bg-gray-50 ${
                  selectedCountry?.name === country.name
                    ? "bg-secondary/10"
                    : ""
                }`}
              >
                <span className="text-lg w-7 h-7 flex items-center justify-center rounded-full bg-gray-100/80">
                  {country.flag}
                </span>
                <span className="text-foreground font-medium text-sm">{country.name}</span>
                <span className="text-muted-foreground text-xs ml-auto">{country.code}</span>
              </button>
            ))}
          </div>
        )}

        {/* Phone input — pill glassmorphism with floating label */}
        <div
          className={`relative w-full rounded-full px-5 py-4 backdrop-blur-sm transition-all border ${
            phoneFocused
              ? "border-secondary/50 bg-white/80 shadow-[0_0_24px_-4px_hsl(var(--brand-orange)/0.2)]"
              : error && !phone.trim()
                ? "border-destructive/40 bg-white/70"
                : "border-gray-200 bg-white/70"
          }`}
        >
          {/* Floating label */}
          <span
            className={`absolute left-5 transition-all pointer-events-none ${
              hasPhoneValue || phoneFocused
                ? "top-1.5 text-[10px] font-bold text-secondary"
                : "top-4 text-base text-muted-foreground"
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
          <div className="flex items-center gap-1.5 mt-3 pl-2">
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
        <div className="flex justify-center mt-10">
          <button
            onClick={handleNext}
            disabled={loading}
            className="px-20 py-4.5 rounded-full gradient-orange text-primary-foreground font-bold text-base transition-all hover:scale-[1.03] active:scale-[0.97] disabled:opacity-50 shadow-[0_0_28px_-2px_hsl(var(--brand-orange)/0.5)] hover:shadow-[0_0_36px_0px_hsl(var(--brand-orange)/0.6)]"
          >
            {loading ? "Sending..." : "Next"}
          </button>
        </div>

        {/* Footer — fine & low */}
        <div className="mt-auto pb-6 flex items-center justify-center gap-1">
          <span className="text-gray-400 text-[10px] tracking-wide">Already have an account?</span>
          <button
            onClick={() => navigate("/welcome")}
            className="text-[10px] font-medium text-gray-500 underline underline-offset-2 tracking-wide"
          >
            Sign in
          </button>
        </div>
      </div>
    </div>
  );
};

export default Signup;
