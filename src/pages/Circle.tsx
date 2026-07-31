import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Copy, Check, Mic, Play, Volume2, Video } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { resolveMemoryFields } from "@/lib/memoryUrl";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import Header from "@/components/Header";
import CurvedBottomNav from "@/components/CurvedBottomNav";
import useUserName from "@/hooks/useUserName";

import grandfatherImg from "@/assets/grandfather.jpg";
import marryImg from "@/assets/marry.jpg";
import loveImg from "@/assets/love.jpg";
import relaxImg from "@/assets/relax.jpg";
import birthImg from "@/assets/birth.jpg";
import picnicImg from "@/assets/picnic.jpg";
import travelImg from "@/assets/travel.jpg";
import childImg from "@/assets/child.jpg";
import houseImg from "@/assets/house.jpg";
import graduateImg from "@/assets/graduate.jpg";

interface CircleInfo {
  id: string;
  name: string;
}

interface CircleMember {
  user_id: string;
  display_name: string | null;
}

interface CircleMemory {
  id: string;
  title: string | null;
  file_url: string | null;
  file_type: string | null;
  thumbnail_url: string | null;
  created_at: string;
  user_id: string;
}

type FilterType = "all" | "voices" | "moments" | "chronicles";
type SphereMode = "question" | "memory";

const MEMBER_LAYOUTS = [
  { leftPct: 4.9, topPct: 4.7, sizePct: 21.6, float: "mf-a", delay: "0s" },
  { leftPct: 68.1, topPct: 2.4, sizePct: 20.3, float: "mf-b", delay: "1.3s" },
  { leftPct: 82.4, topPct: 27.1, sizePct: 18.9, float: "mf-c", delay: "0.6s" },
  { leftPct: 1.1, topPct: 28.2, sizePct: 17.8, float: "mf-a", delay: "2.1s" },
  { leftPct: 78.4, topPct: 51, sizePct: 16.8, float: "mf-b", delay: "0.9s" },
  { leftPct: 1.6, topPct: 52.2, sizePct: 16.2, float: "mf-c", delay: "1.8s" },
  { leftPct: 41.1, topPct: 0.8, sizePct: 16.8, float: "mf-a", delay: "3s" },
  { leftPct: 79.5, topPct: 70.2, sizePct: 15.7, float: "mf-b", delay: "2.4s" },
  { leftPct: 2.2, topPct: 71, sizePct: 15.1, float: "mf-c", delay: "1.1s" },
  { leftPct: 53, topPct: 72.2, sizePct: 16.2, float: "mf-a", delay: "0.4s" },
];

const MEMBER_COLORS = ["#E8742A", "#D4AF37", "#2D6A4F", "#C45C26", "#E8A87C", "#8B5CF6"];

const BG_BUBBLES = [
  { photo: grandfatherImg, size: 64, x: 2, y: 6, anim: "bg-s", delay: "0s", op: 0.13 },
  { photo: loveImg, size: 48, x: 78, y: 8, anim: "bg-m", delay: "1.5s", op: 0.11 },
  { photo: travelImg, size: 38, x: 88, y: 52, anim: "bg-s", delay: "3s", op: 0.1 },
  { photo: graduateImg, size: 52, x: 58, y: 82, anim: "bg-m", delay: "2s", op: 0.12 },
  { photo: picnicImg, size: 30, x: 82, y: 26, anim: "bg-s", delay: "4s", op: 0.09 },
  { photo: relaxImg, size: 42, x: 4, y: 70, anim: "bg-m", delay: "0.8s", op: 0.1 },
  { photo: houseImg, size: 34, x: 44, y: 90, anim: "bg-s", delay: "1.3s", op: 0.08 },
  { photo: marryImg, size: 44, x: 66, y: 42, anim: "bg-m", delay: "2.6s", op: 0.09 },
  { photo: childImg, size: 28, x: 18, y: 88, anim: "bg-s", delay: "3.5s", op: 0.07 },
];

const timeAgo = (iso: string, lang: string) => {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 60) return `${Math.max(1, mins)}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return lang === "fr" ? `${days}j` : `${days}d`;
};

const Circle = () => {
  const navigate = useNavigate();
  const { t, lang, rtl } = useLanguage();
  const userName = useUserName();
  const sphereTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [loading, setLoading] = useState(true);
  const [circleError, setCircleError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [sphereMode, setSphereMode] = useState<SphereMode>("question");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [circle, setCircle] = useState<CircleInfo | null>(null);
  const [circleCode, setCircleCode] = useState("");
  const [members, setMembers] = useState<CircleMember[]>([]);
  const [memories, setMemories] = useState<CircleMemory[]>([]);
  const [showGroupImport, setShowGroupImport] = useState(false);
  const [groupNames, setGroupNames] = useState("");
  const [generatedMessage, setGeneratedMessage] = useState("");

  const inviteLink = circleCode ? `https://infeelit.com/join/${circleCode}` : "";

  const loadCircleData = useCallback(async () => {
    setLoading(true);
    setCircleError(null);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) {
        setCircle(null);
        setMembers([]);
        setMemories([]);
        setCircleCode("");
        return;
      }

      const { data: memberships, error: membershipError } = await supabase
        .from("circle_members")
        .select("circle_id, role, circles(id, name, created_by)")
        .eq("user_id", session.user.id)
        .limit(1);

      if (membershipError) {
        console.error("Circle memberships error:", membershipError);
        setCircleError(
          lang === "fr"
            ? "Erreur de chargement"
            : lang === "ar"
              ? "خطأ في التحميل"
              : "Failed to load circle",
        );
        return;
      }

      const membership = memberships?.[0] as
        | {
            circle_id: string;
            role: string;
            circles: CircleInfo | CircleInfo[] | null;
          }
        | undefined;

      const circleRow = Array.isArray(membership?.circles)
        ? membership?.circles[0]
        : membership?.circles;

      if (!membership?.circle_id || !circleRow) {
        setCircle(null);
        setMembers([]);
        setMemories([]);
        setCircleCode("");
        return;
      }

      setCircle({ id: circleRow.id, name: circleRow.name });

      const { data: code } = await supabase.rpc("get_circle_invite_code", {
        _circle_id: circleRow.id,
      });
      setCircleCode(typeof code === "string" ? code : "");

      const { data: memberProfiles } = await supabase.rpc("get_circle_member_profiles", {
        _circle_id: circleRow.id,
      });
      const loadedMembers = (memberProfiles as CircleMember[]) || [];
      setMembers(loadedMembers);

      const memberIds = loadedMembers.map((m) => m.user_id);
      if (memberIds.length === 0) {
        setMemories([]);
        return;
      }

      const { data: mems } = await supabase
        .from("memories")
        .select("id, title, file_url, file_type, thumbnail_url, created_at, user_id")
        .in("user_id", memberIds)
        .order("created_at", { ascending: false })
        .limit(20);

      const resolved = await resolveMemoryFields((mems as CircleMemory[]) || []);
      const validMemories = resolved.filter(
        (m) => m.file_url !== null && m.file_url !== "",
      );
      setMemories(validMemories);
    } catch (err) {
      console.error("loadCircleData failed:", err);
      setCircleError(
        lang === "fr"
          ? "Erreur de chargement"
          : lang === "ar"
            ? "خطأ في التحميل"
            : "Failed to load circle",
      );
    } finally {
      setLoading(false);
    }
  }, [lang]);

  useEffect(() => {
    loadCircleData();
  }, [loadCircleData]);

  useEffect(() => {
    sphereTimerRef.current = setInterval(() => {
      setSphereMode((p) => (p === "question" ? "memory" : "question"));
    }, 6000);
    return () => {
      if (sphereTimerRef.current) clearInterval(sphereTimerRef.current);
    };
  }, []);

  const handleCopyLink = () => {
    if (!inviteLink) {
      toast.error(
        lang === "fr"
          ? "Lien d'invitation indisponible."
          : lang === "ar"
            ? "رابط الدعوة غير متاح."
            : "Invite link unavailable.",
      );
      return;
    }
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    toast.success(lang === "fr" ? "Lien copié !" : lang === "ar" ? "تم نسخ الرابط!" : "Link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    if (!inviteLink) {
      toast.error(
        lang === "fr"
          ? "Lien d'invitation indisponible."
          : lang === "ar"
            ? "رابط الدعوة غير متاح."
            : "Invite link unavailable.",
      );
      return;
    }
    const msg =
      lang === "fr"
        ? `Rejoins notre cercle familial sur Infeelit 🕯️\n${inviteLink}`
        : lang === "ar"
          ? `انضم إلى دائرتنا العائلية على Infeelit 🕯️\n${inviteLink}`
          : `Join our Family Circle on Infeelit 🕯️\n${inviteLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const generateGroupMessage = () => {
    const names = groupNames
      .split(/[,;\n]+/)
      .map((n) => n.trim())
      .filter((n) => n.length > 0);

    if (names.length === 0 || !circleCode) return;

    const inviteUrl = `infeelit.com/join/${circleCode}`;
    const displayed = names.slice(0, 3);
    const remaining = names.length - 3;

    let namesPart = "";
    if (names.length === 1) namesPart = displayed[0];
    else if (names.length === 2) namesPart = `${displayed[0]} et ${displayed[1]}`;
    else if (names.length === 3) namesPart = `${displayed[0]}, ${displayed[1]} et ${displayed[2]}`;
    else
      namesPart = `${displayed[0]}, ${displayed[1]}, ${displayed[2]} et ${remaining} autre${remaining > 1 ? "s" : ""}`;

    const msg =
      lang === "fr"
        ? `${namesPart} — votre espace famille vous attend sur Infeelit.\n\n${userName || "Quelqu'un que tu aimes"} a créé un sanctuaire pour préserver vos souvenirs ensemble.\n\nRejoignez-nous maintenant 👇\n${inviteUrl}`
        : lang === "ar"
          ? `${namesPart} — مساحة عائلتكم تنتظركم على Infeelit.\n\n${userName || "شخص تحبه"} أنشأ مكاناً للحفاظ على ذكرياتكم معاً.\n\nانضموا إلينا الآن 👇\n${inviteUrl}`
          : `${namesPart} — your family space is waiting for you on Infeelit.\n\n${userName || "Someone you love"} created a sanctuary to preserve your memories together.\n\nJoin us now 👇\n${inviteUrl}`;

    setGeneratedMessage(msg);
  };

  const memberNameById = (userId: string) => {
    const m = members.find((x) => x.user_id === userId);
    return m?.display_name?.split(" ")[0] || (lang === "fr" ? "Membre" : lang === "ar" ? "عضو" : "Member");
  };

  const FILTERS: { id: FilterType; label: string }[] = [
    { id: "all", label: t.tabAll },
    { id: "voices", label: t.tabVoices },
    { id: "moments", label: t.tabVideo },
    { id: "chronicles", label: "📖 Chronicles" },
  ];

  const filteredMemories = memories.filter((m) => {
    if (activeFilter === "voices") return m.file_type === "audio";
    if (activeFilter === "moments") return m.file_type === "video";
    if (activeFilter === "chronicles") return false;
    return true;
  });

  const latestMem = memories[0] ?? null;

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "radial-gradient(ellipse at 50% 36%, #1a0a05 0%, #0f0501 55%, #0a0301 100%)" }}
      >
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            border: "3px solid rgba(232,116,42,0.2)",
            borderTopColor: "#E8742A",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!circle) {
    return (
      <div
        className="min-h-screen flex flex-col relative"
        dir={rtl ? "rtl" : "ltr"}
        style={{
          background: "radial-gradient(ellipse at 50% 36%, #1a0a05 0%, #0f0501 55%, #0a0301 100%)",
          fontFamily: lang === "ar" ? "'Noto Sans Arabic', Arial, sans-serif" : "inherit",
          paddingBottom: "100px",
        }}
      >
        <Header activeTimeline="memories" onTimelineChange={() => {}} />
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-5">
          <p style={{ fontSize: "48px" }}>✦</p>
          <h1
            style={{
              fontSize: "22px",
              fontFamily: "Georgia, serif",
              fontStyle: "italic",
              color: "#ffffff",
              lineHeight: 1.4,
            }}
          >
            {lang === "fr"
              ? "Crée ton cercle familial"
              : lang === "ar"
                ? "أنشئ دائرتك العائلية"
                : "Create your family circle"}
          </h1>
          <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.55)", maxWidth: "280px", lineHeight: 1.6 }}>
            {lang === "fr"
              ? "Un espace privé pour préserver les voix de ceux que tu aimes."
              : lang === "ar"
                ? "مساحة خاصة لحفظ أصوات من تحب."
                : "A private space to preserve the voices of those you love."}
          </p>
          <button
            onClick={() => navigate("/create-circle")}
            style={{
              width: "100%",
              maxWidth: "320px",
              padding: "16px",
              borderRadius: "18px",
              background: "linear-gradient(135deg, #E8742A, #D4621A)",
              color: "#fff",
              fontWeight: 700,
              fontSize: "16px",
              border: "none",
              cursor: "pointer",
              boxShadow: "0 4px 20px rgba(232,116,42,0.4)",
            }}
          >
            {lang === "fr"
              ? "Créer mon cercle familial ✦"
              : lang === "ar"
                ? "إنشاء دائرتي العائلية ✦"
                : "Create your family circle ✦"}
          </button>
          <button
            onClick={() => {
              const code = prompt(
                lang === "fr"
                  ? "Colle le code d'invitation"
                  : lang === "ar"
                    ? "الصق رمز الدعوة"
                    : "Paste invite code",
              );
              if (code?.trim()) navigate(`/join/${code.trim()}`);
            }}
            style={{
              background: "none",
              border: "none",
              color: "rgba(255,255,255,0.5)",
              fontSize: "14px",
              cursor: "pointer",
              padding: "8px",
            }}
          >
            {lang === "fr"
              ? "J'ai un code d'invitation"
              : lang === "ar"
                ? "لدي رمز دعوة"
                : "I have an invite code"}
          </button>
        </div>
        <CurvedBottomNav onPlusClick={() => navigate("/record")} />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-x-hidden"
      dir={rtl ? "rtl" : "ltr"}
      style={{
        background: "radial-gradient(ellipse at 50% 36%, #1a0a05 0%, #0f0501 55%, #0a0301 100%)",
        backgroundColor: "#0f0501",
        fontFamily: lang === "ar" ? "'Noto Sans Arabic', Arial, sans-serif" : "inherit",
        paddingBottom: "100px",
      }}
    >
      <Header activeTimeline="memories" onTimelineChange={() => {}} />
      <style>{`
        @keyframes bgS { 0%{transform:translate(0,0);} 20%{transform:translate(35px,-45px);} 40%{transform:translate(58px,10px);} 60%{transform:translate(40px,55px);} 80%{transform:translate(-12px,35px);} 100%{transform:translate(0,0);} }
        @keyframes bgM { 0%{transform:translate(0,0);} 20%{transform:translate(-42px,-32px);} 40%{transform:translate(-60px,20px);} 60%{transform:translate(-38px,60px);} 80%{transform:translate(10px,42px);} 100%{transform:translate(0,0);} }
        @keyframes mfA { 0%,100%{transform:translate(0,0);} 20%{transform:translate(12px,-18px);} 40%{transform:translate(22px,-4px);} 60%{transform:translate(14px,16px);} 80%{transform:translate(-5px,10px);} }
        @keyframes mfB { 0%,100%{transform:translate(0,0);} 20%{transform:translate(-16px,-13px);} 40%{transform:translate(-22px,10px);} 60%{transform:translate(-12px,20px);} 80%{transform:translate(6px,14px);} }
        @keyframes mfC { 0%,100%{transform:translate(0,0);} 20%{transform:translate(18px,13px);} 40%{transform:translate(8px,-20px);} 60%{transform:translate(-14px,-10px);} 80%{transform:translate(-8px,8px);} }
        @keyframes spherePulse { 0%,100%{box-shadow:0 0 36px rgba(255,185,60,.55),0 0 70px rgba(232,116,42,.28);} 50%{box-shadow:0 0 65px rgba(255,210,80,.85),0 0 115px rgba(232,116,42,.48);} }
        .bg-s{animation:bgS 20s ease-in-out infinite;}
        .bg-m{animation:bgM 15s ease-in-out infinite;}
        .mf-a{animation:mfA 8s ease-in-out infinite;}
        .mf-b{animation:mfB 10s ease-in-out infinite;}
        .mf-c{animation:mfC 12s ease-in-out infinite;}
        .sphere-glow{animation:spherePulse 3s ease-in-out infinite;}
        .hide-scroll{scrollbar-width:none;}
        .hide-scroll::-webkit-scrollbar{display:none;}
      `}</style>

      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {BG_BUBBLES.map((b, i) => (
          <div
            key={i}
            className={`absolute ${b.anim}`}
            style={{ left: `${b.x}%`, top: `${b.y}%`, animationDelay: b.delay }}
          >
            <div
              style={{
                width: `${b.size}px`,
                height: `${b.size}px`,
                borderRadius: "50%",
                overflow: "hidden",
                border: "1px solid rgba(212,175,55,.18)",
                opacity: b.op,
              }}
            >
              <img
                src={b.photo}
                alt=""
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: "center top",
                  filter: "sepia(.9) brightness(.76) contrast(.88)",
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="relative z-10 flex items-center justify-between px-5 pt-14 pb-2">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full"
          style={{ backgroundColor: "rgba(255,255,255,0.1)", color: "#ffffff" }}
        >
          ←
        </button>
        <div className="text-center">
          <h1 className="font-bold text-lg font-serif" style={{ color: "#ffffff" }}>
            {circle.name}
          </h1>
          <p className="text-[10px] uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.45)" }}>
            {t.ourCircle} · {members.length}{" "}
            {lang === "fr" ? "membres" : lang === "ar" ? "أعضاء" : "members"}
          </p>
        </div>
        <div
          className="px-3 py-1 rounded-full text-[10px] font-bold"
          style={{
            backgroundColor: "rgba(107,78,155,.13)",
            border: "1px solid rgba(107,78,155,.36)",
            color: "#6B4E9B",
          }}
        >
          {t.privateLabel}
        </div>
      </div>

      <div className="relative mx-auto z-10 w-full max-w-[90vw] aspect-[3.7/5.1] max-h-[55vh]">
        {[108, 132, 156].map((r, i) => (
          <div
            key={i}
            className="absolute rounded-full pointer-events-none"
            style={{
              width: `${((r * 2) / 370) * 100}%`,
              height: `${((r * 2) / 510) * 100}%`,
              left: `${((185 - r) / 370) * 100}%`,
              top: `${((198 - r) / 510) * 100}%`,
              border: `1px solid rgba(212,175,55,${0.08 + i * 0.04})`,
            }}
          />
        ))}

        <div
          className="absolute sphere-glow"
          style={{
            width: `${(132 / 370) * 100}%`,
            height: `${(132 / 510) * 100}%`,
            left: `${(119 / 370) * 100}%`,
            top: `${(132 / 510) * 100}%`,
            borderRadius: "50%",
            background:
              "radial-gradient(circle at 38% 35%, rgba(255,228,115,.98), rgba(232,116,42,.9), rgba(175,90,10,.72))",
            border: "2.5px solid rgba(255,200,70,.88)",
            cursor: "pointer",
            zIndex: 6,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "14px",
            overflow: "hidden",
          }}
          onClick={() => (latestMem ? navigate(`/memory/${latestMem.id}`) : navigate("/record"))}
        >
          {sphereMode === "question" || !latestMem ? (
            <>
              <p
                style={{
                  fontSize: "6px",
                  fontWeight: 900,
                  letterSpacing: ".12em",
                  color: "rgba(255,255,255,.7)",
                  textTransform: "uppercase",
                  marginBottom: "4px",
                  textAlign: "center",
                }}
              >
                {t.thisWeek}
              </p>
              <p style={{ fontSize: "9px", fontWeight: 700, color: "#fff", lineHeight: 1.38, textAlign: "center" }}>
                {lang === "ar"
                  ? "ما الصوت الذي تريد حفظه اليوم؟"
                  : lang === "fr"
                    ? "Quelle voix veux-tu préserver aujourd'hui ?"
                    : "Which voice will you preserve today?"}
              </p>
            </>
          ) : (
            <>
              <Play size={20} style={{ color: "#fff", marginBottom: "4px" }} />
              <p style={{ fontSize: "9px", fontWeight: 700, color: "#fff", lineHeight: 1.3, textAlign: "center" }}>
                {latestMem.title || memberNameById(latestMem.user_id)}
              </p>
              <p style={{ fontSize: "7px", color: "rgba(255,255,255,.6)", marginTop: "3px", textAlign: "center" }}>
                {t.latestMemory}
              </p>
            </>
          )}
          <div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{ background: "linear-gradient(135deg,rgba(232,116,42,.2) 0%,transparent 55%)" }}
          />
        </div>

        {members.slice(0, MEMBER_LAYOUTS.length).map((m, i) => {
          const layout = MEMBER_LAYOUTS[i];
          const name = m.display_name?.split(" ")[0] || "?";
          const initial = name.charAt(0).toUpperCase();
          const color = MEMBER_COLORS[i % MEMBER_COLORS.length];
          const count = memories.filter((mem) => mem.user_id === m.user_id).length;
          return (
            <div
              key={m.user_id}
              className={`absolute ${layout.float}`}
              style={{
                left: `${layout.leftPct}%`,
                top: `${layout.topPct}%`,
                width: `${layout.sizePct}%`,
                maxWidth: "80px",
                zIndex: 5,
                animationDelay: layout.delay,
              }}
            >
              <div
                style={{
                  width: "100%",
                  aspectRatio: "1",
                  borderRadius: "50%",
                  overflow: "hidden",
                  position: "relative",
                  border: "2.5px solid rgba(212,175,55,.5)",
                  boxShadow: "0 4px 14px rgba(0,0,0,.16)",
                  background: color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span style={{ color: "#fff", fontWeight: 800, fontSize: "18px" }}>{initial}</span>
              </div>
              <p
                style={{
                  fontSize: "8.5px",
                  fontWeight: 700,
                  color: "#ffffff",
                  textAlign: "center",
                  marginTop: "3px",
                  textShadow: "0 1px 4px rgba(0,0,0,.75)",
                }}
              >
                {name}
              </p>
              <p style={{ fontSize: "7px", color: "rgba(255,255,255,0.5)", textAlign: "center", lineHeight: 1.1 }}>
                {count}{" "}
                {lang === "fr" ? "souvenirs" : lang === "ar" ? "ذكريات" : "memories"}
              </p>
            </div>
          );
        })}
      </div>

      <div className="px-5 mb-5 relative z-10">
        <div className="flex items-center justify-between mb-3">
          <p
            style={{
              fontSize: "10px",
              fontWeight: 900,
              letterSpacing: ".16em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.4)",
            }}
          >
            {t.thisWeek}
          </p>
        </div>
        {filteredMemories.length === 0 ? (
          <div
            style={{
              padding: "24px 16px",
              borderRadius: "16px",
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(180,140,80,.38)",
              textAlign: "center",
            }}
          >
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.55)", marginBottom: "12px" }}>
              {lang === "fr"
                ? "Aucun souvenir partagé pour l'instant."
                : lang === "ar"
                  ? "لا توجد ذكريات مشتركة بعد."
                  : "No shared memories yet."}
            </p>
            <button
              onClick={() => navigate("/record")}
              style={{
                padding: "10px 18px",
                borderRadius: "999px",
                background: "linear-gradient(135deg,#E8742A,#D4621A)",
                color: "#fff",
                fontWeight: 700,
                fontSize: "13px",
                border: "none",
                cursor: "pointer",
              }}
            >
              {lang === "fr" ? "Enregistrer le premier ✦" : lang === "ar" ? "سجّل الأول ✦" : "Record the first ✦"}
            </button>
          </div>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-2 hide-scroll">
            {filteredMemories.map((card) => (
              <div
                key={card.id}
                className="shrink-0 rounded-2xl overflow-hidden cursor-pointer relative"
                style={{
                  width: "148px",
                  height: "116px",
                  backgroundColor: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(180,140,80,.38)",
                  backdropFilter: "blur(6px)",
                }}
                onClick={() => navigate(`/memory/${card.id}`)}
              >
                {card.thumbnail_url ? (
                  <img
                    src={card.thumbnail_url}
                    alt=""
                    style={{ width: "100%", height: "70px", objectFit: "cover", objectPosition: "center top" }}
                  />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: "70px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "rgba(232,116,42,0.15)",
                      fontSize: "22px",
                    }}
                  >
                    🎙️
                  </div>
                )}
                <div
                  className="absolute top-1.5 right-1.5 rounded-full px-1.5 py-0.5 flex items-center gap-1"
                  style={{ backgroundColor: "rgba(0,0,0,.5)" }}
                >
                  {card.file_type === "audio" ? <Volume2 size={8} color="#fff" /> : <Video size={8} color="#fff" />}
                </div>
                <div style={{ padding: "5px 8px" }}>
                  <div className="flex items-center gap-1.5">
                    <p style={{ fontSize: "8px", fontWeight: 700, color: "#ffffff" }}>
                      {memberNameById(card.user_id)}
                    </p>
                    <span style={{ fontSize: "7px", color: "rgba(255,255,255,0.45)", marginLeft: "auto" }}>
                      {timeAgo(card.created_at, lang)}
                    </span>
                  </div>
                  <p
                    style={{
                      fontSize: "9px",
                      fontWeight: 600,
                      color: "#ffffff",
                      marginTop: "2px",
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {card.title ||
                      (lang === "fr" ? "Un souvenir" : lang === "ar" ? "ذكرى" : "A memory")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="px-5 mb-5 relative z-10">
        <div className="flex gap-2 overflow-x-auto pb-1 hide-scroll">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className="shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all"
              style={
                activeFilter === f.id
                  ? { backgroundColor: "#E8742A", color: "#fff", boxShadow: "0 3px 12px rgba(232,116,42,.45)" }
                  : {
                      backgroundColor: "rgba(255,255,255,0.1)",
                      color: "#ffffff",
                      border: "1px solid rgba(180,140,80,.36)",
                    }
              }
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 pb-36 relative z-10 space-y-3">
        <div
          className="flex items-center gap-3 p-4 rounded-2xl"
          style={{ backgroundColor: "rgba(255,255,255,0.08)", border: "1px solid rgba(180,140,80,.36)" }}
        >
          <div className="flex-1 min-w-0">
            <p
              style={{
                fontSize: "8px",
                textTransform: "uppercase",
                letterSpacing: ".1em",
                color: "rgba(255,255,255,0.4)",
                marginBottom: "2px",
              }}
            >
              {t.inviteLink}
            </p>
            <p className="font-mono text-sm truncate" style={{ color: "#ffffff" }}>
              {circleCode ? `infeelit.com/join/${circleCode}` : "…"}
            </p>
          </div>
          <button
            onClick={handleCopyLink}
            className="shrink-0 p-2.5 rounded-xl"
            style={
              copied
                ? { backgroundColor: "rgba(16,185,129,.2)", border: "1px solid rgba(16,185,129,.4)" }
                : { backgroundColor: "rgba(255,255,255,0.1)", border: "1px solid rgba(180,140,80,.36)" }
            }
          >
            {copied ? (
              <Check size={16} className="text-emerald-500" />
            ) : (
              <Copy size={16} style={{ color: "#ffffff" }} />
            )}
          </button>
        </div>

        <button
          onClick={handleWhatsApp}
          className="w-full py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2"
          style={{ background: "linear-gradient(135deg,#25D366,#128C7E)", color: "#fff" }}
        >
          <span>💬</span> {t.inviteWhatsApp}
        </button>

        <button
          onClick={() => setShowGroupImport(true)}
          style={{
            width: "100%",
            padding: "14px 20px",
            borderRadius: "16px",
            background: "rgba(37,211,102,0.12)",
            border: "1px solid rgba(37,211,102,0.3)",
            color: "#25D366",
            fontWeight: 700,
            fontSize: "14px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            marginTop: "8px",
          }}
        >
          <span style={{ fontSize: "18px" }}>👥</span>
          {lang === "fr"
            ? "Importer mon groupe WhatsApp"
            : lang === "ar"
              ? "استيراد مجموعة واتساب"
              : "Import my WhatsApp group"}
        </button>

        <p className="text-center text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
          {t.circlePrivate}
        </p>
      </div>

      <div
        className="fixed left-0 right-0 px-5 pb-4 pt-4 z-20"
        style={{
          bottom: "88px",
          background: "linear-gradient(to top, rgba(15,5,1,1) 60%, transparent)",
        }}
      >
        <button
          onClick={() => navigate("/record")}
          className="w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-3"
          style={{
            background: "linear-gradient(135deg,#E8742A,#D4621A)",
            color: "#fff",
            boxShadow: "0 0 28px rgba(232,116,42,.45)",
            minHeight: "48px",
          }}
        >
          <Mic size={20} /> {t.addVoice}
        </button>
      </div>

      {showGroupImport && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            background: "rgba(0,0,0,0.7)",
            backdropFilter: "blur(8px)",
          }}
          onClick={() => {
            setShowGroupImport(false);
            setGeneratedMessage("");
            setGroupNames("");
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "480px",
              backgroundColor: "#0E1A20",
              borderRadius: "24px 24px 0 0",
              padding: "24px 20px 40px",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                width: "40px",
                height: "4px",
                backgroundColor: "rgba(255,255,255,0.2)",
                borderRadius: "999px",
                margin: "0 auto 20px",
              }}
            />

            <p
              style={{
                fontSize: "10px",
                fontWeight: 900,
                letterSpacing: "0.3em",
                color: "#25D366",
                textTransform: "uppercase",
                textAlign: "center",
                marginBottom: "6px",
              }}
            >
              {lang === "fr" ? "Groupe WhatsApp" : lang === "ar" ? "مجموعة واتساب" : "WhatsApp Group"}
            </p>

            <h2
              style={{
                fontSize: "18px",
                fontWeight: 700,
                color: "#fff",
                textAlign: "center",
                fontFamily: "Georgia, serif",
                marginBottom: "20px",
                lineHeight: 1.4,
              }}
            >
              {lang === "fr"
                ? "Entre les prénoms de ta famille"
                : lang === "ar"
                  ? "أدخل أسماء أفراد عائلتك"
                  : "Enter your family members' names"}
            </h2>

            {!generatedMessage ? (
              <>
                <textarea
                  value={groupNames}
                  onChange={(e) => setGroupNames(e.target.value)}
                  placeholder={
                    lang === "fr"
                      ? "Ahmed, Fatima, Karim, Mama, Papa..."
                      : lang === "ar"
                        ? "أحمد، فاطمة، كريم..."
                        : "Ahmed, Fatima, Karim, Mom, Dad..."
                  }
                  rows={3}
                  style={{
                    width: "100%",
                    padding: "14px 16px",
                    borderRadius: "14px",
                    border: "1px solid rgba(255,255,255,0.1)",
                    backgroundColor: "rgba(255,255,255,0.05)",
                    color: "#fff",
                    fontSize: "14px",
                    outline: "none",
                    resize: "none",
                    boxSizing: "border-box",
                    fontFamily: "inherit",
                    marginBottom: "16px",
                  }}
                />
                <button
                  onClick={generateGroupMessage}
                  disabled={groupNames.trim().length < 2 || !circleCode}
                  style={{
                    width: "100%",
                    padding: "16px",
                    borderRadius: "14px",
                    background: "linear-gradient(135deg, #25D366, #128C7E)",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: "15px",
                    border: "none",
                    cursor: groupNames.trim().length < 2 || !circleCode ? "not-allowed" : "pointer",
                    opacity: groupNames.trim().length < 2 || !circleCode ? 0.4 : 1,
                  }}
                >
                  {lang === "fr" ? "Générer le message ✦" : lang === "ar" ? "إنشاء الرسالة ✦" : "Generate message ✦"}
                </button>
              </>
            ) : (
              <>
                <div
                  style={{
                    padding: "16px",
                    borderRadius: "14px",
                    backgroundColor: "rgba(37,211,102,0.08)",
                    border: "1px solid rgba(37,211,102,0.2)",
                    marginBottom: "16px",
                  }}
                >
                  <p
                    style={{
                      fontSize: "13px",
                      color: "rgba(255,255,255,0.85)",
                      lineHeight: 1.6,
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {generatedMessage}
                  </p>
                </div>
                <button
                  onClick={() => {
                    window.open(`https://wa.me/?text=${encodeURIComponent(generatedMessage)}`, "_blank");
                  }}
                  style={{
                    width: "100%",
                    padding: "16px",
                    borderRadius: "14px",
                    background: "linear-gradient(135deg, #25D366, #128C7E)",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: "15px",
                    border: "none",
                    cursor: "pointer",
                    marginBottom: "10px",
                  }}
                >
                  {lang === "fr" ? "Envoyer sur WhatsApp" : lang === "ar" ? "إرسال عبر واتساب" : "Send on WhatsApp"}
                </button>
                <button
                  onClick={() => {
                    setGeneratedMessage("");
                    setGroupNames("");
                  }}
                  style={{
                    width: "100%",
                    padding: "12px",
                    background: "none",
                    border: "none",
                    color: "rgba(255,255,255,0.3)",
                    fontSize: "12px",
                    cursor: "pointer",
                  }}
                >
                  {lang === "fr" ? "← Modifier les prénoms" : lang === "ar" ? "← تعديل الأسماء" : "← Edit names"}
                </button>
              </>
            )}
          </div>
        </div>
      )}
      <CurvedBottomNav onPlusClick={() => navigate("/record")} />
    </div>
  );
};

export default Circle;
