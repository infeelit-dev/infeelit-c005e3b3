import BottomNav from "@/components/BottomNav";
import { Heart, Share2, MessageCircle, User } from "lucide-react"; // J'ai ajouté User ici

const Feed = () => {
  return (
    <div className="min-h-screen bg-[#FDFCFB] pb-28">
      {/* Header discret avec le logo et l'icône profil */}
      <div className="px-6 pt-14 pb-6 flex justify-between items-center">
        <h1 className="text-2xl font-black text-[#1A4D4D] tracking-tighter italic">Infeelit.</h1>
        <div className="w-10 h-10 rounded-full bg-[#F5F0FF] border border-[#6B4E9B]/10 flex items-center justify-center">
          <User size={18} className="text-[#6B4E9B]" />
        </div>
      </div>

      <div className="px-6 space-y-8">
        {/* Carte de question - Style Réseau Social */}
        <div className="relative group">
          <div className="w-full h-[500px] bg-[#1A4D4D]/5 rounded-[40px] overflow-hidden shadow-lg border border-white relative">
            {/* Overlay dégradé pour la lisibilité du texte */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/70 z-10" />

            {/* Contenu textuel */}
            <div className="absolute bottom-10 left-8 right-12 z-20 text-white">
              <p className="text-[10px] font-black uppercase tracking-[0.25em] mb-3 text-[#F97316]">
                Silent Generation
              </p>
              <h2 className="text-2xl font-bold leading-tight tracking-tight">
                What is the most beautiful thing your mother ever told you?
              </h2>
            </div>
          </div>

          {/* Barre d'actions verticale (Like, Message, Share) */}
          <div className="absolute right-4 bottom-28 flex flex-col gap-4 z-30">
            <button className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white shadow-lg border border-white/20 hover:bg-[#F97316] transition-colors">
              <Heart size={22} />
            </button>
            <button className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white shadow-lg border border-white/20">
              <MessageCircle size={22} />
            </button>
            <button className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white shadow-lg border border-white/20">
              <Share2 size={22} />
            </button>
          </div>
        </div>
      </div>

      {/* Le menu de navigation du bas */}
      <BottomNav />
    </div>
  );
};

export default Feed;
