import { useState, useEffect } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Upload, ArrowLeft, Check, X } from "lucide-react";

const ADMIN_EMAILS = ["malik.ceo@infeelit.com", "amconsulting099@gmail.com"];

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
  const [loading, setLoading] = useState(true);

  // Form state
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [firstName, setFirstName] = useState("");
  const [city, setCity] = useState("");
  const [question, setQuestion] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("enfance");
  const [isPublic, setIsPublic] = useState(true);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [authorName, setAuthorName] = useState("");
  const [autoThumbnail, setAutoThumbnail] = useState<Blob | null>(null);
  const [customThumbnail, setCustomThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  // Upload state
  const [uploading, setUploading] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  // Pending & reported memories
  const [pendingMemories, setPendingMemories] = useState<any[]>([]);
  const [reportedMemories, setReportedMemories] = useState<any[]>([]);
  const [loadingModeration, setLoadingModeration] = useState(true);

  // Vérifier si l'utilisateur est admin
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const email = session?.user?.email;
      setIsAdmin(ADMIN_EMAILS.includes(email || ""));
      setLoading(false);
    });
  }, []);

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

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0f0501",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#E8742A",
          fontSize: "24px",
        }}
      >
        ✦
      </div>
    );
  }

  if (!isAdmin) return <Navigate to="/" replace />;

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

  const captureThumbnail = async (videoFile: File): Promise<Blob | null> => {
    return new Promise((resolve) => {
      const video = document.createElement("video");
      const url = URL.createObjectURL(videoFile);
      video.src = url;
      video.muted = true;
      video.playsInline = true;

      const timeout = setTimeout(() => {
        URL.revokeObjectURL(url);
        resolve(null);
      }, 8000);

      video.onloadedmetadata = () => {
        video.currentTime = Math.min(1, video.duration * 0.1);
      };

      video.onseeked = () => {
        clearTimeout(timeout);
        const canvas = document.createElement("canvas");
        canvas.width = 480;
        canvas.height = 270;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(video, 0, 0, 480, 270);
          canvas.toBlob((blob) => {
            URL.revokeObjectURL(url);
            resolve(blob);
          }, "image/jpeg", 0.8);
        } else {
          URL.revokeObjectURL(url);
          resolve(null);
        }
      };

      video.onerror = () => {
        clearTimeout(timeout);
        URL.revokeObjectURL(url);
        resolve(null);
      };
    });
  };

  const handleVideoSelect = async (file: File) => {
    setVideoFile(file);
    const thumb = await captureThumbnail(file);
    setAutoThumbnail(thumb);
    if (thumb) setThumbnailPreview(URL.createObjectURL(thumb));
  };

  const handleManualThumb = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setCustomThumbnail(f);
    setThumbnailPreview(URL.createObjectURL(f));
  };

  const captureFrameAtTime = (file: File, timeSec: number): Promise<Blob | null> =>
    new Promise((resolve) => {
      const video = document.createElement("video");
      const url = URL.createObjectURL(file);
      video.src = url;
      video.muted = true;
      video.playsInline = true;
      const cleanup = () => URL.revokeObjectURL(url);
      video.onloadedmetadata = () => {
        video.currentTime = Math.min(timeSec, video.duration * 0.1);
      };
      video.onseeked = () => {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 360;
        const ctx = canvas.getContext("2d");
        if (!ctx) { cleanup(); resolve(null); return; }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => { cleanup(); resolve(blob); }, "image/jpeg", 0.85);
      };
      video.onerror = () => { cleanup(); resolve(null); };
    });

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isPublishing) return;
    if (!videoFile || !firstName || !question) {
      setError("Remplis tous les champs requis.");
      return;
    }

    setIsPublishing(true);
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
        setIsPublishing(false);
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

      setProgress(50);

      // Auto-generate thumbnail: prefer custom file, else capture frame at 1s (face position)
      let thumbnailPath: string | null = null;
      const fallbackThumb = autoThumbnail || (await captureFrameAtTime(videoFile, 1));
      const thumbSource: File | Blob | null =
        customThumbnail || fallbackThumb;
      if (thumbSource) {
        try {
          const thumbName = `${session.user.id}/${Date.now()}_thumb.jpg`;
          const { data: thumbData } = await supabase.storage
            .from("memories")
            .upload(thumbName, thumbSource, { contentType: "image/jpeg", upsert: false });
          if (thumbData) thumbnailPath = thumbName;
        } catch {
          // non-fatal — continue without thumbnail
        }
      }

      setProgress(75);

      const displayTitle = question.length > 60 ? question.substring(0, 60) + "..." : question;
      const memoryAuthorName = (authorName || "").trim() || "Infeelit";

      const { error: insertError } = await supabase.from("memories").insert({
        user_id: session.user.id,
        user_name: memoryAuthorName,
        author_name: memoryAuthorName,
        title: displayTitle,
        description: description || null,
        file_url: fileName,
        file_type: "video",
        thumbnail_url: thumbnailPath,
        is_public: true,
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
        setDescription("");
        setCategory("enfance");
        setIsPublic(true);
        setIsAnonymous(false);
        setAuthorName("");
        setAutoThumbnail(null);
        setCustomThumbnail(null);
        setThumbnailPreview(null);
        setDone(false);
        setProgress(0);
        setUploading(false);
        setIsPublishing(false);
      }, 3000);
    } catch (err: any) {
      setError(err.message || "Erreur upload.");
      setUploading(false);
      setIsPublishing(false);
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
                if (f) void handleVideoSelect(f);
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

        <input
          type="text"
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          placeholder="Person's name (e.g. Sarah, Anonymous...)"
          style={{
            width: "100%",
            padding: "12px 16px",
            borderRadius: "12px",
            border: "1.5px solid rgba(232,116,42,0.3)",
            background: "rgba(255,255,255,0.06)",
            color: "#fff",
            fontSize: "14px",
            marginBottom: "12px",
            outline: "none",
            boxSizing: "border-box",
          }}
        />

        {/* Miniature personnalisée */}
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
            Miniature personnalisée (optionnelle — sinon auto-capturée à 1s)
          </label>
          <label
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              padding: "20px",
              borderRadius: "16px",
              border: customThumbnail ? "2px solid #E8742A" : "2px dashed rgba(255,255,255,0.15)",
              backgroundColor: customThumbnail ? "rgba(232,116,42,0.06)" : "rgba(255,255,255,0.02)",
              cursor: "pointer",
            }}
          >
            {thumbnailPreview ? (
              <img
                src={thumbnailPreview}
                alt="preview"
                style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "8px" }}
              />
            ) : (
              <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.35)" }}>
                {customThumbnail ? customThumbnail.name : "Choisir une image JPG/PNG"}
              </span>
            )}
            <input
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleManualThumb}
            />
          </label>
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

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description or #hashtags (optional, max 150 chars)"
          maxLength={150}
          rows={2}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "8px",
            background: "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.2)",
            color: "#fff",
            fontSize: "14px",
            resize: "none",
            outline: "none",
            marginBottom: "12px",
          }}
        />

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
          disabled={isPublishing || uploading || !videoFile || !firstName || !question}
          style={{
            padding: "17px",
            borderRadius: "18px",
            background: uploading || isPublishing ? "rgba(255,255,255,0.1)" : "linear-gradient(135deg, #E8742A, #D4621A)",
            color: "#fff",
            fontWeight: 700,
            fontSize: "15px",
            border: "none",
            cursor: uploading || isPublishing ? "not-allowed" : "pointer",
            opacity: isPublishing || !videoFile || !firstName || !question ? 0.6 : 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            boxShadow: uploading || isPublishing ? "none" : "0 0 0 1px rgba(232,116,42,0.3), 0 8px 28px rgba(232,116,42,0.45)",
          }}
        >
          <Upload size={18} />
          {uploading || isPublishing ? "Upload en cours..." : "Publier dans le feed ✦"}
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
