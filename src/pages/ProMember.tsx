import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import ProBottomNav from "@/components/ProBottomNav";

const BG = "#0D1B2A";
const CREAM = "rgba(253,248,240,0.92)";
const TRAMES = [
  { key: "fondation", label: "Fondation", color: "#C4922A" },
  { key: "actualites", label: "Actualités", color: "#2A6496" },
  { key: "vision", label: "Vision", color: "#6D59A8" },
] as const;

type Member = {
  name: string;
  photo: string | null;
  tagline: string | null;
  userId: string | null;
  importedId: string | null;
};

const ProMember = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState<Member | null>(null);
  const [badges, setBadges] = useState<string[]>([]);
  const [count, setCount] = useState(0);
  const [following, setFollowing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [sessionUser, setSessionUser] = useState<string | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!cancelled) setSessionUser(session?.user?.id || null);

      const { data: imported } = await (supabase.from("pro_imported_profiles") as any)
        .select("id, display_name, avatar_url, role, company, fondation, actualites, vision")
        .eq("id", id)
        .maybeSingle();

      let next: Member | null = null;
      let trames: string[] = [];
      let souvenirs = 0;

      if (imported) {
        next = {
          name: imported.display_name || "Voix",
          photo: imported.avatar_url || null,
          tagline: [imported.role, imported.company].filter(Boolean).join(" · ") || imported.fondation || null,
          userId: null,
          importedId: imported.id,
        };
        const { data: drafts } = await (supabase.from("pro_voice_drafts") as any)
          .select("trame")
          .eq("profile_id", imported.id);
        trames = Array.from(new Set((drafts || []).map((d: { trame: string }) => d.trame).filter(Boolean)));
        souvenirs = (drafts || []).length;
      } else {
        const { data: pro } = await (supabase.from("pro_profiles") as any)
          .select("user_id, display_name, avatar_url, dream, role, company")
          .eq("user_id", id)
          .maybeSingle();
        if (!pro) {
          if (!cancelled) setMissing(true);
          return;
        }
        next = {
          name: pro.display_name || "Voix",
          photo: pro.avatar_url || null,
          tagline: pro.dream || [pro.role, pro.company].filter(Boolean).join(" · ") || null,
          userId: pro.user_id,
          importedId: null,
        };
        const { data: mems } = await (supabase.from("memories") as any)
          .select("id, pro_type, timeline")
          .eq("user_id", pro.user_id)
          .or("timeline.eq.pro,is_pro.eq.true");
        souvenirs = (mems || []).length;
        const map: Record<string, string> = {
          fondation: "fondation",
          foundation: "fondation",
          memories: "fondation",
          actualites: "actualites",
          now: "actualites",
          instant: "actualites",
          vision: "vision",
          forever: "vision",
        };
        trames = Array.from(
          new Set(
            (mems || [])
              .map((m: { pro_type?: string; timeline?: string }) => map[String(m.pro_type || m.timeline || "").toLowerCase()])
              .filter(Boolean),
          ),
        );
      }

      if (next?.userId && session?.user?.id && next.userId !== session.user.id) {
        const { data: row } = await supabase
          .from("follows")
          .select("id")
          .eq("follower_id", session.user.id)
          .eq("following_id", next.userId)
          .maybeSingle();
        if (!cancelled) setFollowing(!!row);
      }

      if (!cancelled) {
        setMember(next);
        setBadges(trames);
        setCount(souvenirs);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const toggleFollow = async () => {
    if (!member?.userId || !sessionUser || busy || member.userId === sessionUser) return;
    setBusy(true);
    try {
      if (following) {
        const { error } = await supabase
          .from("follows")
          .delete()
          .eq("follower_id", sessionUser)
          .eq("following_id", member.userId);
        if (error) throw error;
        setFollowing(false);
      } else {
        const { error } = await supabase.from("follows").insert({
          follower_id: sessionUser,
          following_id: member.userId,
        });
        if (error) throw error;
        setFollowing(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setBusy(false);
    }
  };

  const initial = (member?.name || "?").trim().slice(0, 1).toUpperCase();
  const canFollow = Boolean(member?.userId && sessionUser && member.userId !== sessionUser);

  return (
    <div style={{ minHeight: "100vh", background: BG, color: CREAM, padding: "28px 20px 110px" }}>
      <button
        type="button"
        onClick={() => navigate("/pro")}
        style={{ background: "none", border: "none", color: "rgba(253,248,240,0.5)", fontSize: 13, cursor: "pointer", marginBottom: 16 }}
      >
        ← Feed Pro
      </button>

      {missing || !member ? (
        <p style={{ color: "rgba(253,248,240,0.5)", fontStyle: "italic" }}>{missing ? "Profil introuvable." : "…"}</p>
      ) : (
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 88,
              height: 88,
              borderRadius: "50%",
              margin: "0 auto 12px",
              overflow: "hidden",
              background: "linear-gradient(135deg, #C4922A, #6D59A8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 32,
              fontWeight: 800,
            }}
          >
            {member.photo ? (
              <img src={member.photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              initial
            )}
          </div>
          <h1 style={{ fontFamily: "Georgia, serif", fontSize: 22, fontWeight: 400, margin: "0 0 6px" }}>{member.name}</h1>
          {member.tagline && (
            <p style={{ margin: "0 0 12px", fontSize: 14, fontStyle: "italic", color: "rgba(253,248,240,0.7)" }}>
              {member.tagline}
            </p>
          )}
          <div style={{ display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
            {TRAMES.filter((t) => badges.includes(t.key)).map((t) => (
              <span
                key={t.key}
                style={{
                  padding: "4px 10px",
                  borderRadius: 999,
                  border: `1px solid ${t.color}66`,
                  color: t.color,
                  fontSize: 10,
                  fontWeight: 800,
                  letterSpacing: "0.08em",
                }}
              >
                {t.label}
              </span>
            ))}
          </div>
          <button
            type="button"
            onClick={toggleFollow}
            disabled={!canFollow || busy}
            style={{
              padding: "8px 18px",
              borderRadius: 999,
              border: following ? "1px solid rgba(253,248,240,0.25)" : "none",
              background: following ? "rgba(255,255,255,0.08)" : "#C4922A",
              color: following ? "rgba(253,248,240,0.7)" : "#fff",
              fontWeight: 700,
              fontSize: 14,
              cursor: canFollow ? "pointer" : "default",
              opacity: canFollow ? 1 : 0.7,
            }}
          >
            {following ? "Suivi" : "Suivre"}
          </button>
          <p style={{ margin: "14px 0 0", fontSize: 13, color: "rgba(253,248,240,0.55)" }}>
            {count} souvenir{count === 1 ? "" : "s"} professionnel{count === 1 ? "" : "s"} partagé{count === 1 ? "" : "s"}
          </p>
        </div>
      )}

      <ProBottomNav activeTab="feed" onTabChange={() => navigate("/pro")} onSwitch={() => navigate("/")} />
    </div>
  );
};

export default ProMember;
