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
    <header className="absolute top-0 left-0 right-0 z-10 flex flex-col items-center pt-10 pb-2">
      {/* Logo centré */}
      <img
        src={logo}
        alt="Infeelit"
        className="h-12 opacity-95 drop-shadow-lg mb-3"
        style={{ imageRendering: "-webkit-optimize-contrast" as any }}
      />

      {/* Tabs flottants */}
      <nav className="flex justify-center gap-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTimelineChange(tab.id)}
            className={`relative transition-all duration-300 pb-1.5 ${
              activeTimeline === tab.id
                ? "text-white font-black text-sm scale-105"
                : "text-white/45 font-semibold text-xs hover:text-white/70"
            }`}
          >
            {tab.label}
            {activeTimeline === tab.id && (
              <div
                className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                style={{
                  backgroundColor: tab.id === "forever" ? "#38bdf8" : tab.id === "instant" ? "#E8742A" : "#ffffff",
                  boxShadow:
                    tab.id === "forever"
                      ? "0 0 8px rgba(56,189,248,0.8)"
                      : tab.id === "instant"
                        ? "0 0 8px rgba(232,116,42,0.8)"
                        : "0 0 8px rgba(255,255,255,0.6)",
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
