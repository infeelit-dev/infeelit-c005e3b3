import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Waves, MapPin, Plus, Users2, Gem } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface CurvedBottomNavProps {
  onPlusClick?: () => void;
  circleBadge?: number;
}

const CurvedBottomNav = ({ onPlusClick, circleBadge = 0 }: CurvedBottomNavProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();

  const NAV_ITEMS = [
    { icon: Waves, label: t.navFeels, path: "/" },
    { icon: MapPin, label: t.navPlaces, path: "/places" },
    { icon: null, label: "", path: "/record" },
    { icon: Users2, label: t.navConnect, path: "/connect" },
    { icon: Gem, label: t.navTreasure, path: "/treasure" },
  ];

  return (
    <div className="absolute bottom-0 left-0 right-0 z-20">
      <div
        className="h-16 w-full pointer-events-none"
        style={{ background: "linear-gradient(to bottom, transparent, rgba(0,0,0,0.4))" }}
      />
      <div
        className="flex items-center justify-around px-4 pb-8 pt-3"
        style={{
          background: "linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.7))",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        {NAV_ITEMS.map((item, index) => {
          if (index === 2) {
            return (
              <button
                key="record"
                onClick={() => onPlusClick?.()}
                className="relative -top-6 w-16 h-16 rounded-full flex items-center justify-center shadow-2xl active:scale-95 transition-transform"
                style={{
                  background: "linear-gradient(135deg, #E8742A, #D4621A)",
                  boxShadow: "0 0 30px rgba(232,116,42,0.6), 0 8px 20px rgba(0,0,0,0.4)",
                }}
              >
                <Plus size={28} className="text-white" strokeWidth={2.5} />
              </button>
            );
          }

          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          const showBadge = item.path === "/connect" && circleBadge > 0;

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center gap-1 min-w-[56px] transition-all duration-200 active:scale-95"
            >
              {Icon && (
                <div className="relative">
                  <Icon
                    size={22}
                    style={{
                      color: isActive ? "#E8742A" : "rgba(255,255,255,0.5)",
                      filter: isActive ? "drop-shadow(0 0 6px rgba(232,116,42,0.7))" : "none",
                      transition: "all 0.2s ease",
                    }}
                  />
                  {showBadge && (
                    <span
                      style={{
                        position: "absolute",
                        top: -4,
                        right: -6,
                        minWidth: 14,
                        height: 14,
                        padding: "0 4px",
                        borderRadius: 999,
                        background: "linear-gradient(135deg,#E8742A,#D4621A)",
                        color: "#fff",
                        fontSize: 9,
                        fontWeight: 800,
                        lineHeight: "14px",
                        textAlign: "center",
                        boxShadow: "0 0 8px rgba(232,116,42,0.7)",
                      }}
                    >
                      {circleBadge > 9 ? "9+" : circleBadge}
                    </span>
                  )}
                </div>
              )}
              <span
                style={{
                  fontSize: "8px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  color: isActive ? "#E8742A" : "rgba(255,255,255,0.35)",
                }}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CurvedBottomNav;
