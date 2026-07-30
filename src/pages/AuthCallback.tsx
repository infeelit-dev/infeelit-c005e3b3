import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";

const AuthCallback = () => {
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const [status, setStatus] = useState("Opening your space...");
  const [linkExpired, setLinkExpired] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const searchParams = new URLSearchParams(window.location.search);
    const errorDescription =
      hashParams.get("error_description") ||
      searchParams.get("error_description") ||
      hashParams.get("error") ||
      searchParams.get("error") ||
      "";
    const errorCode = hashParams.get("error_code") || searchParams.get("error_code") || "";

    const isExpiredLink =
      hashParams.get("error") === "access_denied" ||
      searchParams.get("error") === "access_denied" ||
      errorCode === "otp_expired" ||
      /expired|invalid|otp/i.test(errorDescription);

    if (isExpiredLink) {
      setLinkExpired(true);
      return;
    }

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

        const pendingMemory = localStorage.getItem("pending_memory");
        if (pendingMemory) {
          try {
            const pending = JSON.parse(pendingMemory);
            const age = Date.now() - (pending.timestamp || 0);
            // Only restore if less than 30 minutes old
            // Keep pending_memory in storage so Record can restore the blob and auto-publish
            if (age < 30 * 60 * 1000) {
              navigate(
                pending.recordMode ? `/record?mode=${pending.recordMode}` : "/record",
                {
                  state: {
                    pendingRestore: true,
                    pendingAutoPublish: !!(pending.blobDataUrl || pending.hasIndexedBlob),
                    preSelectedQuestion: pending.question_fr
                      ? {
                          fr: pending.question_fr,
                          en: pending.question_en,
                          ar: pending.question_ar,
                        }
                      : null,
                    pendingTitle: pending.title || null,
                    pendingVisibility: pending.visibility || null,
                  },
                  replace: true,
                },
              );
              return;
            }
            localStorage.removeItem("pending_memory");
          } catch {
            localStorage.removeItem("pending_memory");
          }
        }

        const pendingCode = localStorage.getItem("pending_circle_code");
        if (pendingCode) {
          localStorage.removeItem("pending_circle_code");
          const { data: circle } = await supabase
            .rpc("lookup_circle_by_invite_code", { _code: pendingCode })
            .single<{ id: string; name: string; member_count: number }>();

          if (circle) {
            await supabase.from("circle_members").insert({
              circle_id: circle.id,
              user_id: userId,
              role: "member",
            });
          }
          setStatus("Welcome to the family");
          navigate("/circles", { replace: true });
          return;
        }

        if (hasName) {
          setStatus("Welcome back");
          navigate("/", { replace: true });
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
        setLinkExpired(true);
      }
    });

    const initSession = async () => {
      if (cancelled) return;
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (
        error?.message?.includes("expired") ||
        error?.message?.includes("invalid")
      ) {
        if (!cancelled) setLinkExpired(true);
        return;
      }

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

  if (linkExpired) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0f0501",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          textAlign: "center",
        }}
      >
        <p style={{ fontSize: "48px", marginBottom: "16px" }}>✦</p>
        <h2
          style={{
            color: "#fff",
            fontSize: "20px",
            fontFamily: "Georgia, serif",
            fontStyle: "italic",
            marginBottom: "12px",
          }}
        >
          {lang === "fr"
            ? "Ce lien a expiré."
            : lang === "ar"
              ? "انتهت صلاحية هذا الرابط."
              : "This link has expired."}
        </h2>
        <p
          style={{
            color: "rgba(255,255,255,0.5)",
            fontSize: "14px",
            marginBottom: "32px",
            lineHeight: 1.6,
            whiteSpace: "pre-line",
          }}
        >
          {lang === "fr"
            ? "Les liens magiques expirent après 24 heures.\nDemandes-en un nouveau."
            : lang === "ar"
              ? "تنتهي صلاحية الروابط السحرية بعد 24 ساعة.\nاطلب رابطاً جديداً."
              : "Magic links expire after 24 hours.\nRequest a new one."}
        </p>
        <button
          onClick={() => navigate("/welcome")}
          style={{
            padding: "16px 32px",
            borderRadius: "999px",
            background: "linear-gradient(135deg, #E8742A, #D4621A)",
            color: "#fff",
            fontWeight: 700,
            fontSize: "16px",
            border: "none",
            cursor: "pointer",
            boxShadow: "0 4px 20px rgba(232,116,42,0.4)",
          }}
        >
          {lang === "fr"
            ? "Demander un nouveau lien ✦"
            : lang === "ar"
              ? "طلب رابط جديد ✦"
              : "Get a new link ✦"}
        </button>
      </div>
    );
  }

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
