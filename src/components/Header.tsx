import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Timeline } from "@/types/timeline";
import infeelit from "@/assets/infeelit-logo.png";

interface HeaderProps {
  activeTimeline: Timeline;
  onTimelineChange: (t: Timeline) => void;
}

const Header = ({ activeTimeline, onTimelineChange }: HeaderProps) => {
  const navigate = useNavigate();
  const { lang, setLang } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
    };
    checkAuth();
  }, []);

  const tabs = [
    { id: "memories" as Timeline, label: "Memories" },
    { id: "instant" as Timeline, label: "Instant" },
    { id: "forever" as Timeline, label: "Forever" },
  ];

  const underlineColor = (id: Timeline) => (id === "forever" ? "#38bdf8" : id === "instant" ? "#E8742A" : "#ffffff");

  const LANGS = [
    { id: "fr", label: "Français" },
    { id: "en", label: "English" },
    { id: "ar", label: "العربية" },
  ];

  const closeBurgerMenu = () => setMenuOpen(false);

  return (
    <>
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
          paddingTop: "8px",
          paddingBottom: "8px",
          background: "transparent",
        }}
        dir="ltr"
      >
        {/* Première ligne : Menu | Logo centré | Actions */}
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            paddingLeft: "16px",
            paddingRight: "16px",
            marginBottom: "8px",
            direction: "ltr",
            position: "relative",
            height: "64px", // Hauteur fixe pour alignement parfait
          }}
        >
          {/* MENU BURGER — position absolue à gauche */}
          <button
            onClick={() => setMenuOpen(true)}
            style={{
              position: "absolute",
              left: "16px",
              top: "50%",
              transform: "translateY(-50%)",
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              backgroundColor: "rgba(255,255,255,0.12)",
              border: "1px solid rgba(255,255,255,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              backdropFilter: "blur(8px)",
              flexShrink: 0,
              zIndex: 5,
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.12)";
            }}
          >
            <Menu size={20} color="#fff" strokeWidth={2} />
          </button>

          {/* LOGO — parfaitement centré horizontalement et verticalement */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              flex: 1,
            }}
          >
            <img
              src={infeelit}
              alt="Infeelit"
              onClick={() => navigate("/")}
              style={{
                height: "52px",
                width: "auto",
                maxWidth: "160px",
                filter: "drop-shadow(0 2px 12px rgba(0,0,0,0.9)) brightness(1.4) contrast(1.2)",
                cursor: "pointer",
                objectFit: "contain",
                display: "block",
              }}
            />
          </div>

          {/* ACTIONS — position absolue à droite */}
          <div
            style={{
              position: "absolute",
              right: "16px",
              top: "50%",
              transform: "translateY(-50%)",
              display: "flex",
              gap: "8px",
              alignItems: "center",
              direction: "ltr",
              flexShrink: 0,
              zIndex: 5,
            }}
          >
            {/* Bouton langue */}
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setLangOpen(!langOpen)}
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(255,255,255,0.12)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  backdropFilter: "blur(8px)",
                  flexShrink: 0,
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.12)";
                }}
              >
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: 900,
                    color: "#fff",
                    fontFamily: lang === "ar" ? "'Noto Sans Arabic', Arial, sans-serif" : "inherit",
                    letterSpacing: "0.05em",
                  }}
                >
                  {lang === "fr" ? "FR" : lang === "en" ? "EN" : "عر"}
                </span>
              </button>

              {langOpen && (
                <>
                  <div
                    style={{
                      position: "fixed",
                      inset: 0,
                      zIndex: -1,
                    }}
                    onClick={() => setLangOpen(false)}
                  />
                  <div
                    style={{
                      position: "absolute",
                      top: "calc(100% + 8px)",
                      right: 0,
                      backgroundColor: "rgba(10,17,40,.97)",
                      backdropFilter: "blur(16px)",
                      borderRadius: "14px",
                      border: "1px solid rgba(255,255,255,.12)",
                      overflow: "hidden",
                      minWidth: "160px",
                      boxShadow: "0 8px 32px rgba(0,0,0,.5)",
                      zIndex: 200,
                    }}
                  >
                    {LANGS.map((l, i) => (
                      <button
                        key={l.id}
                        onClick={() => {
                          setLang(l.id as import("@/lib/i18n").Lang);
                          setLangOpen(false);
                        }}
                        style={{
                          width: "100%",
                          padding: "12px 16px",
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          backgroundColor: lang === l.id ? "rgba(232,116,42,0.15)" : "transparent",
                          border: "none",
                          borderBottom: i < LANGS.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none",
                          cursor: "pointer",
                          transition: "background 0.15s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.05)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor =
                            lang === l.id ? "rgba(232,116,42,0.15)" : "transparent";
                        }}
                      >
                        <span
                          style={{
                            fontSize: "12px",
                            fontWeight: 900,
                            color: lang === l.id ? "#E8742A" : "rgba(255,255,255,0.5)",
                            width: "28px",
                            fontFamily: l.id === "ar" ? "'Noto Sans Arabic', Arial, sans-serif" : "inherit",
                          }}
                        >
                          {l.id === "fr" ? "FR" : l.id === "en" ? "EN" : "عر"}
                        </span>
                        <span
                          style={{
                            fontSize: "13px",
                            fontWeight: 600,
                            color: "#fff",
                            fontFamily: l.id === "ar" ? "'Noto Sans Arabic', Arial, sans-serif" : "inherit",
                          }}
                        >
                          {l.label}
                        </span>
                        {lang === l.id && (
                          <span
                            style={{
                              marginLeft: "auto",
                              color: "#E8742A",
                              fontSize: "14px",
                            }}
                          >
                            ✓
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <button
              onClick={() => navigate("/search")}
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                backgroundColor: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                backdropFilter: "blur(8px)",
                flexShrink: 0,
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.12)";
              }}
            >
              <Search size={18} color="#fff" strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Deuxième ligne : Navigation des timelines */}
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            paddingTop: "4px",
          }}
        >
          <nav
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "32px",
              direction: "ltr",
            }}
          >
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
                    color: isActive ? "#fff" : "rgba(255,255,255,0.6)",
                    fontWeight: isActive ? 900 : 600,
                    fontSize: isActive ? "15px" : "13px",
                    textShadow: "0 1px 8px rgba(0,0,0,0.9)",
                    transition: "all 0.2s",
                    whiteSpace: "nowrap",
                    letterSpacing: isActive ? "0.02em" : "0.01em",
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
                        boxShadow: `0 0 12px ${underlineColor(tab.id)}`,
                        transition: "all 0.3s",
                      }}
                    />
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {menuOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 200,
          }}
          onClick={closeBurgerMenu}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.5)",
              backdropFilter: "blur(4px)",
            }}
          />
          <div
            style={{
              position: "relative",
              width: "75%",
              maxWidth: "300px",
              height: "100%",
              backgroundColor: "#FFF9F2",
              padding: "60px 24px 40px",
              display: "flex",
              flexDirection: "column",
              gap: "4px",
              boxShadow: "4px 0 24px rgba(0,0,0,0.2)",
              direction: "ltr",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeBurgerMenu}
              style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "rgba(61,43,31,0.4)",
                padding: "8px",
              }}
            >
              <X size={20} />
            </button>

            <img
              src={infeelit}
              alt="Infeelit"
              style={{
                height: "48px",
                objectFit: "contain",
                marginBottom: "24px",
                mixBlendMode: "multiply",
              }}
            />

            {/* BOUTON "REJOINDRE" EN PREMIER DANS LE MENU SI NON CONNECTÉ */}
            {!isLoggedIn && (
              <button
                onClick={() => {
                  navigate("/welcome");
                  closeBurgerMenu();
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  width: "100%",
                  padding: "14px 0",
                  background: "none",
                  border: "none",
                  borderBottom: "1px solid rgba(232,116,42,0.1)",
                  cursor: "pointer",
                  textAlign: "left",
                  marginBottom: "4px",
                  transition: "opacity 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = "0.7";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = "1";
                }}
              >
                <span style={{ fontSize: "20px" }}>✦</span>
                <span
                  style={{
                    fontSize: "16px",
                    fontWeight: 700,
                    color: "#E8742A",
                  }}
                >
                  {lang === "fr" ? "Rejoindre Infeelit" : lang === "ar" ? "انضم إلى Infeelit" : "Join Infeelit"}
                </span>
              </button>
            )}

            <button
              onClick={() => {
                navigate("/about");
                closeBurgerMenu();
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "14px 16px",
                borderRadius: "14px",
                background: "none",
                border: "none",
                cursor: "pointer",
                textAlign: "left",
                fontSize: "15px",
                fontWeight: 600,
                color: "#3D2B1F",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.04)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <span>✦</span>
              {lang === "fr" ? "À propos d'Infeelit" : lang === "ar" ? "عن Infeelit" : "About Infeelit"}
            </button>

            <button
              onClick={() => {
                navigate("/contact");
                closeBurgerMenu();
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "14px 16px",
                borderRadius: "14px",
                background: "none",
                border: "none",
                cursor: "pointer",
                textAlign: "left",
                fontSize: "15px",
                fontWeight: 600,
                color: "#3D2B1F",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.04)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <span>💬</span>
              {lang === "fr" ? "Nous contacter" : lang === "ar" ? "اتصل بنا" : "Contact us"}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
