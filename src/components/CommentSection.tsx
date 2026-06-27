import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";

interface Comment {
  id: string;
  user_name: string;
  content: string;
  created_at: string;
}

interface CommentSectionProps {
  memoryId: string;
  userName: string;
  onClose: () => void;
  onCountChange?: (count: number) => void;
}

export default function CommentSection({
  memoryId,
  userName,
  onClose,
  onCountChange,
}: CommentSectionProps) {
  const { lang, rtl } = useLanguage();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  // Charger les commentaires
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("memory_comments")
        .select("*")
        .eq("memory_id", memoryId)
        .order("created_at", { ascending: true });
      setComments(data || []);
      onCountChange?.(data?.length || 0);
      setLoading(false);
    };
    load();
  }, [memoryId]);

  // Envoyer un commentaire
  const handleSend = async () => {
    if (!newComment.trim() || sending) return;
    setSending(true);
    try {
      const { data } = await supabase
        .from("memory_comments")
        .insert({
          memory_id: memoryId,
          user_name: userName || "Anonyme",
          content: newComment.trim(),
        })
        .select()
        .single();

      if (data) {
        setComments((prev) => [...prev, data]);
        setNewComment("");
        onCountChange?.(comments.length + 1);
        // Mettre à jour le compteur dans memories
        await supabase
          .from("memories")
          .update({ comments_count: comments.length + 1 })
          .eq("id", memoryId);
      }
    } catch (err) {
      console.error("Comment error:", err);
    } finally {
      setSending(false);
    }
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString(
      lang === "ar" ? "ar-SA" : lang === "fr" ? "fr-FR" : "en-US",
      { day: "numeric", month: "short" }
    );
  };

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      zIndex: 100,
      display: "flex",
      flexDirection: "column",
      justifyContent: "flex-end",
    }}>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(45,24,16,0.6)",
          backdropFilter: "blur(4px)",
        }}
      />

      {/* Panel commentaires */}
      <div style={{
        position: "relative",
        zIndex: 1,
        background: "#FDF8F0",
        borderRadius: "24px 24px 0 0",
        maxHeight: "75vh",
        display: "flex",
        flexDirection: "column",
        animation: "sheetUp 0.3s cubic-bezier(0.32,0.72,0,1)",
      }}>

        {/* Handle */}
        <div style={{
          width: 36, height: 4, borderRadius: 2,
          background: "rgba(61,43,31,0.15)",
          margin: "12px auto 0",
          flexShrink: 0,
        }} />

        {/* Header */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 20px 12px",
          borderBottom: "1px solid rgba(232,116,42,0.08)",
          flexShrink: 0,
        }}>
          <p style={{
            fontSize: "16px",
            fontWeight: 700,
            color: "#3D2B1F",
            margin: 0,
            fontFamily: "Georgia, serif",
          }}>
            {lang === "fr" ? `${comments.length} commentaire${comments.length !== 1 ? "s" : ""}`
            : lang === "ar" ? `${comments.length} تعليق`
            : `${comments.length} comment${comments.length !== 1 ? "s" : ""}`}
          </p>
          <button
            onClick={onClose}
            style={{
              background: "rgba(61,43,31,0.08)",
              border: "none",
              borderRadius: "50%",
              width: 32, height: 32,
              cursor: "pointer",
              fontSize: "16px",
              color: "#3D2B1F",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ×
          </button>
        </div>

        {/* Liste commentaires */}
        <div style={{
          flex: 1,
          overflowY: "auto",
          padding: "12px 20px",
        }}>
          {loading && (
            <div style={{ textAlign: "center", padding: "24px 0" }}>
              <p style={{ color: "rgba(61,43,31,0.4)", fontSize: "13px" }}>
                {lang === "fr" ? "Chargement…" : lang === "ar" ? "جارٍ التحميل…" : "Loading…"}
              </p>
            </div>
          )}

          {!loading && comments.length === 0 && (
            <div style={{ textAlign: "center", padding: "32px 0" }}>
              <p style={{ fontSize: "32px", marginBottom: "8px" }}>💬</p>
              <p style={{
                fontSize: "15px",
                fontFamily: "Georgia, serif",
                fontStyle: "italic",
                color: "rgba(61,43,31,0.5)",
              }}>
                {lang === "fr" ? "Sois le premier à commenter."
                : lang === "ar" ? "كن أوّل من يعلّق."
                : "Be the first to comment."}
              </p>
            </div>
          )}

          {comments.map((c) => (
            <div key={c.id} style={{
              marginBottom: "16px",
              display: "flex",
              gap: "10px",
              alignItems: "flex-start",
              direction: rtl ? "rtl" : "ltr",
            }}>
              {/* Avatar initiale */}
              <div style={{
                width: 36, height: 36,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #E8742A, #D4621A)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}>
                <span style={{ color: "#fff", fontWeight: 700, fontSize: "14px" }}>
                  {(c.user_name || "?")[0].toUpperCase()}
                </span>
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "3px" }}>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: "#3D2B1F" }}>
                    {c.user_name}
                  </span>
                  <span style={{ fontSize: "11px", color: "rgba(61,43,31,0.35)" }}>
                    {formatDate(c.created_at)}
                  </span>
                </div>
                <p style={{
                  fontSize: "14px",
                  color: "#3D2B1F",
                  lineHeight: 1.5,
                  margin: 0,
                  background: "rgba(232,116,42,0.06)",
                  borderRadius: "0 12px 12px 12px",
                  padding: "8px 12px",
                }}>
                  {c.content}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Saisie du commentaire */}
        <div style={{
          padding: "12px 20px calc(16px + env(safe-area-inset-bottom))",
          borderTop: "1px solid rgba(232,116,42,0.08)",
          display: "flex",
          gap: "10px",
          alignItems: "flex-end",
          flexShrink: 0,
          background: "#FDF8F0",
        }}>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={
              lang === "fr" ? "Laisse un message…"
              : lang === "ar" ? "اترك تعليقاً…"
              : "Leave a message…"
            }
            rows={1}
            dir={rtl ? "rtl" : "ltr"}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            style={{
              flex: 1,
              padding: "12px 14px",
              borderRadius: "16px",
              border: "1px solid rgba(232,116,42,0.2)",
              background: "#fff",
              fontSize: "15px",
              color: "#3D2B1F",
              resize: "none",
              outline: "none",
              fontFamily: "system-ui, sans-serif",
              lineHeight: 1.5,
              textAlign: rtl ? "right" : "left",
            }}
          />

          <button
            onClick={handleSend}
            disabled={!newComment.trim() || sending}
            style={{
              width: 44, height: 44,
              borderRadius: "50%",
              background: newComment.trim()
                ? "linear-gradient(135deg, #E8742A, #D4621A)"
                : "rgba(232,116,42,0.2)",
              border: "none",
              cursor: newComment.trim() ? "pointer" : "not-allowed",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              transition: "all 0.2s ease",
            }}
          >
            <span style={{ color: "#fff", fontSize: "18px" }}>
              {sending ? "…" : (rtl ? "←" : "→")}
            </span>
          </button>
        </div>
      </div>

      <style>{`
        @keyframes sheetUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
