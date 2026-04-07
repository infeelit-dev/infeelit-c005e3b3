import { Search } from "lucide-react";
import logo from "@/assets/infeelit-logo.png";
import type { Timeline } from "@/types/timeline";

interface HeaderProps {
  activeTimeline: Timeline;
  onTimelineChange: (t: Timeline) => void;
}

const tabs: { id: Timeline; label: string }[] = [
  { id: "memories", label: "Memories" },
  { id: "instant", label: "Instant" },
  { id: "forever", label: "Forever" },
];

const Header = ({ activeTimeline, onTimelineChange }: HeaderProps) => {
  return (
    <header className="absolute top-0 left-0 right-0 z-10">
      <div className="px-4 pt-10 pb-2 flex items-center justify-between">
        {/* Logo discret à gauche */}
        <img
          src={logo}
          alt="Infeelit"
          className="h-8 opacity-90 drop-shadow-sm"
          style={{ imageRendering: "-webkit-optimize-contrast" as any }}
        />

        {/* Badges droite */}
        <div className="flex items-center gap-1.5">
          <span className="bg-white/15 backdrop-blur border border-white/30 rounded-full px-2 py-0.5 text-[9px] font-bold text-primary-foreground tracking-wider flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
            LIVE
          </span>
          <span className="gradient-orange rounded-full px-2 py-0.5 text-[9px] font-bold text-primary-foreground tracking-wider">
            Pro
          </span>
        </div>
      </div>

      {/* Tabs fins flottants — sans fond */}
      <nav className="flex justify-center gap-8 px-6 pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTimelineChange(tab.id)}
            className={`relative transition-all duration-300 pb-1.5 ${
              activeTimeline === tab.id
                ? "text-primary-foreground font-extrabold text-sm"
                : "text-white/50 font-semibold text-xs hover:text-white/80"
            }`}
          >
            {tab.label}
            {activeTimeline === tab.id && (
              <div
                className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                style={{
                  backgroundColor: tab.id === "forever" ? "#38bdf8" : tab.id === "instant" ? "#E8742A" : "#ffffff",
                }}
              />
            )}
          </button>
        ))}
      </nav>
    </header>
  );
};

export default Header;
