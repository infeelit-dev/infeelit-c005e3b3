import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { ChevronLeft, Mic } from "lucide-react";

const Whispers = () => {
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const [isConnected, setIsConnected] = useState(false);
  const [members, setMembers] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) {
          setIsConnected(false);
          setLoading(false);
          return;
        }
        setIsConnected(true);

        const { data: memberships } = await supabase
          .from("circle_members")
          .select("circle_id")
          .eq("user_id", session.user.id)
          .limit(1);

        if (!memberships?.length) {
          setMembers([]);
          setLoading(false);
          return;
        }

        const { data: allMembers } = await supabase
          .from("circle_members")
          .select("user_id")
          .eq("circle_id", memberships[0].circle_id)
          .neq("user_id", session.user.id);

        if (allMembers?.length) {
          const userIds = allMembers.map((m) => m.user_id);
          const { data: profiles } = await supabase
            .from("profiles")
            .select("user_id, display_name")
            .in("user_id", userIds);

          const nameMap = new Map((profiles || []).map((p) => [p.user_id, p.display_name]));

          setMembers(
            allMembers.map((m) => ({
              id: m.user_id,
              name: nameMap.get(m.user_id) || (lang === "fr" ? "Membre" : lang === "ar" ? "عضو" : "Member"),
            })),
          );
        } else {
          setMembers([]);
        }
      } catch (err) {
        console.error("Whispers load error:", err);
        setMembers([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [lang]);

  const title = lang === "fr" ? "Murmures" : lang === "ar" ? "همسات" : "Whispers";

  const subtitle =
    lang === "fr" ? "Tes conversations intimes" : lang === "ar" ? "محادثاتك الخاصة" : "Your intimate conversations";

  const handleWhisperClick = (memberName: string) => {
    const msg =
      lang === "fr"
        ? `Bientôt : envoyer un message vocal à ${memberName} ✦`
        : lang === "ar"
          ? `قريباً : إرسال رسالة صوتية إلى ${memberName} ✦`
          : `Coming soon: send a voice message to ${memberName} ✦`;
    alert(msg);
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#FFF9F2",
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
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#FFF9F2",
        display: "flex",
        flexDirection: "column",
        paddingBottom: "100px",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "56px 20px 16px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          borderBottom: "1px solid rgba(61,43,31,0.08)",
          background: "linear-gradient(to bottom, rgba(253,248,240,1), rgba(253,248,240,0.95))",
        }}
      >
        <button
          onClick={() => navigate(-1)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "4px",
          }}
        >
          <ChevronLeft size={22} color="#3D2B1F" />
        </button>
        <div>
          <h1
            style={{
              fontSize: "20px",
              fontWeight: 700,
              color: "#3D2B1F",
              fontFamily: "Georgia, serif",
            }}
          >
            {title}
          </h1>
          <p
            style={{
              fontSize: "11px",
              color: "rgba(61,43,31,0.4)",
            }}
          >
            {subtitle}
          </p>
        </div>
      </div>

      {/* Contenu */}
      {!isConnected ? (
        /* Non connecté */
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "16px",
            padding: "40px 24px",
            textAlign: "center",
          }}
        >
          <span style={{ fontSize: "48px" }}>🔥</span>
          <p
            style={{
              fontSize: "18px",
              fontWeight: 700,
              color: "#3D2B1F",
              fontFamily: "Georgia, serif",
            }}
          >
            {lang === "fr"
              ? "Tes murmures t'attendent."
              : lang === "ar"
                ? "همساتك تنتظرك."
                : "Your whispers are waiting."}
          </p>
          <p
            style={{
              fontSize: "13px",
              color: "rgba(61,43,31,0.5)",
              lineHeight: 1.6,
            }}
          >
            {lang === "fr"
              ? "Connecte-toi pour échanger avec ta famille."
              : lang === "ar"
                ? "سجّل دخولك للتواصل مع عائلتك."
                : "Sign in to connect with your family."}
          </p>
          <button
            onClick={() => navigate("/welcome")}
            style={{
              padding: "14px 28px",
              borderRadius: "999px",
              background: "linear-gradient(135deg, #E8742A, #D4621A)",
              color: "#fff",
              fontWeight: 700,
              fontSize: "15px",
              border: "none",
              cursor: "pointer",
              boxShadow: "0 4px 20px rgba(232,116,42,0.3)",
              marginTop: "8px",
            }}
          >
            {lang === "fr" ? "Se connecter" : lang === "ar" ? "تسجيل الدخول" : "Sign in"}
          </button>
        </div>
      ) : members.length === 0 ? (
        /* Connecté mais pas de membres */
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "16px",
            padding: "40px 24px",
            textAlign: "center",
          }}
        >
          <span style={{ fontSize: "48px" }}>💬</span>
          <p
            style={{
              fontSize: "18px",
              fontWeight: 700,
              color: "#3D2B1F",
              fontFamily: "Georgia, serif",
            }}
          >
            {lang === "fr"
              ? "Invite ta famille d'abord."
              : lang === "ar"
                ? "ادعُ عائلتك أولاً."
                : "Invite your family first."}
          </p>
          <p
            style={{
              fontSize: "13px",
              color: "rgba(61,43,31,0.5)",
              lineHeight: 1.6,
            }}
          >
            {lang === "fr"
              ? "Tes murmures apparaîtront quand ta famille aura rejoint ton Cercle."
              : lang === "ar"
                ? "ستظهر همساتك عندما تنضم عائلتك إلى دائرتك."
                : "Your whispers will appear when your family joins your Circle."}
          </p>
          <button
            onClick={() => navigate("/circles")}
            style={{
              padding: "14px 28px",
              borderRadius: "999px",
              background: "linear-gradient(135deg, #E8742A, #D4621A)",
              color: "#fff",
              fontWeight: 700,
              fontSize: "15px",
              border: "none",
              cursor: "pointer",
              boxShadow: "0 4px 20px rgba(232,116,42,0.3)",
              marginTop: "8px",
            }}
          >
            {lang === "fr" ? "Inviter ma famille" : lang === "ar" ? "دعوة عائلتي" : "Invite my family"}
          </button>
        </div>
      ) : (
        /* Liste des membres = conversations */
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            padding: "8px 0",
          }}
        >
          {members.map((member) => (
            <button
              key={member.id}
              onClick={() => handleWhisperClick(member.name)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
                padding: "16px 20px",
                background: "none",
                border: "none",
                borderBottom: "1px solid rgba(61,43,31,0.06)",
                cursor: "pointer",
                textAlign: "left",
                width: "100%",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(232,116,42,0.04)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              {/* Avatar */}
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, rgba(232,116,42,0.2), rgba(212,98,26,0.1))",
                  border: "2px solid rgba(232,116,42,0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  fontSize: "18px",
                  fontWeight: 700,
                  color: "#E8742A",
                }}
              >
                {member.name[0].toUpperCase()}
              </div>

              {/* Info */}
              <div style={{ flex: 1 }}>
                <p
                  style={{
                    fontSize: "15px",
                    fontWeight: 600,
                    color: "#3D2B1F",
                    marginBottom: "2px",
                  }}
                >
                  {member.name}
                </p>
                <p
                  style={{
                    fontSize: "12px",
                    color: "rgba(61,43,31,0.4)",
                    fontStyle: "italic",
                  }}
                >
                  {lang === "fr"
                    ? "Envoie un murmure vocal..."
                    : lang === "ar"
                      ? "أرسل همسة صوتية..."
                      : "Send a voice whisper..."}
                </p>
              </div>

              {/* Icône micro */}
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  background: "rgba(232,116,42,0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Mic size={16} color="#E8742A" />
              </div>
            </button>
          ))}

          {/* Message coming soon */}
          <p
            style={{
              textAlign: "center",
              fontSize: "11px",
              color: "rgba(61,43,31,0.3)",
              padding: "24px",
              fontStyle: "italic",
            }}
          >
            {lang === "fr"
              ? "Messages vocaux bientôt disponibles ✦"
              : lang === "ar"
                ? "الرسائل الصوتية قادمة قريباً ✦"
                : "Voice messages coming soon ✦"}
          </p>
        </div>
      )}
    </div>
  );
};

export default Whispers;
