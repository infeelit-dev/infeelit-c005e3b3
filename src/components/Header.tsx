import { useState, useEffect, createContext, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Timeline } from "@/types/timeline";
import infeelit from "@/assets/infeelit-logo.png";

interface HeaderProps {
  activeTimeline: Timeline;
  onTimelineChange: (t: Timeline) => void;
  showBack?: boolean;
  pageTitle?: string;
}

export const HeaderOverrideContext = createContext<{ showBack?: boolean; pageTitle?: string }>({});

export function HeaderProvider({
  showBack,
  pageTitle,
  children,
}: {
  showBack?: boolean;
  pageTitle?: string;
  children: React.ReactNode;
}) {
  return (
    <HeaderOverrideContext.Provider value={{ showBack, pageTitle }}>
      {children}
    </HeaderOverrideContext.Provider>
  );
}

const Header = ({ activeTimeline, onTimelineChange, showBack, pageTitle }: HeaderProps) => {
  const headerOverride = useContext(HeaderOverrideContext);
  const effectiveShowBack = showBack ?? headerOverride.showBack;
  const effectivePageTitle = pageTitle ?? headerOverride.pageTitle;
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
          paddingTop: "12px",
          paddingBottom: "8px",
        }}
        dir="ltr"
      >
        {/* BLOC 1 — BURGER + LOGO + LANGUE — grid 1fr auto 1fr */}
        <div
          style={{
            width: "100%",
            display: "grid",
            gridTemplateColumns: "1fr auto 1fr",
            alignItems: "center",
            paddingLeft: "16px",
            paddingRight: "16px",
            marginBottom: "10px",
            direction: "ltr",
          }}
        >
          {/* Gauche : Burger OU Retour */}
          {effectiveShowBack ? (
            <button
              onClick={() => navigate(-1)}
              style={{
                width: "34px",
                height: "34px",
                borderRadius: "50%",
                backgroundColor: "rgba(255,255,255,0.15)",
                border: "1px solid rgba(255,255,255,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                backdropFilter: "blur(8px)",
              }}
              aria-label="Retour"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M19 12H5M12 5l-7 7 7 7"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          ) : (
            <button
              onClick={() => setMenuOpen(true)}
              style={{
                width: "34px",
                height: "34px",
                borderRadius: "50%",
                backgroundColor: "rgba(255,255,255,0.15)",
                border: "1px solid rgba(255,255,255,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                backdropFilter: "blur(8px)",
              }}
            >
              <Menu size={18} color="#fff" />
            </button>
          )}

          {/* LOGO — colonne centrale */}
          <img
            src={infeelit}
            alt="Infeelit"
            onClick={() => navigate("/")}
            style={{
              height: "52px",
              width: "auto",
              display: "block",
              margin: "0 auto",
              filter: "drop-shadow(0 2px 12px rgba(0,0,0,0.9)) brightness(1.4) contrast(1.2)",
              cursor: "pointer",
              transition: "transform 0.2s ease",
            }}
            onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.95)")}
            onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
          />

          {/* ACTIONS — colonne droite */}
          <div
            style={{
              display: "flex",
              gap: "8px",
              alignItems: "center",
              direction: "ltr",
              justifyContent: "flex-end",
            }}
          >
            {/* Bouton langue */}
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setLangOpen(!langOpen)}
                style={{
                  width: "34px",
                  height: "34px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(255,255,255,0.15)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  backdropFilter: "blur(8px)",
                }}
              >
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 900,
                    color: "#fff",
                    fontFamily: lang === "ar" ? "'Noto Sans Arabic', Arial, sans-serif" : "inherit",
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
                      zIndex: 199,
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
                          padding: "11px 14px",
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          backgroundColor: lang === l.id ? "rgba(232,116,42,0.2)" : "transparent",
                          border: "none",
                          borderBottom: i < LANGS.length - 1 ? "1px solid rgba(255,255,255,0.07)" : "none",
                          cursor: "pointer",
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
                              fontSize: "13px",
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
                width: "34px",
                height: "34px",
                borderRadius: "50%",
                backgroundColor: "rgba(255,255,255,0.15)",
                border: "1px solid rgba(255,255,255,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                backdropFilter: "blur(8px)",
              }}
            >
              <Search size={16} color="#fff" />
            </button>
          </div>
        </div>

        {/* BLOC 2 — pageTitle OU NAV MEMORIES | INSTANT | FOREVER */}
        <div
          style={{
            width: "100%",
            paddingLeft: "16px",
            paddingRight: "16px",
          }}
        >
          {effectiveShowBack && effectivePageTitle ? (
            <p
              style={{
                margin: 0,
                paddingBottom: "6px",
                textAlign: "center",
                color: "#fff",
                fontWeight: 700,
                fontSize: "15px",
                textShadow: "0 1px 8px rgba(0,0,0,0.9)",
              }}
            >
              {effectivePageTitle}
            </p>
          ) : (
          <nav
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              width: "100%",
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
                    color: isActive ? "#fff" : "rgba(255,255,255,0.75)",
                    fontWeight: isActive ? 900 : 700,
                    fontSize: isActive ? "16px" : "13px",
                    textShadow: "0 1px 8px rgba(0,0,0,0.9)",
                    transition: "all 0.2s",
                    whiteSpace: "nowrap",
                    textAlign: "center",
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
          )}
        </div>
      </header>

      {/* Menu Burger */}
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
