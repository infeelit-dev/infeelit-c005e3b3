import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import infeelit from "@/assets/infeelit-logo.png";

const FamilyIdentity = () => {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const prefill = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        // TODO: Re-enable redirect after UI tweaks
        // if (!user) {
        //   navigate("/welcome", { replace: true });
        //   return;
        // }
        const meta = user?.user_metadata ?? {};
        if (meta.full_name) {
          const parts = meta.full_name.split(" ");
          setFirstName(parts[0] || "");
          setLastName(parts.slice(1).join(" ") || "");
        } else {
          setFirstName(meta.first_name || meta.given_name || "");
          setLastName(meta.last_name || meta.family_name || "");
        }
      } finally {
        setInitialLoading(false);
      }
    };
    prefill();
  }, [navigate]);

  const canContinue = firstName.trim().length > 0 && lastName.trim().length > 0;

  const handleContinue = async () => {
    if (!canContinue) return;
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const displayName = `${firstName.trim()} ${lastName.trim()}`;
        await supabase
          .from("profiles")
          .update({ display_name: displayName })
          .eq("user_id", user.id);
      }
      navigate("/portrait", { replace: true });
    } catch {
      navigate("/portrait", { replace: true });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#FAF8F6" }}>
        <div className="w-8 h-8 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen relative flex flex-col items-center justify-center px-6 overflow-hidden"
      style={{ backgroundColor: "#FAF8F6" }}
    >
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
          className="text-5xl font-semibold text-center mb-4"
          style={{ fontFamily: "'Inter', sans-serif", color: "#1A3B47" }}
        >
          Tell us your name
        </h1>

        {/* Sub-heading */}
        <p
          className="text-center text-base font-medium mb-6 max-w-xs mx-auto leading-relaxed"
          style={{ color: "#1A1A1A" }}
        >
          Your circle will know you by this name. Start your legacy here.
        </p>

        {/* Input fields */}
        <div className="w-full space-y-4 mt-6 mb-8">
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="First Name"
            className="w-full px-6 py-4 rounded-full backdrop-blur-md bg-white/70 border border-gray-200 text-base font-medium outline-none transition-all focus:border-[#1A3B47] focus:shadow-[0_0_16px_-2px_hsl(25_90%_65%/0.25)] placeholder:text-gray-400"
            style={{ color: "#1A1A1A" }}
          />
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Last Name"
            className="w-full px-6 py-4 rounded-full backdrop-blur-md bg-white/70 border border-gray-200 text-base font-medium outline-none transition-all focus:border-[#1A3B47] focus:shadow-[0_0_16px_-2px_hsl(25_90%_65%/0.25)] placeholder:text-gray-400"
            style={{ color: "#1A1A1A" }}
          />
        </div>

        {/* Button */}
        <div className="flex justify-center mt-16 w-full">
          <button
            onClick={handleContinue}
            disabled={!canContinue || loading}
            className="w-[80%] px-5 py-4 rounded-full font-bold text-2xl text-center transition-all hover:scale-[1.03] active:scale-[0.97] disabled:opacity-50"
            style={{ backgroundColor: "#FF5722", color: "#1A1A1A", mixBlendMode: "multiply" }}
          >
            {loading ? "Saving..." : "Continue my story"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FamilyIdentity;
