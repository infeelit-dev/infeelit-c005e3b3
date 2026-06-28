import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import CurvedBottomNav from "@/components/CurvedBottomNav";
import SparkBubble from "@/components/SparkBubble";
import BubbleCanvas from "@/components/BubbleCanvas";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Timeline } from "@/types/timeline";

const Index = () => {
  const navigate = useNavigate();
  const [activeTimeline, setActiveTimeline] = useState<Timeline>("memories");
  const [sparkForced, setSparkForced] = useState(false);
  const [circleBadge, setCircleBadge] = useState(0);

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
      const ids = (allMembers ?? []).map((x: any) => x.user_id).filter((u: string) => u !== session.user.id);
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

  const handleTimelineChange = (timeline: Timeline) => {
    setActiveTimeline(timeline);
  };

  const handleBubbleClick = (question: string) => {
    navigate("/record", { state: { question } });
  };

  const getBackground = () => {
    if (activeTimeline === "forever")
      return "linear-gradient(180deg, #020818 0%, #041434 40%, #0a1628 70%, #1a1040 100%)";
    if (activeTimeline === "instant") return "linear-gradient(180deg, #1A3B47 0%, #2d6a4f 40%, #E8742A 100%)";
    return "linear-gradient(180deg, #7ec8c8 0%, #a8d8c8 30%, #f0e6d3 70%, #E8742A 100%)";
  };

  const { rtl } = useLanguage();

  return (
    <div
      className="relative w-full h-screen overflow-hidden transition-all duration-700"
      style={{ background: getBackground() }}
      dir={rtl ? "rtl" : "ltr"}
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

      <div
        className="absolute inset-x-0 z-[1]"
        style={{ top: "130px", bottom: "90px" }}
      >
        <BubbleCanvas onBubbleClick={handleBubbleClick} activeTimeline={activeTimeline} />
      </div>

      <CurvedBottomNav onPlusClick={() => setSparkForced(true)} circleBadge={circleBadge} />
    </div>
  );
};

export default Index;
