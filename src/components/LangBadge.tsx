import { useState } from "react";
import { useLocation } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Lang, langLabel } from "@/lib/i18n";

const LANGS: { id: Lang; flag: string; label: string }[] = [
  { id: "en", flag: "🇬🇧", label: "English" },
  { id: "fr", flag: "🇫🇷", label: "Français" },
  { id: "ar", flag: "🇦🇪", label: "العربية" },
];

const LangBadge = () => {
  const { lang, setLang } = useLanguage();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const current = LANGS.find((l) => l.id === lang)!;

  const isOnFeed = location.pathname === "/" || location.pathname === "/feed";

  // Le Header gère déjà la langue sur le feed
  if (isOnFeed) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: "14px",
        left: "14px",
        zIndex: 9999,
      }}
    >
      {/* Single pill */}
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "5px",
          padding: "6px 12px",
          borderRadius: "999px",
          backgroundColor: "rgba(0,0,0,.45)",
          border: "1px solid rgba(255,255,255,.25)",
          backdropFilter: "blur(10px)",
          cursor: "pointer",
          color: "#fff",
          fontSize: "11px",
          fontWeight: 700,
          boxShadow: "0 2px 8px rgba(0,0,0,.2)",
        }}
      >
        <span>{current.flag}</span>
        <span>{langLabel[lang]}</span>
        <span style={{ fontSize: "8px", opacity: 0.5, marginLeft: "1px" }}>▼</span>
      </button>

      {/* Dropdown */}
      {open && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: -1 }} onClick={() => setOpen(false)} />
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 6px)",
              left: 0,
              backgroundColor: "rgba(10,17,40,.97)",
              backdropFilter: "blur(16px)",
              borderRadius: "14px",
              border: "1px solid rgba(255,255,255,.12)",
              overflow: "hidden",
              minWidth: "130px",
              boxShadow: "0 8px 32px rgba(0,0,0,.5)",
            }}
          >
            {LANGS.map((l, i) => (
              <button
                key={l.id}
                onClick={() => {
                  setLang(l.id);
                  setOpen(false);
                }}
                style={{
                  width: "100%",
                  padding: "11px 14px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  backgroundColor: lang === l.id ? "rgba(232,116,42,.2)" : "transparent",
                  border: "none",
                  borderBottom: i < LANGS.length - 1 ? "1px solid rgba(255,255,255,.07)" : "none",
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
                {lang === l.id && <span style={{ marginLeft: "auto", color: "#E8742A", fontSize: "13px" }}>✓</span>}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default LangBadge;
