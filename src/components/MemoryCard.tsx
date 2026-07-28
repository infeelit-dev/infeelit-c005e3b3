import { forwardRef } from "react";

interface MemoryCardProps {
  title: string;
  authorName: string;
  memoryNumber?: number;
  backgroundGradient?: string;
  lang: "fr" | "en" | "ar";
}

const MemoryCard = forwardRef<HTMLDivElement, MemoryCardProps>(
  ({ title, authorName, memoryNumber, backgroundGradient, lang }, ref) => {
    // Couper le titre pour créer l'open loop
    const getTruncatedTitle = (text: string) => {
      if (!text) {
        return lang === "fr" ? "Un souvenir…" : lang === "ar" ? "ذكرى…" : "A memory…";
      }
      if (text.length <= 40) return text + "…";
      const cutPoint = Math.floor(text.length * 0.6);
      const lastSpace = text.lastIndexOf(" ", cutPoint);
      return text.slice(0, lastSpace > 20 ? lastSpace : cutPoint) + "…";
    };

    const truncated = getTruncatedTitle(title);

    const gradient = backgroundGradient || "linear-gradient(135deg, #2D1810 0%, #8B4513 40%, #E8742A 100%)";

    const counterLabel = {
      fr: `Souvenir nº${memoryNumber || 1}`,
      en: `Memory nº${memoryNumber || 1}`,
      ar: `ذكرى رقم ${memoryNumber || 1}`,
    }[lang];

    return (
      <div
        ref={ref}
        style={{
          width: "320px",
          height: "320px",
          borderRadius: "24px",
          overflow: "hidden",
          position: "relative",
          background: gradient,
          fontFamily: "Georgia, serif",
          flexShrink: 0,
        }}
      >
        {/* Overlay texture */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(ellipse at 30% 20%, rgba(255,200,80,0.15) 0%, transparent 60%)",
          }}
        />

        {/* Contenu */}
        <div
          style={{
            position: "relative",
            zIndex: 2,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "28px 24px",
          }}
        >
          {/* Logo en haut */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span
              style={{
                fontSize: "13px",
                fontWeight: 900,
                color: "rgba(255,210,80,0.9)",
                letterSpacing: "0.25em",
                fontFamily: "system-ui, sans-serif",
              }}
            >
              INFEELIT
            </span>
            <span
              style={{
                fontSize: "11px",
                color: "rgba(255,210,80,0.5)",
              }}
            >
              ✦
            </span>
          </div>

          {/* Titre coupé — le cœur de la viralité */}
          <div>
            <p
              style={{
                fontSize: "22px",
                fontStyle: "italic",
                color: "#fff",
                lineHeight: 1.45,
                marginBottom: "12px",
                textShadow: "0 2px 8px rgba(0,0,0,0.3)",
              }}
            >
              "{truncated}"
            </p>
            <p
              style={{
                fontSize: "12px",
                color: "rgba(255,255,255,0.6)",
                fontStyle: "normal",
                fontFamily: "system-ui, sans-serif",
              }}
            >
              — {authorName}
            </p>
          </div>

          {/* Bas de carte */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <p
              style={{
                fontSize: "10px",
                color: "rgba(255,255,255,0.35)",
                letterSpacing: "0.08em",
                fontFamily: "system-ui, sans-serif",
              }}
            >
              {counterLabel}
            </p>
            <p
              style={{
                fontSize: "9px",
                color: "rgba(255,255,255,0.25)",
                fontFamily: "system-ui, sans-serif",
              }}
            >
              infeelit.com
            </p>
          </div>
        </div>
      </div>
    );
  },
);

MemoryCard.displayName = "MemoryCard";
export default MemoryCard;
