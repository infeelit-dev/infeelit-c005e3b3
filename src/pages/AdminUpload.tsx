import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Upload, Loader2, ShieldAlert } from "lucide-react";

type Timeline = "memories" | "past" | "future" | "community";

const AdminUpload = () => {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [timeline, setTimeline] = useState<Timeline>("community");
  const [isPublic, setIsPublic] = useState(true);
  const [isCommunity, setIsCommunity] = useState(true);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [auraIntensity, setAuraIntensity] = useState(35);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate("/welcome");
        return;
      }
      setUserId(session.user.id);
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "admin")
        .maybeSingle();
      setIsAdmin(!!data && !error);
      setChecking(false);
    })();
  }, [navigate]);

  const handleUpload = async () => {
    if (!file || !userId) {
      toast.error("Sélectionne un fichier d'abord.");
      return;
    }
    if (title.trim().length === 0 || title.length > 120) {
      toast.error("Titre requis (1-120 caractères).");
      return;
    }
    if (description.length > 2000) {
      toast.error("Description trop longue (max 2000).");
      return;
    }

    setUploading(true);
    try {
      const ext = (file.name.match(/\.([a-zA-Z0-9]{1,5})$/)?.[1] || "bin").toLowerCase();
      const key = `${userId}/${Date.now()}-${crypto.randomUUID()}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from("memories")
        .upload(key, file, { contentType: file.type, upsert: false });
      if (upErr) throw upErr;

      const fileType = file.type.startsWith("video/")
        ? "video"
        : file.type.startsWith("audio/")
          ? "audio"
          : file.type.startsWith("image/")
            ? "image"
            : "file";

      const { error: insErr } = await supabase.from("memories").insert({
        user_id: userId,
        title: title.trim(),
        description: description.trim() || null,
        file_url: key,
        file_type: fileType,
        timeline,
        is_public: isPublic,
        is_community: isCommunity,
        is_anonymous: isAnonymous,
        aura_intensity: auraIntensity,
      });
      if (insErr) throw insErr;

      toast.success("Mémoire publiée ✦");
      setFile(null);
      setTitle("");
      setDescription("");
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de l'upload");
    } finally {
      setUploading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#FFF9F2" }}>
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: "#E8742A" }} />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-6 text-center gap-4"
        style={{ backgroundColor: "#FFF9F2" }}
      >
        <ShieldAlert className="w-12 h-12" style={{ color: "#E8742A" }} />
        <h1 className="text-xl font-bold" style={{ color: "#3D2B1F", fontFamily: "Georgia, serif" }}>
          Accès restreint
        </h1>
        <p className="text-sm" style={{ color: "rgba(61,43,31,0.6)" }}>
          Cette page est réservée aux administrateurs.
        </p>
        <Button onClick={() => navigate("/")} variant="outline">Retour</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 py-10" style={{ backgroundColor: "#FFF9F2" }}>
      <div className="max-w-xl mx-auto space-y-6">
        <header className="text-center space-y-2">
          <h1 className="text-2xl font-bold" style={{ color: "#3D2B1F", fontFamily: "Georgia, serif" }}>
            Admin · Upload
          </h1>
          <p className="text-sm" style={{ color: "rgba(61,43,31,0.55)" }}>
            Ajoute une mémoire dans le sanctuaire Infeelit.
          </p>
        </header>

        <div className="space-y-4 rounded-2xl border border-[#D4A853]/30 bg-white p-6">
          <div className="space-y-2">
            <Label>Fichier (vidéo / audio / image)</Label>
            <Input
              type="file"
              accept="video/*,audio/*,image/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            {file && (
              <p className="text-xs" style={{ color: "rgba(61,43,31,0.5)" }}>
                {file.name} · {(file.size / 1024 / 1024).toFixed(1)} MB
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Titre</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
              placeholder="Un titre poétique"
            />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={2000}
              rows={4}
              placeholder="Raconte ce moment…"
            />
          </div>

          <div className="space-y-2">
            <Label>Timeline</Label>
            <select
              value={timeline}
              onChange={(e) => setTimeline(e.target.value as Timeline)}
              className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
            >
              <option value="memories">Memories</option>
              <option value="past">Past</option>
              <option value="future">Future</option>
              <option value="community">Community</option>
            </select>
          </div>

          <div className="grid grid-cols-3 gap-2 text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
              Public
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={isCommunity} onChange={(e) => setIsCommunity(e.target.checked)} />
              Communauté
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={isAnonymous} onChange={(e) => setIsAnonymous(e.target.checked)} />
              Anonyme
            </label>
          </div>

          <div className="space-y-2">
            <Label>Intensité d'aura : {auraIntensity}</Label>
            <input
              type="range"
              min={0}
              max={100}
              value={auraIntensity}
              onChange={(e) => setAuraIntensity(Number(e.target.value))}
              className="w-full accent-[#E8742A]"
            />
          </div>

          <Button
            onClick={handleUpload}
            disabled={uploading || !file}
            className="w-full"
            style={{ background: "linear-gradient(135deg, #E8742A, #D4621A)", color: "#fff" }}
          >
            {uploading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Upload…</>
            ) : (
              <><Upload className="w-4 h-4" /> Publier</>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminUpload;