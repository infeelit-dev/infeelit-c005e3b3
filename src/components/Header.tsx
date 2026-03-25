import { Search } from "lucide-react";
import logo from "@/assets/infeelit-logo.png";
import { useState } from "react";

const tabs = ["Memories", "Instant", "Forever"] as const;

const Header = () => {
  const [activeTab, setActiveTab] = useState<string>("Memories");

  return (
    <header className="absolute top-0 left-0 right-0 z-10">
      {/* Frosted glass bar */}
      <div className="mx-3 mt-3 rounded-2xl bg-white/15 backdrop-blur-xl border border-white/40 shadow-lg px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left: avatar + search */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur border border-white/40 flex items-center justify-center overflow-hidden">
              <span className="text-primary-foreground text-xs font-bold text-shadow-soft">A</span>
            </div>
            <button className="w-8 h-8 rounded-full bg-white/15 backdrop-blur border border-white/30 flex items-center justify-center transition-all hover:bg-white/25">
              <Search className="w-3.5 h-3.5 text-primary-foreground drop-shadow" />
            </button>
          </div>

          {/* Center: logo — translucent, blended */}
          <img
            src={logo}
            alt="Infeelit"
            className="h-7 opacity-90 drop-shadow-sm"
          />

          {/* Right: status badges */}
          <div className="flex items-center gap-1.5">
            <span className="bg-white/15 backdrop-blur border border-white/30 rounded-full px-2 py-0.5 text-[9px] font-bold text-primary-foreground tracking-wider text-shadow-soft flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
              LIVE
            </span>
            <span className="gradient-orange rounded-full px-2 py-0.5 text-[9px] font-bold text-primary-foreground tracking-wider">
              Pro
            </span>
          </div>
        </div>

        {/* Sub-navigation tabs */}
        <nav className="flex justify-center gap-6 mt-2.5 pt-2 border-t border-white/15">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`transition-all duration-300 text-shadow-soft ${
                activeTab === tab
                  ? "text-primary-foreground font-extrabold text-sm scale-105"
                  : "text-white/60 font-semibold text-xs"
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default Header;
