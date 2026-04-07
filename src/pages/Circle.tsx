import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Copy, Check, Users, Lock, Plus, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Circle = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState("");
  const [copied, setCopied] = useState(false);
  const [membersCount] = useState(Math.floor(Math.random() * 8) + 2);

  useEffect(() => {
    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        navigate("/welcome");
        return;
      }
      setUserId(session.user.id);

      const { data } = await supabase.from("profiles").select("display_name").eq("user_id", session.user.id).single();

      if (data?.display_name) setUserName(data.display_name);
    };
    init();
  }, []);

  const inviteLink = `https://infeelit.com/join/${userId.slice(0, 8)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    toast.success("Link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    const name = userName || "someone special";
    const message = `${name} is preserving family memories on Infeelit 🌊\n\nJoin my family circle to share and hear our stories together.\n\n${inviteLink}`;
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  const DEMO_MEMBERS = [
    { initial: "M", name: userName || "You", color: "#E8742A", role: "Circle Creator", isYou: true },
    { initial: "S", name: "Sarah", color: "#6B4E9B", role: "Member", isYou: false },
    { initial: "A", name: "Ahmed", color: "#1A3B47", role: "Member", isYou: false },
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#0A0A0A" }}>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .float { animation: float 4s ease-in-out infinite; }
        .fade-up { animation: fadeInUp 0.5s ease forwards; }
      `}</style>

      {/* Header */}
      <div
        className="flex items-center gap-4 px-6 pt-14 pb-6"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
      >
        <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-white/10 text-white">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-white font-bold text-xl">Family Circle</h1>
          <p className="text-white/40 text-xs mt-0.5">Your private sanctuary</p>
        </div>
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
          style={{ backgroundColor: "rgba(107,78,155,0.2)", border: "1px solid rgba(107,78,155,0.4)" }}
        >
          <Lock size={12} style={{ color: "#6B4E9B" }} />
          <span className="text-xs font-bold" style={{ color: "#6B4E9B" }}>
            Private
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-32">
        {/* Section membres */}
        <div className="px-6 pt-6 fade-up">
          <div className="flex items-center justify-between mb-4">
            <p className="text-white/50 text-xs uppercase tracking-widest font-bold">Members · {membersCount}</p>
            <button
              onClick={handleWhatsApp}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
              style={{
                background: "linear-gradient(135deg, #E8742A, #D4621A)",
              }}
            >
              <Plus size={12} className="text-white" />
              <span className="text-white text-xs font-bold">Invite</span>
            </button>
          </div>

          {/* Liste membres */}
          <div className="flex flex-col gap-3">
            {DEMO_MEMBERS.map((member, i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-4 rounded-2xl"
                style={{
                  backgroundColor: member.isYou ? "rgba(232,116,42,0.08)" : "rgba(255,255,255,0.04)",
                  border: member.isYou ? "1px solid rgba(232,116,42,0.2)" : "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-lg shrink-0"
                  style={{ backgroundColor: member.color }}
                >
                  {member.initial}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-white font-bold text-sm">{member.name}</p>
                    {member.isYou && (
                      <span
                        className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full"
                        style={{
                          backgroundColor: "rgba(232,116,42,0.2)",
                          color: "#E8742A",
                        }}
                      >
                        You
                      </span>
                    )}
                  </div>
                  <p className="text-white/30 text-xs mt-0.5">{member.role}</p>
                </div>
                <Heart size={16} style={{ color: member.isYou ? "#E8742A" : "rgba(255,255,255,0.2)" }} />
              </div>
            ))}

            {/* Slots vides */}
            {[...Array(Math.max(0, 12 - DEMO_MEMBERS.length))].slice(0, 3).map((_, i) => (
              <button
                key={`empty-${i}`}
                onClick={handleWhatsApp}
                className="flex items-center gap-4 p-4 rounded-2xl transition-all hover:opacity-80"
                style={{
                  backgroundColor: "rgba(255,255,255,0.02)",
                  border: "1px dashed rgba(255,255,255,0.1)",
                }}
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "rgba(255,255,255,0.05)" }}
                >
                  <Plus size={20} className="text-white/20" />
                </div>
                <p className="text-white/25 text-sm italic">Invite a family member...</p>
              </button>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="mx-6 my-6" style={{ height: "1px", backgroundColor: "rgba(255,255,255,0.06)" }} />

        {/* Section invitation */}
        <div className="px-6 fade-up">
          <p className="text-white/50 text-xs uppercase tracking-widest font-bold mb-4">Invite your family</p>

          {/* Message émotionnel */}
          <div
            className="p-5 rounded-2xl mb-5 text-center"
            style={{
              background: "linear-gradient(135deg, rgba(107,78,155,0.15), rgba(2,8,40,0.3))",
              border: "1px solid rgba(107,78,155,0.2)",
            }}
          >
            <div className="float text-3xl mb-3">🌊</div>
            <p className="text-white font-bold text-base leading-snug mb-2">Your circle is waiting.</p>
            <p className="text-white/50 text-sm leading-relaxed">
              Invite up to 12 family members to share memories, hear each other's voices, and preserve your story
              together.
            </p>
          </div>

          {/* Lien d'invitation */}
          <div
            className="flex items-center gap-3 p-4 rounded-2xl mb-4"
            style={{
              backgroundColor: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <div className="flex-1 min-w-0">
              <p className="text-white/40 text-[10px] uppercase tracking-wider mb-1">Your invite link</p>
              <p className="text-white text-sm font-mono truncate">{inviteLink}</p>
            </div>
            <button
              onClick={handleCopyLink}
              className="shrink-0 p-2.5 rounded-xl transition-all"
              style={{
                backgroundColor: copied ? "rgba(16,185,129,0.2)" : "rgba(255,255,255,0.1)",
                border: copied ? "1px solid rgba(16,185,129,0.4)" : "1px solid rgba(255,255,255,0.15)",
              }}
            >
              {copied ? <Check size={18} className="text-emerald-400" /> : <Copy size={18} className="text-white/60" />}
            </button>
          </div>

          {/* Bouton WhatsApp */}
          <button
            onClick={handleWhatsApp}
            className="w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-3 transition-all hover:opacity-90 active:scale-98"
            style={{
              background: "linear-gradient(135deg, #25D366, #128C7E)",
              color: "#FFFFFF",
            }}
          >
            <span className="text-xl">💬</span>
            Share on WhatsApp
          </button>

          <p className="text-white/25 text-xs text-center mt-3">
            Your circle is private. Only invited members can see your memories.
          </p>
        </div>

        {/* Section souvenirs du cercle */}
        <div className="px-6 mt-6 fade-up">
          <p className="text-white/50 text-xs uppercase tracking-widest font-bold mb-4">Circle memories</p>

          <div
            className="p-6 rounded-2xl text-center"
            style={{
              backgroundColor: "rgba(255,255,255,0.03)",
              border: "1px dashed rgba(255,255,255,0.08)",
            }}
          >
            <Users size={32} className="text-white/15 mx-auto mb-3" />
            <p className="text-white/30 text-sm">
              When your family records memories,
              <br />
              they will appear here.
            </p>
            <button
              onClick={() => navigate("/record")}
              className="mt-4 px-6 py-2.5 rounded-full gradient-orange font-bold text-sm"
              style={{ color: "#FFFFFF" }}
            >
              Record the first memory
            </button>
          </div>
        </div>
      </div>

      {/* Bottom CTA fixe */}
      <div
        className="absolute bottom-0 left-0 right-0 px-6 pb-8 pt-4"
        style={{
          background: "linear-gradient(to top, rgba(10,10,10,1), transparent)",
        }}
      >
        <button
          onClick={() => navigate("/record")}
          className="w-full py-4 rounded-2xl gradient-orange font-bold text-base flex items-center justify-center gap-3"
          style={{ color: "#FFFFFF" }}
        >
          🎙️ Record a memory for your circle
        </button>
      </div>
    </div>
  );
};

export default Circle;
