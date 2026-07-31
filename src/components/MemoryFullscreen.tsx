import { useState } from "react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import SubtitleDisplay from "@/components/SubtitleDisplay";
import { supabase } from "@/integrations/supabase/client";
import generateEchoCard, { generateStoriesCard } from "@/components/EchoCard";

interface MemoryFullscreenProps {
  bubble: {
    id: string;
    title?: string | null;
    file_url?: string | null;
    file_type?: string | null;
    user_id?: string;
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
  currentUserId,
}: MemoryFullscreenProps) {
  const { lang, rtl } = useLanguage();
  const [isClosing, setIsClosing] = useState(false);
  const [reportSent, setReportSent] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [anonymous, setAnonymous] = useState(false);
  const [sharingBusy, setSharingBusy] = useState(false);

  const isOwner = !!(currentUserId && bubble.user_id && currentUserId === bubble.user_id);
  const memoryUrl = `https://infeelit.com/memory/${bubble.id}`;
  const ogShareUrl = `https://rynnnhxfrcebdandsbjn.supabase.co/functions/v1/og-meta?id=${bubble.id}`;

  const handleReport = async () => {
    if (!currentUserId || !bubble.id || reportSent) return;
    const reason = prompt(
      lang === "fr"
        ? "Raison du signalement :"
        : lang === "ar"
          ? "سبب البلاغ:"
          : "Reason for report:",
    );
    if (!reason) return;

    const { error } = await supabase.from("memory_reports").insert({
      memory_id: bubble.id,
      reporter_name: currentUserId,
      reason: reason,
      user_id: currentUserId,
    });

    if (error) {
      console.error("Report failed:", error);
      alert(
        lang === "fr"
          ? "Impossible d'envoyer le signalement."
          : lang === "ar"
            ? "تعذر إرسال البلاغ."
            : "Could not send report.",
      );
      return;
    }

    await supabase
      .from("memories")
      .update({ moderation_status: "reported" })
      .eq("id", bubble.id);

    setReportSent(true);
    alert(
      lang === "fr"
        ? "Signalement envoyé. Merci."
        : lang === "ar"
          ? "تم إرسال البلاغ. شكراً."
          : "Report sent. Thank you.",
    );
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 400);
  };

  const handleDownloadEchoCard = async () => {
    if (sharingBusy) return;
    setSharingBusy(true);
    try {
      const blob = await generateEchoCard(bubble, anonymous);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "infeelit-memory.png";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Echo Card generation failed:", err);
      alert(
        lang === "fr"
          ? "Impossible de générer la carte."
          : lang === "ar"
            ? "تعذر إنشاء البطاقة."
            : "Could not generate Echo Card.",
      );
    } finally {
      setSharingBusy(false);
    }
  };

  const shareText = anonymous
    ? `A memory preserved on Infeelit ✦\n${ogShareUrl}`
    : `"${bubble.title || "A memory"}" — a voice preserved on Infeelit ✦\n${ogShareUrl}`;

  const handleShareLink = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ text: shareText, url: ogShareUrl });
      } else {
        await navigator.clipboard.writeText(ogShareUrl);
        alert(
          lang === "fr"
            ? "Lien copié !"
            : lang === "ar"
              ? "تم نسخ الرابط!"
              : "Link copied!",
        );
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return;
      try {
        await navigator.clipboard.writeText(ogShareUrl);
        alert(
          lang === "fr"
            ? "Lien copié !"
            : lang === "ar"
              ? "تم نسخ الرابط!"
              : "Link copied!",
        );
      } catch {
        /* ignore */
      }
    }
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(
      anonymous
        ? `A memory preserved on Infeelit ✦\n${ogShareUrl}`
        : `"${bubble.title || "A memory"}" — listen to this memory ✦\n${ogShareUrl}`,
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const handleDownloadStoriesCard = async () => {
    if (sharingBusy) return;
    setSharingBusy(true);
    try {
      const blob = await generateStoriesCard(bubble, anonymous);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "infeelit-stories.png";
      a.click();
      URL.revokeObjectURL(url);
      toast.success(
        "Stories card downloaded! Upload to Instagram Stories and add a link sticker.",
      );
    } catch (err) {
      console.error("Stories card failed:", err);
      toast.error("Could not generate Stories card.");
    } finally {
      setSharingBusy(false);
    }
  };

  const transcript =
    bubble.transcript_fr || bubble.transcript_en || bubble.transcript_ar || "";

  const captions = {
    whatsapp: `"${bubble.title || "A memory"}" — écoute ce souvenir ✦\n${ogShareUrl}`,
    instagram: `${bubble.title || "A memory"}\n\n"${transcript.slice(0, 80)}..."\n\nLa suite sur infeelit.com — lien en bio ✦\n\n#infeelit #memoire #famille #voix`,
    tiktok: `${bubble.title || "A memory"}\n\n"${transcript.slice(0, 60)}..."\n\ninfeelit.com (lien en bio)\n\n#infeelit #memoire #famille`,
    linkedin: `J'ai préservé ce souvenir sur Infeelit.\n\n"${bubble.title || "A memory"}"\n\n"${transcript.slice(0, 120)}..."\n\nChaque voix mérite de durer. ${ogShareUrl} ✦`,
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

        {currentUserId && bubble.user_id && bubble.user_id !== currentUserId && (
          <button
            onClick={handleReport}
            disabled={reportSent}
            style={{
              background: "none",
              border: "none",
              color: reportSent ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.3)",
              fontSize: "11px",
              cursor: reportSent ? "default" : "pointer",
              padding: "8px",
            }}
          >
            ⚑{" "}
            {reportSent
              ? lang === "fr"
                ? "Signalé"
                : lang === "ar"
                  ? "تم الإبلاغ"
                  : "Reported"
              : lang === "fr"
                ? "Signaler"
                : lang === "ar"
                  ? "إبلاغ"
                  : "Report"}
          </button>
        )}
      </div>

      {isOwner && (
        <div
          style={{
            position: "absolute",
            bottom: "100px",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            width: "100%",
            maxWidth: "320px",
            padding: "0 24px",
            zIndex: 20,
            boxSizing: "border-box",
          }}
        >
          <button
            onClick={() => setShowShareOptions(true)}
            style={{
              width: "100%",
              padding: "16px",
              borderRadius: "999px",
              background: "linear-gradient(135deg, #E8742A, #D4621A)",
              color: "#fff",
              fontWeight: 700,
              fontSize: "15px",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            ✦ Share this memory
          </button>
        </div>
      )}

      {showShareOptions && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.9)",
            zIndex: 300,
            display: "flex",
            alignItems: "flex-end",
          }}
          onClick={() => setShowShareOptions(false)}
        >
          <div
            style={{
              width: "100%",
              background: "#0f0501",
              borderRadius: "24px 24px 0 0",
              padding: "32px 24px 48px",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              style={{
                color: "#fff",
                fontSize: "18px",
                fontFamily: "Georgia, serif",
                fontStyle: "italic",
                textAlign: "center",
                marginBottom: "8px",
              }}
            >
              Share this memory
            </h3>

            <p
              style={{
                color: "rgba(255,255,255,0.4)",
                fontSize: "13px",
                textAlign: "center",
                marginBottom: "24px",
              }}
            >
              Only the question and a teaser will be shared. Your full voice stays private.
            </p>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 16px",
                background: "rgba(255,255,255,0.05)",
                borderRadius: "12px",
                marginBottom: "20px",
              }}
            >
              <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "14px" }}>
                Share anonymously
              </span>
              <input
                type="checkbox"
                checked={anonymous}
                onChange={(e) => setAnonymous(e.target.checked)}
                style={{ width: "20px", height: "20px", cursor: "pointer" }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <button
                onClick={handleDownloadEchoCard}
                disabled={sharingBusy}
                style={{
                  width: "100%",
                  padding: "16px",
                  borderRadius: "16px",
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: "15px",
                  cursor: sharingBusy ? "wait" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  opacity: sharingBusy ? 0.7 : 1,
                }}
              >
                <span style={{ fontSize: "24px" }}>🖼</span>
                <div style={{ textAlign: "left" }}>
                  <p style={{ margin: 0, fontWeight: 700 }}>
                    {sharingBusy ? "Generating…" : "Download Echo Card"}
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "12px",
                      color: "rgba(255,255,255,0.4)",
                    }}
                  >
                    For Instagram Stories & LinkedIn
                  </p>
                </div>
              </button>

              <button
                onClick={handleShareLink}
                style={{
                  width: "100%",
                  padding: "16px",
                  borderRadius: "16px",
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: "15px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <span style={{ fontSize: "24px" }}>🔗</span>
                <div style={{ textAlign: "left" }}>
                  <p style={{ margin: 0, fontWeight: 700 }}>Share link</p>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "12px",
                      color: "rgba(255,255,255,0.4)",
                    }}
                  >
                    For WhatsApp & iMessage preview
                  </p>
                </div>
              </button>

              <button
                onClick={handleWhatsApp}
                style={{
                  width: "100%",
                  padding: "16px",
                  borderRadius: "16px",
                  background: "rgba(37,211,102,0.15)",
                  border: "1px solid rgba(37,211,102,0.3)",
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: "15px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <span style={{ fontSize: "24px" }}>📱</span>
                <div style={{ textAlign: "left" }}>
                  <p style={{ margin: 0, fontWeight: 700 }}>Send on WhatsApp</p>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "12px",
                      color: "rgba(255,255,255,0.4)",
                    }}
                  >
                    Direct share to contacts
                  </p>
                </div>
              </button>

              <button
                onClick={handleDownloadStoriesCard}
                disabled={sharingBusy}
                style={{
                  width: "100%",
                  padding: "16px",
                  borderRadius: "16px",
                  background: "rgba(193,53,132,0.15)",
                  border: "1px solid rgba(193,53,132,0.3)",
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: "15px",
                  cursor: sharingBusy ? "wait" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginTop: "8px",
                  opacity: sharingBusy ? 0.7 : 1,
                }}
              >
                <span style={{ fontSize: "24px" }}>📸</span>
                <div style={{ textAlign: "left" }}>
                  <p style={{ margin: 0, fontWeight: 700 }}>
                    Download for Instagram Stories
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "12px",
                      color: "rgba(255,255,255,0.4)",
                    }}
                  >
                    Add a link sticker in Stories
                  </p>
                </div>
              </button>
            </div>

            <div style={{ marginTop: "16px" }}>
              <p
                style={{
                  color: "rgba(255,255,255,0.4)",
                  fontSize: "11px",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  marginBottom: "10px",
                  textAlign: "center",
                }}
              >
                Caption kit — copy & paste
              </p>

              {(
                [
                  { platform: "WhatsApp", key: "whatsapp" as const },
                  { platform: "Instagram", key: "instagram" as const },
                  { platform: "TikTok", key: "tiktok" as const },
                  { platform: "LinkedIn", key: "linkedin" as const },
                ] as const
              ).map(({ platform, key }) => (
                <button
                  key={key}
                  onClick={async () => {
                    await navigator.clipboard.writeText(captions[key]);
                    toast.success(`${platform} caption copied!`);
                  }}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: "12px",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "rgba(255,255,255,0.7)",
                    fontSize: "13px",
                    cursor: "pointer",
                    textAlign: "left",
                    marginBottom: "8px",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <span>Copy {platform} caption</span>
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowShareOptions(false)}
              style={{
                background: "none",
                border: "none",
                color: "rgba(255,255,255,0.3)",
                fontSize: "14px",
                cursor: "pointer",
                width: "100%",
                textAlign: "center",
                marginTop: "16px",
                padding: "8px",
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
