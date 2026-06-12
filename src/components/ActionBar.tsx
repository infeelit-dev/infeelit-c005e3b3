import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface ActionBarProps {
  memoryId: string;
  memoryTitle: string;
  authorName: string;
  initialSparks?: number;
  lang: "fr" | "en" | "ar";
  userName: string;
  questionFr?: string;
  questionEn?: string;
  questionAr?: string;
  questionBubbleFr?: string;
  questionBubbleEn?: string;
  questionBubbleAr?: string;
  followupsFr?: string[];
  followupsEn?: string[];
  followupsAr?: string[];
  onReply?: () => void;
}

export default function ActionBar({
  memoryId,
  memoryTitle,
  authorName,
  initialSparks = 0,
  lang,
  userName,
  questionFr,
  questionEn,
  questionAr,
  questionBubbleFr,
  questionBubbleEn,
  questionBubbleAr,
  followupsFr,
  followupsEn,
  followupsAr,
  onReply,
}: ActionBarProps) {
  const navigate = useNavigate();

  const [sparks, setSparks] = useState(initialSparks);
  const [sparked, setSparked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const [replyCount, setReplyCount] = useState(0);

  useEffect(() => {
    const questionText = lang === "fr" ? questionFr : lang === "ar" ? questionAr : questionEn;
    if (!questionText) return;

    supabase
      .from("memories")
      .select("id", { count: "exact", head: true })
      .eq("title", questionText)
      .then(({ count, error }) => {
        if (!error && count !== null) setReplyCount(count);
      });
  }, [questionFr, questionEn, questionAr, lang]);

  const handleSpark = async () => {
    if (sparked) return;
    setSparked(true);
    setSparks((s) => s + 1);
    setShowAnimation(true);
    setTimeout(() => setShowAnimation(false), 800);

    try {
      await supabase.from("memory_sparks").insert({
        memory_id: memoryId,
        user_name: userName || "anonymous",
      });
      await supabase
        .from("memories")
        .update({ sparks_count: sparks + 1 })
        .eq("id", memoryId);
    } catch (err) {
      console.error(err);
    }
  };

  const handleShare = () => {
    const truncated = memoryTitle.length > 55 ? memoryTitle.slice(0, 50) + "…" : memoryTitle + "…";

    const text = {
      fr: `"${truncated}"\n— ${authorName}\n\nÉcoute ce souvenir et ajoute le tien 👇\nhttps://infeelit.com`,
      en: `"${truncated}"\n— ${authorName}\n\nListen to this memory and add yours 👇\nhttps://infeelit.com`,
      ar: `"${truncated}"\n— ${authorName}\n\nاستمع لهذه الذكرى وأضف ذكراك 👇\nhttps://infeelit.com`,
    }[lang];

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, "_blank");
  };

  const handleBookmark = async () => {
    setBookmarked((b) => !b);
    try {
      if (!bookmarked) {
        await supabase.from("memory_bookmarks").insert({
          memory_id: memoryId,
          user_name: userName || "anonymous",
        });
      } else {
        await supabase
          .from("memory_bookmarks")
          .delete()
          .eq("memory_id", memoryId)
          .eq("user_name", userName || "anonymous");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReply = () => {
    if (onReply) {
      onReply();
      return;
    }

    const preSelectedQuestion = {
      fr: questionFr || "",
      en: questionEn || "",
      ar: questionAr || "",
      bubble_fr: questionBubbleFr || "Ta réponse",
      bubble_en: questionBubbleEn || "Your answer",
      bubble_ar: questionBubbleAr || "إجابتك",
      followups_fr: followupsFr || [],
      followups_en: followupsEn || [],
      followups_ar: followupsAr || [],
    };

    navigate("/record", {
      state: {
        preSelectedQuestion,
        inspiredBy: memoryId,
        replyTo: memoryId,
      },
    });
  };

  const btnStyle = {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    gap: "4px",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "8px",
    borderRadius: "12px",
    transition: "transform 0.15s ease",
    minWidth: "56px",
    position: "relative" as const,
  };

  const iconStyle = (active: boolean, color: string) => ({
    fontSize: "22px",
    filter: active ? `drop-shadow(0 0 6px ${color})` : "none",
    transform: active ? "scale(1.15)" : "scale(1)",
    transition: "transform 0.15s ease",
  });

  const labelStyle = {
    fontSize: "11px",
    fontWeight: 600,
    color: "rgba(61,43,31,0.5)",
    fontFamily: "system-ui, sans-serif",
    letterSpacing: "0.02em",
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        padding: "8px 16px 12px",
        borderTop: "1px solid rgba(232,116,42,0.08)",
        background: "rgba(253,248,240,0.95)",
        position: "relative",
      }}
    >
      <button style={btnStyle} onClick={handleSpark} aria-label="Spark">
        <span style={iconStyle(sparked, "#E8742A")}>{sparked ? "✦" : "✧"}</span>
        <span
          style={{
            ...labelStyle,
            color: sparked ? "#E8742A" : "rgba(61,43,31,0.5)",
            fontWeight: sparked ? 700 : 600,
          }}
        >
          {sparks > 0 ? sparks : lang === "fr" ? "Étincelle" : lang === "ar" ? "شرارة" : "Spark"}
        </span>
        {showAnimation && (
          <span
            style={{
              position: "absolute",
              top: "0",
              left: "50%",
              transform: "translateX(-50%)",
              fontSize: "20px",
              animation: "sparkFly 0.8s ease forwards",
              pointerEvents: "none",
            }}
          >
            ✦
          </span>
        )}
      </button>

      <button style={btnStyle} onClick={handleReply} aria-label="Reply">
        <span style={{ fontSize: "22px" }}>🎙️</span>
        <span style={labelStyle}>
          {replyCount > 0
            ? `${replyCount} ${lang === "fr" ? "réponses" : lang === "ar" ? "إجابات" : "answers"}`
            : lang === "fr"
              ? "Et toi ?"
              : lang === "ar"
                ? "وأنت؟"
                : "And you?"}
        </span>
      </button>

      <button style={btnStyle} onClick={handleShare} aria-label="Share">
        <span style={{ fontSize: "22px" }}>📤</span>
        <span style={labelStyle}>{lang === "fr" ? "Partager" : lang === "ar" ? "مشاركة" : "Share"}</span>
      </button>

      <button style={btnStyle} onClick={handleBookmark} aria-label="Bookmark">
        <span style={iconStyle(bookmarked, "#D4AF37")}>{bookmarked ? "🔖" : "🔖"}</span>
        <span
          style={{
            ...labelStyle,
            color: bookmarked ? "#D4AF37" : "rgba(61,43,31,0.5)",
          }}
        >
          {lang === "fr" ? "Garder" : lang === "ar" ? "حفظ" : "Save"}
        </span>
      </button>

      <style>{`
        @keyframes sparkFly {
          0% {
            opacity: 1;
            transform: translateX(-50%) translateY(0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateX(-50%) translateY(-40px) scale(1.5);
          }
        }
      `}</style>
    </div>
  );
}
