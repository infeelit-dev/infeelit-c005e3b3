import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import infeelit from "@/assets/infeelit-logo.png";

const FamilyIdentity = () => {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [firstFocused, setFirstFocused] = useState(false);
  const [lastFocused, setLastFocused] = useState(false);

  useEffect(() => {
    const prefill = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user) {
          const meta = session.user.user_metadata ?? {};
          if (meta.full_name) {
            const parts = meta.full_name.split(" ");
            setFirstName(parts[0] || "");
            setLastName(parts.slice(1).join(" ") || "");
          } else {
            setFirstName(meta.first_name || meta.given_name || "");
            setLastName(meta.last_name || meta.family_name || "");
          }
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
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        const displayName = `${firstName.trim()} ${lastName.trim()}`;
        const { error } = await (supabase as any).from("profiles").upsert(
          {
            id: session.user.id,
            user_id: session.user.id,
            display_name: displayName,
            onboarding_completed: false,
          },
          { onConflict: "user_id" },
        );
        if (error) throw error;
      }
      navigate("/portrait", { replace: true });
    } catch (err) {
      console.error("Failed to save name:", err);
      toast.error("Could not save your name. Please try again.");
      setLoading(false);
      return;
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

  const hasFirst = firstName.length > 0;
  const hasLast = lastName.length > 0;

  return (
    <div
      className="min-h-screen relative flex flex-col items-center justify-center px-6 overflow-hidden"
      style={{ backgroundColor: "#FAF8F6" }}
    >
      <div className="absolute -top-32 -left-32 w-[420px] h-[420px] rounded-full bg-[hsl(187_40%_82%)] opacity-[0.06] blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-[500px] h-[500px] rounded-full bg-[hsl(25_90%_65%)] opacity-[0.08] blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-sm flex flex-col items-center">
        <img
          src={infeelit}
          alt="Infeelit"
          className="w-[220px] h-auto object-contain mx-auto mb-8"
          style={{ imageRendering: "-webkit-optimize-contrast" as any, mixBlendMode: "multiply" }}
        />

        <h1 className="text-3xl font-semibold text-center mb-2" style={{ color: "#1A3B47" }}>
          Tell us your name
        </h1>

        <p
          className="text-center text-base font-medium mb-8 max-w-xs mx-auto leading-relaxed"
          style={{ color: "#1A1A1A" }}
        >
          Your circle will know you by this name.
          <br />
          Begin your story here.
        </p>

        <div
          className={`relative w-full rounded-full px-5 py-4 backdrop-blur-md transition-all border text-center mb-3 ${
            firstFocused ? "border-white/50 bg-white/80" : "border-white/40 bg-white/80"
          }`}
        >
          <span
            className={`absolute left-0 right-0 text-center transition-all pointer-events-none ${
              hasFirst || firstFocused
                ? "top-1.5 text-[10px] font-bold text-secondary"
                : "top-4 text-base text-muted-foreground"
            }`}
          >
            First Name
          </span>
          <input
            type="text"
            value={firstName}
            onFocus={() => setFirstFocused(true)}
            onBlur={() => setFirstFocused(false)}
            onChange={(e) => setFirstName(e.target.value)}
            className={`w-full bg-transparent outline-none text-foreground text-base text-center ${hasFirst || firstFocused ? "pt-3" : "pt-0"}`}
          />
        </div>

        <div
          className={`relative w-full rounded-full px-5 py-4 backdrop-blur-md transition-all border text-center ${
            lastFocused ? "border-white/50 bg-white/80" : "border-white/40 bg-white/80"
          }`}
        >
          <span
            className={`absolute left-0 right-0 text-center transition-all pointer-events-none ${
              hasLast || lastFocused
                ? "top-1.5 text-[10px] font-bold text-secondary"
                : "top-4 text-base text-muted-foreground"
            }`}
          >
            Last Name
          </span>
          <input
            type="text"
            value={lastName}
            onFocus={() => setLastFocused(true)}
            onBlur={() => setLastFocused(false)}
            onChange={(e) => setLastName(e.target.value)}
            className={`w-full bg-transparent outline-none text-foreground text-base text-center ${hasLast || lastFocused ? "pt-3" : "pt-0"}`}
          />
        </div>

        <div className="flex justify-center mt-10 mb-4 w-full">
          <button
            onClick={handleContinue}
            disabled={!canContinue || loading}
            className="w-[85%] px-5 py-4 rounded-full gradient-orange font-bold text-lg text-center transition-all hover:scale-[1.03] active:scale-[0.97] disabled:opacity-50"
            style={{ color: "#FFFFFF" }}
          >
            {loading ? "Saving..." : "Continue my story"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FamilyIdentity;
