import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import CurvedBottomNav from "@/components/CurvedBottomNav";

const Search = () => {
  const { lang } = useLanguage();
  const navigate = useNavigate();

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
        paddingBottom: "80px",
      }}
    >
      <button
        type="button"
        onClick={() => navigate(-1)}
        style={{
          position: "absolute",
          top: "56px",
          left: "20px",
          width: "44px",
          height: "44px",
          borderRadius: "50%",
          background: "rgba(61,43,31,0.08)",
          border: "none",
          cursor: "pointer",
          color: "#3D2B1F",
          fontSize: "20px",
        }}
        aria-label="Back"
      >
        ←
      </button>
      <span style={{ fontSize: "32px" }}>🔍</span>
      <h1
        style={{
          fontSize: "20px",
          fontWeight: 700,
          color: "#3D2B1F",
          fontFamily: "Georgia, serif",
        }}
      >
        {lang === "fr" ? "Recherche" : lang === "ar" ? "البحث" : "Search"}
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
      <CurvedBottomNav />
    </div>
  );
};

export default Search;
