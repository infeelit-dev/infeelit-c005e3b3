import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const COUNTRIES = [
  { name: "Ghana", flag: "🇬🇭", code: "+233" },
  { name: "Cameroon", flag: "🇨🇲", code: "+237" },
  { name: "Niger", flag: "🇳🇪", code: "+227" },
  { name: "Ukraine", flag: "🇺🇦", code: "+380" },
  { name: "America", flag: "🇺🇸", code: "+1" },
  { name: "Canada", flag: "🇨🇦", code: "+1" },
  { name: "France", flag: "🇫🇷", code: "+33" },
  { name: "Germany", flag: "🇩🇪", code: "+49" },
  { name: "United Kingdom", flag: "🇬🇧", code: "+44" },
];

const Signup = () => {
  const navigate = useNavigate();
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[3]); // Ukraine default
  const [phone, setPhone] = useState("");
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleNext = async () => {
    setError("");
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

  return (
    <div className="min-h-screen bg-white flex flex-col px-6 pt-16">
      <h1 className="text-2xl font-bold text-center text-foreground mb-16">
        Sign Up
      </h1>

      {/* Phone input card */}
      <div className={`border rounded-xl p-4 mb-3 transition-colors ${error ? "border-secondary" : "border-border"}`}>
        {/* Country selector */}
        <button
          onClick={() => setShowCountryPicker(!showCountryPicker)}
          className="w-full text-left text-foreground font-medium text-base pb-3 border-b border-border"
        >
          {selectedCountry.name} ({selectedCountry.code})
        </button>

        {/* Phone input */}
        <input
          type="tel"
          placeholder="Phone number"
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value);
            setError("");
          }}
          className={`w-full pt-3 text-base outline-none bg-transparent placeholder:text-muted-foreground ${error ? "text-destructive placeholder:text-destructive/60" : "text-foreground"}`}
        />
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-1.5 mb-3">
          <span className="w-4 h-4 rounded-full bg-destructive text-primary-foreground flex items-center justify-center text-[10px] font-bold">!</span>
          <span className="text-destructive text-sm">{error}</span>
        </div>
      )}

      {/* Privacy text */}
      <p className="text-sm text-foreground mb-4">
        We'll call you or text you to confirm your number.{" "}
        <button className="underline font-medium">Privacy Policy</button>
      </p>

      {/* Next button */}
      <button
        onClick={handleNext}
        disabled={loading}
        className="w-full py-4 rounded-full gradient-orange text-primary-foreground font-bold text-base transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
      >
        {loading ? "Sending..." : "Next"}
      </button>

      {/* Country picker dropdown */}
      {showCountryPicker && (
        <div className="mt-8 border border-border rounded-xl overflow-hidden bg-white shadow-lg">
          {COUNTRIES.map((country) => (
            <button
              key={country.name}
              onClick={() => {
                setSelectedCountry(country);
                setShowCountryPicker(false);
              }}
              className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors hover:bg-muted/50 ${
                selectedCountry.name === country.name
                  ? "bg-secondary/10 border border-secondary rounded-lg"
                  : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{country.flag}</span>
                <span className="text-foreground font-medium">{country.name}</span>
              </div>
              <span className="text-muted-foreground">{country.code}</span>
            </button>
          ))}
        </div>
      )}

      {/* Bottom links */}
      <div className="mt-auto pb-8 flex items-center justify-center gap-1 text-sm">
        <span className="text-muted-foreground">Already have an account?</span>
        <button
          onClick={() => navigate("/welcome")}
          className="font-bold text-foreground underline underline-offset-2"
        >
          Sign in
        </button>
      </div>
    </div>
  );
};

export default Signup;
