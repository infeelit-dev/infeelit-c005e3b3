import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import CurvedBottomNav from "@/components/CurvedBottomNav";
import SparkBubble from "@/components/SparkBubble";
import BubbleCanvas from "@/components/BubbleCanvas";
import useUserName from "@/hooks/useUserName";
import type { Timeline } from "@/types/timeline";

const Index = () => {
  const navigate = useNavigate();
  const location = useLocation();
  useUserName();
  const [activeTimeline, setActiveTimeline] = useState<Timeline>("memories");
  const [sparkForced, setSparkForced] = useState(false);
  const [showPlusSheet, setShowPlusSheet] = useState(false);
  const [circleBadge, setCircleBadge] = useState(0);
  const importInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (location.state?.openSpark) {
      setSparkForced(true);
    }
  }, [location.state]);

  useEffect(() => {
    const entryTime = Date.now();
    return () => {
      const timeSpent = Date.now() - entryTime;
      const prev = Number(localStorage.getItem("infeelit_feed_time") || 0);
      localStorage.setItem("infeelit_feed_time", String(prev + timeSpent));
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) return;
      const { data: memberships } = await supabase
        .from("circle_members")
        .select("circle_id, user_id")
        .eq("user_id", session.user.id)
        .limit(1);
      const m = memberships?.[0];
      if (!m) return;
      const { data: allMembers } = await supabase.from("circle_members").select("user_id").eq("circle_id", m.circle_id);
      const ids = (allMembers ?? []).map((x: { user_id: string }) => x.user_id).filter((u: string) => u !== session.user.id);
      if (ids.length === 0) return;
      const since =
        localStorage.getItem("infeelit_circle_last_visit") || new Date(Date.now() - 7 * 86400000).toISOString();
      const { count } = await supabase
        .from("memories")
        .select("id", { count: "exact", head: true })
        .in("user_id", ids)
        .gt("created_at", since);
      if (!cancelled) setCircleBadge(count ?? 0);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleTimelineChange = async (timeline: Timeline) => {
    setActiveTimeline(timeline);
  };

  const handleBubbleClick = (question: string) => {
    navigate("/record", { state: { question } });
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setShowPlusSheet(false);
    navigate("/record", { state: { importedFile: file, skipToImport: true } });
  };

  const getBackground = () => {
    if (activeTimeline === "forever")
      return "linear-gradient(180deg, #020818 0%, #041434 40%, #0a1628 70%, #1a1040 100%)";
    if (activeTimeline === "instant") return "linear-gradient(180deg, #1A3B47 0%, #2d6a4f 40%, #E8742A 100%)";
    return "linear-gradient(180deg, #7ec8c8 0%, #a8d8c8 30%, #f0e6d3 70%, #E8742A 100%)";
  };

  return (
    <div
      className="relative w-full h-screen overflow-hidden transition-all duration-700"
      style={{ background: getBackground() }}
    >
      <style>{`
        @keyframes twinkle { 0%, 100% { opacity: 0.3; transform: scale(1); } 50% { opacity: 1; transform: scale(1.5); } }
      `}</style>

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-white/5 blur-3xl" />
        <div
          className="absolute top-1/4 -right-16 w-64 h-64 rounded-full bg-white/5 blur-3xl"
          style={{ animationDelay: "4s" }}
        />
        <div
          className="absolute bottom-1/3 -left-10 w-56 h-56 rounded-full bg-white/5 blur-3xl"
          style={{ animationDelay: "8s" }}
        />
        {activeTimeline === "forever" &&
          [...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                width: Math.random() * 2 + 1 + "px",
                height: Math.random() * 2 + 1 + "px",
                left: Math.random() * 100 + "%",
                top: Math.random() * 70 + "%",
                opacity: Math.random() * 0.7 + 0.3,
                animation: `twinkle ${Math.random() * 3 + 2}s ease-in-out infinite`,
                animationDelay: Math.random() * 3 + "s",
              }}
            />
          ))}
      </div>

      <Header activeTimeline={activeTimeline} onTimelineChange={handleTimelineChange} />
      <SparkBubble forceOpen={sparkForced} onSparkClose={() => setSparkForced(false)} />
      <BubbleCanvas onBubbleClick={handleBubbleClick} activeTimeline={activeTimeline} />

      <CurvedBottomNav onPlusClick={() => setShowPlusSheet(true)} circleBadge={circleBadge} />

      <input
        ref={importInputRef}
        type="file"
        accept="video/*"
        style={{ display: "none" }}
        onChange={handleImportFile}
      />

      {showPlusSheet && (
        <>
          <div
            onClick={() => setShowPlusSheet(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.45)",
              zIndex: 45,
            }}
          />
          <div
            style={{
              position: "fixed",
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 46,
              background: "#FDF8F0",
              borderRadius: "24px 24px 0 0",
              padding: "20px 20px calc(28px + env(safe-area-inset-bottom))",
              boxShadow: "0 -8px 32px rgba(0,0,0,0.15)",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "4px",
                borderRadius: "2px",
                background: "rgba(61,43,31,0.15)",
                margin: "0 auto 20px",
              }}
            />
            <button
              type="button"
              onClick={() => {
                setShowPlusSheet(false);
                setSparkForced(true);
              }}
              style={{
                width: "100%",
                padding: "16px 20px",
                borderRadius: "16px",
                background: "rgba(232,116,42,0.1)",
                border: "1px solid rgba(232,116,42,0.25)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "14px",
                marginBottom: "10px",
                textAlign: "left",
              }}
            >
              <span style={{ fontSize: "24px" }}>🎙️</span>
              <span style={{ fontSize: "15px", fontWeight: 700, color: "#3D2B1F" }}>
                Enregistrer un souvenir
              </span>
            </button>
            <button
              type="button"
              onClick={() => importInputRef.current?.click()}
              style={{
                width: "100%",
                padding: "16px 20px",
                borderRadius: "16px",
                background: "rgba(61,43,31,0.06)",
                border: "1px solid rgba(61,43,31,0.12)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "14px",
                textAlign: "left",
              }}
            >
              <span style={{ fontSize: "24px" }}>📁</span>
              <span style={{ fontSize: "15px", fontWeight: 700, color: "#3D2B1F" }}>
                Importer depuis ma galerie
              </span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Index;
