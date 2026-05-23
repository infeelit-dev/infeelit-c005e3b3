import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";

const JoinCircle = () => {
  const navigate = useNavigate();
  const { code } = useParams();
  const { lang } = useLanguage();
  const [circle, setCircle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const loadCircle = async () => {
      if (!code) return;
      const { data, error } = await supabase.rpc("lookup_circle_by_invite_code", { _code: code }).single();
      if (error || !data) { setNotFound(true); }
      else { setCircle(data); }
      setLoading(false);
    };
    loadCircle();
  }, [code]);

  const handleJoin = async () => {
    setJoining(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      localStorage.setItem("pending_circle_code", code || "");
      navigate("/welcome");
      return;
    }
    const { error } = await supabase.from("circle_members").insert({ circle_id: circle.id, user_id: session.user.id, role: "member" });
    if (error) { toast.error(error.message); setJoining(false); return; }
    toast.success(lang === "fr" ? "Bienvenue dans la famille !" : lang === "ar" ? "مرحباً بك في العائلة!" : "Welcome to the family!");
    navigate("/circle");
  };

  const texts = {
    title: lang === "ar" ? "انضم إلى المساحة العائلية" : lang === "fr" ? "Rejoindre l'espace familial" : "Join the family space",
    invite: lang === "ar" ? "يدعوك إلى " + (circle?.name || "") : lang === "fr" ? "t'invite dans " + (circle?.name || "") : "invites you to join " + (circle?.name || ""),
    members: lang === "ar" ? (circle?.member_count || 0) + " أعضاء في الانتظار" : lang === "fr" ? (circle?.member_count || 0) + " membres t'attendent" : (circle?.member_count || 0) + " members waiting",
    join: lang === "ar" ? "انضم إلى العائلة ✦" : lang === "fr" ? "Rejoindre la famille ✦" : "Join the family ✦",
    notFound: lang === "ar" ? "هذا الرابط لم يعد نشطاً. اطلب رابطاً جديداً من عائلتك." : lang === "fr" ? "Ce lien n'est plus actif. Demande un nouveau lien à ta famille." : "This link is no longer active. Ask your family for a new link.",
    create: lang === "ar" ? "إنشاء مساحتي الخاصة" : lang === "fr" ? "Créer mon propre espace" : "Create my own space",
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#FFF9F2" }}><div className="w-8 h-8 border-2 border-[#E8742A]/20 border-t-[#E8742A] rounded-full animate-spin" /></div>;
  }

  if (notFound || !circle) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center gap-6" style={{ backgroundColor: "#FFF9F2" }}>
        <p className="text-4xl">🔗</p>
        <p className="text-sm" style={{ color: "rgba(61,43,31,0.5)", maxWidth: "280px" }}>{texts.notFound}</p>
        <button onClick={() => navigate("/create-circle")} className="px-6 py-3 rounded-full font-bold text-sm" style={{ background: "linear-gradient(135deg, #E8742A, #D4621A)", color: "#fff" }}>{texts.create}</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center gap-5" style={{ backgroundColor: "#FFF9F2" }}>
      <p className="text-5xl">✦</p>
      <h1 className="text-xl font-bold" style={{ color: "#3D2B1F", fontFamily: "Georgia, serif" }}>{texts.title}</h1>
      <p className="text-sm" style={{ color: "rgba(61,43,31,0.6)", maxWidth: "280px" }}>{texts.invite}</p>
      <p className="text-xs" style={{ color: "rgba(61,43,31,0.3)" }}>{texts.members}</p>
      <button onClick={handleJoin} disabled={joining} className="w-full max-w-xs py-4 rounded-full font-bold text-base transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50" style={{ background: "linear-gradient(135deg, #E8742A, #D4621A)", color: "#fff", boxShadow: "0 4px 20px rgba(232,116,42,0.3)" }}>
        {joining ? "..." : texts.join}
      </button>
    </div>
  );
};

export default JoinCircle;
