import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { pickLocalized } from "@/lib/pickLocalized";
import SubtitleDisplay from "@/components/SubtitleDisplay";
import CommentSection from "@/components/CommentSection";
import { supabase } from "@/integrations/supabase/client";
import generateEchoCard, { generateStoriesCard, generateTeaserVideo } from "@/components/EchoCard";

interface MemoryFullscreenProps {
  bubble: {
    id: string;
    title?: string | null;
    file_url?: string | null;
    file_type?: string | null;
    user_id?: string;
    user_name?: string;
    author_name?: string | null;
    thumbnail_url?: string | null;
    image?: string | null;
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

export default function MemoryFullscreen({ bubble, onClose, currentUserId }: MemoryFullscreenProps) {
  const navigate = useNavigate();
  const { lang, rtl, t } = useLanguage();
  const [isClosing, setIsClosing] = useState(false);
  const [reportSent, setReportSent] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [anonymous, setAnonymous] = useState(false);
  const [sharingBusy, setSharingBusy] = useState(false);
  const [showSparkQuestion, setShowSparkQuestion] = useState(false);
  const [sparkQuestion, setSparkQuestion] = useState("");
  const [hasShownSpark, setHasShownSpark] = useState(false);
  // Icons visible by default; hide only while media is actively playing (onPlay/onPause)
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [isSparked, setIsSparked] = useState(false);
  const [sparksCount, setSparksCount] = useState(bubble.sparks_count || 0);
  const [commentsCount] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const isPlayingRef = useRef(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Force the browser to start buffering/playing as soon as the source changes
  useEffect(() => {
    if (!videoRef.current || !bubble.file_url) return;
    setVideoReady(false);
    videoRef.current.src = bubble.file_url;
    videoRef.current.load();
    videoRef.current.play().catch(console.error);
  }, [bubble.file_url]);

  // Swipe-down-to-close support
  const touchStartY = useState(0);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY[1](e.touches[0].clientY);
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const delta = e.changedTouches[0].clientY - touchStartY[0];
    if (delta > 80) handleClose();
  };

  // Prefer author_name (admin uploads) over user_name (profile)
  const displayName = bubble.author_name || bubble.user_name || "Anonyme";

  const isOwner = !!(currentUserId && bubble.user_id && currentUserId === bubble.user_id);
  const memoryUrl = `https://infeelit.com/memory/${bubble.id}`;
  const ogShareUrl = `https://rynnnhxfrcebdandsbjn.supabase.co/functions/v1/og-meta?id=${bubble.id}`;

  const generateSparkQuestion = () => {
    const title = bubble.title?.toLowerCase() || "";

    const questions: Record<string, Record<string, string>> = {
      cinema: {
        fr: "Et toi — quel est le premier film qui t'a bouleversé ?",
        en: "And you — what was the first film that moved you deeply?",
        ar: "وأنت — ما هو أول فيلم أثّر فيك بعمق؟",
      },
      film: {
        fr: "Et toi — quel film ne peux-tu jamais oublier ?",
        en: "And you — which film can you never forget?",
        ar: "وأنت — أي فيلم لا تستطيع نسيانه أبداً؟",
      },
      manger: {
        fr: "Et toi — quel plat te ramène instantanément à ton enfance ?",
        en: "And you — which dish instantly takes you back to childhood?",
        ar: "وأنت — أي طبق يعيدك فوراً إلى طفولتك؟",
      },
      cuisine: {
        fr: "Et toi — quelle odeur de cuisine ne peux-tu jamais oublier ?",
        en: "And you — what cooking smell can you never forget?",
        ar: "وأنت — أي رائحة طعام لا تستطيع نسيانها؟",
      },
      école: {
        fr: "Et toi — quel souvenir d'école t'a le plus marqué ?",
        en: "And you — what school memory marked you the most?",
        ar: "وأنت — أي ذكرى مدرسية أثّرت فيك أكثر؟",
      },
      school: {
        fr: "Et toi — quel professeur a changé quelque chose en toi ?",
        en: "And you — which teacher changed something in you?",
        ar: "وأنت — أي معلم غيّر شيئاً فيك؟",
      },
      maman: {
        fr: "Et toi — quelle est la dernière chose que ta maman t'a apprise ?",
        en: "And you — what is the last thing your mother taught you?",
        ar: "وأنت — ما آخر شيء علّمتك إياه أمّك؟",
      },
      papa: {
        fr: "Et toi — quelle phrase de ton père entends-tu encore ?",
        en: "And you — which words from your father do you still hear?",
        ar: "وأنت — أي كلمات والدك لا تزال تسمعها؟",
      },
      père: {
        fr: "Et toi — quelle leçon de vie t'a transmise ton père ?",
        en: "And you — what life lesson did your father pass on to you?",
        ar: "وأنت — أي درس حياة نقله إليك والدك؟",
      },
      mère: {
        fr: "Et toi — quel geste de ta mère te manque le plus ?",
        en: "And you — which gesture of your mother do you miss the most?",
        ar: "وأنت — أي إيماءة من أمّك تفتقدها أكثر؟",
      },
      enfance: {
        fr: "Et toi — quel est ton souvenir d'enfance le plus lumineux ?",
        en: "And you — what is your brightest childhood memory?",
        ar: "وأنت — ما هي أضوأ ذكريات طفولتك؟",
      },
      jouet: {
        fr: "Et toi — quel jouet as-tu le plus aimé dans ta vie ?",
        en: "And you — what toy did you love the most in your life?",
        ar: "وأنت — أي لعبة أحببتها أكثر في حياتك؟",
      },
      voyage: {
        fr: "Et toi — quel voyage a changé ta façon de voir le monde ?",
        en: "And you — which journey changed the way you see the world?",
        ar: "وأنت — أي رحلة غيّرت طريقة نظرتك للعالم؟",
      },
      maison: {
        fr: "Et toi — quelle maison de ton passé revois-tu en fermant les yeux ?",
        en: "And you — which house from your past do you see when you close your eyes?",
        ar: "وأنت — أي بيت من ماضيك تراه حين تغمض عينيك؟",
      },
      amour: {
        fr: "Et toi — quel moment d'amour n'as-tu jamais oublié ?",
        en: "And you — what moment of love have you never forgotten?",
        ar: "وأنت — أي لحظة حب لم تنسَها قط؟",
      },
      default: {
        fr: "Et toi — quel souvenir voudrais-tu préserver pour toujours ?",
        en: "And you — which memory would you like to preserve forever?",
        ar: "وأنت — أي ذكرى تريد الحفاظ عليها إلى الأبد؟",
      },
    };

    let matched = "default";
    for (const keyword of Object.keys(questions)) {
      if (keyword !== "default" && title.includes(keyword)) {
        matched = keyword;
        break;
      }
    }

    const langKey = lang === "fr" ? "fr" : lang === "ar" ? "ar" : "en";
    setSparkQuestion(questions[matched]?.[langKey] || questions.default[langKey]);
  };

  const handleReport = async () => {
    if (!currentUserId || !bubble.id || reportSent) return;
    const reason = prompt(
      pickLocalized(lang, { fr: "Raison du signalement :", ar: "سبب البلاغ:", en: "Reason for report:" }),
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
        pickLocalized(lang, {
          fr: "Impossible d'envoyer le signalement.",
          ar: "تعذر إرسال البلاغ.",
          en: "Could not send report.",
        }),
      );
      return;
    }

    await supabase.from("memories").update({ moderation_status: "reported" }).eq("id", bubble.id);

    setReportSent(true);
    alert(
      pickLocalized(lang, {
        fr: "Signalement envoyé. Merci.",
        ar: "تم إرسال البلاغ. شكراً.",
        en: "Report sent. Thank you.",
      }),
    );
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 400);
  };

  const handleSpark = () => {
    setIsSparked((prev) => !prev);
    setSparksCount((prev) => (isSparked ? Math.max(0, prev - 1) : prev + 1));
  };

  const handleBookmark = () => {
    toast.info("Saved to bookmarks");
  };

  const handleDownloadEchoCard = async () => {
    if (sharingBusy) return;
    setSharingBusy(true);
    try {
      const blob = await generateEchoCard(bubble, anonymous, lang);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "infeelit-memory.png";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Echo Card generation failed:", err);
      alert(
        pickLocalized(lang, {
          fr: "Impossible de générer la carte.",
          ar: "تعذر إنشاء البطاقة.",
          en: "Could not generate Echo Card.",
        }),
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
        alert(pickLocalized(lang, { fr: "Lien copié !", ar: "تم نسخ الرابط!", en: "Link copied!" }));
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return;
      try {
        await navigator.clipboard.writeText(ogShareUrl);
        alert(pickLocalized(lang, { fr: "Lien copié !", ar: "تم نسخ الرابط!", en: "Link copied!" }));
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
      toast.success("Stories card downloaded! Upload to Instagram Stories and add a link sticker.");
    } catch (err) {
      console.error("Stories card failed:", err);
      toast.error("Could not generate Stories card.");
    } finally {
      setSharingBusy(false);
    }
  };

  const handleGenerateTeaserVideo = async () => {
    if (sharingBusy) return;
    setSharingBusy(true);
    toast.info("Generating teaser video... (~12 seconds)");
    try {
      const blob = await generateTeaserVideo(bubble);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = blob.type.includes("mp4") ? "infeelit-teaser.mp4" : "infeelit-teaser.webm";
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Teaser video ready! Upload to TikTok or Instagram Reels.");
    } catch (err) {
      console.error("Teaser video failed:", err);
      toast.error("Could not generate teaser video on this device.");
    } finally {
      setSharingBusy(false);
    }
  };

  const transcript = bubble.transcript_fr || bubble.transcript_en || bubble.transcript_ar || "";

  const captions = {
    whatsapp: `"${bubble.title || "A memory"}" — écoute ce souvenir ✦\n${ogShareUrl}`,
    instagram: `${bubble.title || "A memory"}\n\n"${transcript.slice(0, 80)}..."\n\nLa suite sur infeelit.com — lien en bio ✦\n\n#infeelit #memoire #famille #voix`,
    tiktok: `${bubble.title || "A memory"}\n\n"${transcript.slice(0, 60)}..."\n\ninfeelit.com (lien en bio)\n\n#infeelit #memoire #famille`,
    linkedin: `J'ai préservé ce souvenir sur Infeelit.\n\n"${bubble.title || "A memory"}"\n\n"${transcript.slice(0, 120)}..."\n\nChaque voix mérite de durer. ${ogShareUrl} ✦`,
  };

  const isAudio = bubble.file_type === "audio";

  return createPortal(
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "#000",
        animation: isClosing ? "bloomClose 0.4s ease-in forwards" : "bloomReveal 0.4s ease-out forwards",
      }}
    >
      {!isAudio && bubble.file_url && (
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#000",
          }}
        >
          {!videoReady && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#000",
                zIndex: 10001,
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  border: "3px solid rgba(232,116,42,0.3)",
                  borderTop: "3px solid #E8742A",
                  animation: "spin 1s linear infinite",
                }}
              />
            </div>
          )}
          <video
            ref={videoRef}
            src={bubble.file_url}
            autoPlay
            playsInline
            muted={false}
            preload="auto"
            crossOrigin="anonymous"
            poster={bubble.image || bubble.thumbnail_url || ""}
            onLoadStart={() => setVideoReady(false)}
            onCanPlay={() => setVideoReady(true)}
            onCanPlayThrough={() => setVideoReady(true)}
            onPlay={() => {
              isPlayingRef.current = true;
              setIsPlaying(true);
            }}
            onPause={() => {
              isPlayingRef.current = false;
              setIsPlaying(false);
            }}
            onEnded={() => {
              isPlayingRef.current = false;
              setIsPlaying(false);
              setTimeout(() => {
                if (isPlayingRef.current) return;
                if (!hasShownSpark) {
                  setHasShownSpark(true);
                  generateSparkQuestion();
                  setShowSparkQuestion(true);
                }
              }, 3000);
            }}
            style={{
              width: "100%",
              height: "100%",
              maxHeight: "100vh",
              objectFit: "contain",
            }}
          />
        </div>
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
              opacity: isPlaying ? 0 : 1,
              pointerEvents: isPlaying ? "none" : "auto",
              transition: "opacity 0.3s ease",
            }}
          >
            {(displayName || "?")[0]?.toUpperCase()}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              height: "48px",
              opacity: isPlaying ? 0 : 1,
              transition: "opacity 0.3s ease",
            }}
          >
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: "3px",
                  borderRadius: "999px",
                  background: "rgba(255,255,255,0.7)",
                  // No orange/wave glow while audio is playing — only after pause/end
                  animation: isPlaying ? "none" : `waveBar 1.2s ease-in-out ${i * 0.06}s infinite alternate`,
                  height: isPlaying ? "12px" : undefined,
                }}
              />
            ))}
          </div>

          {bubble.file_url && (
            <audio
              autoPlay
              style={{ display: "none" }}
              onPlay={() => {
                isPlayingRef.current = true;
                setIsPlaying(true);
              }}
              onPause={() => {
                isPlayingRef.current = false;
                setIsPlaying(false);
              }}
              onEnded={() => {
                isPlayingRef.current = false;
                setIsPlaying(false);
                setTimeout(() => {
                  if (isPlayingRef.current) return;
                  if (!hasShownSpark) {
                    setHasShownSpark(true);
                    generateSparkQuestion();
                    setShowSparkQuestion(true);
                  }
                }, 3000);
              }}
            >
              <source src={bubble.file_url} />
            </audio>
          )}
        </div>
      )}

      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 35%, rgba(0,0,0,0.2) 100%)",
          pointerEvents: "none",
          opacity: isPlaying ? 0 : 1,
          transition: "opacity 0.3s ease",
        }}
      />

      <button
        onPointerUp={(e) => {
          e.preventDefault();
          onClose();
        }}
        style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          width: "44px",
          height: "44px",
          borderRadius: "50%",
          background: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(255,255,255,0.2)",
          color: "#fff",
          fontSize: "20px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 99999,
          WebkitTapHighlightColor: "transparent",
          touchAction: "manipulation",
        }}
      >
        ×
      </button>

      {bubble.title && (
        <div
          style={{
            position: "fixed",
            top: "20px",
            left: "16px",
            right: "72px",
            zIndex: 10000,
            padding: "8px 16px",
            borderRadius: "12px",
            background: "rgba(232,116,42,0.85)",
            color: "#fff",
            fontSize: "14px",
            fontWeight: 600,
            lineHeight: 1.35,
            backdropFilter: "blur(8px)",
            direction: rtl ? "rtl" : "ltr",
          }}
        >
          {bubble.title}
        </div>
      )}

      <div
        style={{
          position: "fixed",
          bottom: "100px",
          left: "16px",
          right: "80px",
          zIndex: 100,
          direction: rtl ? "rtl" : "ltr",
          opacity: isPlaying ? 0 : 1,
          visibility: isPlaying ? "hidden" : "visible",
          pointerEvents: isPlaying ? "none" : "auto",
          transition: "opacity 0.3s ease",
        }}
      >
        <p
          style={{
            color: "#fff",
            fontWeight: 700,
            fontSize: "15px",
            margin: "0 0 4px",
            textShadow: "0 1px 4px rgba(0,0,0,0.5)",
          }}
        >
          {displayName}
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
          position: "fixed",
          right: "4px",
          bottom: "100px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "12px",
          zIndex: 10000,
          opacity: 1,
          pointerEvents: "auto",
          transition: "opacity 0.3s ease",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
          <button
            onPointerUp={handleSpark}
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              background: "rgba(0,0,0,0.3)",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              backdropFilter: "blur(8px)",
              WebkitTapHighlightColor: "transparent",
              touchAction: "manipulation",
              transform: isSparked ? "scale(1.1)" : "scale(1)",
              transition: "transform 0.2s ease",
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill={isSparked ? "#ff2d55" : "none"}
              stroke="white"
              strokeWidth="1.8"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
          <span style={{ color: "#fff", fontSize: "12px", fontWeight: 600, marginTop: "2px" }}>{sparksCount || 0}</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
          <button
            onPointerUp={() => setShowComments(true)}
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              background: "rgba(0,0,0,0.3)",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              backdropFilter: "blur(8px)",
              WebkitTapHighlightColor: "transparent",
              touchAction: "manipulation",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </button>
          <span style={{ color: "#fff", fontSize: "12px", fontWeight: 600, marginTop: "2px" }}>
            {commentsCount || 0}
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
          <button
            onPointerUp={handleBookmark}
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              background: "rgba(0,0,0,0.3)",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              backdropFilter: "blur(8px)",
              WebkitTapHighlightColor: "transparent",
              touchAction: "manipulation",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
          <button
            onPointerUp={() => setShowShareOptions(true)}
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              background: "rgba(0,0,0,0.3)",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              backdropFilter: "blur(8px)",
              WebkitTapHighlightColor: "transparent",
              touchAction: "manipulation",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8">
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
          </button>
        </div>

        {currentUserId && bubble.user_id !== currentUserId && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
            <button
              onPointerUp={handleReport}
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                background: "rgba(0,0,0,0.3)",
                border: "none",
                color: "rgba(255,255,255,0.5)",
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                backdropFilter: "blur(8px)",
                WebkitTapHighlightColor: "transparent",
                touchAction: "manipulation",
              }}
            >
              ⚑
            </button>
          </div>
        )}
      </div>

      {showComments && (
        <div style={{ position: "fixed", inset: 0, zIndex: 10001 }}>
          <CommentSection
            memoryId={bubble.id}
            userName={displayName}
            onClose={() => setShowComments(false)}
            onCountChange={(count) => {
              /* count updated in CommentSection itself */
            }}
          />
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
              <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "14px" }}>Share anonymously</span>
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
                  <p style={{ margin: 0, fontWeight: 700 }}>{sharingBusy ? "Generating…" : "Download Echo Card"}</p>
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
                  <p style={{ margin: 0, fontWeight: 700 }}>Download for Instagram Stories</p>
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

              <button
                onClick={handleGenerateTeaserVideo}
                disabled={sharingBusy}
                style={{
                  width: "100%",
                  padding: "16px",
                  borderRadius: "16px",
                  background: "rgba(0,0,0,0.3)",
                  border: "1px solid rgba(255,255,255,0.15)",
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
                <span style={{ fontSize: "24px" }}>🎵</span>
                <div style={{ textAlign: "left" }}>
                  <p style={{ margin: 0, fontWeight: 700 }}>Generate TikTok/Reels teaser</p>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "12px",
                      color: "rgba(255,255,255,0.4)",
                    }}
                  >
                    12s animated video with waveform
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

      {showSparkQuestion && !isPlaying && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.92)",
            zIndex: 300,
            display: "flex",
            alignItems: "flex-end",
            animation: "fadeIn 0.5s ease",
          }}
        >
          <div
            style={{
              width: "100%",
              background: "linear-gradient(to top, #0f0501, #1a0a05)",
              borderRadius: "24px 24px 0 0",
              padding: "40px 24px 56px",
              textAlign: "center",
              borderTop: "1px solid rgba(212,175,55,0.2)",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "3px",
                background: "rgba(255,255,255,0.2)",
                borderRadius: "999px",
                margin: "0 auto 24px",
              }}
            />

            <p
              style={{
                fontSize: "11px",
                fontWeight: 900,
                letterSpacing: "0.3em",
                color: "#D4AF37",
                textTransform: "uppercase",
                marginBottom: "16px",
              }}
            >
              ✦{" "}
              {lang === "fr"
                ? "Ce souvenir t'a touché"
                : lang === "ar"
                  ? "لمستك هذه الذكرى"
                  : "This memory touched you"}
            </p>

            <h3
              style={{
                color: "#fff",
                fontSize: "20px",
                fontFamily: "Georgia, serif",
                fontStyle: "italic",
                lineHeight: 1.5,
                marginBottom: "32px",
                padding: "0 8px",
              }}
            >
              {sparkQuestion}
            </h3>

            <button
              onClick={() => {
                setShowSparkQuestion(false);
                navigate("/record", {
                  state: {
                    question: sparkQuestion,
                    inspiredBy: {
                      memoryId: bubble.id,
                      title: bubble.title,
                    },
                  },
                });
              }}
              style={{
                width: "100%",
                padding: "18px",
                borderRadius: "18px",
                background: "linear-gradient(135deg, #E8742A, #D4621A)",
                color: "#fff",
                fontWeight: 700,
                fontSize: "16px",
                border: "none",
                cursor: "pointer",
                marginBottom: "12px",
                boxShadow: "0 4px 20px rgba(232,116,42,0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              🎙️ {lang === "fr" ? "Enregistrer ma réponse" : lang === "ar" ? "سجّل إجابتي" : "Record my answer"}
            </button>

            <button
              onClick={() => setShowSparkQuestion(false)}
              style={{
                background: "none",
                border: "none",
                color: "rgba(255,255,255,0.4)",
                fontSize: "14px",
                cursor: "pointer",
                padding: "8px",
              }}
            >
              {lang === "fr" ? "Plus tard" : lang === "ar" ? "لاحقاً" : "Maybe later"}
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>,
    document.body,
  );
}
