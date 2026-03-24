import { Search, Zap } from "lucide-react";
import logo from "@/assets/infeelit-logo.png";
import { useState } from "react";

const tabs = ["Memories", "Instant", "Forever"] as const;

const Header = () => {
  const [activeTab, setActiveTab] = useState<string>("Memories");

  return (
    <header className="absolute top-0 left-0 right-0 z-10 px-5 pt-4 pb-2">
      {/* Top row */}
      <div className="flex items-center justify-between">
        {/* Left: avatar + search */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full glass-surface flex items-center justify-center overflow-hidden">
            <span className="text-primary-foreground text-sm font-bold text-shadow-soft">A</span>
          </div>
          <button className="w-9 h-9 rounded-full glass-surface flex items-center justify-center">
            <Search className="w-4 h-4 text-primary-foreground drop-shadow" />
          </button>
        </div>

        {/* Center: logo */}
        <img src={logo} alt="Infeelit" className="h-8 drop-shadow-md" />

        {/* Right: status badges */}
        <div className="flex items-center gap-2">
          <span className="glass-surface rounded-full px-2.5 py-0.5 text-[10px] font-bold text-primary-foreground tracking-wider text-shadow-soft flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
            LIVE
          </span>
          <span className="gradient-orange rounded-full px-2.5 py-0.5 text-[10px] font-bold text-primary-foreground tracking-wider flex items-center gap-1">
            <Zap className="w-3 h-3" />
            Pro
          </span>
        </div>
      </div>

      {/* Sub-navigation tabs */}
      <nav className="flex justify-center gap-6 mt-4">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`transition-all duration-300 text-shadow-soft ${
              activeTab === tab
                ? "text-primary-foreground font-extrabold text-base scale-105"
                : "text-white/70 font-semibold text-sm"
            }`}
          >
            {tab}
          </button>
        ))}
      </nav>
    </header>
  );
};

export default Header;
