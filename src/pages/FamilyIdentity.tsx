import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const FamilyIdentity = () => {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const prefill = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/welcome", { replace: true });
        return;
      }
      // Pre-fill from user metadata (Google/Apple may provide this)
      const meta = user.user_metadata || {};
      if (meta.full_name) {
        const parts = meta.full_name.split(" ");
        setFirstName(parts[0] || "");
        setLastName(parts.slice(1).join(" ") || "");
      } else {
        setFirstName(meta.first_name || meta.given_name || "");
        setLastName(meta.last_name || meta.family_name || "");
      }
      setInitialLoading(false);
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
      <div className="min-h-screen gradient-canvas flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-canvas flex flex-col px-6 pt-16">
      <h1 className="text-2xl font-bold text-center text-foreground mb-3">
        Votre identité familiale
      </h1>
      <p className="text-center text-muted-foreground text-sm mb-10 max-w-xs mx-auto leading-relaxed">
        C'est sous ce nom que vos proches vous reconnaîtront dans le cercle Infeelit.
      </p>

      {/* First name */}
      <div className="mb-4">
        <label className="text-sm font-semibold text-foreground mb-2 block">
          Prénom
        </label>
        <input
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="Votre prénom"
          className="w-full px-4 py-3 rounded-xl glass-surface text-foreground placeholder:text-muted-foreground outline-none focus:border-secondary/60 transition-colors text-base"
        />
      </div>

      {/* Last name */}
      <div className="mb-8">
        <label className="text-sm font-semibold text-foreground mb-2 block">
          Nom
        </label>
        <input
          type="text"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          placeholder="Votre nom"
          className="w-full px-4 py-3 rounded-xl glass-surface text-foreground placeholder:text-muted-foreground outline-none focus:border-secondary/60 transition-colors text-base"
        />
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Continue button */}
      <button
        onClick={handleContinue}
        disabled={!canContinue || loading}
        className="w-full py-4 rounded-full gradient-orange text-primary-foreground font-bold text-base transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 mb-8"
      >
        {loading ? "Saving..." : "Continuer"}
      </button>
    </div>
  );
};

export default FamilyIdentity;
