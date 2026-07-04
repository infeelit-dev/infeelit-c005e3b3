import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import SubtitleDisplay from "@/components/SubtitleDisplay";

interface MemoryFullscreenProps {
  bubble: {
    id: string;
    title?: string | null;
    file_url?: string | null;
    file_type?: string | null;
    user_name?: string;
    sparks_count?: number;
    transcript_fr?: string | null;
    transcript_en?: string | null;
    transcript_ar?: string | null;
    translation_status?: string | null;
    detected_lang?: string | null;
  };
  onClose: () => void;
  userName: string;
  currentUserId?: string;
}

export default function MemoryFullscreen({
  bubble,
  onClose,
}: MemoryFullscreenProps) {
  const { lang, rtl } = useLanguage();
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 400);
  };

  const isAudio = bubble.file_type === "audio";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "#000",
        animation: isClosing
          ? "bloomClose 0.4s ease-in forwards"
          : "bloomReveal 0.4s ease-out forwards",
      }}
    >
      {!isAudio && bubble.file_url && (
        <video
          src={bubble.file_url}
          autoPlay
          playsInline
          loop
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      )}

      {isAudio && (
        <div
          style={{
            width: "100%",
            height: "100%",
            background: "linear-gradient(160deg, #2D1810 0%, #8B3A1A 40%, #E8742A 100%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "24px",
          }}
        >
          <div
            style={{
              width: "100px",
              height: "100px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #E8742A, #D4621A)",
              border: "3px solid rgba(212,175,55,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "40px",
              fontWeight: 700,
              color: "#fff",
            }}
          >
            {(bubble.user_name || "?")[0]?.toUpperCase()}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              height: "48px",
            }}
          >
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: "3px",
                  borderRadius: "999px",
                  background: "rgba(255,255,255,0.7)",
                  animation: `waveBar 1.2s ease-in-out ${i * 0.06}s infinite alternate`,
                }}
              />
            ))}
          </div>

          {bubble.file_url && (
            <audio autoPlay loop style={{ display: "none" }}>
              <source src={bubble.file_url} />
            </audio>
          )}
        </div>
      )}

      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 35%, rgba(0,0,0,0.2) 100%)",
          pointerEvents: "none",
        }}
      />

      <button
        onClick={handleClose}
        style={{
          position: "absolute",
          top: "56px",
          left: "16px",
          width: "40px",
          height: "40px",
          borderRadius: "50%",
          background: "rgba(0,0,0,0.5)",
          border: "1px solid rgba(255,255,255,0.2)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backdropFilter: "blur(8px)",
          zIndex: 10,
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M19 12H5M12 5l-7 7 7 7"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <div
        style={{
          position: "absolute",
          bottom: "180px",
          left: "16px",
          right: "80px",
          direction: rtl ? "rtl" : "ltr",
          zIndex: 10,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "8px",
            direction: "ltr",
          }}
        >
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #E8742A, #D4621A)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "14px",
              fontWeight: 700,
              color: "#fff",
              flexShrink: 0,
            }}
          >
            {(bubble.user_name || "?")[0]?.toUpperCase()}
          </div>
          <p
            style={{
              fontSize: "14px",
              fontWeight: 700,
              color: "#fff",
              margin: 0,
              textShadow: "0 1px 4px rgba(0,0,0,0.8)",
            }}
          >
            {bubble.user_name || "Anonyme"}
          </p>
        </div>

        <p
          style={{
            fontSize: "16px",
            fontFamily: "Georgia, serif",
            fontStyle: "italic",
            color: "#fff",
            margin: 0,
            lineHeight: 1.4,
            textShadow: "0 1px 6px rgba(0,0,0,0.8)",
          }}
        >
          {bubble.title}
        </p>

        {bubble.translation_status === "done" && (
          <SubtitleDisplay
            transcript_fr={bubble.transcript_fr ?? undefined}
            transcript_en={bubble.transcript_en ?? undefined}
            transcript_ar={bubble.transcript_ar ?? undefined}
            translation_status={bubble.translation_status ?? undefined}
            detected_lang={bubble.detected_lang ?? undefined}
          />
        )}
      </div>

      <div
        style={{
          position: "absolute",
          right: "16px",
          bottom: "180px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "24px",
          zIndex: 10,
        }}
      >
        {[
          {
            icon: "✦",
            label: (bubble.sparks_count ?? 0) > 0 ? String(bubble.sparks_count) : "",
            color: "#E8742A",
          },
          { icon: "💬", label: "", color: "#fff" },
          { icon: "📤", label: "", color: "#fff" },
          { icon: "🔖", label: "", color: "#fff" },
        ].map(({ icon, label }, i) => (
          <div key={i} style={{ textAlign: "center" }}>
            <p
              style={{
                fontSize: "28px",
                margin: 0,
                filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))",
              }}
            >
              {icon}
            </p>
            {label && (
              <p
                style={{
                  fontSize: "11px",
                  color: "#fff",
                  margin: "2px 0 0",
                  fontWeight: 700,
                  textShadow: "0 1px 3px rgba(0,0,0,0.8)",
                }}
              >
                {label}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
