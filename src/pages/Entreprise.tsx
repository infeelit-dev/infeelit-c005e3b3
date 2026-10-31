import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const BG = "#0D1B2A";
const CREAM = "rgba(253,248,240,0.92)";
const TRAMES = [
  { label: "Fondation", color: "#C4922A", desc: "Histoire fondatrice, premiers clients, premiers obstacles" },
  { label: "Actualités", color: "#2A6496", desc: "Projets en cours, victoires récentes, vie d'équipe" },
  { label: "Vision", color: "#6D59A8", desc: "Direction, valeurs, mission" },
];

type Row = {
  id: string;
  name: string;
  logo_url: string | null;
  sector: string | null;
};

const Entreprise = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [row, setRow] = useState<Row | null>(null);
  const [following, setFollowing] = useState(false);
  const [sessionUser, setSessionUser] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const uid = session?.user?.id || null;
      if (!cancelled) setSessionUser(uid);
      const { data } = await (supabase.from("entreprise_profiles") as any)
        .select("id, name, logo_url, sector")
        .eq("id", id)
        .maybeSingle();
      if (!data) {
        if (!cancelled) setMissing(true);
        return;
      }
      if (!cancelled) setRow(data);
      if (uid) {
        const { data: fol } = await (supabase.from("entreprise_follows") as any)
          .select("id")
          .eq("follower_id", uid)
          .eq("entreprise_id", id)
          .maybeSingle();
        if (!cancelled) setFollowing(!!fol);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const toggleFollow = async () => {
    if (!sessionUser || !id || busy) return;
    setBusy(true);
    try {
      if (following) {
        const { error } = await (supabase.from("entreprise_follows") as any)
          .delete()
          .eq("follower_id", sessionUser)
          .eq("entreprise_id", id);
        if (error) throw error;
        setFollowing(false);
      } else {
        const { error } = await (supabase.from("entreprise_follows") as any).insert({
          follower_id: sessionUser,
          entreprise_id: id,
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

  const initial = (row?.name || "?").trim().slice(0, 1).toUpperCase();

  return (
    <div style={{ minHeight: "100vh", background: BG, color: CREAM, padding: "28px 20px 80px" }}>
      <button
        type="button"
        onClick={() => navigate("/pro")}
        style={{ background: "none", border: "none", color: "rgba(253,248,240,0.5)", cursor: "pointer", marginBottom: 20 }}
      >
        ← Feed Pro
      </button>
      {missing || !row ? (
        <p style={{ color: "rgba(253,248,240,0.5)", fontStyle: "italic" }}>{missing ? "Entreprise introuvable." : "…"}</p>
      ) : (
        <>
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: 16,
                margin: "0 auto 12px",
                overflow: "hidden",
                background: "linear-gradient(135deg, #C4922A, #6D59A8)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 28,
                fontWeight: 800,
              }}
            >
              {row.logo_url ? (
                <img src={row.logo_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                initial
              )}
            </div>
            <h1 style={{ fontFamily: "Georgia, serif", fontSize: 22, fontWeight: 400, margin: 0 }}>{row.name}</h1>
            {row.sector && (
              <p style={{ margin: "6px 0 12px", fontSize: 13, color: "rgba(253,248,240,0.55)" }}>{row.sector}</p>
            )}
            <button
              type="button"
              onClick={toggleFollow}
              disabled={!sessionUser || busy}
              style={{
                padding: "8px 18px",
                borderRadius: 999,
                border: following ? "1px solid rgba(253,248,240,0.25)" : "none",
                background: following ? "rgba(255,255,255,0.08)" : "#C4922A",
                color: following ? "rgba(253,248,240,0.7)" : "#fff",
                fontWeight: 700,
                cursor: sessionUser ? "pointer" : "default",
                opacity: sessionUser ? 1 : 0.7,
              }}
            >
              {following ? "Suivi" : "Suivre"}
            </button>
          </div>
          {TRAMES.map((t) => (
            <div
              key={t.label}
              style={{
                padding: 14,
                borderRadius: 14,
                border: `1px solid ${t.color}40`,
                background: `${t.color}14`,
                marginBottom: 10,
              }}
            >
              <p style={{ margin: "0 0 6px", color: t.color, fontSize: 10, fontWeight: 900, letterSpacing: "0.16em" }}>
                {t.label}
              </p>
              <p style={{ margin: 0, fontSize: 14, fontStyle: "italic", color: "rgba(253,248,240,0.55)" }}>{t.desc}</p>
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default Entreprise;
