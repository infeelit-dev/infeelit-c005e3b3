import { useState } from "react";
import { useLocation } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Lang, langLabel } from "@/lib/i18n";

const LANGS: { id: Lang; flag: string; label: string }[] = [
  { id: "en", flag: "🇬🇧", label: "English" },
  { id: "fr", flag: "🇫🇷", label: "Français" },
  { id: "ar", flag: "🇦🇪", label: "العربية" },
];

// Pages where Header already handles language — hide LangBadge there
const HIDE_ON = ["/", "/feed"];

const LangBadge = () => {
  const { lang, setLang } = useLanguage();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  // Don't render on Index/feed — Header already has the selector
  if (HIDE_ON.includes(location.pathname)) return null;

  const current = LANGS.find((l) => l.id === lang)!;

  return (
    <div style={{ position: "fixed", top: "14px", left: "14px", zIndex: 9999 }}>
      {/* Single pill button */}
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "5px",
          padding: "6px 12px",
          borderRadius: "999px",
          backgroundColor: "rgba(0,0,0,.45)",
          border: "1px solid rgba(255,255,255,.2)",
          backdropFilter: "blur(10px)",
          cursor: "pointer",
          color: "#fff",
          fontSize: "11px",
          fontWeight: 700,
        }}
      >
        <span>{current.flag}</span>
        <span>{langLabel[lang]}</span>
        <span style={{ fontSize: "8px", opacity: 0.6 }}>▼</span>
      </button>

      {/* Dropdown */}
      {open && (
        <>
          {/* Click outside to close */}
          <div style={{ position: "fixed", inset: 0, zIndex: -1 }} onClick={() => setOpen(false)} />
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 6px)",
              left: 0,
              backgroundColor: "rgba(10,17,40,.96)",
              backdropFilter: "blur(16px)",
              borderRadius: "14px",
              border: "1px solid rgba(255,255,255,.12)",
              overflow: "hidden",
              minWidth: "130px",
              boxShadow: "0 8px 32px rgba(0,0,0,.4)",
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
                  padding: "10px 14px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  backgroundColor: lang === l.id ? "rgba(232,116,42,.18)" : "transparent",
                  border: "none",
                  borderBottom: i < LANGS.length - 1 ? "1px solid rgba(255,255,255,.06)" : "none",
                  cursor: "pointer",
                  direction: l.id === "ar" ? "rtl" : "ltr",
                }}
              >
                <span style={{ fontSize: "16px" }}>{l.flag}</span>
                <span style={{ fontSize: "12px", fontWeight: 700, color: "#fff" }}>{l.label}</span>
                {lang === l.id && <span style={{ marginLeft: "auto", color: "#E8742A", fontSize: "12px" }}>✓</span>}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default LangBadge;
