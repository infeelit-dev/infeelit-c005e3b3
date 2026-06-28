import type { BubbleData } from "@/components/BubbleCanvas";

interface MemoryFullscreenProps {
  bubble: BubbleData;
  onClose: () => void;
  userName: string;
  lang: string;
}

export default function MemoryFullscreen({ bubble, onClose, lang }: MemoryFullscreenProps) {
  const isVideo = bubble.file_type === "video";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "#000",
        animation: "expandFromBubble 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
      }}
    >
      <style>{`
        @keyframes expandFromBubble {
          from { transform: scale(0.3); opacity: 0; border-radius: 50%; }
          to { transform: scale(1); opacity: 1; border-radius: 0; }
        }
      `}</style>

      {bubble.file_url && isVideo && (
        <video
          src={bubble.file_url}
          autoPlay
          playsInline
          controls={false}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      )}

      {bubble.file_url && !isVideo && (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg, #2D1810, #8B3A1A)",
          }}
        >
          {bubble.thumbnail_url ? (
            <img
              src={bubble.thumbnail_url}
              alt=""
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                opacity: 0.35,
              }}
            />
          ) : null}
          <audio
            src={bubble.file_url}
            autoPlay
            controls
            style={{ width: "80%", position: "relative", zIndex: 1 }}
          />
        </div>
      )}

      {!bubble.file_url && bubble.thumbnail_url && (
        <img
          src={bubble.thumbnail_url}
          alt=""
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      )}

      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 40%, rgba(0,0,0,0.3) 100%)",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "56px",
            left: "16px",
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            background: "rgba(0,0,0,0.5)",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontSize: "20px",
          }}
        >
          ←
        </button>

        <div
          style={{
            position: "absolute",
            bottom: "100px",
            left: "16px",
            right: "80px",
          }}
        >
          <p
            style={{
              fontSize: "14px",
              fontWeight: 700,
              color: "#fff",
              margin: "0 0 4px",
            }}
          >
            {bubble.user_name || "Anonyme"}
          </p>
          <p
            style={{
              fontSize: "16px",
              fontFamily: "Georgia, serif",
              fontStyle: "italic",
              color: "#fff",
              margin: 0,
              lineHeight: 1.4,
            }}
          >
            {bubble.title}
          </p>
        </div>

        <div
          style={{
            position: "absolute",
            right: "16px",
            bottom: "100px",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            alignItems: "center",
          }}
        >
          {[
            { icon: "✦", label: String(bubble.sparks_count || 0) },
            { icon: "💬", label: "" },
            { icon: "📤", label: "" },
            { icon: "🔖", label: "" },
          ].map(({ icon, label }, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ fontSize: "28px" }}>{icon}</div>
              {label !== "" && (
                <p style={{ fontSize: "11px", color: "#fff", margin: 0 }}>{label}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
