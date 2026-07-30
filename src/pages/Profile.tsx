import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";

interface ProfileMemory {
  id: string;
  title: string | null;
  thumbnail_url: string | null;
  created_at: string;
  sparks_count: number;
}

const LoadingSpinner = () => (
  <div
    style={{
      minHeight: "100vh",
      background: "#FDF8F0",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <div
      style={{
        width: "32px",
        height: "32px",
        border: "2px solid rgba(232,116,42,0.2)",
        borderTopColor: "#E8742A",
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
      }}
    />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

const Profile = () => {
  const navigate = useNavigate();
  const { lang, rtl } = useLanguage();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [memories, setMemories] = useState<ProfileMemory[]>([]);
  const [sparksCount, setSparksCount] = useState(0);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState("");

  const handleSaveName = async () => {
    if (!newName.trim() || !session?.user?.id) return;
    const trimmed = newName.trim();
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: trimmed })
      .eq("user_id", session.user.id);
    if (error) {
      console.error("Save name failed:", error);
      return;
    }
    localStorage.setItem("infeelit_user_name", trimmed);
    await supabase.auth.updateUser({ data: { display_name: trimmed } });
    setEditingName(false);
    window.location.reload();
  };

  const handleDeleteMemory = async (memoryId: string) => {
    if (
      !confirm(
        lang === "fr"
          ? "Supprimer ce souvenir définitivement ?"
          : lang === "ar"
            ? "هل تريد حذف هذه الذكرى نهائياً؟"
            : "Delete this memory permanently?",
      )
    ) {
      return;
    }

    const { error } = await supabase.from("memories").delete().eq("id", memoryId);
    if (error) {
      console.error("Delete memory failed:", error);
      return;
    }
    setMemories((prev) => prev.filter((m) => m.id !== memoryId));
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setLoading(false);
    });
  }, []);

  const userName =
    session?.user.user_metadata?.display_name ||
    localStorage.getItem("infeelit_user_name") ||
    session?.user.email?.split("@")[0] ||
    "Infeelit";

  useEffect(() => {
    if (!session) return;

    const loadProfileData = async () => {
      const { data } = await supabase
        .from("memories")
        .select("id, title, thumbnail_url, created_at, sparks_count")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })
        .limit(12);

      const memoriesData = data || [];

      const signUrl = async (path: string | null): Promise<string | null> => {
        if (!path) return null;
        if (path.startsWith("http")) return path;
        try {
          const { data } = await supabase.storage
            .from("memories")
            .createSignedUrl(path, 3600);
          return data?.signedUrl || null;
        } catch {
          return null;
        }
      };

      const signed = await Promise.all(
        memoriesData.map(async (m: any) => ({
          ...m,
          thumbnail_url: await signUrl(m.thumbnail_url),
        })),
      );

      setMemories(signed);

      if (memoriesData.length > 0) {
        const { count } = await supabase
          .from("memory_sparks")
          .select("id", { count: "exact", head: true })
          .in(
            "memory_id",
            memoriesData.map((m) => m.id),
          );
        setSparksCount(count || 0);
      } else {
        setSparksCount(0);
      }
    };

    loadProfileData();
  }, [session]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("infeelit_user_name");
    localStorage.removeItem("infeelit_spark_balance");
    navigate("/");
    window.location.reload();
  };

  if (loading) return <LoadingSpinner />;

  if (!session) {
    return (
      <div
        dir={rtl ? "rtl" : "ltr"}
        style={{
          minHeight: "100vh",
          background: "linear-gradient(160deg, #2D1810 0%, #8B3A1A 50%, #E8742A 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "60px 28px 40px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.12)",
            border: "2px solid rgba(212,175,55,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "24px",
            fontSize: "36px",
          }}
        >
          ✦
        </div>

        <p
          style={{
            fontSize: "28px",
            fontFamily: "Georgia, serif",
            fontStyle: "italic",
            color: "#fff",
            marginBottom: "12px",
            lineHeight: 1.3,
          }}
        >
          {lang === "fr"
            ? "Ton espace t'attend."
            : lang === "ar"
              ? "مساحتك بانتظارك."
              : "Your space is waiting."}
        </p>

        <p
          style={{
            fontSize: "15px",
            color: "rgba(255,255,255,0.65)",
            lineHeight: 1.6,
            marginBottom: "40px",
            maxWidth: "280px",
          }}
        >
          {lang === "fr"
            ? "Préserve ta voix. Crée ton cercle familial. Laisse quelque chose d'éternel."
            : lang === "ar"
              ? "احفظ صوتك. أنشئ دائرتك العائلية. اترك شيئاً خالداً."
              : "Preserve your voice. Create your family circle. Leave something eternal."}
        </p>

        <div
          style={{
            display: "flex",
            gap: "16px",
            marginBottom: "40px",
            direction: "ltr",
          }}
        >
          {[
            { icon: "🎙️", label: lang === "fr" ? "Souvenirs" : lang === "ar" ? "ذكريات" : "Memories" },
            { icon: "👨‍👩‍👧", label: lang === "fr" ? "Cercle" : lang === "ar" ? "دائرة" : "Circle" },
            { icon: "✦", label: lang === "fr" ? "Étincelles" : lang === "ar" ? "شرارات" : "Sparks" },
          ].map(({ icon, label }) => (
            <div
              key={label}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <div
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "16px",
                  background: "rgba(255,255,255,0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "24px",
                }}
              >
                {icon}
              </div>
              <span
                style={{
                  fontSize: "11px",
                  color: "rgba(255,255,255,0.6)",
                  fontWeight: 600,
                }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>

        <button
          onClick={() => navigate("/welcome")}
          style={{
            width: "100%",
            maxWidth: "300px",
            padding: "18px",
            borderRadius: "18px",
            background: "#fff",
            color: "#E8742A",
            fontWeight: 800,
            fontSize: "17px",
            border: "none",
            cursor: "pointer",
            marginBottom: "12px",
            boxShadow: "0 8px 30px rgba(0,0,0,0.2)",
          }}
        >
          {lang === "fr"
            ? "Créer mon espace ✦"
            : lang === "ar"
              ? "أنشئ مساحتي ✦"
              : "Create my space ✦"}
        </button>

        <button
          onClick={() => navigate("/welcome")}
          style={{
            background: "none",
            border: "none",
            color: "rgba(255,255,255,0.5)",
            fontSize: "14px",
            cursor: "pointer",
            padding: "8px",
          }}
        >
          {lang === "fr"
            ? "J'ai déjà un compte →"
            : lang === "ar"
              ? "→ لديّ حسابٌ بالفعل"
              : "I already have an account →"}
        </button>
      </div>
    );
  }

  return (
    <div
      dir={rtl ? "rtl" : "ltr"}
      style={{
        minHeight: "100vh",
        background: "#FDF8F0",
        paddingBottom: "100px",
      }}
    >
      <div
        style={{
          background: "linear-gradient(160deg, #2D1810, #8B3A1A)",
          padding: "60px 24px 32px",
          textAlign: "center",
          position: "relative",
        }}
      >
        <button
          onClick={() => navigate(-1)}
          style={{
            position: "absolute",
            top: "56px",
            left: rtl ? undefined : "20px",
            right: rtl ? "20px" : undefined,
            width: "34px",
            height: "34px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.15)",
            border: "1px solid rgba(255,255,255,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
          aria-label={lang === "fr" ? "Retour" : lang === "ar" ? "رجوع" : "Back"}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={rtl ? { transform: "scaleX(-1)" } : undefined}>
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
            width: "72px",
            height: "72px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #E8742A, #D4621A)",
            border: "3px solid rgba(212,175,55,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
            fontSize: "28px",
            fontWeight: 700,
            color: "#fff",
          }}
        >
          {userName[0]?.toUpperCase() || "✦"}
        </div>

        {editingName ? (
          <div
            style={{
              display: "flex",
              gap: "8px",
              alignItems: "center",
              justifyContent: "center",
              flexWrap: "wrap",
              marginBottom: "4px",
            }}
          >
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder={userName}
              style={{
                padding: "8px 16px",
                borderRadius: "999px",
                border: "1.5px solid #E8742A",
                background: "rgba(255,255,255,0.08)",
                color: "#fff",
                fontSize: "16px",
                outline: "none",
              }}
              autoFocus
            />
            <button
              onClick={handleSaveName}
              style={{
                padding: "8px 16px",
                borderRadius: "999px",
                background: "#E8742A",
                color: "#fff",
                border: "none",
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              ✓
            </button>
            <button
              onClick={() => setEditingName(false)}
              style={{
                padding: "8px 16px",
                borderRadius: "999px",
                background: "rgba(255,255,255,0.1)",
                color: "#fff",
                border: "none",
                cursor: "pointer",
              }}
            >
              ✕
            </button>
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              justifyContent: "center",
              marginBottom: "4px",
            }}
          >
            <h2
              style={{
                color: "#fff",
                margin: 0,
                fontSize: "22px",
                fontWeight: 700,
                fontFamily: "Georgia, serif",
              }}
            >
              {userName}
            </h2>
            <button
              onClick={() => {
                setNewName(userName);
                setEditingName(true);
              }}
              style={{
                background: "none",
                border: "none",
                color: "rgba(255,255,255,0.4)",
                cursor: "pointer",
                fontSize: "16px",
              }}
              aria-label={lang === "fr" ? "Modifier le nom" : lang === "ar" ? "تعديل الاسم" : "Edit name"}
            >
              ✎
            </button>
          </div>
        )}
        <p
          style={{
            fontSize: "13px",
            color: "rgba(255,255,255,0.5)",
            margin: 0,
          }}
        >
          {session.user.email || ""}
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "32px",
            marginTop: "24px",
            direction: "ltr",
          }}
        >
          {[
            {
              count: memories.length,
              label: lang === "fr" ? "souvenirs" : lang === "ar" ? "ذكريات" : "memories",
            },
            {
              count: sparksCount,
              label: lang === "fr" ? "étincelles" : lang === "ar" ? "شرارات" : "sparks",
            },
          ].map(({ count, label }) => (
            <div key={label} style={{ textAlign: "center" }}>
              <p
                style={{
                  fontSize: "24px",
                  fontWeight: 900,
                  color: "#fff",
                  margin: "0 0 2px",
                }}
              >
                {count}
              </p>
              <p
                style={{
                  fontSize: "11px",
                  color: "rgba(255,255,255,0.5)",
                  margin: 0,
                  letterSpacing: "0.05em",
                }}
              >
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: "24px 20px 0" }}>
        <p
          style={{
            fontSize: "11px",
            fontWeight: 900,
            color: "#E8742A",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            marginBottom: "16px",
          }}
        >
          {lang === "fr" ? "Mes souvenirs" : lang === "ar" ? "ذكرياتي" : "My memories"}
        </p>

        {memories.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px 24px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "16px",
              background: "rgba(232,116,42,0.05)",
              borderRadius: "20px",
              border: "1.5px dashed rgba(232,116,42,0.2)",
            }}
          >
            <p style={{ fontSize: "48px", margin: 0 }}>✦</p>
            <h3
              style={{
                color: "#3D2B1F",
                fontSize: "20px",
                fontFamily: "Georgia, serif",
                fontStyle: "italic",
                lineHeight: 1.4,
                margin: 0,
              }}
            >
              {lang === "fr"
                ? "Ta première voix attend d'être enregistrée."
                : lang === "ar"
                  ? "صوتك الأول ينتظر أن يُسجَّل."
                  : "Your first voice is waiting to be recorded."}
            </h3>
            <p
              style={{
                color: "rgba(61,43,31,0.5)",
                fontSize: "14px",
                lineHeight: 1.6,
                margin: 0,
                whiteSpace: "pre-line",
              }}
            >
              {lang === "fr"
                ? "Chaque souvenir que tu préserves aujourd'hui\ndeviendra un trésor pour demain."
                : lang === "ar"
                  ? "كل ذكرى تحفظها اليوم ستصبح كنزاً للغد."
                  : "Every memory you preserve today\nbecomes a treasure for tomorrow."}
            </p>
            <button
              onClick={() => navigate("/questions")}
              style={{
                padding: "16px 32px",
                borderRadius: "999px",
                background: "linear-gradient(135deg, #E8742A, #D4621A)",
                color: "#fff",
                fontWeight: 700,
                fontSize: "16px",
                border: "none",
                cursor: "pointer",
                boxShadow: "0 4px 20px rgba(232,116,42,0.4)",
              }}
            >
              {lang === "fr"
                ? "🎙️ Enregistrer mon premier souvenir"
                : lang === "ar"
                  ? "🎙️ سجّل ذكراي الأولى"
                  : "🎙️ Record my first memory"}
            </button>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "8px",
            }}
          >
            {memories.map((memory) => (
              <div
                key={memory.id}
                onClick={() => navigate(`/memory/${memory.id}`)}
                style={{
                  aspectRatio: "9/16",
                  borderRadius: "12px",
                  overflow: "hidden",
                  background: "linear-gradient(135deg, #E8742A22, #D4AF3722)",
                  cursor: "pointer",
                  position: "relative",
                }}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteMemory(memory.id);
                  }}
                  style={{
                    position: "absolute",
                    top: "8px",
                    right: "8px",
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    background: "rgba(220,38,38,0.8)",
                    border: "none",
                    color: "#fff",
                    fontSize: "14px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 5,
                  }}
                >
                  ×
                </button>
                {memory.thumbnail_url ? (
                  <img
                    src={memory.thumbnail_url}
                    alt=""
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "24px",
                    }}
                  >
                    🎙️
                  </div>
                )}
                {memory.sparks_count > 0 && (
                  <div
                    style={{
                      position: "absolute",
                      bottom: "6px",
                      left: "6px",
                      background: "rgba(0,0,0,0.6)",
                      borderRadius: "999px",
                      padding: "2px 8px",
                      display: "flex",
                      alignItems: "center",
                      gap: "3px",
                    }}
                  >
                    <span style={{ fontSize: "10px", color: "#E8742A" }}>✦</span>
                    <span style={{ fontSize: "10px", color: "#fff", fontWeight: 700 }}>
                      {memory.sparks_count}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ padding: "32px 20px 0" }}>
        <button
          onClick={handleLogout}
          style={{
            width: "100%",
            padding: "14px",
            borderRadius: "14px",
            background: "none",
            border: "1px solid rgba(61,43,31,0.12)",
            color: "rgba(61,43,31,0.5)",
            fontWeight: 600,
            fontSize: "14px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}
        >
          <span>↩</span>
          {lang === "fr" ? "Se déconnecter" : lang === "ar" ? "تسجيل الخروج" : "Sign out"}
        </button>
      </div>

      <div
        style={{
          textAlign: "center",
          padding: "32px 24px 16px",
          borderTop: "1px solid rgba(61,43,31,0.08)",
          marginTop: "32px",
        }}
      >
        <p
          style={{
            color: "rgba(61,43,31,0.35)",
            fontSize: "12px",
            marginBottom: "8px",
          }}
        >
          {lang === "fr"
            ? "Vous souhaitez supprimer votre compte ?"
            : lang === "ar"
              ? "هل تريد حذف حسابك؟"
              : "Want to delete your account?"}
        </p>
        <a
          href="mailto:malik@infeelit.com?subject=Account deletion request"
          style={{
            color: "rgba(61,43,31,0.4)",
            fontSize: "12px",
            textDecoration: "underline",
          }}
        >
          {lang === "fr" ? "Contactez-nous" : lang === "ar" ? "تواصل معنا" : "Contact us"}
        </a>
      </div>
    </div>
  );
};

export default Profile;
