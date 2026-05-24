import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const Chats = () => {
  const navigate = useNavigate();
  const { lang } = useLanguage();

  const title = lang === "fr" ? "Chats" : lang === "ar" ? "المحادثات" : "Chats";
  const empty =
    lang === "fr"
      ? "Tes conversations apparaîtront ici."
      : lang === "ar"
        ? "ستظهر محادثاتك هنا."
        : "Your conversations will appear here.";
  const soon =
    lang === "fr"
      ? "Messagerie bientôt disponible ✦"
      : lang === "ar"
        ? "المراسلة قادمة قريباً ✦"
        : "Messaging coming soon ✦";

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#FFF9F2",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "16px",
        padding: "24px",
      }}
    >
      <div
        style={{
          width: "64px",
          height: "64px",
          borderRadius: "50%",
          background: "rgba(232,116,42,0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span style={{ fontSize: "28px" }}>💬</span>
      </div>
      <h1 style={{ fontSize: "20px", fontWeight: 700, color: "#3D2B1F", fontFamily: "Georgia, serif" }}>{title}</h1>
      <p style={{ fontSize: "14px", color: "rgba(61,43,31,0.5)", textAlign: "center", lineHeight: 1.6 }}>{empty}</p>
      <p style={{ fontSize: "12px", color: "#E8742A", fontWeight: 600 }}>{soon}</p>
    </div>
  );
};

export default Chats;
