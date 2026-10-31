import { useRef, useState, type CSSProperties, type FormEvent, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const BG = "#0D1B2A";
const CREAM = "rgba(253,248,240,0.92)";

const EntrepriseNew = () => {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [sector, setSector] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onLogo = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Image only.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("5 MB max.");
      return;
    }
    setError(null);
    setLogoFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate("/welcome");
        return;
      }
      let logo_url: string | null = null;
      if (logoFile) {
        const ext = (logoFile.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
        const path = `${session.user.id}/${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage.from("entreprise-logos").upload(path, logoFile, {
          upsert: true,
          contentType: logoFile.type,
        });
        if (upErr) throw upErr;
        logo_url = supabase.storage.from("entreprise-logos").getPublicUrl(path).data.publicUrl;
      }
      const { data, error: insErr } = await (supabase.from("entreprise_profiles") as any)
        .insert({
          owner_id: session.user.id,
          name: name.trim(),
          sector: sector.trim() || null,
          logo_url,
        })
        .select("id")
        .single();
      if (insErr) throw insErr;
      navigate(`/pro/entreprise/${data.id}`);
    } catch (err) {
      console.error(err);
      setError("Impossible d'enregistrer.");
    } finally {
      setBusy(false);
    }
  };

  const field: CSSProperties = {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px 14px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.04)",
    color: CREAM,
    fontSize: 15,
    marginTop: 6,
  };

  return (
    <div style={{ minHeight: "100vh", background: BG, color: CREAM, padding: "28px 20px 80px" }}>
      <button
        type="button"
        onClick={() => navigate("/pro")}
        style={{ background: "none", border: "none", color: "rgba(253,248,240,0.5)", cursor: "pointer", marginBottom: 20 }}
      >
        ← Retour
      </button>
      <h1 style={{ fontFamily: "Georgia, serif", fontSize: 22, fontWeight: 400, margin: "0 0 8px" }}>Profil entreprise</h1>
      <p style={{ color: "rgba(253,248,240,0.5)", fontSize: 13, margin: "0 0 20px", lineHeight: 1.45 }}>
        Fondation, Actualités et Vision s&apos;appliqueront à l&apos;histoire de l&apos;entreprise.
      </p>
      <form onSubmit={submit}>
        <label style={{ fontSize: 12, fontWeight: 700 }}>
          Nom
          <input value={name} onChange={(e) => setName(e.target.value)} required style={field} />
        </label>
        <label style={{ fontSize: 12, fontWeight: 700, display: "block", marginTop: 16 }}>
          Secteur
          <input value={sector} onChange={(e) => setSector(e.target.value)} style={field} />
        </label>
        <div style={{ marginTop: 16 }}>
          <p style={{ fontSize: 12, fontWeight: 700, margin: "0 0 8px" }}>Logo</p>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            style={{
              width: 72,
              height: 72,
              borderRadius: 14,
              border: "1px solid rgba(255,255,255,0.16)",
              background: "rgba(255,255,255,0.06)",
              color: CREAM,
              cursor: "pointer",
              overflow: "hidden",
              padding: 0,
            }}
          >
            {preview ? <img src={preview} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "+"}
          </button>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={onLogo} />
        </div>
        {error && <p style={{ color: "#E8742A", fontSize: 13 }}>{error}</p>}
        <button
          type="submit"
          disabled={busy || !name.trim()}
          style={{
            marginTop: 24,
            width: "100%",
            height: 48,
            border: "none",
            borderRadius: 12,
            background: "#C4922A",
            color: "#fff",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          {busy ? "…" : "Créer"}
        </button>
      </form>
    </div>
  );
};

export default EntrepriseNew;
