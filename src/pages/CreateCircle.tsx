import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUserName } from "@/hooks/useUserName";
import { generateCircleCode } from "@/lib/circleCode";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";

const CreateCircle = () => {
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const userName = useUserName();
  const [step, setStep] = useState<"name" | "share">("name");
  const [familyName, setFamilyName] = useState("");
  const [loading, setLoading] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [copied, setCopied] = useState(false);

  const handleCreate = async () => {
    if (!familyName.trim()) return;
    setLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) {
        toast.error("You must be logged in.");
        return;
      }

      const code = generateCircleCode(lang);

      const { data: circle, error: circleError } = await supabase
        .from("circles")
        .insert({ name: familyName.trim(), created_by: session.user.id, invite_code: code })
        .select()
        .single();

      if (circleError || !circle) throw circleError;

      await supabase.from("circle_members").insert({ circle_id: circle.id, user_id: session.user.id, role: "admin" });

      setInviteCode(code);
      setStep("share");
    } catch (err: any) {
      toast.error(err.message || "Error creating circle");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText("infeelit.com/join/" + inviteCode);
    setCopied(true);
    toast.success(lang === "fr" ? "Lien copié !" : lang === "ar" ? "تم نسخ الرابط!" : "Link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    const msg =
      lang === "fr"
        ? (userName || "Quelqu'un") +
          " t'invite dans l'espace " +
          familyName +
          " sur Infeelit. Rejoins-nous avec le code " +
          inviteCode +
          " : infeelit.com/join/" +
          inviteCode
        : lang === "ar"
          ? (userName || "شخص ما") +
            " يدعوك إلى مساحة " +
            familyName +
            " على Infeelit. انضم إلينا بالرمز " +
            inviteCode +
            " : infeelit.com/join/" +
            inviteCode
          : (userName || "Someone") +
            " invites you to join the " +
            familyName +
            " space on Infeelit. Join us with code " +
            inviteCode +
            " : infeelit.com/join/" +
            inviteCode;
    window.open("https://wa.me/?text=" + encodeURIComponent(msg));
  };

  const texts = {
    title:
      lang === "ar"
        ? "ما اسم عائلتك ؟"
        : lang === "fr"
          ? "Comment s'appelle votre famille ?"
          : "What is your family's name?",
    placeholder: lang === "ar" ? "عائلة الأحمد" : lang === "fr" ? "Famille Aït-Gacem" : "The Johnson Family",
    button: lang === "ar" ? "أنشئ مساحتنا ✦" : lang === "fr" ? "Créer notre espace ✦" : "Create our space ✦",
    shareTitle:
      lang === "ar"
        ? "مساحتك العائلية جاهزة ✦"
        : lang === "fr"
          ? "Ton espace familial est créé ✦"
          : "Your family space is created ✦",
    shareSub:
      lang === "ar"
        ? "شارك هذا الرمز مع عائلتك"
        : lang === "fr"
          ? "Partage ce code avec ta famille"
          : "Share this code with your family",
    whatsapp: lang === "ar" ? "إرسال عبر واتساب" : lang === "fr" ? "Envoyer sur WhatsApp" : "Send on WhatsApp",
    copy: lang === "ar" ? "نسخ الرابط" : lang === "fr" ? "Copier le lien" : "Copy link",
    later:
      lang === "ar" ? "البدء دون انتظار ←" : lang === "fr" ? "Commencer sans attendre →" : "Start without waiting →",
  };

  if (step === "share") {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-6 text-center gap-6"
        style={{ backgroundColor: "#FFF9F2" }}
      >
        {" "}
        <p className="text-6xl">✦</p>{" "}
        <h1 className="text-xl font-bold" style={{ color: "#3D2B1F", fontFamily: "Georgia, serif" }}>
          {texts.shareTitle}
        </h1>{" "}
        <p className="text-sm" style={{ color: "rgba(61,43,31,0.5)" }}>
          {texts.shareSub}
        </p>{" "}
        <div
          className="px-6 py-4 rounded-2xl border border-[#D4A853]/30 bg-white"
          style={{ letterSpacing: "0.3em", fontSize: "28px", fontWeight: 700, color: "#E8742A" }}
        >
          {" "}
          {inviteCode}{" "}
        </div>{" "}
        <p className="text-xs" style={{ color: "rgba(61,43,31,0.3)" }}>
          infeelit.com/join/{inviteCode}
        </p>
        <button
          onClick={handleWhatsApp}
          className="w-full max-w-xs py-4 rounded-full font-bold text-base flex items-center justify-center gap-2"
          style={{ backgroundColor: "#25D366", color: "#fff" }}
        >
          💬 {texts.whatsapp}
        </button>
        <button
          onClick={handleCopy}
          className="w-full max-w-xs py-3 rounded-full font-bold text-sm flex items-center justify-center gap-2"
          style={{ backgroundColor: "rgba(61,43,31,0.05)", color: "#3D2B1F", border: "1px solid rgba(61,43,31,0.1)" }}
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
          {texts.copy}
        </button>
        <button
          onClick={() => navigate("/")}
          className="text-sm underline underline-offset-2"
          style={{ color: "rgba(61,43,31,0.4)", background: "none", border: "none", cursor: "pointer" }}
        >
          {texts.later}
        </button>
      </div>
    );
  }
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 text-center gap-6"
      style={{ backgroundColor: "#FFF9F2" }}
    >
      {" "}
      <h1 className="text-xl font-bold" style={{ color: "#3D2B1F", fontFamily: "Georgia, serif" }}>
        {texts.title}
      </h1>{" "}
      <div className="w-full max-w-xs rounded-full px-6 py-4 bg-white border border-[#D4A853]/30">
        {" "}
        <input
          type="text"
          value={familyName}
          onChange={(e) => setFamilyName(e.target.value)}
          placeholder={texts.placeholder}
          className="w-full bg-transparent outline-none text-[#3D2B1F] text-center font-serif text-lg"
          autoFocus
        />{" "}
      </div>{" "}
      <button
        onClick={handleCreate}
        disabled={!familyName.trim() || loading}
        className="w-full max-w-xs py-4 rounded-full font-bold text-base transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
        style={{
          background: "linear-gradient(135deg, #E8742A, #D4621A)",
          color: "#fff",
          boxShadow: "0 4px 20px rgba(232,116,42,0.3)",
        }}
      >
        {" "}
        {loading ? "..." : texts.button}{" "}
      </button>{" "}
    </div>
  );
};
export default CreateCircle;
