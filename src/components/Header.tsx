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
    <header
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: "12px",
        paddingBottom: "8px",
      }}
    >
      <img
        src={logo}
        alt="Infeelit"
        style={{
          height: "72px",
          width: "auto",
          maxWidth: "260px",
          minWidth: "160px",
          opacity: 1,
          marginBottom: "10px",
          filter: "drop-shadow(0 2px 16px rgba(0,0,0,0.9)) brightness(1.3) contrast(1.2)",
          display: "block",
        }}
      />

      <nav
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "32px",
        }}
      >
        {tabs.map((tab) => {
          const isActive = activeTimeline === tab.id;
          const underlineColor = tab.id === "forever" ? "#38bdf8" : tab.id === "instant" ? "#E8742A" : "#ffffff";

          return (
            <button
              key={tab.id}
              onClick={() => onTimelineChange(tab.id)}
              style={{
                position: "relative",
                paddingBottom: "6px",
                color: isActive ? "#FFFFFF" : "rgba(255,255,255,0.75)",
                fontWeight: isActive ? 900 : 700,
                fontSize: isActive ? "16px" : "13px",
                letterSpacing: "0.02em",
                background: "none",
                border: "none",
                cursor: "pointer",
                textShadow: "0 1px 8px rgba(0,0,0,0.9)",
                transition: "all 0.2s ease",
                whiteSpace: "nowrap",
              }}
            >
              {tab.label}
              {isActive && (
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: "2.5px",
                    borderRadius: "999px",
                    backgroundColor: underlineColor,
                    boxShadow: `0 0 10px ${underlineColor}`,
                  }}
                />
              )}
            </button>
          );
        })}
      </nav>
    </header>
  );
};

export default Header;
