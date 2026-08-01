import { useState, useEffect, type CSSProperties } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { resolveMemoryUrl } from "@/lib/memoryUrl";
import { useLanguage } from "@/contexts/LanguageContext";
import { pickLocalized } from "@/lib/pickLocalized";
import CurvedBottomNav from "@/components/CurvedBottomNav";
import { toast } from "sonner";

interface ProfileMemory {
  id: string;
  title: string | null;
  thumbnail_url: string | null;
  created_at: string;
  sparks_count: number;
  file_type?: string | null;
}

const LoadingSpinner = () => (
  <div
    style={{
      minHeight: "100vh",
      background: "#FDF8F2",
      transition: "background-color 0.3s ease",
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
  const { userId: routeUserId } = useParams();
  const { lang, rtl } = useLanguage();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [memories, setMemories] = useState<ProfileMemory[]>([]);
  const [sparksCount, setSparksCount] = useState(0);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [memoryToDelete, setMemoryToDelete] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [totalMemoryCount, setTotalMemoryCount] = useState(0);
  const [displayName, setDisplayName] = useState("");
  const [savingName, setSavingName] = useState(false);
  const PAGE_SIZE = 12;

  const handleSaveName = async () => {
    if (!newName.trim() || !session?.user?.id || savingName) return;
    const trimmed = newName.trim();
    setSavingName(true);
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: trimmed })
      .eq("user_id", session.user.id);
    if (error) {
      console.error("Save name failed:", error);
      toast.error(pickLocalized(lang, { fr: "Erreur de sauvegarde", ar: "فشل الحفظ", en: "Save failed" }));
      setSavingName(false);
      return;
    }
    localStorage.setItem("infeelit_user_name", trimmed);
    await supabase.auth.updateUser({ data: { display_name: trimmed } });
    setDisplayName(trimmed);
    setEditingName(false);
    setSavingName(false);
    toast.success(pickLocalized(lang, { fr: "Nom mis à jour ✦", ar: "تم تحديث الاسم ✦", en: "Name updated ✦" }));
  };

  const handleDeleteMemory = (memoryId: string) => {
    setMemoryToDelete(memoryId);
  };

  const confirmDeleteMemory = async () => {
    if (!memoryToDelete) return;
    const { error } = await supabase.from("memories").delete().eq("id", memoryToDelete);
    if (error) {
      console.error("Delete memory failed:", error);
      toast.error(pickLocalized(lang, { fr: "Erreur de suppression", ar: "خطأ في الحذف", en: "Delete failed" }));
      return;
    }
    setMemories((prev) => prev.filter((m) => m.id !== memoryToDelete));
    setMemoryToDelete(null);
    toast.success(
      pickLocalized(lang, { fr: "Souvenir supprimé.", ar: "تم حذف الذكرى.", en: "Memory deleted." }),
    );
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setLoading(false);
    });
  }, []);

  const userName =
    displayName ||
    session?.user.user_metadata?.display_name ||
    localStorage.getItem("infeelit_user_name") ||
    session?.user.email?.split("@")[0] ||
    "Infeelit";

  useEffect(() => {
    if (!session) return;

    const targetId = routeUserId || session.user.id;

    const loadProfileData = async () => {
      if (!routeUserId || routeUserId === session.user.id) {
        setDisplayName(
          session.user.user_metadata?.display_name ||
            localStorage.getItem("infeelit_user_name") ||
            session.user.email?.split("@")[0] ||
            "Infeelit",
        );
      } else {
        const { data: prof } = await supabase
          .from("profiles")
          .select("display_name")
          .eq("user_id", routeUserId)
          .maybeSingle();
        setDisplayName(prof?.display_name || "Infeelit");
      }

      const { count: exactCount } = await supabase
        .from("memories")
        .select("*", { count: "exact", head: true })
        .eq("user_id", routeUserId || session.user.id);
      setTotalMemoryCount(exactCount || 0);

      const from = page * PAGE_SIZE;
      const to = (page + 1) * PAGE_SIZE - 1;
      const { data } = await supabase
        .from("memories")
        .select("id, title, thumbnail_url, created_at, sparks_count, file_type")
        .eq("user_id", routeUserId || session.user.id)
        .order("created_at", { ascending: false })
        .range(from, to);

      const memoriesData = data || [];

      const signed = await Promise.all(
        memoriesData.map(async (m: any) => ({
          ...m,
          thumbnail_url: await resolveMemoryUrl(m.thumbnail_url),
        })),
      );

      setMemories((prev) => (page === 0 ? signed : [...prev, ...signed]));
      setHasMore((exactCount || 0) > (page + 1) * PAGE_SIZE);

      // Accurate sparks: sum sparks_count from all user memories (paginated aggregate approx via RPC-less query)
      const { data: sparkRows } = await supabase
        .from("memories")
        .select("sparks_count")
        .eq("user_id", routeUserId || session.user.id);
      const totalSparks = (sparkRows || []).reduce(
        (sum: number, row: { sparks_count?: number | null }) => sum + (row.sparks_count || 0),
        0,
      );
      setSparksCount(totalSparks);
    };

    loadProfileData();
  }, [session, page, routeUserId]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("infeelit_user_name");
    localStorage.removeItem("infeelit_spark_balance");
    navigate("/");
    window.location.reload();
  };

  const profileUserId = routeUserId || session?.user?.id || null;
  const isOwnProfile = !routeUserId || routeUserId === session?.user?.id;

  if (loading) return <LoadingSpinner />;

  if (!session) {
    return (
      <div
        dir={rtl ? "rtl" : "ltr"}
        style={{
          minHeight: "100vh",
          ["--family-bg" as string]: "#FDF8F2",
          ["--family-bg-card" as string]: "#FFFFFF",
          ["--family-bg-elevated" as string]: "#F5EDE0",
          ["--family-border" as string]: "#E8D5B7",
          ["--family-text" as string]: "#2D1810",
          ["--family-text-secondary" as string]: "#6B4C35",
          ["--family-text-tertiary" as string]: "#9B7355",
          ["--family-success" as string]: "#4A7C59",
          background: "linear-gradient(160deg, #FDF8F2 0%, #F5EDE0 40%, #FFFFFF 70%, #E8742A 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "60px 28px 40px",
          textAlign: "center",
          transition: "background-color 0.3s ease",
        } as CSSProperties}
      >
        <div
          style={{
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            background: "#F5EDE0",
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
            color: "#2D1810",
            marginBottom: "12px",
            lineHeight: 1.3,
          }}
        >
          {pickLocalized(lang, { fr: "Ton espace t'attend.", ar: "مساحتك بانتظارك.", en: "Your space is waiting." })}
        </p>

        <p
          style={{
            fontSize: "15px",
            color: "#6B4C35",
            lineHeight: 1.6,
            marginBottom: "40px",
            maxWidth: "280px",
          }}
        >
          {pickLocalized(lang, { fr: "Préserve ta voix. Crée ton cercle familial. Laisse quelque chose d'éternel.", ar: "احفظ صوتك. أنشئ دائرتك العائلية. اترك شيئاً خالداً.", en: "Preserve your voice. Create your family circle. Leave something eternal." })}
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
            { icon: "🎙️", label: pickLocalized(lang, { fr: "Souvenirs", ar: "ذكريات", en: "Memories" }) },
            { icon: "👨‍👩‍👧", label: pickLocalized(lang, { fr: "Cercle", ar: "دائرة", en: "Circle" }) },
            { icon: "✦", label: pickLocalized(lang, { fr: "Étincelles", ar: "شرارات", en: "Sparks" }) },
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
                  background: "#F5EDE0",
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
                  color: "#6B4C35",
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
            background: "linear-gradient(135deg, #E8742A, #D4621A)",
            color: "#fff",
            fontWeight: 800,
            fontSize: "17px",
            border: "none",
            cursor: "pointer",
            marginBottom: "12px",
            boxShadow: "0 8px 30px rgba(0,0,0,0.2)",
          }}
        >
          {pickLocalized(lang, { fr: "Créer mon espace ✦", ar: "أنشئ مساحتي ✦", en: "Create my space ✦" })}
        </button>

        <button
          onClick={() => navigate("/welcome")}
          style={{
            background: "none",
            border: "none",
            color: "#9B7355",
            fontSize: "14px",
            cursor: "pointer",
            padding: "8px",
          }}
        >
          {pickLocalized(lang, { fr: "J'ai déjà un compte →", ar: "→ لديّ حسابٌ بالفعل", en: "I already have an account →" })}
        </button>
        <CurvedBottomNav onPlusClick={() => navigate("/record")} familySpace />
      </div>
    );
  }

  return (
    <div
      dir={rtl ? "rtl" : "ltr"}
        style={{
          ["--family-bg" as string]: "#FDF8F2",
          ["--family-bg-card" as string]: "#FFFFFF",
          ["--family-bg-elevated" as string]: "#F5EDE0",
          ["--family-border" as string]: "#E8D5B7",
          ["--family-text" as string]: "#2D1810",
          ["--family-text-secondary" as string]: "#6B4C35",
          ["--family-text-tertiary" as string]: "#9B7355",
          ["--family-success" as string]: "#4A7C59",
          minHeight: "100vh",
          background: "#FDF8F2",
          paddingBottom: "100px",
          position: "relative",
          transition: "background-color 0.3s ease",
        } as CSSProperties}
      >
      <div
        style={{
          background: "linear-gradient(160deg, #F5EDE0 0%, #FDF8F2 50%, #FFFFFF 100%)",
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
            background: "#F5EDE0",
            border: "1px solid #E8D5B7",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
          aria-label={pickLocalized(lang, { fr: "Retour", ar: "رجوع", en: "Back" })}
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
              onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
              placeholder={userName}
              style={{
                boxShadow: "0 2px 12px rgba(45,24,16,0.08)",
                padding: "8px 16px",
                borderRadius: "999px",
                border: "1.5px solid #E8742A",
                background: "#FFFFFF",
                color: "#2D1810",
                fontSize: "16px",
                outline: "none",
              }}
              autoFocus
            />
            <button
              onClick={handleSaveName}
              disabled={savingName}
              style={{
                padding: "8px 16px",
                borderRadius: "999px",
                background: "#E8742A",
                color: "#fff",
                border: "none",
                cursor: savingName ? "wait" : "pointer",
                fontWeight: 700,
                opacity: savingName ? 0.7 : 1,
              }}
            >
              {savingName ? "…" : "✓"}
            </button>
            <button
              onClick={() => setEditingName(false)}
              style={{
                padding: "8px 16px",
                borderRadius: "999px",
                background: "#F5EDE0",
                color: "#2D1810",
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
                color: "#2D1810",
                margin: 0,
                fontSize: "22px",
                fontWeight: 700,
                fontFamily: "Georgia, serif",
              }}
            >
              {userName}
            </h2>
            {isOwnProfile && (
              <button
                onClick={() => {
                  setNewName(userName);
                  setEditingName(true);
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: "#9B7355",
                  cursor: "pointer",
                  fontSize: "16px",
                }}
                aria-label={pickLocalized(lang, { fr: "Modifier le nom", ar: "تعديل الاسم", en: "Edit name" })}
              >
                ✎
              </button>
            )}
          </div>
        )}
        {isOwnProfile && (
          <p
            style={{
              fontSize: "13px",
              color: "#9B7355",
              margin: 0,
            }}
          >
            {session.user.email || ""}
          </p>
        )}

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
              count: totalMemoryCount,
              label: pickLocalized(lang, { fr: "souvenirs", ar: "ذكريات", en: "memories" }),
            },
            {
              count: sparksCount,
              label: pickLocalized(lang, { fr: "étincelles", ar: "شرارات", en: "sparks" }),
            },
          ].map(({ count, label }) => (
            <div key={label} style={{ textAlign: "center" }}>
              <p
                style={{
                  fontSize: "24px",
                  fontWeight: 900,
                  color: "#2D1810",
                  margin: "0 0 2px",
                }}
              >
                {count}
              </p>
              <p
                style={{
                  fontSize: "11px",
                  color: "#9B7355",
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
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "16px",
            gap: "12px",
          }}
        >
          <p
            style={{
              fontSize: "11px",
              fontWeight: 900,
              color: "#E8742A",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              margin: 0,
            }}
          >
            {pickLocalized(lang, { fr: "Mes souvenirs", ar: "ذكرياتي", en: "My memories" })}
          </p>
          {isOwnProfile && memories.length > 0 && (
            <button
              onClick={() => setEditMode(!editMode)}
              style={{
                padding: "8px 16px",
                borderRadius: "999px",
                background: editMode ? "#E8742A" : "#F5EDE0",
                color: editMode ? "#fff" : "#2D1810",
                border: editMode ? "none" : "1px solid #E8D5B7",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: 700,
                minHeight: "36px",
              }}
            >
              {editMode
                ? pickLocalized(lang, { fr: "Terminer", ar: "إنهاء", en: "Done" })
                : pickLocalized(lang, { fr: "Modifier", ar: "تعديل", en: "Edit" })}
            </button>
          )}
        </div>

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
                color: "#2D1810",
                fontSize: "20px",
                fontFamily: "Georgia, serif",
                fontStyle: "italic",
                lineHeight: 1.4,
                margin: 0,
              }}
            >
              {pickLocalized(lang, { fr: "Ta première voix attend d'être enregistrée.", ar: "صوتك الأول ينتظر أن يُسجَّل.", en: "Your first voice is waiting to be recorded." })}
            </h3>
            <p
              style={{
                color: "#9B7355",
                fontSize: "14px",
                lineHeight: 1.6,
                margin: 0,
                whiteSpace: "pre-line",
              }}
            >
              {pickLocalized(lang, { fr: "Chaque souvenir que tu préserves aujourd'hui\ndeviendra un trésor pour demain.", ar: "كل ذكرى تحفظها اليوم ستصبح كنزاً للغد.", en: "Every memory you preserve today\nbecomes a treasure for tomorrow." })}
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
              {pickLocalized(lang, { fr: "🎙️ Enregistrer mon premier souvenir", ar: "🎙️ سجّل ذكراي الأولى", en: "🎙️ Record my first memory" })}
            </button>
          </div>
        ) : (
          <>
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
                  boxShadow: "0 2px 12px rgba(45,24,16,0.08)",
                  cursor: "pointer",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    bottom: "8px",
                    left: "8px",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    background: "rgba(0,0,0,0.6)",
                    borderRadius: "999px",
                    padding: "3px 8px",
                    zIndex: 4,
                  }}
                >
                  <span style={{ fontSize: "10px", color: "#2D1810" }}>
                    {memory.file_type === "audio" ? "🎙️" : "▶"}
                  </span>
                </div>
                {editMode && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteMemory(memory.id);
                    }}
                    style={{
                      position: "absolute",
                      top: "6px",
                      right: "6px",
                      width: "28px",
                      height: "28px",
                      borderRadius: "50%",
                      background: "rgba(220,38,38,0.9)",
                      border: "2px solid #fff",
                      color: "#fff",
                      fontSize: "16px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      zIndex: 5,
                    }}
                  >
                    ×
                  </button>
                )}
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
                      bottom: "8px",
                      right: "8px",
                      background: "rgba(0,0,0,0.6)",
                      borderRadius: "999px",
                      padding: "2px 8px",
                      display: "flex",
                      alignItems: "center",
                      gap: "3px",
                      zIndex: 4,
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
          {hasMore && (
            <div style={{ display: "flex", justifyContent: "center", marginTop: "16px" }}>
              <button
                onClick={() => setPage((p) => p + 1)}
                style={{
                  padding: "12px 32px",
                  borderRadius: "999px",
                  background: "#F5EDE0",
                  color: "#2D1810",
                  border: "1px solid #E8D5B7",
                  cursor: "pointer",
                }}
              >
                {pickLocalized(lang, { fr: "Voir plus", ar: "عرض المزيد", en: "Load more" })}
              </button>
            </div>
          )}
          </>
        )}
      </div>

      {isOwnProfile && (
      <>
      <div style={{ padding: "32px 20px 0" }}>
        <button
          onClick={handleLogout}
          style={{
            width: "100%",
            padding: "14px",
            borderRadius: "14px",
            background: "none",
            border: "1px solid #E8D5B7",
            color: "#9B7355",
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
          {pickLocalized(lang, { fr: "Se déconnecter", ar: "تسجيل الخروج", en: "Sign out" })}
        </button>
      </div>

      <div
        style={{
          textAlign: "center",
          padding: "32px 24px 16px",
          borderTop: "1px solid #E8D5B7",
          marginTop: "32px",
        }}
      >
        <p
          style={{
            color: "#9B7355",
            fontSize: "12px",
            marginBottom: "8px",
          }}
        >
          {pickLocalized(lang, { fr: "Vous souhaitez supprimer votre compte ?", ar: "هل تريد حذف حسابك؟", en: "Want to delete your account?" })}
        </p>
        <a
          href="mailto:malik@infeelit.com?subject=Account deletion request"
          style={{
            color: "#9B7355",
            fontSize: "12px",
            textDecoration: "underline",
          }}
        >
          {pickLocalized(lang, { fr: "Contactez-nous", ar: "تواصل معنا", en: "Contact us" })}
        </a>
      </div>
      </>
      )}

      {memoryToDelete && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.85)",
            zIndex: 200,
            display: "flex",
            alignItems: "flex-end",
          }}
        >
          <div
            style={{
              width: "100%",
              background: "#FFFFFF",
              boxShadow: "0 2px 12px rgba(45,24,16,0.08)",
              borderRadius: "24px 24px 0 0",
              padding: "32px 24px 48px",
              textAlign: "center",
            }}
          >
            <p style={{ fontSize: "32px", marginBottom: "8px" }}>🗑️</p>
            <h3
              style={{
                color: "#2D1810",
                fontSize: "18px",
                fontFamily: "Georgia, serif",
                fontStyle: "italic",
                marginBottom: "8px",
              }}
            >
              {pickLocalized(lang, { fr: "Supprimer ce souvenir ?", ar: "هل تريد حذف هذه الذكرى؟", en: "Delete this memory?" })}
            </h3>
            <p
              style={{
                color: "#9B7355",
                fontSize: "14px",
                marginBottom: "32px",
              }}
            >
              {pickLocalized(lang, { fr: "Cette action est irréversible.", ar: "هذا الإجراء لا يمكن التراجع عنه.", en: "This action cannot be undone." })}
            </p>
            <button
              onClick={confirmDeleteMemory}
              style={{
                width: "100%",
                padding: "16px",
                borderRadius: "16px",
                background: "rgba(220,38,38,0.9)",
                color: "#fff",
                fontWeight: 700,
                fontSize: "16px",
                border: "none",
                cursor: "pointer",
                marginBottom: "12px",
              }}
            >
              {pickLocalized(lang, { fr: "Supprimer définitivement", ar: "حذف نهائياً", en: "Delete permanently" })}
            </button>
            <button
              onClick={() => setMemoryToDelete(null)}
              style={{
                background: "none",
                border: "none",
                color: "#9B7355",
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              {pickLocalized(lang, { fr: "Annuler", ar: "إلغاء", en: "Cancel" })}
            </button>
          </div>
        </div>
      )}

      <CurvedBottomNav onPlusClick={() => navigate("/record")} familySpace />
    </div>
  );
};

export default Profile;
