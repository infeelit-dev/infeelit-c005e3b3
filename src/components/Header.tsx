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
      <div className="mx-3 mt-3 rounded-2xl bg-white/15 backdrop-blur-xl border border-white/40 shadow-lg px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur border border-white/40 flex items-center justify-center">
              <span className="text-primary-foreground text-xs font-bold">A</span>
            </div>
            <button className="w-8 h-8 rounded-full bg-white/15 backdrop-blur border border-white/30 flex items-center justify-center">
              <Search className="w-3.5 h-3.5 text-primary-foreground" />
            </button>
          </div>

          <img
            src={logo}
            alt="Infeelit"
            className="h-12 opacity-95 drop-shadow-sm"
            style={{ imageRendering: "-webkit-optimize-contrast" as any }}
          />

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

        <nav className="flex justify-center gap-6 mt-2.5 pt-2 border-t border-white/15">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTimelineChange(tab.id)}
              className={`transition-all duration-300 ${
                activeTimeline === tab.id
                  ? "text-primary-foreground font-extrabold text-sm scale-105"
                  : "text-white/60 font-semibold text-xs"
              }`}
            >
              {tab.label}
              {activeTimeline === tab.id && (
                <div
                  className="mx-auto mt-0.5 h-0.5 rounded-full"
                  style={{
                    width: "100%",
                    backgroundColor: tab.id === "forever" ? "#38bdf8" : tab.id === "instant" ? "#E8742A" : "#ffffff",
                  }}
                />
              )}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default Header;
