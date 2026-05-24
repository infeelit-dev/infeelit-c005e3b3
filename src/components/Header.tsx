import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X, Search } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Timeline } from "@/types/timeline";
import infeelit from "@/assets/infeelit-logo.png";

interface HeaderProps {
  activeTimeline: Timeline;
  onTimelineChange: (t: Timeline) => void | Promise<void>;
}

const LANGS = [
  { id: "en" as const, flag: "🇬🇧", label: "English" },
  { id: "fr" as const, flag: "🇫🇷", label: "Français" },
  { id: "ar" as const, flag: "🇦🇪", label: "العربية" },
];

const langLabel: Record<string, string> = {
  en: "EN",
  fr: "FR",
  ar: "عر",
};

const Header = ({ activeTimeline, onTimelineChange }: HeaderProps) => {
  const navigate = useNavigate();
  const { lang, setLang } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  const tabs = [
    { id: "memories" as Timeline, label: lang === "fr" ? "Souvenirs" : lang === "ar" ? "ذكريات" : "Memories" },
    { id: "instant" as Timeline, label: lang === "fr" ? "Instant" : lang === "ar" ? "لحظة" : "Instant" },
    { id: "forever" as Timeline, label: lang === "fr" ? "Pour toujours" : lang === "ar" ? "للأبد" : "Forever" },
  ];

  const underlineColor = (id: Timeline) => (id === "forever" ? "#38bdf8" : id === "instant" ? "#E8742A" : "#ffffff");

  return (
    <>
      <header
        dir="ltr"
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
        {/* Ligne du haut */}
        <div
          dir="ltr"
          style={{
            width: "100%",
            display: "grid",
            gridTemplateColumns: "72px 1fr 72px",
            alignItems: "center",
            paddingLeft: "16px",
            paddingRight: "16px",
            marginBottom: "10px",
          }}
        >
          {/* Gauche : burger */}
          <div style={{ display: "flex", justifyContent: "flex-start" }}>
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
          </div>

          {/* Centre : logo */}
          <div style={{ display: "flex", justifyContent: "center" }}>
            <img
              src={infeelit}
              alt="Infeelit"
              onClick={() => navigate("/")}
              style={{
                height: "64px",
                width: "auto",
                maxWidth: "160px",
                filter: "drop-shadow(0 2px 12px rgba(0,0,0,0.9)) brightness(1.4) contrast(1.2)",
                cursor: "pointer",
              }}
            />
          </div>

          {/* Droite : langue dropdown + loupe */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "8px",
              alignItems: "center",
              position: "relative",
            }}
          >
            {/* Bouton langue avec dropdown */}
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setLangOpen((v) => !v)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  padding: "6px 10px",
                  borderRadius: "999px",
                  backgroundColor: "rgba(255,255,255,0.15)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  backdropFilter: "blur(8px)",
                  cursor: "pointer",
                  color: "#fff",
                  fontSize: "11px",
                  fontWeight: 700,
                  height: "34px",
                }}
              >
                <span>{LANGS.find((l) => l.id === lang)?.flag}</span>
                <span>{langLabel[lang]}</span>
                <span style={{ fontSize: "7px", opacity: 0.6 }}>▼</span>
              </button>

              {/* Dropdown */}
              {langOpen && (
                <>
                  <div style={{ position: "fixed", inset: 0, zIndex: 98 }} onClick={() => setLangOpen(false)} />
                  <div
                    style={{
                      position: "absolute",
                      top: "calc(100% + 6px)",
                      right: 0,
                      backgroundColor: "rgba(10,17,40,0.97)",
                      backdropFilter: "blur(16px)",
                      borderRadius: "14px",
                      border: "1px solid rgba(255,255,255,0.12)",
                      overflow: "hidden",
                      minWidth: "130px",
                      boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
                      zIndex: 99,
                    }}
                  >
                    {LANGS.map((l, i) => (
                      <button
                        key={l.id}
                        onClick={() => {
                          setLang(l.id);
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
                        <span style={{ fontSize: "16px" }}>{l.flag}</span>
                        <span
                          style={{
                            fontSize: "12px",
                            fontWeight: 700,
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

            {/* Loupe */}
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

        {/* Tabs centrés avec largeur fixe */}
        <div
          dir="ltr"
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "0px",
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
                  width: "110px",
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
                  lineHeight: 1,
                }}
              >
                {tab.label}
                {isActive && (
                  <div
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: "60%",
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
        </div>
      </header>

      {/* Menu burger */}
      {menuOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200 }} onClick={() => setMenuOpen(false)}>
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.5)",
              backdropFilter: "blur(4px)",
            }}
          />
          <div
            dir="ltr"
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
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setMenuOpen(false)}
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

            <button
              onClick={() => {
                navigate("/about");
                setMenuOpen(false);
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
                setMenuOpen(false);
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
