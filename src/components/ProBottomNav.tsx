const ACTIVE = "#C4922A";
const INACTIVE = "rgba(26,10,5,0.35)";

export type ProTab = "feed" | "reseau" | "voix" | "moi";

const PRO_NAV_ITEMS = [
  { id: "feed", icon: "home", label: "Feed" },
  { id: "reseau", icon: "users", label: "Réseau" },
  { id: "switch", icon: "plus", label: "" },
  { id: "voix", icon: "mic", label: "Voix" },
  { id: "moi", icon: "user", label: "Moi" },
] as const;

interface ProBottomNavProps {
  activeTab: string;
  onTabChange: (tab: ProTab) => void;
  onSwitch: () => void;
}

function FeedIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function ReseauIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function VoixIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  );
}

function MoiIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function NavIcon({ icon }: { icon: string }) {
  if (icon === "home") return <FeedIcon />;
  if (icon === "users") return <ReseauIcon />;
  if (icon === "mic") return <VoixIcon />;
  if (icon === "user") return <MoiIcon />;
  return <PlusIcon />;
}

export default function ProBottomNav({ activeTab, onTabChange, onSwitch }: ProBottomNavProps) {
  return (
    <nav
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 30,
        background: "rgba(253,248,240,0.95)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderTop: "1px solid rgba(0,0,0,0.08)",
        minHeight: "70px",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-around",
        paddingTop: "8px",
      }}
    >
      {PRO_NAV_ITEMS.map((item) => {
        if (item.id === "switch") {
          return (
            <div
              key={item.id}
              style={{
                flex: 1,
                display: "flex",
                justifyContent: "center",
                alignItems: "flex-start",
              }}
            >
              <button
                type="button"
                aria-label="Créer ou revenir à Infeelit"
                onClick={onSwitch}
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #C4922A, #6D59A8)",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transform: "translateY(-8px)",
                  boxShadow: "0 4px 20px rgba(196,146,42,0.4)",
                  flexShrink: 0,
                }}
              >
                <PlusIcon />
              </button>
            </div>
          );
        }

        const isActive = activeTab === item.id;
        const color = isActive ? ACTIVE : INACTIVE;

        return (
          <button
            key={item.id}
            type="button"
            aria-label={item.label}
            aria-current={isActive ? "page" : undefined}
            onClick={() => onTabChange(item.id)}
            style={{
              flex: 1,
              background: "none",
              border: "none",
              cursor: "pointer",
              color,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "4px",
              padding: "4px 0 8px",
            }}
          >
            <NavIcon icon={item.icon} />
            <span
              style={{
                fontSize: "10px",
                fontWeight: isActive ? 800 : 600,
                letterSpacing: "0.04em",
              }}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
