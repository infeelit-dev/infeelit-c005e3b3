import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Lang, langLabel } from "@/lib/i18n";
import logo from "@/assets/infeelit-logo.png";
import type { Timeline } from "@/types/timeline";

interface HeaderProps {
  activeTimeline: Timeline;
  onTimelineChange: (t: Timeline) => void | Promise<void>;
}

const LANGS: Lang[] = ["en", "fr", "ar"];

const Header = ({ activeTimeline, onTimelineChange }: HeaderProps) => {
  const navigate = useNavigate();
  const { lang, setLang, t, rtl } = useLanguage();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInitial, setUserInitial] = useState("M");
  const [showLangMenu, setShowLangMenu] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
      if (session) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("display_name")
          .eq("user_id", session.user.id)
          .single();
        if (profile?.display_name) {
          setUserInitial(profile.display_name[0].toUpperCase());
        }
      }
    };
    checkSession();
  }, []);

  const tabs = [
    { id: "memories" as Timeline, label: t.memories },
    { id: "instant" as Timeline, label: t.instant },
    { id: "forever" as Timeline, label: t.forever },
  ];

  const underlineColor = (id: Timeline) => (id === "forever" ? "#38bdf8" : id === "instant" ? "#E8742A" : "#ffffff");

  return (
    <header
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: "12px",
        paddingBottom: "8px",
      }}
    >
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingLeft: "16px",
          paddingRight: "16px",
          marginBottom: "10px",
        }}
      >
        {/* ── Language selector ── */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setShowLangMenu((v) => !v)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              padding: "6px 14px",
              borderRadius: "999px",
              backgroundColor: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.25)",
              cursor: "pointer",
              backdropFilter: "blur(8px)",
              fontFamily: lang === "ar" ? "'Noto Sans Arabic', Arial, sans-serif" : "inherit",
            }}
          >
            {/* Globe icon SVG inline — no lucide import needed */}
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#fff"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
            <span style={{ color: "#fff", fontSize: "10px", fontWeight: 700, letterSpacing: "0.05em" }}>
              {langLabel[lang]}
            </span>
          </button>

          {/* Dropdown */}
          {showLangMenu && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 6px)",
                left: rtl ? "auto" : 0,
                right: rtl ? 0 : "auto",
                backgroundColor: "rgba(10,17,40,0.95)",
                backdropFilter: "blur(16px)",
                borderRadius: "14px",
                border: "1px solid rgba(255,255,255,.15)",
                overflow: "hidden",
                minWidth: "110px",
                boxShadow: "0 8px 32px rgba(0,0,0,.4)",
                zIndex: 100,
              }}
            >
              {LANGS.map((l) => (
                <button
                  key={l}
                  onClick={() => {
                    setLang(l);
                    setShowLangMenu(false);
                  }}
                  style={{
                    width: "100%",
                    padding: "10px 16px",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    backgroundColor: "transparent",
                    border: "none",
                    cursor: "pointer",
                    borderBottom: l !== "ar" ? "1px solid rgba(255,255,255,.07)" : "none",
                    backgroundColor: lang === l ? "rgba(232,116,42,.15)" : "transparent",
                    fontFamily: l === "ar" ? "'Noto Sans Arabic', Arial, sans-serif" : "inherit",
                    direction: l === "ar" ? "rtl" : "ltr",
                  }}
                >
                  <span style={{ fontSize: "16px" }}>{l === "en" ? "🇬🇧" : l === "fr" ? "🇫🇷" : "🇦🇪"}</span>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: "#fff" }}>
                    {l === "en" ? "English" : l === "fr" ? "Français" : "العربية"}
                  </span>
                  {lang === l && <span style={{ marginLeft: "auto", color: "#E8742A", fontSize: "12px" }}>✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Logo */}
        <img
          src={logo}
          alt="Infeelit"
          style={{
            height: "44px",
            width: "auto",
            maxWidth: "160px",
            filter: "drop-shadow(0 2px 12px rgba(0,0,0,0.9)) brightness(1.4) contrast(1.2)",
          }}
        />

        {/* Begin my story / Avatar */}
        {isLoggedIn ? (
          <button
            onClick={() => navigate("/treasure")}
            style={{
              width: "34px",
              height: "34px",
              borderRadius: "50%",
              backgroundColor: "#E8742A",
              border: "2px solid rgba(255,255,255,0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#fff",
              fontWeight: 900,
              fontSize: "14px",
            }}
          >
            {userInitial}
          </button>
        ) : (
          <button
            onClick={() => navigate("/welcome")}
            style={{
              padding: "6px 14px",
              borderRadius: "999px",
              background: "linear-gradient(135deg, #E8742A, #D4621A)",
              color: "#fff",
              fontSize: "10px",
              fontWeight: 800,
              letterSpacing: "0.04em",
              border: "none",
              cursor: "pointer",
              boxShadow: "0 2px 12px rgba(232,116,42,0.5)",
              whiteSpace: "nowrap",
              fontFamily: lang === "ar" ? "'Noto Sans Arabic', Arial, sans-serif" : "inherit",
            }}
          >
            {t.beginMyStory}
          </button>
        )}
      </div>

      {/* Timeline tabs */}
      <nav style={{ display: "flex", justifyContent: "center", gap: "32px" }}>
        {tabs.map((tab) => {
          const isActive = activeTimeline === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTimelineChange(tab.id)}
              style={{
                position: "relative",
                paddingBottom: "6px",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: isActive ? "#fff" : "rgba(255,255,255,0.75)",
                fontWeight: isActive ? 900 : 700,
                fontSize: isActive ? "16px" : "13px",
                letterSpacing: "0.02em",
                textShadow: "0 1px 8px rgba(0,0,0,0.9)",
                transition: "all 0.2s",
                whiteSpace: "nowrap",
                fontFamily: lang === "ar" ? "'Noto Sans Arabic', Arial, sans-serif" : "inherit",
              }}
            >
              {tab.label}
              {isActive && (
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: "2.5px",
                    borderRadius: "999px",
                    backgroundColor: underlineColor(tab.id),
                    boxShadow: `0 0 10px ${underlineColor(tab.id)}`,
                  }}
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Click outside to close lang menu */}
      {showLangMenu && (
        <div style={{ position: "fixed", inset: 0, zIndex: 99 }} onClick={() => setShowLangMenu(false)} />
      )}
    </header>
  );
};

export default Header;
