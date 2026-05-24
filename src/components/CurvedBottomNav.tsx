import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Users, MapPin, Plus, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";

interface CurvedBottomNavProps {
  onPlusClick?: () => void;
  circleBadge?: number;
}

const CurvedBottomNav = ({ onPlusClick, circleBadge = 0 }: CurvedBottomNavProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, lang } = useLanguage();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsConnected(!!session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setIsConnected(!!session);
    });
    return () => subscription.unsubscribe();
  }, []);

  const NAV_ITEMS = [
    { icon: Users, label: lang === "ar" ? "دوائر" : lang === "fr" ? "Cercles" : "Circles", path: "/circles" },
    { icon: MapPin, label: lang === "ar" ? "أماكن" : lang === "fr" ? "Lieux" : "Places", path: "/places" },
    { icon: null, label: "", path: "/record" },
    { icon: MessageCircle, label: lang === "ar" ? "همسات" : lang === "fr" ? "Murmures" : "Whispers", path: "/whispers" },
    { icon: "flame", label: lang === "ar" ? "أنا" : lang === "fr" ? "Moi" : "Me", path: "/treasure" },
  ];

  const isActive = (path: string) => {
    if (path === "/record") return false;
    if (path === "/circles" && (location.pathname === "/circles" || location.pathname === "/circle")) return true;
    return location.pathname === path;
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 z-20">
      <div className="h-16 w-full pointer-events-none" style={{ background: "linear-gradient(to bottom, transparent, rgba(0,0,0,0.4))" }} />
      <div className="flex items-center justify-around px-4 pb-8 pt-3" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.7))", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}>
        {NAV_ITEMS.map((item, index) => {
          if (index === 2) {
            return (
              <button key="record" onClick={() => onPlusClick?.()} className="relative -top-6 w-16 h-16 rounded-full flex items-center justify-center shadow-2xl active:scale-95 transition-transform" style={{ background: "linear-gradient(135deg, #E8742A, #D4621A)", boxShadow: "0 0 30px rgba(232,116,42,0.6), 0 8px 20px rgba(0,0,0,0.4)" }}>
                <Plus size={28} className="text-white" strokeWidth={2.5} />
              </button>
            );
          }

          if (item.icon === "flame") {
            return (
              <button key="flame" onClick={() => navigate(item.path)} className="flex flex-col items-center gap-1 min-w-[56px] transition-all duration-200 active:scale-95">
                <div style={{ position: "relative" }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={isConnected ? "#E8742A" : "rgba(255,255,255,0.3)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ filter: isConnected ? "none" : "grayscale(1)", animation: isConnected && isActive(item.path) ? "flameAlive 2s ease-in-out infinite" : "none" }}>
                    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
                  </svg>
                  {circleBadge > 0 && isActive(item.path) && (
                    <div style={{ position: "absolute", top: "-4px", right: "-8px", minWidth: "14px", height: "14px", borderRadius: "7px", backgroundColor: "#E8742A", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 3px" }}>
                      <span style={{ fontSize: "8px", color: "#fff", fontWeight: 700, lineHeight: 1 }}>{circleBadge}</span>
                    </div>
                  )}
                </div>
                <span style={{ fontSize: "8px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: isActive(item.path) ? "#E8742A" : "rgba(255,255,255,0.35)" }}>{item.label}</span>
              </button>
            );
          }

          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <button key={item.path} onClick={() => navigate(item.path)} className="flex flex-col items-center gap-1 min-w-[56px] transition-all duration-200 active:scale-95">
              <div style={{ position: "relative" }}>
                {Icon && <Icon size={22} style={{ color: active ? "#E8742A" : "rgba(255,255,255,0.5)", filter: active ? "drop-shadow(0 0 6px rgba(232,116,42,0.7))" : "none", transition: "all 0.2s ease" }} />}
                {index === 0 && circleBadge > 0 && (
                  <div style={{ position: "absolute", top: "-4px", right: "-8px", minWidth: "14px", height: "14px", borderRadius: "7px", backgroundColor: "#E8742A", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 3px" }}>
                    <span style={{ fontSize: "8px", color: "#fff", fontWeight: 700, lineHeight: 1 }}>{circleBadge}</span>
                  </div>
                )}
              </div>
              <span style={{ fontSize: "8px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: active ? "#E8742A" : "rgba(255,255,255,0.35)" }}>{item.label}</span>
            </button>
          );
        })}
      </div>
      <style dangerouslySetInnerHTML={{ __html: "@keyframes flameAlive { 0%, 100% { transform: scale(1); filter: drop-shadow(0 0 4px rgba(232,116,42,0.6)); } 50% { transform: scale(1.08); filter: drop-shadow(0 0 8px rgba(232,116,42,0.9)); } }" }} />
    </div>
  );
};

export default CurvedBottomNav;