import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ProBubbleCanvas, { type ProBubbleItem } from "@/components/ProBubbleCanvas";
import ProBottomNav, { type ProTab } from "@/components/ProBottomNav";

const NAVY = "#0D1B2A";
const CREAM = "rgba(253,248,240,0.92)";

type DemoVoice = {
  name: string;
  role: string;
  company: string;
  color: string;
};

const DEMO_VOICES: DemoVoice[] = [
  { name: "Karim B.", role: "Fondateur", company: "Infeelit", color: "#C4922A" },
  { name: "Sara M.", role: "CEO", company: "Bloom Health", color: "#6D59A8" },
  { name: "Jean-Pierre D.", role: "Technicien", company: "Duval Industries", color: "#2A6496" },
];

function VoiceCard({
  voice,
  actionLabel,
  onAction,
  followed,
}: {
  voice: DemoVoice;
  actionLabel?: string;
  onAction?: () => void;
  followed?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "14px 16px",
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "14px",
        marginBottom: "8px",
      }}
    >
      <div
        style={{
          width: "44px",
          height: "44px",
          borderRadius: "50%",
          background: `${voice.color}22`,
          border: `2px solid ${voice.color}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: voice.color,
          fontWeight: 900,
          fontSize: "16px",
          flexShrink: 0,
        }}
      >
        {voice.name[0]}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ color: CREAM, fontWeight: 700, fontSize: "15px", margin: 0 }}>{voice.name}</p>
        <p style={{ color: "rgba(253,248,240,0.45)", fontSize: "13px", margin: "2px 0 0" }}>
          {voice.role} · {voice.company}
        </p>
      </div>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          style={{
            padding: "6px 16px",
            borderRadius: "999px",
            background: followed ? "rgba(196,146,42,0.2)" : "rgba(196,146,42,0.12)",
            border: "1px solid #C4922A",
            color: "#C4922A",
            fontSize: "13px",
            fontWeight: 700,
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

function ProReseau({
  followedPeople,
  followers,
  onFollow,
}: {
  followedPeople: DemoVoice[];
  followers: DemoVoice[];
  onFollow: (voice: DemoVoice) => void;
}) {
  const followedNames = new Set(followedPeople.map((v) => v.name));

  return (
    <div style={{ padding: "72px 20px 24px" }}>
      <p
        style={{
          color: "#C4922A",
          fontSize: "10px",
          fontWeight: 900,
          letterSpacing: "0.2em",
          margin: "8px 0 12px",
        }}
      >
        VOICES YOU FOLLOW
      </p>
      {followedPeople.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 24px" }}>
          <p style={{ color: "#C4922A", fontSize: "32px", margin: 0 }}>◆</p>
          <p
            style={{
              color: CREAM,
              fontSize: "16px",
              fontFamily: "Georgia, serif",
              fontStyle: "italic",
              margin: "8px 0 0",
            }}
          >
            You haven&apos;t followed any voice yet.
          </p>
        </div>
      ) : (
        followedPeople.map((voice) => <VoiceCard key={voice.name} voice={voice} />)
      )}

      <p
        style={{
          color: "#2A6496",
          fontSize: "10px",
          fontWeight: 900,
          letterSpacing: "0.2em",
          margin: "24px 0 12px",
        }}
      >
        FOLLOWING YOU
      </p>
      {followers.length === 0 ? (
        <p
          style={{
            color: "rgba(253,248,240,0.45)",
            fontSize: "14px",
            fontStyle: "italic",
            textAlign: "center",
            padding: "24px",
          }}
        >
          No one is following your voice yet.
        </p>
      ) : (
        followers.map((voice) => <VoiceCard key={voice.name} voice={voice} />)
      )}

      <p
        style={{
          color: "#6D59A8",
          fontSize: "10px",
          fontWeight: 900,
          letterSpacing: "0.2em",
          margin: "24px 0 12px",
        }}
      >
        SUGGESTED VOICES
      </p>
      {DEMO_VOICES.map((voice) => {
        const isFollowed = followedNames.has(voice.name);
        return (
          <VoiceCard
            key={voice.name}
            voice={voice}
            followed={isFollowed}
            actionLabel={isFollowed ? "Suivi" : "+ Suivre"}
            onAction={() => onFollow(voice)}
          />
        );
      })}
    </div>
  );
}

function ProVoix() {
  return (
    <div style={{ textAlign: "center", padding: "100px 24px 60px" }}>
      <p style={{ fontSize: "48px", margin: 0 }}>🎙️</p>
      <p
        style={{
          color: CREAM,
          fontSize: "18px",
          fontFamily: "Georgia, serif",
          fontStyle: "italic",
          marginBottom: "8px",
        }}
      >
        Tes messages vocaux apparaîtront ici.
      </p>
      <p style={{ color: "rgba(253,248,240,0.45)", fontSize: "14px" }}>
        Réponds à une bulle avec ta voix pour commencer.
      </p>
    </div>
  );
}

function ProProfile() {
  return (
    <div style={{ padding: "72px 24px 24px" }}>
      <div style={{ textAlign: "center", marginBottom: "24px" }}>
        <div
          style={{
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #C4922A, #6D59A8)",
            margin: "0 auto 12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontSize: "32px",
            fontWeight: 900,
          }}
        >
          M
        </div>
        <h2 style={{ color: CREAM, fontSize: "20px", fontWeight: 700, margin: 0 }}>Malik</h2>
        <p style={{ color: "#C4922A", fontSize: "13px", margin: "4px 0 0" }}>Fondateur · Infeelit</p>
      </div>

      {[
        { label: "MA FONDATION", color: "#C4922A", desc: "Pourquoi j'ai choisi ce chemin" },
        { label: "MES ACTUALITÉS", color: "#2A6496", desc: "Ce que je vis professionnellement" },
        { label: "MES PROJETS", color: "#6D59A8", desc: "Où je vais, ce que je construis" },
      ].map(({ label, color, desc }) => (
        <div
          key={label}
          style={{
            padding: "16px",
            borderRadius: "14px",
            border: `1px solid ${color}40`,
            background: `${color}18`,
            marginBottom: "12px",
            cursor: "pointer",
          }}
        >
          <p style={{ color, fontSize: "10px", fontWeight: 900, letterSpacing: "0.2em", margin: "0 0 6px" }}>
            {label}
          </p>
          <p style={{ color: "rgba(253,248,240,0.55)", fontSize: "14px", margin: 0, fontStyle: "italic" }}>
            {desc}
          </p>
          <p style={{ color, fontSize: "12px", margin: "8px 0 0", fontWeight: 700 }}>
            + Enregistrer ma voix →
          </p>
        </div>
      ))}
    </div>
  );
}

type SelectedBubble = ProBubbleItem & { color: string };

export default function Pro() {
  const navigate = useNavigate();
  const [navTab, setNavTab] = useState<ProTab>("feed");
  const [headerCollapsed, setHeaderCollapsed] = useState(false);
  const [selected, setSelected] = useState<SelectedBubble | null>(null);
  const [followedPeople, setFollowedPeople] = useState<DemoVoice[]>([]);
  const [followers] = useState<DemoVoice[]>([]);

  const handleFollow = (voice: DemoVoice) => {
    setFollowedPeople((prev) => {
      if (prev.some((v) => v.name === voice.name)) {
        return prev.filter((v) => v.name !== voice.name);
      }
      return [...prev, voice];
    });
  };

  return (
    <div
      style={{
        height: "100vh",
        background: NAVY,
        color: CREAM,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        paddingBottom: "80px",
        boxSizing: "border-box",
      }}
    >
      {/* COMPANY HEADER — dark glass, collapses after 80px scroll */}
      {navTab === "feed" && (
        <div
          style={{
            flexShrink: 0,
            zIndex: 100,
            background: "rgba(13,27,42,0.9)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            padding: headerCollapsed ? "10px 20px" : "18px 20px 14px",
            transition: "padding 0.3s ease",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: headerCollapsed ? "10px" : "14px",
            }}
          >
            <div
              style={{
                width: headerCollapsed ? "36px" : "52px",
                height: headerCollapsed ? "36px" : "52px",
                borderRadius: headerCollapsed ? "10px" : "14px",
                background: "linear-gradient(135deg, #C4922A, #6D59A8)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontSize: headerCollapsed ? "16px" : "20px",
                fontWeight: 900,
                flexShrink: 0,
                transition: "all 0.3s ease",
              }}
            >
              ◆
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <h1
                style={{
                  color: CREAM,
                  fontSize: headerCollapsed ? "15px" : "18px",
                  fontWeight: 800,
                  margin: 0,
                  fontFamily: "Georgia, serif",
                  transition: "font-size 0.3s ease",
                }}
              >
                Infeelit
              </h1>
              {!headerCollapsed && (
                <p
                  style={{
                    color: "rgba(253,248,240,0.5)",
                    fontSize: "13px",
                    margin: "2px 0 0",
                  }}
                >
                  Dubai · 3 membres
                </p>
              )}
            </div>

            <button
              type="button"
              style={{
                padding: headerCollapsed ? "6px 12px" : "8px 16px",
                borderRadius: "999px",
                background: "#C4922A",
                border: "none",
                color: "#fff",
                fontSize: "13px",
                fontWeight: 700,
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              + Suivre
            </button>
          </div>

          {!headerCollapsed && (
            <p
              style={{
                color: "rgba(253,248,240,0.55)",
                fontSize: "13px",
                fontStyle: "italic",
                fontFamily: "Georgia, serif",
                margin: "12px 0 0",
                lineHeight: 1.5,
              }}
            >
              Préserver les voix qu&apos;on aime avant qu&apos;il soit trop tard.
            </p>
          )}
        </div>
      )}

      {navTab === "feed" && (
        <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
          <ProBubbleCanvas
            onScroll={(scrolled) => setHeaderCollapsed(scrolled > 80)}
            onBubbleTap={(bubble) => setSelected(bubble)}
          />
        </div>
      )}
      {navTab === "reseau" && (
        <div style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
          <ProReseau
            followedPeople={followedPeople}
            followers={followers}
            onFollow={handleFollow}
          />
        </div>
      )}
      {navTab === "voix" && (
        <div style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
          <ProVoix />
        </div>
      )}
      {navTab === "moi" && (
        <div style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
          <ProProfile />
        </div>
      )}

      {selected && (
        <button
          type="button"
          onClick={() => setSelected(null)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 200,
            background: "rgba(5,10,18,0.92)",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            padding: "24px",
          }}
        >
          <div
            style={{
              width: "min(280px, 86vw)",
              aspectRatio: "1",
              borderRadius: "50%",
              border: `3px solid ${selected.color}`,
              background:
                selected.hasPhoto && selected.photoUrl
                  ? `center / cover url(${selected.photoUrl})`
                  : `radial-gradient(circle at 30% 30%, ${selected.color}55, #0D1B2A)`,
              boxShadow: `0 0 40px ${selected.color}66`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              padding: "28px",
              textAlign: "center",
            }}
          >
            <p style={{ margin: 0, fontSize: "13px", fontWeight: 800, opacity: 0.85 }}>
              {selected.name}
            </p>
            <p style={{ margin: "4px 0 12px", fontSize: "11px", opacity: 0.6 }}>{selected.role}</p>
            <p
              style={{
                margin: 0,
                fontFamily: "Georgia, serif",
                fontStyle: "italic",
                fontSize: "18px",
                lineHeight: 1.35,
              }}
            >
              {selected.title}
            </p>
            <p
              style={{
                margin: "16px 0 0",
                fontSize: "13px",
                fontWeight: 800,
                color: selected.color,
              }}
            >
              ▶ {selected.duration}
            </p>
          </div>
        </button>
      )}

      <ProBottomNav activeTab={navTab} onTabChange={setNavTab} onSwitch={() => navigate("/")} />
    </div>
  );
}
