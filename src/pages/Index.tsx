import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import CurvedBottomNav from "@/components/CurvedBottomNav";
import SparkBubble from "@/components/SparkBubble";
import BubbleCanvas from "@/components/BubbleCanvas";
import ActionBar from "@/components/ActionBar";
import SubtitleDisplay from "@/components/SubtitleDisplay";
import useUserName from "@/hooks/useUserName";
import type { Timeline } from "@/types/timeline";
import { useLanguage } from "@/contexts/LanguageContext";

const REPORT_REASONS = {
  fr: ["Contenu violent", "Contenu sexuel", "Spam ou publicité", "Contenu inapproprié", "Autre"],
  en: ["Violent content", "Sexual content", "Spam or advertising", "Inappropriate content", "Other"],
  ar: ["محتوى عنيف", "محتوى جنسي", "بريد عشوائي أو إعلان", "محتوى غير لائق", "أخرى"],
};

const Index = () => {
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const userName = useUserName();
  const [activeTimeline, setActiveTimeline] = useState<Timeline>("memories");
  const [sparkForced, setSparkForced] = useState(false);
  const [circleBadge, setCircleBadge] = useState(0);
  const [feedMemories, setFeedMemories] = useState<any[]>([]);
  const [loadingFeed, setLoadingFeed] = useState(true);
  const currentUserName = localStorage.getItem("infeelit_user_name") || "";
  const [showReportMenu, setShowReportMenu] = useState<string | null>(null);
  const [reportSent, setReportSent] = useState<Record<string, boolean>>({});

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

  useEffect(() => {
    const loadFeed = async () => {
      setLoadingFeed(true);
      const { data: memories } = await supabase
        .from("memories")
        .select(
          `
          *,
          profiles (display_name)
        `,
        )
        .eq("is_community", true)
        .not("moderation_status", "in", '("rejected","reported")')
        .order("created_at", { ascending: false })
        .limit(20);

      setFeedMemories(memories || []);
      setLoadingFeed(false);
    };
    loadFeed();
  }, []);

  const handleTimelineChange = async (timeline: Timeline) => {
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

  const handleReport = async (memoryId: string, reason: string) => {
    try {
      const { error } = await supabase.from("memory_reports").insert({
        memory_id: memoryId,
        reporter_name: userName || "anonymous",
        reason,
      });

      if (error) throw error;

      const { count } = await supabase.from("memory_reports").select("*", { count: "exact" }).eq("memory_id", memoryId);

      if (count && count >= 3) {
        await supabase.from("memories").update({ moderation_status: "reported" }).eq("id", memoryId);
      }

      setReportSent({ ...reportSent, [memoryId]: true });
      setShowReportMenu(null);

      if (count && count >= 3) {
        setFeedMemories(feedMemories.filter((m) => m.id !== memoryId));
      }

      setTimeout(() => {
        setReportSent((prev) => ({ ...prev, [memoryId]: false }));
      }, 3000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div
      className="relative w-full h-screen overflow-hidden transition-all duration-700"
      style={{ background: getBackground() }}
    >
      <style>{`
        @keyframes twinkle { 0%, 100% { opacity: 0.3; transform: scale(1); } 50% { opacity: 1; transform: scale(1.5); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideUp { from { transform: translateY(60px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes wander1 { 0% { transform: translate(0px, 0px); } 20% { transform: translate(50px, -60px); } 40% { transform: translate(90px, -20px); } 60% { transform: translate(60px, 55px); } 80% { transform: translate(-30px, 40px); } 100% { transform: translate(0px, 0px); } }
        @keyframes wander3 { 0% { transform: translate(0px, 0px); } 25% { transform: translate(70px, 55px); } 50% { transform: translate(30px, -70px); } 75% { transform: translate(-55px, -40px); } 100% { transform: translate(0px, 0px); } }
        @keyframes pulseViolet { 0%, 100% { box-shadow: 0 0 15px rgba(107,78,155,0.6), 0 0 30px rgba(107,78,155,0.3); } 50% { box-shadow: 0 0 30px rgba(107,78,155,1), 0 0 60px rgba(107,78,155,0.5); } }
        @keyframes pulseGold { 0%, 100% { box-shadow: 0 0 15px rgba(232,116,42,0.5); } 50% { box-shadow: 0 0 30px rgba(232,116,42,0.9); } }
        .fade-in-up { animation: fadeInUp 0.4s ease forwards; }
        .slide-up { animation: slideUp 0.4s ease forwards; }
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

      <div className="relative z-20 flex-1 overflow-y-auto pb-32 pt-20 px-4 pointer-events-none">
        <div className="pointer-events-auto">
          {loadingFeed ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-2 border-[#E8742A] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : feedMemories.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-white/50 text-sm">Aucun souvenir pour l'instant</p>
              <p className="text-white/30 text-xs mt-2">Sois le premier à en partager un</p>
            </div>
          ) : (
            feedMemories.map((memory) => {
              const displayName =
                memory.profiles?.display_name?.split(" ")[0] || (memory.is_anonymous ? "Un Gardien" : "Quelqu'un");

              const questionObj = memory.question_data || {};
              const questionText =
                lang === "fr" ? questionObj.fr : lang === "ar" ? questionObj.ar : questionObj.en || memory.title;

              const isReported = reportSent[memory.id] || false;

              return (
                <div
                  key={memory.id}
                  style={{
                    borderRadius: "24px",
                    overflow: "hidden",
                    background: "#fff",
                    boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
                    marginBottom: "20px",
                    position: "relative",
                  }}
                >
                  <button
                    onClick={() => setShowReportMenu(showReportMenu === memory.id ? null : memory.id)}
                    style={{
                      position: "absolute",
                      top: "8px",
                      right: "8px",
                      background: "rgba(0,0,0,0.3)",
                      border: "none",
                      borderRadius: "50%",
                      width: "28px",
                      height: "28px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      zIndex: 15,
                      opacity: 0.6,
                      transition: "opacity 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = "1";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = "0.6";
                    }}
                    aria-label="Signaler"
                  >
                    <span style={{ fontSize: "14px" }}>⚑</span>
                  </button>

                  {isReported && (
                    <div
                      style={{
                        position: "absolute",
                        bottom: "60px",
                        left: "16px",
                        right: "16px",
                        padding: "10px 14px",
                        background: "rgba(34,197,94,0.15)",
                        border: "1px solid rgba(34,197,94,0.3)",
                        borderRadius: "12px",
                        zIndex: 20,
                        backdropFilter: "blur(4px)",
                      }}
                    >
                      <p
                        style={{
                          fontSize: "13px",
                          color: "#16a34a",
                          margin: 0,
                          fontWeight: 600,
                        }}
                      >
                        {lang === "fr"
                          ? "✓ Signalement envoyé. Merci."
                          : lang === "ar"
                            ? "✓ تم إرسال البلاغ. شكراً."
                            : "✓ Report sent. Thank you."}
                      </p>
                    </div>
                  )}

                  {showReportMenu === memory.id && (
                    <div
                      style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(0,0,0,0.5)",
                        backdropFilter: "blur(4px)",
                        zIndex: 200,
                        display: "flex",
                        alignItems: "flex-end",
                        justifyContent: "center",
                        padding: "0 0 24px",
                      }}
                      onClick={() => setShowReportMenu(null)}
                    >
                      <div
                        style={{
                          background: "#FDF8F0",
                          borderRadius: "24px 24px 16px 16px",
                          padding: "24px 20px",
                          width: "100%",
                          maxWidth: "420px",
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <p
                          style={{
                            fontSize: "11px",
                            fontWeight: 900,
                            color: "#E8742A",
                            letterSpacing: "0.2em",
                            textTransform: "uppercase",
                            marginBottom: "16px",
                            textAlign: "center",
                          }}
                        >
                          {lang === "fr"
                            ? "Pourquoi signales-tu ce contenu ?"
                            : lang === "ar"
                              ? "لماذا تُبلّغ عن هذا المحتوى؟"
                              : "Why are you reporting this?"}
                        </p>

                        {(REPORT_REASONS[lang as keyof typeof REPORT_REASONS] || REPORT_REASONS.fr).map((reason) => (
                          <button
                            key={reason}
                            onClick={() => handleReport(memory.id, reason)}
                            style={{
                              width: "100%",
                              padding: "14px 16px",
                              background: "none",
                              border: "none",
                              borderBottom: "1px solid rgba(61,43,31,0.08)",
                              cursor: "pointer",
                              textAlign: "left",
                              fontSize: "15px",
                              color: "#3D2B1F",
                              fontWeight: 500,
                            }}
                          >
                            {reason}
                          </button>
                        ))}

                        <button
                          onClick={() => setShowReportMenu(null)}
                          style={{
                            width: "100%",
                            padding: "14px",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: "rgba(61,43,31,0.4)",
                            fontSize: "14px",
                            marginTop: "8px",
                          }}
                        >
                          {lang === "fr" ? "Annuler" : lang === "ar" ? "إلغاء" : "Cancel"}
                        </button>
                      </div>
                    </div>
                  )}

                  {questionText && (
                    <div
                      style={{
                        padding: "12px 16px 0",
                        background: "rgba(253,248,240,0.95)",
                      }}
                    >
                      <p
                        style={{
                          fontSize: "10px",
                          fontWeight: 700,
                          letterSpacing: "0.1em",
                          color: "rgba(232,116,42,0.6)",
                          textTransform: "uppercase",
                          fontFamily: "system-ui, sans-serif",
                          marginBottom: "4px",
                        }}
                      >
                        La question
                      </p>
                      <p
                        style={{
                          fontSize: "13px",
                          fontFamily: "Georgia, serif",
                          fontStyle: "italic",
                          color: "#3D2B1F",
                          lineHeight: 1.4,
                          marginBottom: "8px",
                        }}
                      >
                        {questionText}
                      </p>
                    </div>
                  )}

                  <div style={{ position: "relative", aspectRatio: "16/9", background: "#000" }}>
                    {memory.file_type === "video" && memory.file_url ? (
                      <video
                        src={memory.file_url}
                        controls
                        playsInline
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : memory.file_type === "audio" && memory.file_url ? (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          height: "100%",
                          background: "linear-gradient(135deg, #2D1810, #8B4513)",
                        }}
                      >
                        <audio src={memory.file_url} controls style={{ width: "80%" }} />
                      </div>
                    ) : (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          height: "100%",
                          background: "linear-gradient(135deg, #2D1810, #8B4513)",
                        }}
                      >
                        <span style={{ fontSize: "48px" }}>🎙️</span>
                      </div>
                    )}
                  </div>

                  <div style={{ padding: "12px 16px 0" }}>
                    <p
                      style={{
                        fontSize: "14px",
                        fontWeight: 700,
                        color: "#3D2B1F",
                        fontFamily: "Georgia, serif",
                        lineHeight: 1.4,
                      }}
                    >
                      {memory.title || "Un souvenir"}
                    </p>
                    <p
                      style={{
                        fontSize: "11px",
                        color: "rgba(61,43,31,0.5)",
                        marginTop: "4px",
                      }}
                    >
                      — {displayName}
                    </p>
                  </div>

                  <SubtitleDisplay
                    transcript_fr={memory.transcript_fr}
                    transcript_en={memory.transcript_en}
                    transcript_ar={memory.transcript_ar}
                    translation_status={memory.translation_status}
                    detected_lang={memory.detected_lang}
                    currentLang={lang as "fr" | "en" | "ar"}
                  />

                  <ActionBar
                    memoryId={memory.id}
                    memoryTitle={memory.title || "Souvenir"}
                    authorName={displayName}
                    initialSparks={memory.sparks_count || 0}
                    lang={lang as "fr" | "en" | "ar"}
                    userName={currentUserName}
                    questionFr={questionObj?.fr}
                    questionEn={questionObj?.en}
                    questionAr={questionObj?.ar}
                    questionBubbleFr={questionObj?.bubble_fr}
                    questionBubbleEn={questionObj?.bubble_en}
                    questionBubbleAr={questionObj?.bubble_ar}
                    followupsFr={questionObj?.followups_fr}
                    followupsEn={questionObj?.followups_en}
                    followupsAr={questionObj?.followups_ar}
                  />
                </div>
              );
            })
          )}
        </div>
      </div>

      <CurvedBottomNav onPlusClick={() => setSparkForced(true)} circleBadge={circleBadge} />
    </div>
  );
};

export default Index;
