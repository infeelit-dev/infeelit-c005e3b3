import BottomNav from "@/components/BottomNav";
import { Heart, Share2, MessageCircle } from "lucide-react";

const Feed = () => {
  return (
    <div className="min-h-screen bg-[#FDFCFB] pb-28">
      {/* Header discret */}
      <div className="px-6 pt-14 pb-6 flex justify-between items-center">
        <h1 className="text-2xl font-black text-[#1A4D4D] tracking-tighter italic">Infeelit.</h1>
        <div className="w-10 h-10 rounded-full bg-[#F5F0FF] border border-[#6B4E9B]/10 flex items-center justify-center">
          <User size={18} className="text-[#6B4E9B]" />
        </div>
      </div>

      <div className="px-6 space-y-8">
        {/* Exemple de carte de question (Design Social) */}
        <div className="relative group">
          <div className="w-full h-[400px] bg-gray-100 rounded-[40px] overflow-hidden shadow-lg border border-white">
            {/* Ici on mettra tes photos dynamiquement plus tard */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />

            <div className="absolute bottom-8 left-8 right-8 text-white">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 opacity-80">Silent Generation</p>
              <h2 className="text-xl font-bold leading-tight">
                What is the most beautiful thing your mother ever told you?
              </h2>
            </div>
          </div>

          {/* Boutons d'interaction (Like, Share) à droite comme sur tes screens */}
          <div className="absolute right-4 bottom-24 flex flex-col gap-5">
            <button className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white shadow-lg border border-white/20">
              <Heart size={20} />
            </button>
            <button className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white shadow-lg border border-white/20">
              <MessageCircle size={20} />
            </button>
            <button className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white shadow-lg border border-white/20">
              <Share2 size={20} />
            </button>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Feed;
