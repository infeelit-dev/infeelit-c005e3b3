import { useLanguage } from "@/contexts/LanguageContext";
import { Lang, langLabel } from "@/lib/i18n";

const LANGS: Lang[] = ["en", "fr", "ar"];

const LangBadge = () => {
  const { lang, setLang } = useLanguage();

  return (
    <div
      style={{
        position: "fixed",
        top: "16px",
        left: "16px",
        zIndex: 999,
        display: "flex",
        gap: "4px",
      }}
    >
      {LANGS.map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          style={{
            padding: "5px 10px",
            borderRadius: "999px",
            fontSize: "10px",
            fontWeight: 900,
            cursor: "pointer",
            border: "1px solid rgba(255,255,255,.3)",
            backgroundColor: lang === l ? "rgba(232,116,42,.9)" : "rgba(0,0,0,.35)",
            color: "#fff",
            backdropFilter: "blur(8px)",
            transition: "all .15s",
          }}
        >
          {langLabel[l]}
        </button>
      ))}
    </div>
  );
};

export default LangBadge;
