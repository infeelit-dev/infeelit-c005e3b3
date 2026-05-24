import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const WHY_VIDEOS = {
  fr: "UJ_iwEj6aQc",
  en: "6-FT_LAlRes",
  ar: "RNL29SxXFc4",
};

const WHAT_VIDEOS = {
  fr: "xk-5eLgobSM",
  en: "mXAuINbfQzM",
  ar: "HWUuJGLpbBI",
};

const About = () => {
  const { lang } = useLanguage();
  const navigate = useNavigate();
  const [whyLang, setWhyLang] = useState(lang as "fr" | "en" | "ar");
  const [whatLang, setWhatLang] = useState(lang as "fr" | "en" | "ar");

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#FFF9F2", paddingBottom: "120px" }}>
      <button
        onClick={() => navigate(-1)}
        style={{
          position: "absolute",
          top: "16px",
          left: "16px",
          width: "34px",
          height: "34px",
          borderRadius: "50%",
          background: "rgba(61,43,31,0.08)",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 10,
        }}
      >
        <ChevronLeft size={18} color="#3D2B1F" />
      </button>

      <div style={{ padding: "56px 24px 24px", textAlign: "center" }}>
        <p
          style={{
            fontSize: "10px",
            fontWeight: 900,
            letterSpacing: "0.3em",
            color: "#E8742A",
            textTransform: "uppercase",
            marginBottom: "8px",
          }}
        >
          {lang === "fr" ? "L'histoire de Malik" : lang === "ar" ? "قصة مالك" : "Malik's story"}
        </p>
        <h1
          style={{
            fontSize: "24px",
            fontWeight: 700,
            color: "#3D2B1F",
            fontFamily: "Georgia, serif",
            lineHeight: 1.4,
            marginBottom: "24px",
          }}
        >
          {lang === "fr"
            ? "Pourquoi j'ai créé Infeelit"
            : lang === "ar"
              ? "لماذا أنشأت Infeelit"
              : "Why I built Infeelit"}
        </h1>
      </div>

      <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginBottom: "12px" }}>
        {(["fr", "en", "ar"] as const).map((l) => (
          <button
            key={l}
            onClick={() => setWhyLang(l)}
            style={{
              padding: "6px 16px",
              borderRadius: "999px",
              border: "1px solid rgba(232,116,42,0.3)",
              background: whyLang === l ? "#E8742A" : "transparent",
              color: whyLang === l ? "#fff" : "#3D2B1F",
              fontSize: "12px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {l === "fr" ? "Français" : l === "ar" ? "العربية" : "English"}
          </button>
        ))}
      </div>

      <div
        style={{
          margin: "0 16px",
          borderRadius: "20px",
          overflow: "hidden",
          aspectRatio: "16/9",
          boxShadow: "0 4px 24px rgba(0,0,0,0.1)",
        }}
      >
        <iframe
          width="100%"
          height="100%"
          src={`https://www.youtube.com/embed/${WHY_VIDEOS[whyLang]}`}
          title="Pourquoi Infeelit"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{ display: "block" }}
        />
      </div>

      <div
        style={{
          margin: "32px 24px",
          padding: "24px",
          borderRadius: "20px",
          background: "rgba(232,116,42,0.06)",
          border: "1px solid rgba(232,116,42,0.2)",
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontSize: "18px",
            fontStyle: "italic",
            fontFamily: "Georgia, serif",
            color: "#3D2B1F",
            lineHeight: 1.6,
            marginBottom: "12px",
          }}
        >
          {lang === "fr"
            ? "\"J'avais soif de connaître la vie de mon père. Infeelit est le verre qu'il n'a pas eu le temps de remplir.\""
            : lang === "ar"
              ? '"كنت عطشاً لمعرفة حياة والدي. Infeelit هو الكأس الذي لم يكن لديه الوقت لملئه."'
              : '"I was thirsty to know my father\'s life. Infeelit is the glass he never had time to fill."'}
        </p>
        <p style={{ fontSize: "12px", fontWeight: 700, color: "#E8742A", letterSpacing: "0.1em" }}>
          — Malik, Fondateur d'Infeelit
        </p>
      </div>

      <div style={{ textAlign: "center", padding: "8px 24px 32px" }}>
        <p style={{ fontSize: "22px", fontWeight: 900, color: "#3D2B1F", fontFamily: "Georgia, serif" }}>
          {lang === "fr" ? "Remplis le verre." : lang === "ar" ? "املأ الكأس." : "Fill the glass."}
        </p>
        <p style={{ fontSize: "14px", color: "rgba(61,43,31,0.5)", marginTop: "4px" }}>
          {lang === "fr"
            ? "Partage ton histoire. Maintenant."
            : lang === "ar"
              ? "شارك قصتك. الآن."
              : "Share your story. Now."}
        </p>
      </div>

      <div style={{ height: "1px", background: "rgba(61,43,31,0.08)", margin: "0 24px 32px" }} />

      <div style={{ padding: "0 24px 24px", textAlign: "center" }}>
        <p
          style={{
            fontSize: "10px",
            fontWeight: 900,
            letterSpacing: "0.3em",
            color: "#E8742A",
            textTransform: "uppercase",
            marginBottom: "8px",
          }}
        >
          {lang === "fr" ? "La plateforme" : lang === "ar" ? "المنصة" : "The platform"}
        </p>
        <h2
          style={{
            fontSize: "22px",
            fontWeight: 700,
            color: "#3D2B1F",
            fontFamily: "Georgia, serif",
            marginBottom: "24px",
          }}
        >
          {lang === "fr" ? "C'est quoi Infeelit ?" : lang === "ar" ? "ما هو Infeelit ؟" : "What is Infeelit ?"}
        </h2>
      </div>

      <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginBottom: "12px" }}>
        {(["fr", "en", "ar"] as const).map((l) => (
          <button
            key={l}
            onClick={() => setWhatLang(l)}
            style={{
              padding: "6px 16px",
              borderRadius: "999px",
              border: "1px solid rgba(232,116,42,0.3)",
              background: whatLang === l ? "#E8742A" : "transparent",
              color: whatLang === l ? "#fff" : "#3D2B1F",
              fontSize: "12px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {l === "fr" ? "Français" : l === "ar" ? "العربية" : "English"}
          </button>
        ))}
      </div>

      <div
        style={{
          margin: "0 16px",
          borderRadius: "20px",
          overflow: "hidden",
          aspectRatio: "16/9",
          boxShadow: "0 4px 24px rgba(0,0,0,0.1)",
        }}
      >
        <iframe
          width="100%"
          height="100%"
          src={`https://www.youtube.com/embed/${WHAT_VIDEOS[whatLang]}`}
          title="C'est quoi Infeelit"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{ display: "block" }}
        />
      </div>

      <div style={{ padding: "32px 24px", display: "flex", flexDirection: "column", gap: "12px" }}>
        {[
          {
            icon: "🔒",
            fr: "Intimité absolue",
            en: "Absolute intimacy",
            ar: "خصوصية مطلقة",
            descFr: "Pas de profils publics. Vos cercles sont invisibles de l'extérieur.",
            descEn: "No public profiles. Your circles are invisible from the outside.",
            descAr: "لا ملفات شخصية عامة. دوائرك غير مرئية من الخارج.",
          },
          {
            icon: "✦",
            fr: "Préservation éternelle",
            en: "Eternal preservation",
            ar: "حفظ أبدي",
            descFr: "Tes souvenirs survivent au temps. Prêts à être écoutés dans 50 ans.",
            descEn: "Your memories survive time. Ready to be heard in 50 years.",
            descAr: "ذكرياتك تتجاوز الزمن. جاهزة للاستماع بعد 50 عاماً.",
          },
          {
            icon: "🔥",
            fr: "La flamme ne s'éteint jamais",
            en: "The flame never dies",
            ar: "الشعلة لا تنطفئ أبداً",
            descFr: "Ta voix continue de vivre après toi. Pour ceux que tu aimes.",
            descEn: "Your voice lives on after you. For those you love.",
            descAr: "صوتك يستمر بعدك. لمن تحب.",
          },
        ].map((v) => (
          <div
            key={v.icon}
            style={{
              display: "flex",
              gap: "16px",
              alignItems: "flex-start",
              padding: "16px",
              borderRadius: "16px",
              background: "#fff",
              border: "1px solid rgba(232,116,42,0.12)",
              boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
            }}
          >
            <span style={{ fontSize: "24px" }}>{v.icon}</span>
            <div>
              <p style={{ fontWeight: 700, color: "#3D2B1F", fontSize: "15px", marginBottom: "4px" }}>
                {lang === "fr" ? v.fr : lang === "ar" ? v.ar : v.en}
              </p>
              <p style={{ fontSize: "13px", color: "rgba(61,43,31,0.55)", lineHeight: 1.5 }}>
                {lang === "fr" ? v.descFr : lang === "ar" ? v.descAr : v.descEn}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ textAlign: "center", padding: "16px 24px 40px" }}>
        <div style={{ fontSize: "48px", marginBottom: "16px", animation: "flamePulse 2s ease-in-out infinite" }}>
          🔥
        </div>
        <p
          style={{
            fontSize: "16px",
            fontStyle: "italic",
            fontFamily: "Georgia, serif",
            color: "#3D2B1F",
            lineHeight: 1.6,
          }}
        >
          {lang === "fr"
            ? '"Infeelit ne conserve pas les souvenirs, il les éclaire."'
            : lang === "ar"
              ? '"Infeelit لا يحفظ الذكريات، بل يضيئها."'
              : '"Infeelit doesn\'t preserve memories, it illuminates them."'}
        </p>
      </div>
      <style>{`@keyframes flamePulse{0%,100%{transform:scale(1)}50%{transform:scale(1.15)}}`}</style>
    </div>
  );
};

export default About;
