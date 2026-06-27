import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";

interface ActionBarProps {
  memoryId: string;
  memoryTitle: string;
  authorName: string;
  initialSparks?: number;
  initialComments?: number;
  userName: string;
  onReply?: () => void;
  onComment?: () => void;
}

export default function ActionBar({
  memoryId,
  memoryTitle,
  authorName,
  initialSparks = 0,
  initialComments = 0,
  userName,
  onReply,
  onComment,
}: ActionBarProps) {
  const { lang } = useLanguage();
  const [sparks, setSparks] = useState(initialSparks);
  const [sparked, setSparked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [comments, setComments] = useState(initialComments);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setComments(initialComments);
  }, [initialComments]);

  // Vérifier si déjà liké / bookmarké
  useEffect(() => {
    if (!userName || !memoryId) return;
    const check = async () => {
      const [sparkRes, bookmarkRes] = await Promise.all([
        supabase
          .from("memory_sparks")
          .select("id")
          .eq("memory_id", memoryId)
          .eq("user_name", userName)
          .maybeSingle(),
        supabase
          .from("memory_bookmarks")
          .select("id")
          .eq("memory_id", memoryId)
          .eq("user_name", userName)
          .maybeSingle(),
      ]);
      if (sparkRes.data) setSparked(true);
      if (bookmarkRes.data) setBookmarked(true);
    };
    check();
  }, [memoryId, userName]);

  // ✦ ÉTINCELLE (like)
  const handleSpark = async () => {
    if (loading) return;
    setLoading(true);
    try {
      if (sparked) {
        // Retirer le like
        await supabase
          .from("memory_sparks")
          .delete()
          .eq("memory_id", memoryId)
          .eq("user_name", userName || "anonymous");
        setSparked(false);
        setSparks((s) => Math.max(0, s - 1));
        await supabase
          .from("memories")
          .update({ sparks_count: Math.max(0, sparks - 1) })
          .eq("id", memoryId);
      } else {
        // Ajouter le like
        await supabase.from("memory_sparks").insert({
          memory_id: memoryId,
          user_name: userName || "anonymous",
        });
        setSparked(true);
        setSparks((s) => s + 1);
        await supabase
          .from("memories")
          .update({ sparks_count: sparks + 1 })
          .eq("id", memoryId);
      }
    } catch (err) {
      console.error("Spark error:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🔖 BOOKMARK
  const handleBookmark = async () => {
    if (loading) return;
    setLoading(true);
    try {
      if (bookmarked) {
        await supabase
          .from("memory_bookmarks")
          .delete()
          .eq("memory_id", memoryId)
          .eq("user_name", userName || "anonymous");
        setBookmarked(false);
      } else {
        await supabase.from("memory_bookmarks").insert({
          memory_id: memoryId,
          user_name: userName || "anonymous",
        });
        setBookmarked(true);
      }
    } catch (err) {
      console.error("Bookmark error:", err);
    } finally {
      setLoading(false);
    }
  };

  // 📤 PARTAGER WhatsApp
  const handleShare = () => {
    const truncated =
      memoryTitle.length > 60
        ? memoryTitle.slice(0, 55) + "…"
        : memoryTitle + "…";
    const text = {
      fr: `"${truncated}"\n— ${authorName}\n\nÉcoute ce souvenir 👇\nhttps://infeelit.com`,
      en: `"${truncated}"\n— ${authorName}\n\nListen to this memory 👇\nhttps://infeelit.com`,
      ar: `"${truncated}"\n— ${authorName}\n\nاستمع لهذه الذكرى 👇\nhttps://infeelit.com`,
    }[lang as "fr" | "en" | "ar"] || `https://infeelit.com`;

    if (navigator.share) {
      navigator.share({ title: "Infeelit", text }).catch(() => {
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
      });
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
    }
  };

  const btnStyle = (active: boolean, activeColor: string) => ({
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    gap: "3px",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "8px 6px",
    borderRadius: "12px",
    minWidth: "52px",
    transition: "opacity 0.15s ease",
    opacity: loading ? 0.6 : 1,
  });

  const iconStyle = (active: boolean, color: string) => ({
    fontSize: "22px",
    color: active ? color : "rgba(61,43,31,0.5)",
    transition: "transform 0.2s ease",
    transform: active ? "scale(1.15)" : "scale(1)",
  });

  const labelStyle = (active: boolean, color: string) => ({
    fontSize: "11px",
    fontWeight: 600,
    color: active ? color : "rgba(61,43,31,0.45)",
    fontFamily: "system-ui, sans-serif",
    letterSpacing: "0.01em",
  });

  return (
    <div style={{
      display: "flex",
      justifyContent: "space-around",
      alignItems: "center",
      padding: "8px 12px 12px",
      borderTop: "1px solid rgba(232,116,42,0.07)",
      background: "rgba(253,248,240,0.98)",
    }}>

      {/* ✦ ÉTINCELLE */}
      <button style={btnStyle(sparked, "#E8742A")} onClick={handleSpark}>
        <span style={iconStyle(sparked, "#E8742A")}>
          {sparked ? "✦" : "✧"}
        </span>
        <span style={labelStyle(sparked, "#E8742A")}>
          {sparks > 0 ? sparks : (
            lang === "fr" ? "Étincelle"
            : lang === "ar" ? "شرارة"
            : "Spark"
          )}
        </span>
      </button>

      {/* 💬 COMMENTER */}
      <button style={btnStyle(false, "#E8742A")} onClick={onComment}>
        <span style={{ fontSize: "22px", color: "rgba(61,43,31,0.5)" }}>
          💬
        </span>
        <span style={labelStyle(false, "#E8742A")}>
          {comments > 0 ? comments : (
            lang === "fr" ? "Commenter"
            : lang === "ar" ? "تعليق"
            : "Comment"
          )}
        </span>
      </button>

      {/* 🎙️ ET TOI ? */}
      <button style={btnStyle(false, "#E8742A")} onClick={onReply}>
        <span style={{ fontSize: "22px", color: "rgba(61,43,31,0.5)" }}>
          🎙️
        </span>
        <span style={labelStyle(false, "#E8742A")}>
          {lang === "fr" ? "Et toi ?"
          : lang === "ar" ? "وأنت؟"
          : "And you?"}
        </span>
      </button>

      {/* 📤 PARTAGER */}
      <button style={btnStyle(false, "#E8742A")} onClick={handleShare}>
        <span style={{ fontSize: "22px", color: "rgba(61,43,31,0.5)" }}>
          📤
        </span>
        <span style={labelStyle(false, "#E8742A")}>
          {lang === "fr" ? "Partager"
          : lang === "ar" ? "مشاركة"
          : "Share"}
        </span>
      </button>

      {/* 🔖 GARDER */}
      <button style={btnStyle(bookmarked, "#D4AF37")} onClick={handleBookmark}>
        <span style={iconStyle(bookmarked, "#D4AF37")}>
          {bookmarked ? "🔖" : "🔖"}
        </span>
        <span style={labelStyle(bookmarked, "#D4AF37")}>
          {lang === "fr" ? "Garder"
          : lang === "ar" ? "حفظ"
          : "Save"}
        </span>
      </button>

    </div>
  );
}
