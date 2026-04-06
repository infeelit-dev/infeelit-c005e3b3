import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import infeelit from "@/assets/infeelit-logo.png";

const Profile = () => {
  const navigate = useNavigate();

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
          className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold text-white"
          style={{ backgroundColor: "#6B4E9B" }}
        >
          M
        </div>
        <h1 className="text-2xl font-bold text-[#1A3B47]">My Memories</h1>
        <p className="text-[#1A3B47]/60 text-sm">Your recorded memories will appear here.</p>
        <button
          onClick={() => navigate("/record")}
          className="w-full max-w-xs py-4 rounded-full gradient-orange font-bold text-lg"
          style={{ color: "#FFFFFF" }}
        >
          Record a memory
        </button>
      </div>
    </div>
  );
};

export default Profile;
