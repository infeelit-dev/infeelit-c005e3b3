import { forwardRef } from "react";

interface MemoryCardProps {
  title: string;
  authorName: string;
  city?: string;
  familyName?: string;
  memoryNumber?: number;
  backgroundImage?: string;
  lang: "fr" | "en" | "ar";
}

const MemoryCard = forwardRef<HTMLDivElement, MemoryCardProps>(
  ({ title, authorName, city, familyName, memoryNumber, backgroundImage, lang }, ref) => {
    return (
      <div
        ref={ref}
        style={{
          width: "320px",
          height: "320px",
          borderRadius: "24px",
          overflow: "hidden",
          position: "relative",
          background: "#FDF8F0",
          fontFamily: "Georgia, serif",
        }}
      >
        {backgroundImage && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: `url(${backgroundImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: "blur(8px) brightness(0.6) sepia(30%)",
            }}
          />
        )}

        <div
          style={{
            position: "absolute",
            inset: 0,
            background: backgroundImage
              ? "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.7) 100%)"
              : "linear-gradient(135deg, #FDF8F0 0%, #F0E6D3 100%)",
          }}
        />

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
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span
              style={{
                fontSize: "14px",
                fontWeight: 700,
                color: backgroundImage ? "#fff" : "#E8742A",
                letterSpacing: "0.15em",
              }}
            >
              INFEELIT
            </span>
            <span
              style={{
                fontSize: "12px",
                color: backgroundImage ? "rgba(255,255,255,0.5)" : "rgba(232,116,42,0.5)",
              }}
            >
              ✦
            </span>
          </div>

          <div>
            <p
              style={{
                fontSize: "22px",
                fontStyle: "italic",
                color: backgroundImage ? "#fff" : "#3D2B1F",
                lineHeight: 1.4,
                marginBottom: "16px",
              }}
            >
              "{title.length > 80 ? title.slice(0, 80) + "…" : title}"
            </p>

            <p
              style={{
                fontSize: "12px",
                color: backgroundImage ? "rgba(255,255,255,0.7)" : "rgba(61,43,31,0.5)",
                fontStyle: "normal",
              }}
            >
              — {authorName}
              {city ? ` · ${city}` : ""}
            </p>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            {memoryNumber !== undefined && (
              <p
                style={{
                  fontSize: "10px",
                  color: backgroundImage ? "rgba(255,255,255,0.4)" : "rgba(61,43,31,0.3)",
                  letterSpacing: "0.1em",
                }}
              >
                {lang === "fr"
                  ? `Souvenir nº${memoryNumber}`
                  : lang === "ar"
                    ? `ذكرى رقم ${memoryNumber}`
                    : `Memory nº${memoryNumber}`}
                {familyName ? ` · ${lang === "fr" ? "Famille" : "Family"} ${familyName}` : ""}
              </p>
            )}
            <p
              style={{
                fontSize: "9px",
                color: backgroundImage ? "rgba(255,255,255,0.3)" : "rgba(61,43,31,0.2)",
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
