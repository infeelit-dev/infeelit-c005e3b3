import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { getLabel } from "@/lib/uiLabels";

const Search = () => {
  const { lang } = useLanguage();

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
      <span style={{ fontSize: "32px" }}>🔍</span>
      <h1
        style={{
          fontSize: "20px",
          fontWeight: 700,
          color: "#3D2B1F",
          fontFamily: "Georgia, serif",
        }}
      >
        {getLabel("search", lang)}
      </h1>
      <p
        style={{
          fontSize: "12px",
          color: "#E8742A",
          fontWeight: 600,
        }}
      >
        {lang === "fr"
          ? "Bientôt — cherche un souvenir, un lieu, un hashtag ✦"
          : lang === "ar"
            ? "قريباً — ابحث عن ذكرى أو مكان أو وسم ✦"
            : "Coming soon — search a memory, a place, a hashtag ✦"}
      </p>
    </div>
  );
};

export default Search;
