import { useState } from "react";

interface SubtitleDisplayProps {
  transcript_fr?: string;
  transcript_en?: string;
  transcript_ar?: string;
  translation_status?: string;
  detected_lang?: string;
  currentLang: "fr" | "en" | "ar";
}

export default function SubtitleDisplay({
  transcript_fr,
  transcript_en,
  transcript_ar,
  translation_status,
  detected_lang,
  currentLang,
}: SubtitleDisplayProps) {
  const [showLang, setShowLang] = useState(currentLang);
  const [expanded, setExpanded] = useState(false);

  const hasTranslation = translation_status === "done";
  const isProcessing = translation_status === "processing";

  if (!hasTranslation && !isProcessing) return null;

  const getText = () => {
    if (showLang === "fr") return transcript_fr;
    if (showLang === "en") return transcript_en;
    if (showLang === "ar") return transcript_ar;
    return transcript_fr || transcript_en || transcript_ar;
  };

  const text = getText();
  const isRTL = showLang === "ar";

  const MAX_CHARS = 120;
  const truncated = text && text.length > MAX_CHARS && !expanded ? text.slice(0, MAX_CHARS) + "…" : text;

  return (
    <div
      style={{
        padding: "10px 16px 12px",
        borderTop: "1px solid rgba(232,116,42,0.06)",
        background: "rgba(253,248,240,0.95)",
      }}
    >
      {hasTranslation && (
        <div
          style={{
            display: "flex",
            gap: "6px",
            marginBottom: "8px",
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontSize: "10px",
              color: "rgba(61,43,31,0.4)",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginRight: "4px",
            }}
          >
            {currentLang === "fr" ? "Lire en" : currentLang === "ar" ? "اقرأ بـ" : "Read in"}
          </span>

          {[
            { code: "fr", label: "FR" },
            { code: "en", label: "EN" },
            { code: "ar", label: "عر" },
          ].map(({ code, label }) => {
            const hasContent = code === "fr" ? !!transcript_fr : code === "en" ? !!transcript_en : !!transcript_ar;

            if (!hasContent) return null;

            return (
              <button
                key={code}
                onClick={() => setShowLang(code as "fr" | "en" | "ar")}
                style={{
                  padding: "3px 10px",
                  borderRadius: "999px",
                  background: showLang === code ? "#E8742A" : "rgba(232,116,42,0.1)",
                  color: showLang === code ? "#fff" : "#E8742A",
                  border: "none",
                  fontSize: "11px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      )}

      {isProcessing && (
        <p
          style={{
            fontSize: "12px",
            color: "rgba(232,116,42,0.5)",
            fontStyle: "italic",
            margin: 0,
          }}
        >
          ✦ {currentLang === "fr" ? "Traduction en cours…" : currentLang === "ar" ? "جارٍ الترجمة…" : "Translating…"}
        </p>
      )}

      {hasTranslation && text && (
        <div dir={isRTL ? "rtl" : "ltr"}>
          <p
            style={{
              fontSize: "14px",
              color: "#3D2B1F",
              lineHeight: 1.6,
              margin: 0,
              fontFamily: isRTL ? "system-ui, sans-serif" : "Georgia, serif",
              fontStyle: isRTL ? "normal" : "italic",
            }}
          >
            {truncated}
          </p>

          {text.length > MAX_CHARS && (
            <button
              onClick={() => setExpanded(!expanded)}
              style={{
                background: "none",
                border: "none",
                color: "#E8742A",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
                padding: "4px 0",
                marginTop: "4px",
              }}
            >
              {expanded
                ? currentLang === "fr"
                  ? "Voir moins"
                  : currentLang === "ar"
                    ? "أقل"
                    : "See less"
                : currentLang === "fr"
                  ? "Lire la suite"
                  : currentLang === "ar"
                    ? "اقرأ أكثر"
                    : "Read more"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
