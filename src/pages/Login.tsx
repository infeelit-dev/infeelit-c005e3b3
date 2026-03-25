import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import infeelit from "@/assets/infeelit-logo.png";

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

const Login = () => {
  const navigate = useNavigate();
  const [selectedCountry, setSelectedCountry] = useState<typeof COUNTRIES[0] | null>(null);
  const [phone, setPhone] = useState("");
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [phoneFocused, setPhoneFocused] = useState(false);

  useEffect(() => {
    const detectCountry = async () => {
      try {
        const res = await fetch("https://ipapi.co/json/");
        if (res.ok) {
          const data = await res.json();
          const match = COUNTRIES.find((c) => c.code === data.country_calling_code);
          if (match) setSelectedCountry(match);
        }
      } catch {
        // silent
      }
    };
    detectCountry();
  }, []);

  const handleNext = async () => {
    setError("");
    if (!selectedCountry) { setError("Please select your country."); return; }
    if (!phone.trim()) { setError("Phone number is required."); return; }

    const fullPhone = `${selectedCountry.code}${phone.replace(/\s/g, "")}`;
    setLoading(true);
    try {
      const { error: authError } = await supabase.auth.signInWithOtp({ phone: fullPhone });
      if (authError) setError(authError.message);
      else navigate("/verify", { state: { phone: fullPhone } });
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const hasPhoneValue = phone.length > 0;

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
          className="w-[216px] md:w-[270px] h-auto object-contain mx-auto"
          style={{ imageRendering: "-webkit-optimize-contrast" as any, mixBlendMode: "multiply" }}
        />

        {/* Title */}
        <h1
          className="text-4xl font-bold text-center mt-4 mb-1"
          style={{ fontFamily: "'Montserrat', 'Inter', sans-serif", color: '#1A3B47' }}
        >
          Welcome Back
        </h1>

        {/* Sub-heading */}
        <p className="text-center text-base font-medium mb-8 max-w-xs mx-auto leading-relaxed text-foreground/80">
          Your circle is waiting for you.
          <br />
          Reconnect with your legacy.
        </p>

        {/* Country selector */}
        <button
          onClick={() => setShowCountryPicker(!showCountryPicker)}
          className={`w-full text-center rounded-full px-5 py-4 mb-3 backdrop-blur-md bg-white/80 transition-all border focus:outline-none ${
            error && !selectedCountry
              ? "border-destructive/40"
              : "border-white/40 hover:bg-white/90 focus:border-white/50 focus:shadow-[0_0_20px_-4px_hsl(var(--brand-orange)/0.2)]"
          }`}
        >
          {selectedCountry ? (
            <div className="flex items-center gap-3">
              <span className="text-xl w-8 h-8 flex items-center justify-center rounded-full bg-gray-100/80">{selectedCountry.flag}</span>
              <span className="text-foreground font-semibold text-base">{selectedCountry.name}</span>
              <span className="text-muted-foreground text-sm ml-auto">{selectedCountry.code}</span>
            </div>
          ) : (
            <span className="text-gray-500 text-base font-semibold">Select your country</span>
          )}
        </button>

        {showCountryPicker && (
          <div className="mb-3 w-full rounded-2xl overflow-hidden bg-white/90 backdrop-blur-sm border border-gray-200 shadow-lg max-h-64 overflow-y-auto">
            {COUNTRIES.map((country) => (
              <button
                key={country.name}
                onClick={() => { setSelectedCountry(country); setShowCountryPicker(false); setError(""); }}
                className={`w-full flex items-center gap-3 px-5 py-3 text-left transition-colors hover:bg-gray-50 ${
                  selectedCountry?.name === country.name ? "bg-secondary/10" : ""
                }`}
              >
                <span className="text-lg w-7 h-7 flex items-center justify-center rounded-full bg-gray-100/80">{country.flag}</span>
                <span className="text-foreground font-medium text-sm">{country.name}</span>
                <span className="text-muted-foreground text-xs ml-auto">{country.code}</span>
              </button>
            ))}
          </div>
        )}

        {/* Phone input */}
        <div
          className={`relative w-full rounded-full px-5 py-4 backdrop-blur-sm transition-all border ${
            phoneFocused
              ? "border-gray-300 bg-white/95 shadow-[0_0_24px_-2px_hsl(var(--brand-orange)/0.2)]"
              : error && !phone.trim()
                ? "border-destructive/40 bg-white/90"
                : "border-gray-300 bg-white/90"
          }`}
        >
          <span className={`absolute left-5 transition-all pointer-events-none ${
            hasPhoneValue || phoneFocused
              ? "top-1.5 text-[10px] font-bold text-secondary"
              : "top-4 text-base text-muted-foreground"
          }`}>
            Phone number
          </span>
          <input
            type="tel"
            value={phone}
            onFocus={() => setPhoneFocused(true)}
            onBlur={() => setPhoneFocused(false)}
            onChange={(e) => { setPhone(e.target.value); setError(""); }}
            className={`w-full bg-transparent outline-none text-foreground text-base ${hasPhoneValue || phoneFocused ? "pt-3" : "pt-0"}`}
          />
        </div>

        {error && (
          <div className="flex items-center gap-1.5 mt-3 pl-2 self-start">
            <span className="w-4 h-4 rounded-full bg-destructive text-primary-foreground flex items-center justify-center text-[10px] font-bold shrink-0">!</span>
            <span className="text-destructive text-xs">{error}</span>
          </div>
        )}

        {/* Log In button */}
        <div className="flex justify-center mt-8 w-full">
          <button
            onClick={handleNext}
            disabled={loading}
            className="w-full py-5 rounded-full gradient-orange text-white font-bold text-lg transition-all hover:scale-[1.03] active:scale-[0.97] disabled:opacity-50 shadow-[0_0_28px_-2px_hsl(var(--brand-orange)/0.5)] hover:shadow-[0_0_36px_0px_hsl(var(--brand-orange)/0.6)]"
          >
            {loading ? "Sending..." : "Log In"}
          </button>
        </div>

        {/* Footer */}
        <div className="mt-10 flex items-center justify-center gap-1.5">
          <span className="text-muted-foreground text-sm">New to Infeelit?</span>
          <button
            onClick={() => navigate("/signup")}
            className="text-sm font-bold text-foreground underline underline-offset-2"
          >
            Create my account
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
