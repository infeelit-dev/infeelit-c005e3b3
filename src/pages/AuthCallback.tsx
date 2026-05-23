import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const AuthCallback = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState("Opening your space...");

  useEffect(() => {
    let cancelled = false;

    const checkProfileAndRedirect = async (userId: string) => {
      if (cancelled) return;
      setStatus("Checking your profile...");
      try {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("display_name")
          .eq("user_id", userId)
          .single();

        if (error && error.code !== "PGRST116") {
          console.error("Profile fetch error:", error);
        }

        const hasName = !!profile?.display_name && profile.display_name.trim().length > 0;

        if (cancelled) return;

        const pendingCode = localStorage.getItem("pending_circle_code");
        if (pendingCode) {
          localStorage.removeItem("pending_circle_code");
          const { data: circle } = await supabase.from("circles").select("id").eq("invite_code", pendingCode).single();

          if (circle) {
            await supabase.from("circle_members").insert({
              circle_id: circle.id,
              user_id: userId,
              role: "member",
            });
          }
          setStatus("Welcome to the family");
          navigate("/circle", { replace: true });
          return;
        }

        if (hasName) {
          setStatus("Welcome back");
          navigate("/treasure", { replace: true });
        } else {
          setStatus("Let's set up your profile...");
          navigate("/identity", { replace: true });
        }
      } catch (err) {
        console.error("Profile check failed:", err);
        if (!cancelled) navigate("/identity", { replace: true });
      }
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (cancelled) return;
      if (event === "SIGNED_IN" && session) {
        checkProfileAndRedirect(session.user.id);
      }
      if (event === "SIGNED_OUT") {
        setStatus("Link expired. Redirecting...");
        setTimeout(() => {
          if (!cancelled) navigate("/welcome", { replace: true });
        }, 1500);
      }
    });

    const initSession = async () => {
      if (cancelled) return;
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session && !cancelled) {
        checkProfileAndRedirect(session.user.id);
      }
    };
    initSession();

    const fallback = setTimeout(() => {
      if (!cancelled) {
        setStatus("Taking too long. Redirecting...");
        navigate("/welcome", { replace: true });
      }
    }, 15000);

    return () => {
      cancelled = true;
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
