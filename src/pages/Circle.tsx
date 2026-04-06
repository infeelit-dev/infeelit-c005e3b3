import { useNavigate } from "react-router-dom";
import { ArrowLeft, Copy } from "lucide-react";
import infeelit from "@/assets/infeelit-logo.png";
import { toast } from "sonner";

const Circle = () => {
  const navigate = useNavigate();
  const inviteLink = "https://infeelit.app/join/abc123";

  const copyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    toast.success("Link copied. Share it on WhatsApp!");
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#FAF8F6" }}>
      <div className="px-6 pt-14 pb-4 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-white border border-gray-100 shadow-sm">
          <ArrowLeft size={20} className="text-[#1A3B47]" />
        </button>
        <img src={infeelit} alt="Infeelit" className="w-[100px] h-auto" style={{ mixBlendMode: "multiply" }} />
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-6">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center text-3xl"
          style={{ backgroundColor: "#6B4E9B20" }}
        >
          🔒
        </div>
        <h1 className="text-2xl font-bold text-[#1A3B47]">My Family Circle</h1>
        <p className="text-[#1A3B47]/60 text-sm max-w-xs">
          Invite your family to share and listen to memories together. Only people you invite can see your circle.
        </p>
        <div className="w-full max-w-xs bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center justify-between gap-3">
          <span className="text-xs text-[#1A3B47]/60 truncate">{inviteLink}</span>
          <button onClick={copyLink} className="p-2 rounded-full bg-[#6B4E9B]/10 shrink-0">
            <Copy size={16} className="text-[#6B4E9B]" />
          </button>
        </div>
        <button
          onClick={() => {
            const text = encodeURIComponent(
              `Join my family circle on Infeelit — where we preserve our voices and memories together. ${inviteLink}`,
            );
            window.open(`https://wa.me/?text=${text}`, "_blank");
          }}
          className="w-full max-w-xs py-4 rounded-full font-bold text-lg"
          style={{ backgroundColor: "#25D366", color: "#FFFFFF" }}
        >
          📲 Invite via WhatsApp
        </button>
        <button
          onClick={() => navigate("/record")}
          className="w-full max-w-xs py-4 rounded-full gradient-orange font-bold text-lg"
          style={{ color: "#FFFFFF" }}
        >
          Record for my circle
        </button>
      </div>
    </div>
  );
};

export default Circle;
