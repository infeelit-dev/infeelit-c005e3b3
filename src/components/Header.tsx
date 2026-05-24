import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import type { Timeline } from "@/types/timeline";
import infeelit from "@/assets/infeelit-logo.png";

interface HeaderProps {
  activeTimeline: Timeline;
  onTimelineChange: (t: Timeline) => void | Promise<void>;
}

const Header = ({ activeTimeline, onTimelineChange }: HeaderProps) => {
  const navigate = useNavigate();

  const tabs = [
    { id: "memories" as Timeline, label: "Memories" },
    { id: "instant" as Timeline, label: "Instant" },
    { id: "forever" as Timeline, label: "Forever" },
  ];

  const underlineColor = (id: Timeline) => (id === "forever" ? "#38bdf8" : id === "instant" ? "#E8742A" : "#ffffff");

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
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingLeft: "16px",
          paddingRight: "16px",
          marginBottom: "10px",
        }}
      >
        <div style={{ width: "80px" }} />
        <img
          src={infeelit}
          alt="Infeelit"
          onClick={() => navigate("/")}
          style={{
            height: "64px",
            width: "auto",
            maxWidth: "160px",
            filter: "drop-shadow(0 2px 12px rgba(0,0,0,0.9)) brightness(1.4) contrast(1.2)",
            cursor: "pointer",
          }}
        />
        <button
          onClick={() => navigate("/search")}
          style={{
            width: "34px",
            height: "34px",
            borderRadius: "50%",
            backgroundColor: "rgba(255,255,255,0.15)",
            border: "1px solid rgba(255,255,255,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            backdropFilter: "blur(8px)",
          }}
        >
          <Search size={16} color="#fff" />
        </button>
      </div>
      <nav style={{ display: "flex", justifyContent: "center", gap: "32px" }}>
        {tabs.map((tab) => {
          const isActive = activeTimeline === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTimelineChange(tab.id)}
              style={{
                position: "relative",
                paddingBottom: "6px",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: isActive ? "#fff" : "rgba(255,255,255,0.75)",
                fontWeight: isActive ? 900 : 700,
                fontSize: isActive ? "16px" : "13px",
                textShadow: "0 1px 8px rgba(0,0,0,0.9)",
                transition: "all 0.2s",
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
                    backgroundColor: underlineColor(tab.id),
                    boxShadow: `0 0 10px ${underlineColor(tab.id)}`,
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
