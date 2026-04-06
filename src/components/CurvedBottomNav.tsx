import { Home, Users, Menu, Plus, Circle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CurvedBottomNav = () => {
  const navigate = useNavigate();

  return (
    <div className="absolute bottom-0 left-0 right-0 z-10">
      <svg viewBox="0 0 400 80" preserveAspectRatio="none" className="w-full h-20 block">
        <defs>
          <linearGradient id="navGlass" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0.25)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.12)" />
          </linearGradient>
        </defs>
        <path
          d="M0,28 C80,28 140,28 165,28 C180,28 185,4 200,4 C215,4 220,28 235,28 C260,28 320,28 400,28 L400,80 L0,80 Z"
          fill="url(#navGlass)"
        />
        <path
          d="M0,28 C80,28 140,28 165,28 C180,28 185,4 200,4 C215,4 220,28 235,28 C260,28 320,28 400,28"
          fill="none"
          stroke="rgba(255,255,255,0.45)"
          strokeWidth="0.8"
        />
      </svg>

      <div className="absolute inset-0 backdrop-blur-lg pointer-events-none rounded-t-3xl" style={{ top: "28px" }} />

      {/* Bouton + vers /record */}
      <button
        onClick={() => navigate("/record")}
        className="absolute left-1/2 -translate-x-1/2 top-0 -translate-y-1/2 w-14 h-14 rounded-full gradient-orange flex items-center justify-center transition-transform duration-300 hover:scale-110 active:scale-95 shadow-[0_0_30px_rgba(232,116,42,0.5)]"
      >
        <Plus className="w-7 h-7 text-white" strokeWidth={2.5} />
      </button>

      {/* Nav icons */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-8 pb-5 pt-2">
        <NavIcon icon={<Home className="w-5 h-5" />} label="Ocean" active onClick={() => navigate("/")} />
        <NavIcon icon={<Circle className="w-5 h-5" />} label="Circle" onClick={() => navigate("/circle")} />
        <div className="w-14" />
        <NavIcon icon={<Users className="w-5 h-5" />} label="Friends" onClick={() => navigate("/circle")} />
        <NavIcon icon={<Menu className="w-5 h-5" />} label="Me" onClick={() => navigate("/profile")} />
      </div>
    </div>
  );
};

const NavIcon = ({
  icon,
  label,
  active = false,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center gap-0.5 transition-all duration-200 ${
      active ? "text-primary-foreground" : "text-white/60 hover:text-white/80"
    }`}
  >
    {icon}
    <span className="text-[10px] font-semibold">{label}</span>
  </button>
);

export default CurvedBottomNav;
