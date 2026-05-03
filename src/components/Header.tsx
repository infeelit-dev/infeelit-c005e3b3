import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import logo from "@/assets/infeelit-logo.png";
import type { Timeline } from "@/types/timeline";

interface HeaderProps {
  activeTimeline: Timeline;
  onTimelineChange: (t: Timeline) => void | Promise<void>;
}

const Header = ({ activeTimeline, onTimelineChange }: HeaderProps) => {
  const navigate = useNavigate();
  const { t, lang } = useLanguage();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInitial, setUserInitial] = useState("M");

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
        {/* Left spacer — same width as right button for centering */}
        <div style={{ width: "80px" }} />

        {/* Logo — perfectly centered */}
        <img
          src={logo}
          alt="Infeelit"
          style={{
            height: "64px",
            width: "auto",
            maxWidth: "160px",
            filter: "drop-shadow(0 2px 12px rgba(0,0,0,0.9)) brightness(1.4) contrast(1.2)",
          }}
        />

        {/* Right — Begin my story or avatar */}
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
    </header>
  );
};

export default Header;
