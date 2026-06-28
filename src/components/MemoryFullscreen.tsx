import { useRef, useEffect } from "react";
import type { BubbleData } from "@/components/BubbleCanvas";
import ActionBar from "@/components/ActionBar";

interface MemoryFullscreenProps {
  bubble: BubbleData;
  onClose: () => void;
  userName: string;
  lang: string;
}

const WAVE_HEIGHTS = [14, 22, 10, 18, 26, 16, 24, 12, 20, 28, 15, 22];

export default function MemoryFullscreen({ bubble, onClose, userName }: MemoryFullscreenProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const isVideo = bubble.file_type === "video";

  useEffect(() => {
    audioRef.current?.play().catch(() => {});
  }, [bubble.file_url]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: isVideo ? "#000" : "linear-gradient(160deg, #2D1810 0%, #8B3A1A 50%, #E8742A 100%)",
        animation: "expandFromBubble 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
      }}
    >
      <style>{`
        @keyframes expandFromBubble {
          from { transform: scale(0.3); opacity: 0; border-radius: 50%; }
          to { transform: scale(1); opacity: 1; border-radius: 0; }
        }
        @keyframes audioWave {
          0%, 100% { transform: scaleY(0.45); opacity: 0.65; }
          50% { transform: scaleY(1); opacity: 1; }
        }
      `}</style>

      {bubble.file_url && isVideo && (
        <video
          src={bubble.file_url}
          autoPlay
          playsInline
          controls
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      )}

      {bubble.file_url && !isVideo && (
        <>
          {bubble.thumbnail_url && (
            <img
              src={bubble.thumbnail_url}
              alt=""
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                opacity: 0.2,
              }}
            />
          )}
          <audio ref={audioRef} src={bubble.file_url} autoPlay style={{ display: "none" }} />
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "32px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "center",
                gap: "5px",
                height: "80px",
              }}
            >
              {WAVE_HEIGHTS.map((h, i) => (
                <div
                  key={i}
                  style={{
                    width: "5px",
                    height: `${h}px`,
                    borderRadius: "3px",
                    background: "linear-gradient(to top, #D4621A, #FFD080)",
                    transformOrigin: "bottom",
                    animation: `audioWave ${0.55 + (i % 4) * 0.12}s ease-in-out infinite`,
                    animationDelay: `${i * 0.05}s`,
                  }}
                />
              ))}
            </div>
            <button
              onClick={() => {
                const el = audioRef.current;
                if (!el) return;
                if (el.paused) el.play();
                else el.pause();
              }}
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                background: "rgba(255,255,255,0.15)",
                border: "2px solid rgba(255,255,255,0.35)",
                color: "#fff",
                fontSize: "24px",
                cursor: "pointer",
              }}
              aria-label="Play / Pause"
            >
              🎙️
            </button>
          </div>
        </>
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
            "linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 40%, rgba(0,0,0,0.25) 100%)",
          pointerEvents: "none",
        }}
      />

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
          zIndex: 2,
        }}
      >
        ←
      </button>

      <div
        style={{
          position: "absolute",
          bottom: "120px",
          left: "16px",
          right: "88px",
          zIndex: 2,
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

      {bubble.type === "real" && (
        <div
          style={{
            position: "absolute",
            right: "8px",
            bottom: "100px",
            zIndex: 2,
            pointerEvents: "auto",
          }}
        >
          <ActionBar
            memoryId={bubble.id}
            memoryTitle={bubble.title}
            authorName={bubble.user_name || "Anonyme"}
            initialSparks={bubble.sparks_count || 0}
            userName={userName}
            mode="spark-share"
            layout="vertical"
            theme="dark"
          />
        </div>
      )}
    </div>
  );
}
