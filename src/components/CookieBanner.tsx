import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

const CookieBanner = () => {
  const { lang } = useLanguage();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem("infeelit_cookies_accepted");
    if (!accepted) setVisible(true);
  }, []);

  const handleAccept = () => {
    localStorage.setItem("infeelit_cookies_accepted", "true");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        background: "rgba(15,5,1,0.97)",
        borderTop: "1px solid rgba(232,116,42,0.2)",
        padding: "16px 24px",
        zIndex: 999,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "16px",
        backdropFilter: "blur(10px)",
        flexWrap: "wrap",
      }}
    >
      <p
        style={{
          color: "rgba(255,255,255,0.7)",
          fontSize: "13px",
          margin: 0,
          lineHeight: 1.5,
          flex: 1,
          minWidth: "200px",
        }}
      >
        {lang === "fr"
          ? "Nous utilisons des cookies essentiels pour faire fonctionner Infeelit. "
          : lang === "ar"
            ? "نستخدم ملفات تعريف الارتباط الأساسية لتشغيل Infeelit. "
            : "We use essential cookies to make Infeelit work. "}
        <a href="/privacy" style={{ color: "#E8742A", textDecoration: "underline" }}>
          {lang === "fr" ? "En savoir plus" : lang === "ar" ? "اعرف أكثر" : "Learn more"}
        </a>
      </p>
      <button
        onClick={handleAccept}
        style={{
          padding: "10px 24px",
          borderRadius: "999px",
          background: "linear-gradient(135deg, #E8742A, #D4621A)",
          color: "#fff",
          fontWeight: 700,
          fontSize: "13px",
          border: "none",
          cursor: "pointer",
          whiteSpace: "nowrap",
        }}
      >
        {lang === "fr" ? "Accepter" : lang === "ar" ? "قبول" : "Accept"}
      </button>
    </div>
  );
};

export default CookieBanner;
