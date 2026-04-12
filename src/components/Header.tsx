import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Globe } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import logo from "@/assets/infeelit-logo.png";
import type { Timeline } from "@/types/timeline";

interface HeaderProps {
  activeTimeline: Timeline;
  onTimelineChange: (t: Timeline) => void | Promise<void>;
}

const tabs: { id: Timeline; label: string }[] = [
  { id: "memories", label: "Memories" },
  { id: "instant", label: "Instant" },
  { id: "forever", label: "Forever" },
];

const Header = ({ activeTimeline, onTimelineChange }: HeaderProps) => {
  const navigate = useNavigate();
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
        {/* Globe */}
        <button
          onClick={() => toast("FR / EN / AR — Coming this week 🌍")}
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
          }}
        >
          <Globe size={13} color="#FFFFFF" />
          <span
            style={{
              color: "#FFFFFF",
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: "0.05em",
            }}
          >
            EN
          </span>
        </button>

        {/* Logo */}
        <img
          src={logo}
          alt="Infeelit"
          style={{
            height: "44px",
            width: "auto",
            maxWidth: "160px",
            opacity: 1,
            display: "block",
            filter: "drop-shadow(0 2px 12px rgba(0,0,0,0.9)) brightness(1.4) contrast(1.2)",
          }}
        />

        {/* Begin my story ou avatar */}
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
              color: "#FFFFFF",
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
              color: "#FFFFFF",
              fontSize: "10px",
              fontWeight: 800,
              letterSpacing: "0.04em",
              border: "none",
              cursor: "pointer",
              boxShadow: "0 2px 12px rgba(232,116,42,0.5)",
              whiteSpace: "nowrap",
            }}
          >
            Begin my story
          </button>
        )}
      </div>

      {/* Tabs */}
      <nav
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "32px",
        }}
      >
        {tabs.map((tab) => {
          const isActive = activeTimeline === tab.id;
          const underlineColor = tab.id === "forever" ? "#38bdf8" : tab.id === "instant" ? "#E8742A" : "#ffffff";

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
                color: isActive ? "#FFFFFF" : "rgba(255,255,255,0.75)",
                fontWeight: isActive ? 900 : 700,
                fontSize: isActive ? "16px" : "13px",
                letterSpacing: "0.02em",
                textShadow: "0 1px 8px rgba(0,0,0,0.9)",
                transition: "all 0.2s ease",
                whiteSpace: "nowrap",
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
                    backgroundColor: underlineColor,
                    boxShadow: `0 0 10px ${underlineColor}`,
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
