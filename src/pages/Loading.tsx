import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import infeelit from "@/assets/infeelit-logo.png";
import imgRelax from "@/assets/relax.jpg";
import imgTravel from "@/assets/travel.jpg";
import imgPicnic from "@/assets/picnic.jpg";
import imgGrandfather from "@/assets/grandfather.jpg";
import imgHouse from "@/assets/house.jpg";
import imgMarry from "@/assets/marry.jpg";
import imgLove from "@/assets/love.jpg";
import imgGraduate from "@/assets/graduate.jpg";
import imgChild from "@/assets/child.jpg";
import imgBirth from "@/assets/birth.jpg";

const IMAGES = [
  imgBirth,
  imgChild,
  imgGraduate,
  imgMarry,
  imgHouse,
  imgLove,
  imgGrandfather,
  imgPicnic,
  imgTravel,
  imgRelax,
];

const Loading = () => {
  const navigate = useNavigate();
  const { t, lang, rtl } = useLanguage();

  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const imgInterval = setInterval(() => {
      setCurrentImgIndex((prev) => (prev + 1) % IMAGES.length);
    }, 800);

    const progressInterval = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 100 : prev + 1));
    }, 40);

    const timeout = setTimeout(() => navigate("/feed"), 4500);

    return () => {
      clearInterval(imgInterval);
      clearInterval(progressInterval);
      clearTimeout(timeout);
    };
  }, [navigate]);

  return (
    <div
      className="min-h-screen bg-[#FDFCFB] flex flex-col items-center justify-center px-8 overflow-hidden"
      dir={rtl ? "rtl" : "ltr"}
      style={{ fontFamily: lang === "ar" ? "'Noto Sans Arabic', Arial, sans-serif" : "inherit" }}
    >
      <style>{`
        @keyframes slow-zoom {
          from { transform: scale(1);   opacity: 0; }
          to   { transform: scale(1.1); opacity: 1; }
        }
        .fade-in-out { animation: slow-zoom 1.2s ease-in-out infinite alternate; }
      `}</style>

      {/* Logo */}
      <img
        src={infeelit}
        alt="Infeelit"
        className="w-[140px] h-auto object-contain mb-12"
        style={{ mixBlendMode: "multiply" }}
      />

      {/* Rotating memory circle */}
      <div className="relative w-48 h-48 mb-12">
        <div className="absolute inset-0 rounded-full border-4 border-[#F97316]/20 animate-ping" />
        <div className="absolute inset-0 rounded-full border-2 border-[#F97316]/10 animate-pulse" />
        <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-white shadow-2xl">
          <img
            src={IMAGES[currentImgIndex]}
            className="w-full h-full object-cover transition-all duration-1000 ease-in-out grayscale sepia"
            alt="Memories"
          />
          <div className="absolute inset-0 bg-[#6B4E9B]/10 mix-blend-overlay" />
        </div>
      </div>

      {/* Poetic text — translated */}
      <div className="text-center space-y-3 max-w-xs">
        <h2 className="text-[#1A4D4D] text-xl font-black uppercase tracking-tighter">{t.loadingTitle}</h2>
        <p className="text-[#6B7280] text-sm font-medium italic opacity-80 leading-relaxed">"{t.loadingQuote}"</p>
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-[200px] mt-16 bg-gray-100 h-1 rounded-full overflow-hidden">
        <div className="h-full bg-[#F97316] transition-all duration-300 ease-out" style={{ width: `${progress}%` }} />
      </div>

      <p className="mt-4 text-[9px] font-black text-[#9CA3AF] uppercase tracking-[0.3em]">{t.loadingSubtitle}</p>
    </div>
  );
};

export default Loading;
