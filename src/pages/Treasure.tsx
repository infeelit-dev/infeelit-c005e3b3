import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Mic, Heart, Volume2, Video, Play, Lock, Globe, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Assets (Placeholder fallback au cas où les chemins posent problème)
import grandfatherImg from "@/assets/grandfather.jpg";
import marryImg from "@/assets/marry.jpg";
import loveImg from "@/assets/love.jpg";
import relaxImg from "@/assets/relax.jpg";
import travelImg from "@/assets/travel.jpg";

interface Memory {
  id: string;
  title: string | null;
  file_url: string;
  file_type: string | null;
  thumbnail_url: string | null;
  created_at: string;
  is_public: boolean | null;
  timeline: string | null;
}

type ActiveTab = "all" | "voices" | "video" | "forever";

const DEMO_MEMORIES: Memory[] = [
  {
    id: "d1",
    title: "The smell of home",
    file_url: "",
    file_type: "video",
    thumbnail_url: grandfatherImg,
    created_at: new Date().toISOString(),
    is_public: false,
    timeline: "past",
  },
  {
    id: "d2",
    title: "What courage taught me",
    file_url: "",
    file_type: "audio",
    thumbnail_url: null,
    created_at: new Date().toISOString(),
    is_public: true,
    timeline: "past",
  },
];

const Treasure = () => {
  const navigate = useNavigate();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true); // État crucial
  const [displayName, setDisplayName] = useState("Your");
  const [activeTab, setActiveTab] = useState<ActiveTab>("all");
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        // Si erreur ou pas de session, on attend un peu avant de rediriger pour éviter le flash
        if (!session || sessionError) {
          console.log("No session found, redirecting...");
          navigate("/");
          return;
        }

        // Fetch Profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("display_name")
          .eq("user_id", session.user.id)
          .single();
        if (profile?.display_name) setDisplayName(profile.display_name);

        // Fetch Memories
        const { data: mems, error: memsError } = await (supabase as any)
          .from("memories")
          .select("*")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false });

        if (mems && mems.length > 0) {
          setMemories(mems);
          setIsDemo(false);
        } else {
          setMemories(DEMO_MEMORIES);
          setIsDemo(true);
        }
      } catch (err) {
        console.error("Initialization error:", err);
      } finally {
        setLoading(false); // On arrête le chargement quoi qu'il arrive
      }
    };

    fetchUserData();
  }, [navigate]);

  // Si on charge encore, on affiche un écran blanc ou un loader complet pour éviter le bug
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF8F6]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E8742A]"></div>
      </div>
    );
  }

  const filtered = memories.filter((m) => {
    if (activeTab === "all") return true;
    if (activeTab === "voices") return m.file_type === "audio";
    if (activeTab === "video") return m.file_type === "video";
    if (activeTab === "forever") return m.timeline === "forever";
    return true;
  });

  return (
    <div className="min-h-screen pb-40" style={{ backgroundColor: "#FAF8F6" }}>
      {/* Header Immersif */}
      <div
        className="relative px-6 pt-16 pb-10 rounded-b-[40px] shadow-lg overflow-hidden"
        style={{ background: "linear-gradient(160deg, #1A3B47 0%, #2C6E49 100%)" }}
      >
        <button onClick={() => navigate(-1)} className="absolute top-14 left-6 p-2 bg-white/10 rounded-full text-white">
          <ArrowLeft size={20} />
        </button>

        <div className="mt-8">
          <h1 className="text-3xl font-serif font-bold text-white leading-tight">
            {displayName},<br />
            <span className="text-white/60 font-normal italic text-xl">your memories live here.</span>
          </h1>
        </div>

        {/* Stats Minimalistes */}
        <div className="flex gap-4 mt-8">
          <div className="flex-1 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center">
            <p className="text-2xl font-bold text-orange-400">{memories.length}</p>
            <p className="text-[10px] uppercase tracking-widest text-white/50 font-black">Memories</p>
          </div>
          <div className="flex-1 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center">
            <p className="text-2xl font-bold text-blue-300">
              {memories.filter((m) => m.timeline === "forever").length}
            </p>
            <p className="text-[10px] uppercase tracking-widest text-white/50 font-black">Forever</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 px-6 mt-8 overflow-x-auto no-scrollbar">
        {["all", "voices", "video", "forever"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as ActiveTab)}
            className={`px-5 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === tab
                ? "bg-[#1A3B47] text-white shadow-md"
                : "bg-white text-stone-400 border border-stone-100"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Grille de Souvenirs */}
      <div className="px-6 mt-6 grid grid-cols-2 gap-4">
        {filtered.map((mem) => (
          <div
            key={mem.id}
            className="bg-white rounded-2xl overflow-hidden shadow-sm border border-stone-100 active:scale-95 transition-transform"
            onClick={() => (!isDemo ? toast.info(`Playing: ${mem.title}`) : toast.error("Record a real memory first"))}
          >
            <div className="aspect-square relative bg-stone-100 flex items-center justify-center">
              {mem.thumbnail_url ? (
                <img src={mem.thumbnail_url} className="w-full h-full object-cover" />
              ) : (
                <div className="opacity-20">
                  {mem.file_type === "audio" ? <Volume2 size={40} /> : <Video size={40} />}
                </div>
              )}
              <div className="absolute bottom-2 right-2 bg-black/30 backdrop-blur-md p-1.5 rounded-full">
                <Play size={10} className="text-white fill-white" />
              </div>
            </div>
            <div className="p-3">
              <h3 className="font-bold text-[11px] text-[#1A3B47] truncate">{mem.title || "A memory"}</h3>
              <p className="text-[9px] text-stone-400 mt-1">{new Date(mem.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Floating CTA */}
      <div className="fixed bottom-10 left-0 right-0 px-8 z-50">
        <button
          onClick={() => navigate("/record")}
          className="w-full py-4 rounded-2xl bg-[#E8742A] text-white font-bold flex items-center justify-center gap-3 shadow-[0_15px_35px_rgba(232,116,42,0.4)]"
        >
          <Mic size={20} /> Record New
        </button>
      </div>
    </div>
  );
};

export default Treasure;
