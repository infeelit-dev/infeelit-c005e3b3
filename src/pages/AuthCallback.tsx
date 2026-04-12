import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const AuthCallback = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState("Verifying your link...");

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Supabase lit automatiquement le token dans l'URL (#access_token=...)
        // et établit la session. On attend qu'elle soit prête.
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error || !session) {
          setStatus("Link expired or invalid. Redirecting...");
          setTimeout(() => navigate("/welcome"), 2000);
          return;
        }

        const userId = session.user.id;
        setStatus("Welcome back ✦ Loading your space...");

        // Vérifie si le profil est complet
        const { data: profile } = await supabase
          .from("profiles")
          .select("display_name, generation")
          .eq("user_id", userId)
          .single();

        // Profil complet = display_name ET generation renseignés
        const profileComplete =
          profile?.display_name &&
          profile.display_name.trim().length > 0 &&
          profile?.generation &&
          profile.generation.trim().length > 0;

        if (profileComplete) {
          // Utilisateur connu → directement dans son Treasure
          navigate("/treasure", { replace: true });
        } else {
          // Nouvel utilisateur → compléter le profil
          navigate("/portrait", { replace: true });
        }
      } catch (err) {
        console.error("Auth callback error:", err);
        setStatus("Something went wrong. Redirecting...");
        setTimeout(() => navigate("/welcome"), 2000);
      }
    };

    // Petit délai pour laisser Supabase traiter le hash dans l'URL
    const timer = setTimeout(handleCallback, 500);
    return () => clearTimeout(timer);
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
      {/* Spinner */}
      <div
        style={{
          width: "48px",
          height: "48px",
          borderRadius: "50%",
          border: "3px solid rgba(232,116,42,.2)",
          borderTopColor: "#E8742A",
          animation: "spin 1s linear infinite",
        }}
      />

      {/* Logo text */}
      <p
        style={{
          fontSize: "22px",
          fontWeight: 900,
          color: "#fff",
          fontFamily: "Georgia, serif",
          letterSpacing: ".04em",
        }}
      >
        Infeelit
      </p>

      {/* Status message */}
      <p
        style={{
          fontSize: "13px",
          color: "rgba(255,255,255,.4)",
          textAlign: "center",
          maxWidth: "260px",
          lineHeight: 1.5,
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
