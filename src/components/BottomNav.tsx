import { useNavigate, useLocation } from "react-router-dom";
import { Home, BookOpen, PlusCircle, User } from "lucide-react";

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: Home, path: "/feed", label: "Home" },
    { icon: BookOpen, path: "/stories", label: "Stories" },
    { icon: PlusCircle, path: "/create", label: "Record" },
    { icon: User, path: "/profile", label: "Profile" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-gray-100 px-8 py-4 flex justify-between items-center z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.03)]">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className="flex flex-col items-center gap-1.5 transition-all active:scale-90"
          >
            <item.icon
              size={22}
              className={isActive ? "text-[#E8742A] fill-[#E8742A]/5" : "text-[#1A4D4D]/30"}
              strokeWidth={isActive ? 2.5 : 2}
            />
            <span
              className={`text-[9px] font-black uppercase tracking-[0.15em] ${isActive ? "text-[#E8742A]" : "text-[#1A4D4D]/30"}`}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default BottomNav;
