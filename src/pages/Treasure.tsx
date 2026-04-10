import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Mic, Heart, Volume2, Video, Play, ArrowLeft, Bookmark, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Assets fallback
import grandfatherImg from "@/assets/grandfather.jpg";
import marryImg from "@/assets/marry.jpg";
import loveImg from "@/assets/love.jpg";

const Treasure = () => {
  const navigate = useNavigate();
  const [memories, setMemories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState("User");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("display_name")
            .eq("user_id", session.user.id)
            .single();
          if (profile?.display_name) setDisplayName(profile.display_name);

          const { data: mems } = await (supabase as any)
            .from("memories")
            .select("*")
            .eq("user_id", session.user.id)
            .order("created_at", { ascending: false });

          setMemories(mems || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  return (
    <div className="min-h-screen pb-40" style={{ backgroundColor: "#FAF8F6" }}>
      {/* 1. Header Artistique */}
      <header className="relative px-6 pt-16 pb-12 bg-white rounded-b-[50px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border-b border-stone-100">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-3 bg-stone-50 rounded-full text-stone-400 hover:text-[#E8742A] transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-2 px-4 py-1.5 bg-amber-50 rounded-full border border-amber-100">
            <Sparkles size={12} className="text-amber-600" />
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-700">Vault Level 1</span>
          </div>
        </div>

        <h1 className="text-4xl font-serif font-bold text-[#1A3B47] leading-tight">
          {displayName},<br />
          <span className="text-stone-300 font-normal italic text-2xl">your legacy lives here.</span>
        </h1>

        <div className="flex gap-10 mt-8 px-2">
          <div>
            <p className="text-3xl font-bold text-[#E8742A]">{memories.length}</p>
            <p className="text-[10px] uppercase tracking-tighter font-black text-stone-400">Souvenirs</p>
          </div>
          <div className="w-px h-10 bg-stone-100" />
          <div>
            <p className="text-3xl font-bold text-[#1A3B47]">5</p>
            <p className="text-[10px] uppercase tracking-tighter font-black text-stone-400">Circle Members</p>
          </div>
        </div>
      </header>

      {/* 2. Grille Gallery Style */}
      <main className="px-6 mt-10">
        {loading ? (
          <div className="flex flex-col items-center py-20 gap-4 opacity-30">
            <div className="w-10 h-10 border-4 border-stone-200 border-t-[#E8742A] rounded-full animate-spin" />
            <p className="font-serif italic text-stone-500">Opening your chest...</p>
          </div>
        ) : memories.length === 0 ? (
          <div className="text-center py-20 bg-white/50 rounded-[40px] border-2 border-dashed border-stone-200">
            <Heart size={48} className="mx-auto text-stone-200 mb-4" />
            <p className="font-serif italic text-stone-400 text-lg">"Every family has a story..."</p>
            <p className="text-stone-300 text-xs mt-2 px-12 uppercase tracking-widest font-bold">
              Start recording yours today.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-5">
            {memories.map((mem) => (
              <div
                key={mem.id}
                className="group relative bg-white rounded-[30px] overflow-hidden shadow-[0_8px_25px_rgba(0,0,0,0.04)] border border-stone-50 transition-all duration-500 active:scale-95"
                onClick={() => toast.info(`Reliving: ${mem.title}`)}
              >
                {/* Media Preview */}
                <div className="aspect-[3/4] relative bg-stone-100 overflow-hidden">
                  {mem.thumbnail_url ? (
                    <img
                      src={mem.thumbnail_url}
                      className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700"
                      alt=""
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center opacity-10">
                      {mem.file_type === "audio" ? <Volume2 size={40} /> : <Video size={40} />}
                    </div>
                  )}
                  {/* Overlay Gradation */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-40" />

                  {/* Play Tag */}
                  <div className="absolute bottom-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full border border-white/30 flex items-center justify-center">
                    <Play size={14} className="text-white fill-white ml-0.5" />
                  </div>

                  {/* Date Badge */}
                  <div className="absolute top-4 left-4 px-3 py-1 bg-black/20 backdrop-blur-sm rounded-full">
                    <span className="text-[8px] font-black text-white uppercase tracking-widest">
                      {new Date(mem.created_at).toLocaleDateString(undefined, { month: "short", year: "numeric" })}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 bg-white">
                  <h3 className="font-bold text-[12px] text-[#1A3B47] truncate leading-tight mb-1 group-hover:text-[#E8742A] transition-colors">
                    {mem.title || "Untitled Moment"}
                  </h3>
                  <div className="flex items-center gap-1.5 opacity-40">
                    <Bookmark size={8} />
                    <span className="text-[8px] uppercase font-black tracking-widest">Family Heritage</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* 3. CTA Flottant Premium */}
      <div className="fixed bottom-12 left-0 right-0 px-8 z-50">
        <button
          onClick={() => navigate("/record")}
          className="w-full py-5 rounded-[24px] bg-[#1A3B47] text-white font-bold flex items-center justify-center gap-4 shadow-[0_20px_40px_rgba(26,59,71,0.3)] active:scale-95 transition-all group"
        >
          <div className="w-8 h-8 bg-[#E8742A] rounded-full flex items-center justify-center group-hover:rotate-12 transition-transform">
            <Mic size={16} className="text-white" />
          </div>
          <span className="text-sm tracking-wide">Capture a New Memory</span>
        </button>
      </div>

      {/* Texture papier sur toute la page */}
      <div
        className="absolute inset-0 opacity-[0.02] pointer-events-none mix-blend-multiply"
        style={{ backgroundImage: `url("https://www.transparenttextures.com/patterns/natural-paper.png")` }}
      />
    </div>
  );
};

export default Treasure;
