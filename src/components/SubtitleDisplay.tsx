import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

interface SubtitleDisplayProps {
  transcript_fr?: string | null;
  transcript_en?: string | null;
  transcript_ar?: string | null;
  translation_status?: string | null;
  detected_lang?: string | null;
}

export default function SubtitleDisplay({
  transcript_fr,
  transcript_en,
  transcript_ar,
  translation_status,
  detected_lang,
}: SubtitleDisplayProps) {
  const { lang } = useLanguage();
  const [displayLang, setDisplayLang] = useState<"fr" | "en" | "ar">(lang as "fr" | "en" | "ar");
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const browserLang = navigator.language?.toLowerCase() || "";
    if (browserLang.startsWith("ar")) setDisplayLang("ar");
    else if (browserLang.startsWith("fr")) setDisplayLang("fr");
    else setDisplayLang("en");
  }, []);

  const isDone = translation_status === "done";
  const isProcessing = translation_status === "processing" || translation_status === "pending";

  const getText = (): string | null => {
    if (displayLang === "fr") return transcript_fr || null;
    if (displayLang === "ar") return transcript_ar || null;
    return transcript_en || null;
  };

  const text = getText();
  const isRTL = displayLang === "ar";
  const MAX_CHARS = 160;
  const display =
    text && text.length > MAX_CHARS && !expanded ? text.slice(0, MAX_CHARS) + "…" : text;

  if (!isDone && !isProcessing) return null;

  return (
    <div
      style={{
        padding: "10px 16px 14px",
        borderTop: "1px solid rgba(232,116,42,0.06)",
        background: "rgba(253,248,240,0.98)",
      }}
    >
      {isDone && (
        <div
          style={{
            display: "flex",
            gap: "6px",
            marginBottom: "10px",
            alignItems: "center",
            direction: "ltr",
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              fontSize: "9px",
              color: "rgba(61,43,31,0.35)",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            {lang === "fr" ? "Lire en" : lang === "ar" ? "اقرأ بـ" : "Read in"}
          </span>

          {[
            { code: "fr" as const, label: "FR", has: !!transcript_fr },
            { code: "en" as const, label: "EN", has: !!transcript_en },
            { code: "ar" as const, label: "عر", has: !!transcript_ar },
          ]
            .filter((l) => l.has)
            .map(({ code, label }) => (
              <button
                key={code}
                onClick={() => setDisplayLang(code)}
                style={{
                  padding: "3px 10px",
                  borderRadius: "999px",
                  background: displayLang === code ? "#E8742A" : "rgba(232,116,42,0.1)",
                  color: displayLang === code ? "#fff" : "#E8742A",
                  border: "none",
                  fontSize: "11px",
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                {label}
              </button>
            ))}

          {detected_lang && detected_lang !== "unknown" && (
            <span
              style={{
                marginLeft: "auto",
                fontSize: "9px",
                color: "rgba(61,43,31,0.25)",
              }}
            >
              ✦ {detected_lang.toUpperCase()}
            </span>
          )}
        </div>
      )}

      {isProcessing && (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            style={{
              width: "12px",
              height: "12px",
              border: "2px solid rgba(232,116,42,0.2)",
              borderTop: "2px solid #E8742A",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              flexShrink: 0,
            }}
          />
          <p
            style={{
              fontSize: "12px",
              color: "rgba(61,43,31,0.4)",
              fontStyle: "italic",
              margin: 0,
            }}
          >
            {lang === "fr"
              ? "Transcription en cours…"
              : lang === "ar"
                ? "جارٍ النسخ والترجمة…"
                : "Transcribing…"}
          </p>
        </div>
      )}

      {isDone && display && (
        <div dir={isRTL ? "rtl" : "ltr"}>
          <p
            style={{
              fontSize: "14px",
              color: "#3D2B1F",
              lineHeight: 1.65,
              margin: 0,
              fontFamily: isRTL ? "system-ui, sans-serif" : "Georgia, serif",
              fontStyle: isRTL ? "normal" : "italic",
              textAlign: isRTL ? "right" : "left",
            }}
          >
            {display}
          </p>
          {text && text.length > MAX_CHARS && (
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
                ? lang === "fr"
                  ? "↑ Réduire"
                  : lang === "ar"
                    ? "↑ أقل"
                    : "↑ Show less"
                : lang === "fr"
                  ? "↓ Lire la suite"
                  : lang === "ar"
                    ? "↓ اقرأ أكثر"
                    : "↓ Read more"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
