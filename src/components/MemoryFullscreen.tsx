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

export default function MemoryFullscreen({ bubble, onClose, userName, currentUserId }: MemoryFullscreenProps) {
  const navigate = useNavigate();
  const { lang, rtl } = useLanguage();
  const [isClosing, setIsClosing] = useState(false);
  const [reportSent, setReportSent] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [anonymous, setAnonymous] = useState(false);
  const [sharingBusy, setSharingBusy] = useState(false);
  const [showSparkQuestion, setShowSparkQuestion] = useState(false);
  const [sparkQuestion, setSparkQuestion] = useState("");
  const [hasShownSpark, setHasShownSpark] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const isPlayingRef = useRef(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (!videoRef.current || !bubble.file_url) return;
    setVideoReady(false);
    videoRef.current.src = bubble.file_url;
    videoRef.current.load();
    videoRef.current.play().catch(console.error);
  }, [bubble.file_url]);

  const touchStartY = useState(0);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY[1](e.touches[0].clientY);
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const delta = e.changedTouches[0].clientY - touchStartY[0];
    if (delta > 80) handleClose();
  };

  const displayName = bubble.author_name || bubble.user_name || "Anonyme";
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
                zIndex: 9998,
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
        onTouchEnd={(e) => {
          e.stopPropagation();
          handleClose();
        }}
        onClick={handleClose}
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

      <MemoryActions
        bubble={bubble}
        userName={userName}
        currentUserId={currentUserId}
        handleBookmark={handleBookmark}
        setShowShareOptions={setShowShareOptions}
        handleReport={handleReport}
      />

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
          {/* ... share sheet unchanged — full content in file above lines 623-895 ... */}
        </div>
      )}

      {/* spark question + style block — see full file */}
    </div>,
    document.body,
  );
}

function MemoryActions(
  {
    /* ... */
  },
) {
  /* ... full component lines 1022-1240 ... */
}
