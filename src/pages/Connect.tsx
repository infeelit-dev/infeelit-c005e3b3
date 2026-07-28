import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, UserPlus, Search, Heart, Play } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  phone: string | null;
}

const Connect = () => {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [following, setFollowing] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        navigate("/welcome");
        return;
      }
      setCurrentUser(session.user.id);
      await loadProfiles();
      await loadFollowing(session.user.id);
      setLoading(false);
    };
    init();
  }, [navigate]);

  const loadProfiles = async () => {
    const { data } = await supabase.from("profiles").select("id, user_id, display_name, phone").limit(50);

    if (data) setProfiles(data);
  };

  const loadFollowing = async (userId: string) => {
    const { data } = await (supabase as any).from("follows").select("following_id").eq("follower_id", userId);

    if (data) {
      const ids = (data as any[]).map((f: any) => f.following_id);
      setFollowing(ids);
    }
  };

  const handleFollow = async (profileUserId: string) => {
    if (!currentUser) return;

    const isFollowing = following.includes(profileUserId);

    if (isFollowing) {
      const { error } = await (supabase as any)
        .from("follows")
        .delete()
        .eq("follower_id", currentUser)
        .eq("following_id", profileUserId);

      if (error) {
        console.error("Unfollow error:", error);
        toast.error("Failed to unfollow.");
        return;
      }

      setFollowing((prev) => prev.filter((id) => id !== profileUserId));
      toast.success("Unfollowed");
    } else {
      const { error } = await (supabase as any).from("follows").insert({
        follower_id: currentUser,
        following_id: profileUserId,
      });

      if (error) {
        console.error("Follow error:", error);
        toast.error("Failed to follow.");
        return;
      }

      setFollowing((prev) => [...prev, profileUserId]);
      toast.success("Following — you'll see their memories.");
    }
  };

  const handleInvite = () => {
    const text = "Come preserve your memories with me on Infeelit 🌊 https://infeelit.com";
    if (navigator.share) {
      navigator.share({ text });
    } else {
      navigator.clipboard.writeText(text);
      toast.success("Link copied!");
    }
  };

  const filtered = profiles.filter(
    (p) => p.user_id !== currentUser && (p.display_name?.toLowerCase().includes(search.toLowerCase()) || !search),
  );

  const getInitial = (profile: Profile) => {
    if (profile.display_name) return profile.display_name[0].toUpperCase();
    return "?";
  };

  const getColor = (index: number) => {
    const colors = ["#E8742A", "#6B4E9B", "#1A3B47", "#38bdf8", "#10b981"];
    return colors[index % colors.length];
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#0A0A0A" }}>
      {/* Header */}
      <div className="flex items-center gap-4 px-6 pt-14 pb-4">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-white/10 text-white">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-white font-bold text-lg flex-1">Connect</h1>
        <span className="text-white/30 text-xs">{profiles.length} members</span>
      </div>

      {/* Search */}
      <div className="px-6 pb-4">
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-2xl"
          style={{
            backgroundColor: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <Search size={16} className="text-white/30" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search members..."
            className="flex-1 bg-transparent text-white text-sm outline-none placeholder-white/30"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-6 pb-40 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-[#E8742A] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-white/30 text-sm">No members found yet.</p>
            <p className="text-white/20 text-xs mt-2">Be the first to invite your friends.</p>
          </div>
        ) : (
          filtered.map((profile, index) => {
            const isFollowing = following.includes(profile.user_id);
            return (
              <div
                key={profile.id}
                className="flex items-center gap-4 p-4 rounded-2xl"
                style={{
                  backgroundColor: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                {/* Avatar */}
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-lg shrink-0"
                  style={{ backgroundColor: getColor(index) }}
                >
                  {getInitial(profile)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-sm truncate">{profile.display_name || "Infeelit Member"}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1 text-white/30 text-xs">
                      <Heart size={10} />
                      Memories
                    </span>
                    <span className="flex items-center gap-1 text-white/30 text-xs">
                      <Play size={10} />
                      Stories
                    </span>
                  </div>
                </div>

                {/* Follow / Unfollow */}
                <button
                  onClick={() => handleFollow(profile.user_id)}
                  className="shrink-0 px-4 py-2 rounded-full font-bold text-xs transition-all"
                  style={{
                    backgroundColor: isFollowing ? "rgba(255,255,255,0.1)" : "#E8742A",
                    color: "#FFFFFF",
                    border: isFollowing ? "1px solid rgba(255,255,255,0.2)" : "none",
                  }}
                >
                  {isFollowing ? "Following" : "Follow"}
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Invite banner */}
      <div
        className="absolute bottom-20 left-4 right-4 px-5 py-4 rounded-2xl flex items-center justify-between gap-4"
        style={{
          backgroundColor: "rgba(232,116,42,0.1)",
          border: "1px solid rgba(232,116,42,0.3)",
        }}
      >
        <div>
          <p className="text-white font-bold text-sm">Invite your friends</p>
          <p className="text-white/50 text-xs mt-0.5">Share your memories with people you love.</p>
        </div>
        <button onClick={handleInvite} className="shrink-0 p-3 rounded-full gradient-orange">
          <UserPlus size={18} className="text-white" />
        </button>
      </div>
    </div>
  );
};

export default Connect;
