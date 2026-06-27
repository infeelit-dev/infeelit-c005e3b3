import { useNavigate } from "react-router-dom";
import { ArrowLeft, LogOut, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Header from "@/components/Header";
import { useLanguage } from "@/contexts/LanguageContext";
import infeelit from "@/assets/infeelit-logo.png";

const Profile = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Error signing out");
    } else {
      toast.success("Signed out successfully");
      navigate("/welcome");
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#FAF8F6" }}>
      <Header activeTimeline="memories" onTimelineChange={() => {}} />
      {/* Header */}
      <div className="px-6 pt-14 pb-4 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-white border border-gray-100 shadow-sm">
          <ArrowLeft size={20} className="text-[#1A3B47]" />
        </button>
        <img src={infeelit} alt="Infeelit" className="w-[100px] h-auto" style={{ mixBlendMode: "multiply" }} />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-6">
        {/* Avatar */}
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold text-white"
          style={{ backgroundColor: "#6B4E9B" }}
        >
          M
        </div>

        <h1 className="text-2xl font-bold text-[#1A3B47]">{t.yourHaven}</h1>
        <p className="text-[#1A3B47]/60 text-sm">{t.privateVaultSub}</p>

        {/* Security badge */}
        <div
          className="w-full max-w-xs flex items-center gap-4 p-4 rounded-2xl"
          style={{
            backgroundColor: "rgba(255,255,255,0.8)",
            border: "1px solid rgba(0,0,0,0.05)",
          }}
        >
          <div className="p-2 rounded-full" style={{ backgroundColor: "rgba(107,78,155,0.1)" }}>
            <ShieldCheck size={20} style={{ color: "#6B4E9B" }} />
          </div>
          <div className="text-left">
            <p className="text-sm font-bold text-[#1A3B47]">Privacy Guaranteed</p>
            <p className="text-xs text-[#1A3B47]/40">Your memories are encrypted and private.</p>
          </div>
        </div>

        {/* Record button */}
        <button
          onClick={() => navigate("/record")}
          className="w-full max-w-xs py-4 rounded-full gradient-orange font-bold text-lg"
          style={{ color: "#FFFFFF" }}
        >
          Record a memory
        </button>

        {/* Logout button */}
        <button
          onClick={handleLogout}
          className="w-full max-w-xs py-4 rounded-full font-bold flex items-center justify-center gap-2 transition-all"
          style={{
            backgroundColor: "rgba(239,68,68,0.08)",
            color: "#EF4444",
            border: "1px solid rgba(239,68,68,0.2)",
          }}
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>

      {/* Footer */}
      <p className="text-center text-[10px] pb-8" style={{ color: "rgba(26,59,71,0.2)" }}>
        Infeelit — Est. 2016
      </p>
    </div>
  );
};

export default Profile;
