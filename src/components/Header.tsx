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
      {/* Logo centré — taille fixe en pixels pour éviter tout problème */}
      <img
        src={logo}
        alt="Infeelit"
        style={{
          height: "52px",
          width: "auto",
          opacity: 0.95,
          marginBottom: "12px",
          filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.3))",
          imageRendering: "-webkit-optimize-contrast",
        }}
      />

      {/* Tabs flottants sans fond */}
      <nav className="flex justify-center gap-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTimelineChange(tab.id)}
            className="relative transition-all duration-300 pb-1.5"
            style={{
              color: activeTimeline === tab.id ? "#FFFFFF" : "rgba(255,255,255,0.45)",
              fontWeight: activeTimeline === tab.id ? 900 : 600,
              fontSize: activeTimeline === tab.id ? "14px" : "12px",
              transform: activeTimeline === tab.id ? "scale(1.05)" : "scale(1)",
            }}
          >
            {tab.label}
            {activeTimeline === tab.id && (
              <div
                className="absolute bottom-0 left-0 right-0 rounded-full"
                style={{
                  height: "2px",
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
