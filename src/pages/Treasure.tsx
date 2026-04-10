import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Mic, Heart, Volume2, Video, Play, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Placeholders au cas où les images locales posent problème en preview
const GRANDFATHER = "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&auto=format&fit=crop&q=60";

const Treasure = () => {
  const navigate = useNavigate();
  const [memories, setMemories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState("Your");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        // ON NE REDIRIGE PLUS ICI. On laisse la page ouverte quoi qu'il arrive.
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

          if (mems && mems.length > 0) setMemories(mems);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF8F6] pb-32">
      {/* HEADER FIXE */}
      <div className="px-6 pt-16 pb-8 bg-white border-b border-stone-100">
        <button onClick={() => navigate(-1)} className="mb-4 p-2 bg-stone-100 rounded-full">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-3xl font-serif font-bold text-[#1A3B47]">
          {displayName}, <span className="text-stone-400 font-normal italic">memories.</span>
        </h1>
      </div>

      {/* GRILLE (OU DEMO SI VIDE) */}
      <div className="px-6 mt-8">
        {loading ? (
          <div className="flex justify-center py-20 animate-pulse text-stone-400">Opening Vault...</div>
        ) : memories.length === 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {/* Carte de Démo forcée pour voir si ça marche */}
            <div className="bg-white rounded-2xl p-2 border border-stone-200">
              <div className="aspect-square bg-stone-100 rounded-xl flex items-center justify-center mb-2">
                <Play size={20} className="text-orange-500" />
              </div>
              <p className="text-[10px] font-bold">Example Memory</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {memories.map((m) => (
              <div key={m.id} className="bg-white rounded-2xl overflow-hidden border border-stone-100">
                <div className="aspect-square bg-stone-200" />
                <p className="p-2 text-[11px] font-bold truncate">{m.title}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="fixed bottom-10 left-6 right-6">
        <button
          onClick={() => navigate("/record")}
          className="w-full py-4 bg-[#E8742A] text-white rounded-2xl font-bold"
        >
          Record a new memory
        </button>
      </div>
    </div>
  );
};

export default Treasure;
