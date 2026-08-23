import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { pickLocalized } from "@/lib/pickLocalized";

interface NotificationRow {
  id: string;
  type: string | null;
  memory_id: string | null;
  from_user_id: string | null;
  read: boolean;
  created_at: string;
  message: string | null;
  memories?: { title: string | null } | null;
}

const Notifications = () => {
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const [items, setItems] = useState<NotificationRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate("/welcome");
        return;
      }

      const { data, error } = await supabase
        .from("notifications")
        .select("id, type, memory_id, from_user_id, read, created_at, message, memories(title)")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) {
        console.error("Load notifications failed:", error);
      }

      if (!cancelled) {
        setItems((data as NotificationRow[]) || []);
        setLoading(false);
      }

      await supabase
        .from("notifications")
        .update({ read: true })
        .eq("user_id", session.user.id)
        .eq("read", false);
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const labelFor = (n: NotificationRow) => {
    const title = n.memories?.title || pickLocalized(lang, { fr: "un souvenir", ar: "ذكرى", en: "a memory" });
    if (n.type === "spark") {
      return pickLocalized(lang, {
        fr: `Quelqu'un a aimé ton souvenir : ${title}`,
        ar: `أعجب شخص بذكراك: ${title}`,
        en: `Someone liked your memory: ${title}`,
      });
    }
    if (n.type === "comment") {
      return pickLocalized(lang, {
        fr: `Nouveau commentaire sur : ${title}`,
        ar: `تعليق جديد على: ${title}`,
        en: `New comment on: ${title}`,
      });
    }
    return n.message || title;
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f0501",
        color: "#fff",
        paddingBottom: "40px",
      }}
    >
      <div
        style={{
          padding: "56px 20px 16px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <button
          type="button"
          onClick={() => navigate(-1)}
          style={{
            background: "rgba(255,255,255,0.1)",
            border: "none",
            color: "#fff",
            borderRadius: "999px",
            padding: "10px 16px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          ←
        </button>
        <h1 style={{ margin: 0, fontSize: "20px", fontFamily: "Georgia, serif", fontStyle: "italic" }}>
          {pickLocalized(lang, { fr: "Notifications", ar: "الإشعارات", en: "Notifications" })}
        </h1>
      </div>

      {loading && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "200px",
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
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {!loading && items.length === 0 && (
        <p style={{ textAlign: "center", color: "rgba(255,255,255,0.45)", marginTop: "48px", padding: "0 24px" }}>
          {pickLocalized(lang, {
            fr: "Aucune notification pour le moment.",
            ar: "لا إشعارات حالياً.",
            en: "No notifications yet.",
          })}
        </p>
      )}

      {!loading && items.length > 0 && (
        <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: "10px" }}>
          {items.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => {
                if (n.memory_id) navigate(`/memory/${n.memory_id}`);
              }}
              style={{
                textAlign: "left",
                background: n.read ? "rgba(255,255,255,0.04)" : "rgba(232,116,42,0.12)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "14px",
                padding: "14px 16px",
                color: "#fff",
                cursor: n.memory_id ? "pointer" : "default",
              }}
            >
              <p style={{ margin: 0, fontSize: "14px", lineHeight: 1.4 }}>{labelFor(n)}</p>
              <p style={{ margin: "8px 0 0", fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>
                {new Date(n.created_at).toLocaleString(
                  lang === "ar" ? "ar" : lang === "fr" ? "fr-FR" : "en-US",
                )}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
