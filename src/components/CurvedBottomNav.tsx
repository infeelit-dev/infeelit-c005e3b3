import { useNavigate, useLocation } from "react-router-dom";
import { Waves, MapPin, Plus, Users2, Gem } from "lucide-react";

const NAV_ITEMS = [
  { icon: Waves, label: "Feels", path: "/" },
  { icon: MapPin, label: "Places", path: "/places" },
  { icon: null, label: "", path: "/record" },
  { icon: Users2, label: "Connect", path: "/connect" },
  { icon: Gem, label: "Treasure", path: "/treasure" },
];

const CurvedBottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="absolute bottom-0 left-0 right-0 z-20">
      <svg viewBox="0 0 390 80" className="w-full" style={{ marginBottom: "-2px" }} preserveAspectRatio="none">
        <path
          d="M0,0 L145,0 Q165,0 175,15 Q185,30 195,30 Q205,30 215,15 Q225,0 245,0 L390,0 L390,80 L0,80 Z"
          fill="rgba(10,10,10,0.92)"
        />
      </svg>

      <div
        className="absolute bottom-0 left-0 right-0 flex items-end justify-around px-2 pb-6 pt-0"
        style={{ backgroundColor: "rgba(10,10,10,0.92)" }}
      >
        {NAV_ITEMS.map((item, index) => {
          if (index === 2) {
            return (
              <button
                key="record"
                onClick={() => navigate("/record")}
                className="relative -top-8 w-16 h-16 rounded-full gradient-orange flex items-center justify-center shadow-2xl active:scale-95 transition-transform"
                style={{
                  boxShadow: "0 0 30px rgba(232,116,42,0.5)",
                }}
              >
                <Plus size={28} className="text-white" strokeWidth={2.5} />
              </button>
            );
          }

          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center gap-1 min-w-[60px] transition-all duration-200"
            >
              {Icon && (
                <Icon
                  size={22}
                  className="transition-all duration-200"
                  style={{
                    color: isActive ? "#E8742A" : "rgba(255,255,255,0.45)",
                    filter: isActive ? "drop-shadow(0 0 6px rgba(232,116,42,0.6))" : "none",
                  }}
                />
              )}
              <span
                className="font-bold uppercase tracking-widest"
                style={{
                  fontSize: "8px",
                  color: isActive ? "#E8742A" : "rgba(255,255,255,0.35)",
                  letterSpacing: "0.12em",
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
