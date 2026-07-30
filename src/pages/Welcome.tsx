import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import infeelit from "@/assets/infeelit-logo.png";

const Welcome = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, lang, rtl } = useLanguage();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          emailRedirectTo: "https://infeelit.com/auth/callback",
          shouldCreateUser: true,
        },
      });
      if (error) throw error;
      toast.success(t.welcomeSuccess, {
        description:
          lang === "fr"
            ? "Vérifie tes spams si tu ne vois rien"
            : lang === "ar"
              ? "تحقق من البريد العشوائي"
              : "Check your spam if you don't see it",
        duration: 8000,
      });
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gradient-canvas px-6"
      dir={rtl ? "rtl" : "ltr"}
      style={{
        fontFamily: lang === "ar" ? "'Noto Sans Arabic', Arial, sans-serif" : "inherit",
      }}
    >
      <div className="flex-1 flex flex-col items-center justify-center gap-8">
        <img
          src={infeelit}
          alt="Infeelit"
          className="w-[280px] md:w-[350px] max-w-[80vw] h-auto object-contain mx-auto"
        />
        <div className="text-center max-w-sm space-y-3 px-4">
          <p className="text-xl text-primary leading-relaxed" style={{ fontFamily: "serif" }}>
            {t.welcomeTagline}
          </p>
          <p className="text-sm font-medium leading-relaxed pt-2" style={{ color: "#1A1A1A" }}>
            {t.welcomeSubtitle}
          </p>
        </div>
      </div>

      <div className="w-full max-w-sm pb-12 space-y-6">
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder={t.welcomePlaceholder}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-[85%] mx-auto block p-4 rounded-full border border-gray-200 text-center focus:outline-none focus:ring-2 focus:ring-primary/20"
            required
            dir="ltr"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-[85%] mx-auto block py-4 rounded-full font-bold text-base tracking-wide transition-transform hover:scale-[1.02] active:scale-[0.98] shadow-lg text-white"
            style={{ background: "linear-gradient(135deg, #E8742A, #D4621A)" }}
          >
            {loading ? t.welcomeSending : t.welcomeCta}
          </button>
          <p
            style={{
              fontSize: "12px",
              color: "rgba(61,43,31,0.45)",
              textAlign: "center",
              marginTop: "16px",
              lineHeight: 1.6,
              width: "85%",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            {lang === "fr" ? (
              <>
                En rejoignant vous acceptez nos{" "}
                <a href="/terms" style={{ color: "#E8742A", textDecoration: "underline" }}>
                  Conditions d&apos;utilisation
                </a>{" "}
                et{" "}
                <a href="/privacy" style={{ color: "#E8742A", textDecoration: "underline" }}>
                  Politique de confidentialité
                </a>
              </>
            ) : lang === "ar" ? (
              <>
                بالانضمام توافق على{" "}
                <a href="/terms" style={{ color: "#E8742A", textDecoration: "underline" }}>
                  شروط الاستخدام
                </a>{" "}
                و
                <a href="/privacy" style={{ color: "#E8742A", textDecoration: "underline" }}>
                  سياسة الخصوصية
                </a>
              </>
            ) : (
              <>
                By joining you agree to our{" "}
                <a href="/terms" style={{ color: "#E8742A", textDecoration: "underline" }}>
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="/privacy" style={{ color: "#E8742A", textDecoration: "underline" }}>
                  Privacy Policy
                </a>
              </>
            )}
          </p>
        </form>
        <p className="text-center text-[10px] text-muted-foreground/60 px-4 italic">{t.welcomeFooter}</p>
      </div>
    </div>
  );
};

export default Welcome;
