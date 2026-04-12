import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const AuthCallback = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState("Opening your space...");

  useEffect(() => {
    // onAuthStateChange est le seul moyen fiable d'intercepter
    // le token Magic Link dans le hash de l'URL.
    // Il se déclenche automatiquement quand Supabase lit #access_token.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      // SIGNED_IN couvre à la fois Magic Link (type=magiclink) et OTP
      if (event === "SIGNED_IN" && session) {
        setStatus("Checking your profile...");

        try {
          const { data: profile } = await supabase
            .from("profiles")
            .select("display_name, generation")
            .eq("user_id", session.user.id)
            .single();

          // Un profil auto-créé par trigger aura display_name NULL ou vide
          const isComplete =
            !!profile?.display_name &&
            profile.display_name.trim().length > 0 &&
            !!profile?.generation &&
            profile.generation.trim().length > 0;

          if (isComplete) {
            setStatus("Welcome back ✦");
            navigate("/treasure", { replace: true });
          } else {
            setStatus("Let's set up your profile...");
            navigate("/portrait", { replace: true });
          }
        } catch (err) {
          console.error("Profile check failed:", err);
          navigate("/portrait", { replace: true });
        }
      }

      // Token expiré ou lien invalide
      if (event === "SIGNED_OUT") {
        setStatus("Link expired. Redirecting...");
        setTimeout(() => navigate("/welcome", { replace: true }), 1500);
      }
    });

    // Sécurité : si après 8 secondes rien ne s'est passé → welcome
    const fallback = setTimeout(() => {
      setStatus("Taking too long. Redirecting...");
      navigate("/welcome", { replace: true });
    }, 8000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(fallback);
    };
  }, [navigate]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#0E1A20",
        gap: "24px",
        padding: "24px",
      }}
    >
      <div
        style={{
          width: "52px",
          height: "52px",
          borderRadius: "50%",
          border: "3px solid rgba(232,116,42,.2)",
          borderTopColor: "#E8742A",
          animation: "spin 1s linear infinite",
        }}
      />

      <p
        style={{
          fontSize: "24px",
          fontWeight: 900,
          color: "#fff",
          fontFamily: "Georgia, serif",
          letterSpacing: ".04em",
        }}
      >
        Infeelit
      </p>

      <p
        style={{
          fontSize: "13px",
          color: "rgba(255,255,255,.4)",
          textAlign: "center",
          maxWidth: "260px",
          lineHeight: 1.6,
        }}
      >
        {status}
      </p>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default AuthCallback;
