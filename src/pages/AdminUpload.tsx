import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Upload, ArrowLeft, Check, X, AlertTriangle } from "lucide-react";

const ADMIN_EMAIL = "malik.ceo@infeelit.com";

const THEMATIC_CATEGORIES = [
  { id: "enfance", label: "Enfance / Childhood / طفولة" },
  { id: "famille", label: "Famille / Family / عائلة" },
  { id: "amour", label: "Amour / Love / حب" },
  { id: "maison", label: "Maison / Home / بيت" },
  { id: "voyage", label: "Voyage / Travel / سفر" },
  { id: "sport", label: "Sport / Match / رياضة" },
  { id: "travail", label: "Travail / Work / عمل" },
  { id: "transmission", label: "Transmission / Legacy / إرث" },
];

const AdminUpload = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);

  // Form state
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [firstName, setFirstName] = useState("");
  const [city, setCity] = useState("");
  const [question, setQuestion] = useState("");
  const [category, setCategory] = useState("enfance");
  const [isPublic, setIsPublic] = useState(true);
  const [isAnonymous, setIsAnonymous] = useState(false);

  // Upload state
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  // Pending & reported memories
  const [pendingMemories, setPendingMemories] = useState<any[]>([]);
  const [reportedMemories, setReportedMemories] = useState<any[]>([]);
  const [loadingModeration, setLoadingModeration] = useState(true);

  // Vérifier si l'utilisateur est admin
  useEffect(() => {
    const checkAdmin = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user?.email === ADMIN_EMAIL) {
        setIsAdmin(true);
      } else {
        navigate("/");
      }
      setChecking(false);
    };
    checkAdmin();
  }, [navigate]);

  // Charger les contenus en attente et signalés
  useEffect(() => {
    if (!isAdmin) return;

    const loadModeration = async () => {
      setLoadingModeration(true);

      // Pending
      const { data: pending } = await supabase
        .from("memories")
        .select("*")
        .eq("moderation_status", "pending")
        .order("created_at", { ascending: false });
      setPendingMemories(pending || []);

      // Reported (avec les raisons des signalements)
      const { data: reported } = await supabase
        .from("memories")
        .select("*, memory_reports(reason, created_at)")
        .eq("moderation_status", "reported")
        .order("created_at", { ascending: false });
      setReportedMemories(reported || []);

      setLoadingModeration(false);
    };

    loadModeration();

    // Subscription pour les changements en temps réel
    const channel = supabase
      .channel("moderation_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "memories" }, () => loadModeration())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdmin]);

  if (checking) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#FDF8F0",
        }}
      >
        <span style={{ fontSize: "40px" }}>✦</span>
      </div>
    );
  }

  if (!isAdmin) return null;

  const handleApprove = async (memoryId: string) => {
    await supabase.from("memories").update({ moderation_status: "approved" }).eq("id", memoryId);

    setPendingMemories(pendingMemories.filter((m) => m.id !== memoryId));
  };

  const handleReject = async (memoryId: string) => {
    await supabase.from("memories").update({ moderation_status: "rejected" }).eq("id", memoryId);

    setPendingMemories(pendingMemories.filter((m) => m.id !== memoryId));
  };

  const handleKeep = async (memoryId: string) => {
    await supabase.from("memories").update({ moderation_status: "approved" }).eq("id", memoryId);

    setReportedMemories(reportedMemories.filter((m) => m.id !== memoryId));
  };

  const handleDelete = async (memoryId: string) => {
    await supabase.from("memories").delete().eq("id", memoryId);

    setReportedMemories(reportedMemories.filter((m) => m.id !== memoryId));
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoFile || !firstName || !question) {
      setError("Remplis tous les champs requis.");
      return;
    }

    setUploading(true);
    setProgress(10);
    setError("");

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        setError("Tu dois être connecté comme admin.");
        setUploading(false);
        return;
      }

      setProgress(20);

      const fileExt = videoFile.name.split(".").pop();
      const fileName = `${session.user.id}/${Date.now()}_street_interview.${fileExt}`;

      const { error: uploadError } = await supabase.storage.from("memories").upload(fileName, videoFile, {
        cacheControl: "3600",
        upsert: false,
      });

      if (uploadError) throw uploadError;

      setProgress(60);

      const { data: signedData } = await supabase.storage
        .from("memories")
        .createSignedUrl(fileName, 60 * 60 * 24 * 365);

      setProgress(75);

      const displayTitle = question.length > 60 ? question.substring(0, 60) + "..." : question;

      const { error: insertError } = await supabase.from("memories").insert({
        user_id: session.user.id,
        title: displayTitle,
        description: city ? `${firstName} · ${city}` : firstName,
        file_url: fileName,
        file_type: "video",
        thumbnail_url: null,
        is_public: isPublic,
        is_community: true,
        is_anonymous: isAnonymous,
        timeline: "memories",
        spark_reward: 0,
        moderation_status: "approved",
        created_at: new Date().toISOString(),
      });

      if (insertError) throw insertError;

      setProgress(100);
      setDone(true);

      setTimeout(() => {
        setVideoFile(null);
        setFirstName("");
        setCity("");
        setQuestion("");
        setCategory("enfance");
        setIsPublic(true);
        setIsAnonymous(false);
        setDone(false);
        setProgress(0);
        setUploading(false);
      }, 3000);
    } catch (err: any) {
      setError(err.message || "Erreur upload.");
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#0E1A20",
        paddingBottom: "100px",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "56px 20px 16px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <button
          onClick={() => navigate(-1)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
          }}
        >
          <ArrowLeft size={22} color="#fff" />
        </button>
        <div>
          <h1
            style={{
              fontSize: "18px",
              fontWeight: 700,
              color: "#fff",
              fontFamily: "Georgia, serif",
            }}
          >
            Admin Infeelit
          </h1>
          <p
            style={{
              fontSize: "11px",
              color: "rgba(255,255,255,0.3)",
            }}
          >
            Upload & Modération ✦
          </p>
        </div>
      </div>

      {/* Formulaire upload */}
      <form
        onSubmit={handleUpload}
        style={{
          padding: "24px 20px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        {/* Upload vidéo */}
        <div>
          <label
            style={{
              fontSize: "11px",
              fontWeight: 700,
              color: "#E8742A",
              textTransform: "uppercase",
              letterSpacing: "0.15em",
              display: "block",
              marginBottom: "8px",
            }}
          >
            Vidéo *
          </label>
          <label
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              padding: "32px",
              borderRadius: "16px",
              border: videoFile ? "2px solid #E8742A" : "2px dashed rgba(255,255,255,0.2)",
              backgroundColor: videoFile ? "rgba(232,116,42,0.08)" : "rgba(255,255,255,0.03)",
              cursor: "pointer",
            }}
          >
            <Upload size={24} color={videoFile ? "#E8742A" : "rgba(255,255,255,0.3)"} />
            <span
              style={{
                fontSize: "13px",
                color: videoFile ? "#E8742A" : "rgba(255,255,255,0.4)",
                textAlign: "center",
              }}
            >
              {videoFile ? videoFile.name : "Appuie pour choisir une vidéo"}
            </span>
            <input
              type="file"
              accept="video/*"
              style={{ display: "none" }}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) setVideoFile(f);
              }}
            />
          </label>
        </div>

        {/* Prénom */}
        <div>
          <label
            style={{
              fontSize: "11px",
              fontWeight: 700,
              color: "#E8742A",
              textTransform: "uppercase",
              letterSpacing: "0.15em",
              display: "block",
              marginBottom: "8px",
            }}
          >
            Prénom de la personne *
          </label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Thomas, Fatima, Ahmed..."
            style={{
              width: "100%",
              padding: "14px 16px",
              borderRadius: "12px",
              border: "1px solid rgba(255,255,255,0.1)",
              backgroundColor: "rgba(255,255,255,0.05)",
              color: "#fff",
              fontSize: "14px",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Ville */}
        <div>
          <label
            style={{
              fontSize: "11px",
              fontWeight: 700,
              color: "#E8742A",
              textTransform: "uppercase",
              letterSpacing: "0.15em",
              display: "block",
              marginBottom: "8px",
            }}
          >
            Ville
          </label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Dubai, Paris, Alger..."
            style={{
              width: "100%",
              padding: "14px 16px",
              borderRadius: "12px",
              border: "1px solid rgba(255,255,255,0.1)",
              backgroundColor: "rgba(255,255,255,0.05)",
              color: "#fff",
              fontSize: "14px",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Question */}
        <div>
          <label
            style={{
              fontSize: "11px",
              fontWeight: 700,
              color: "#E8742A",
              textTransform: "uppercase",
              letterSpacing: "0.15em",
              display: "block",
              marginBottom: "8px",
            }}
          >
            Question posée *
          </label>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ex: Quel est ton souvenir d'enfance le plus fort ?"
            rows={3}
            style={{
              width: "100%",
              padding: "14px 16px",
              borderRadius: "12px",
              border: "1px solid rgba(255,255,255,0.1)",
              backgroundColor: "rgba(255,255,255,0.05)",
              color: "#fff",
              fontSize: "14px",
              outline: "none",
              resize: "none",
              boxSizing: "border-box",
              fontFamily: "inherit",
            }}
          />
        </div>

        {/* Catégorie */}
        <div>
          <label
            style={{
              fontSize: "11px",
              fontWeight: 700,
              color: "#E8742A",
              textTransform: "uppercase",
              letterSpacing: "0.15em",
              display: "block",
              marginBottom: "8px",
            }}
          >
            Thème
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{
              width: "100%",
              padding: "14px 16px",
              borderRadius: "12px",
              border: "1px solid rgba(255,255,255,0.1)",
              backgroundColor: "#1A2530",
              color: "#fff",
              fontSize: "14px",
              outline: "none",
              boxSizing: "border-box",
            }}
          >
            {THEMATIC_CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        {/* Options */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            padding: "16px",
            borderRadius: "16px",
            backgroundColor: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          {[
            {
              label: "Visible dans le feed public",
              value: isPublic,
              set: setIsPublic,
            },
            {
              label: "Anonyme (sans prénom affiché)",
              value: isAnonymous,
              set: setIsAnonymous,
            },
          ].map((opt, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  fontSize: "13px",
                  color: "rgba(255,255,255,0.7)",
                }}
              >
                {opt.label}
              </span>
              <button
                type="button"
                onClick={() => opt.set(!opt.value)}
                style={{
                  width: "48px",
                  height: "26px",
                  borderRadius: "999px",
                  border: "none",
                  cursor: "pointer",
                  backgroundColor: opt.value ? "#E8742A" : "rgba(255,255,255,0.15)",
                  position: "relative",
                  transition: "background 0.2s",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: "3px",
                    left: opt.value ? "25px" : "3px",
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    backgroundColor: "#fff",
                    transition: "left 0.2s",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
                  }}
                />
              </button>
            </div>
          ))}
        </div>

        {/* Barre de progression */}
        {uploading && (
          <div>
            <div
              style={{
                height: "4px",
                backgroundColor: "rgba(255,255,255,0.1)",
                borderRadius: "999px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${progress}%`,
                  backgroundColor: "#E8742A",
                  borderRadius: "999px",
                  transition: "width 0.3s ease",
                }}
              />
            </div>
            <p
              style={{
                fontSize: "11px",
                color: "rgba(255,255,255,0.4)",
                textAlign: "center",
                marginTop: "8px",
              }}
            >
              Upload en cours... {progress}%
            </p>
          </div>
        )}

        {/* Erreur */}
        {error && (
          <p
            style={{
              color: "#ff6b6b",
              fontSize: "13px",
              textAlign: "center",
              padding: "12px",
              borderRadius: "12px",
              backgroundColor: "rgba(255,107,107,0.1)",
            }}
          >
            {error}
          </p>
        )}

        {/* Bouton submit */}
        <button
          type="submit"
          disabled={uploading || !videoFile || !firstName || !question}
          style={{
            padding: "17px",
            borderRadius: "18px",
            background: uploading ? "rgba(255,255,255,0.1)" : "linear-gradient(135deg, #E8742A, #D4621A)",
            color: "#fff",
            fontWeight: 700,
            fontSize: "15px",
            border: "none",
            cursor: uploading ? "not-allowed" : "pointer",
            opacity: !videoFile || !firstName || !question ? 0.4 : 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            boxShadow: uploading ? "none" : "0 0 0 1px rgba(232,116,42,0.3), 0 8px 28px rgba(232,116,42,0.45)",
          }}
        >
          <Upload size={18} />
          {uploading ? "Upload en cours..." : "Publier dans le feed ✦"}
        </button>
      </form>

      {/* SECTION — EN ATTENTE */}
      {pendingMemories.length > 0 && (
        <div style={{ padding: "0 20px 24px" }}>
          <p
            style={{
              fontSize: "11px",
              fontWeight: 900,
              color: "#F59E0B",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              marginBottom: "16px",
            }}
          >
            ⏳ En attente — {pendingMemories.length} contenu(s)
          </p>

          {pendingMemories.map((memory) => (
            <div
              key={memory.id}
              style={{
                padding: "16px",
                borderRadius: "16px",
                background: "rgba(245,158,11,0.08)",
                border: "1px solid rgba(245,158,11,0.2)",
                marginBottom: "12px",
              }}
            >
              <p style={{ fontSize: "14px", fontWeight: 700, color: "#fff", margin: "0 0 4px" }}>{memory.title}</p>
              <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", margin: "0 0 12px" }}>
                {memory.description || "Sans description"} · {new Date(memory.created_at).toLocaleDateString()}
              </p>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={() => handleApprove(memory.id)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "999px",
                    background: "#22c55e",
                    color: "#fff",
                    border: "none",
                    fontWeight: 700,
                    fontSize: "13px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <Check size={16} /> Approuver
                </button>
                <button
                  onClick={() => handleReject(memory.id)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "999px",
                    background: "rgba(220,38,38,0.15)",
                    color: "#ef4444",
                    border: "1px solid rgba(220,38,38,0.3)",
                    fontWeight: 700,
                    fontSize: "13px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <X size={16} /> Rejeter
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SECTION — SIGNALÉS */}
      {reportedMemories.length > 0 && (
        <div style={{ padding: "0 20px 24px" }}>
          <p
            style={{
              fontSize: "11px",
              fontWeight: 900,
              color: "#dc2626",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              marginBottom: "16px",
            }}
          >
            🚨 Signalés — {reportedMemories.length} contenu(s)
          </p>

          {reportedMemories.map((memory) => {
            const reports = memory.memory_reports || [];
            const reasons = reports.map((r: any) => r.reason).join(", ");

            return (
              <div
                key={memory.id}
                style={{
                  padding: "16px",
                  borderRadius: "16px",
                  background: "rgba(220,38,38,0.08)",
                  border: "1px solid rgba(220,38,38,0.2)",
                  marginBottom: "12px",
                }}
              >
                <p style={{ fontSize: "14px", fontWeight: 700, color: "#fff", margin: "0 0 4px" }}>{memory.title}</p>
                <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", margin: "0 0 12px" }}>
                  {reports.length} signalement(s) · {reasons}
                </p>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={() => handleKeep(memory.id)}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "999px",
                      background: "#22c55e",
                      color: "#fff",
                      border: "none",
                      fontWeight: 700,
                      fontSize: "13px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <Check size={16} /> Garder
                  </button>
                  <button
                    onClick={() => handleDelete(memory.id)}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "999px",
                      background: "rgba(220,38,38,0.15)",
                      color: "#ef4444",
                      border: "1px solid rgba(220,38,38,0.3)",
                      fontWeight: 700,
                      fontSize: "13px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <X size={16} /> Supprimer
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* État vide */}
      {pendingMemories.length === 0 && reportedMemories.length === 0 && !loadingModeration && (
        <div
          style={{
            padding: "24px 20px",
            textAlign: "center",
          }}
        >
          <p
            style={{
              fontSize: "13px",
              color: "rgba(255,255,255,0.3)",
            }}
          >
            ✦ Aucun contenu en attente ou signalé
          </p>
        </div>
      )}
    </div>
  );
};

export default AdminUpload;
