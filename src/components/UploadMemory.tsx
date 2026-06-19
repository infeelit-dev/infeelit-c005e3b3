import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface UploadMemoryProps {
  lang: "fr" | "en" | "ar";
  userName: string;
  onClose: () => void;
}

export default function UploadMemory({ lang, userName, onClose }: UploadMemoryProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [question, setQuestion] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (!selected.type.startsWith("video/")) {
      setError(
        lang === "fr"
          ? "Seules les vidéos sont acceptées."
          : lang === "ar"
            ? "الفيديوهات فقط مقبولة."
            : "Only video files are accepted.",
      );
      return;
    }

    if (selected.size > 500 * 1024 * 1024) {
      setError(
        lang === "fr"
          ? "La vidéo ne doit pas dépasser 500 Mo."
          : lang === "ar"
            ? "يجب ألا يتجاوز الفيديو 500 ميغابايت."
            : "Video must be under 500 MB.",
      );
      return;
    }

    setFile(selected);
    setError(null);
    const url = URL.createObjectURL(selected);
    setPreview(url);
  };

  const generateThumbnail = (videoFile: File): Promise<Blob | null> => {
    return new Promise((resolve) => {
      const video = document.createElement("video");
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      video.preload = "metadata";
      video.src = URL.createObjectURL(videoFile);

      video.onloadedmetadata = () => {
        video.currentTime = Math.min(1, video.duration * 0.1);
      };

      video.onseeked = () => {
        canvas.width = 640;
        canvas.height = 360;
        ctx?.drawImage(video, 0, 0, 640, 360);
        canvas.toBlob(resolve, "image/jpeg", 0.85);
        URL.revokeObjectURL(video.src);
      };

      video.onerror = () => resolve(null);
    });
  };

  const uploadToStorage = async (file: File, path: string): Promise<string | null> => {
    try {
      const { data, error } = await supabase.storage.from("memories").upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });

      if (error) throw error;

      const { data: urlData } = supabase.storage.from("memories").getPublicUrl(path);

      return urlData.publicUrl;
    } catch (err) {
      console.error("Upload error:", err);
      return null;
    }
  };

  const handleSubmit = async () => {
    if (!file || !title.trim()) {
      setError(
        lang === "fr"
          ? "Ajoute un titre pour ce souvenir."
          : lang === "ar"
            ? "أضف عنواناً لهذه الذكرى."
            : "Add a title for this memory.",
      );
      return;
    }

    setUploading(true);
    setProgress(10);

    try {
      const timestamp = Date.now();
      const safeUserName = userName.replace(/[^a-zA-Z0-9]/g, "_") || "anonymous";
      const fileExt = file.name.split(".").pop() || "mp4";
      const filePath = `${safeUserName}/${timestamp}_upload.${fileExt}`;
      const thumbPath = `${safeUserName}/${timestamp}_thumb.jpg`;

      setProgress(20);
      const thumbnailBlob = await generateThumbnail(file);

      setProgress(30);
      const videoUrl = await uploadToStorage(file, filePath);
      if (!videoUrl) throw new Error("Video upload failed");

      setProgress(70);
      let thumbnailUrl = null;
      if (thumbnailBlob) {
        const thumbFile = new File([thumbnailBlob], "thumbnail.jpg", { type: "image/jpeg" });
        thumbnailUrl = await uploadToStorage(thumbFile, thumbPath);
      }

      setProgress(85);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error: dbError } = await supabase.from("memories").insert({
        user_id: user.id,
        title: title.trim(),
        description: question.trim() || null,
        file_url: videoUrl,
        file_type: "video",
        thumbnail_url: thumbnailUrl,
        is_public: true,
        is_community: true,
        timeline: "memories",
      });

      if (dbError) throw dbError;

      setProgress(100);

      setTimeout(() => {
        navigate("/");
        onClose();
      }, 500);
    } catch (err) {
      console.error(err);
      setError(
        lang === "fr"
          ? "Erreur lors de l'upload. Réessaie."
          : lang === "ar"
            ? "خطأ أثناء الرفع. حاول مرة أخرى."
            : "Upload error. Please try again.",
      );
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#FDF8F0",
        zIndex: 100,
        display: "flex",
        flexDirection: "column",
        overflowY: "auto",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "56px 20px 16px",
          borderBottom: "1px solid rgba(232,116,42,0.1)",
        }}
      >
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            fontSize: "22px",
            cursor: "pointer",
            color: "#3D2B1F",
          }}
        >
          ←
        </button>
        <p
          style={{
            fontSize: "16px",
            fontWeight: 700,
            color: "#3D2B1F",
            fontFamily: "Georgia, serif",
          }}
        >
          {lang === "fr" ? "Importer un souvenir" : lang === "ar" ? "استيراد ذكرى" : "Import a memory"}
        </p>
        <div style={{ width: 40 }} />
      </div>

      <div style={{ padding: "24px 20px", flex: 1 }}>
        {/* ✅ AFFICHAGE CONDITIONNEL — placeholder OU vidéo */}
        {!file ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: "2px dashed rgba(232,116,42,0.3)",
              borderRadius: "20px",
              padding: "48px 24px",
              textAlign: "center",
              cursor: "pointer",
              background: "rgba(232,116,42,0.04)",
              marginBottom: "24px",
              transition: "all 0.2s ease",
            }}
          >
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>🎬</div>
            <p
              style={{
                fontSize: "18px",
                fontWeight: 700,
                color: "#3D2B1F",
                marginBottom: "8px",
              }}
            >
              {lang === "fr" ? "Choisir une vidéo" : lang === "ar" ? "اختر فيديو" : "Choose a video"}
            </p>
            <p
              style={{
                fontSize: "13px",
                color: "rgba(61,43,31,0.5)",
              }}
            >
              {lang === "fr"
                ? "Depuis ta galerie · Max 500 Mo"
                : lang === "ar"
                  ? "من معرض صورك · بحد أقصى 500 ميغابايت"
                  : "From your gallery · Max 500 MB"}
            </p>
          </div>
        ) : (
          <div style={{ marginBottom: "24px", position: "relative" }}>
            <video
              src={preview || ""}
              controls
              style={{
                width: "100%",
                borderRadius: "16px",
                maxHeight: "300px",
                objectFit: "cover",
                background: "#000",
              }}
            />
            <button
              onClick={() => {
                setFile(null);
                setPreview(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                background: "rgba(0,0,0,0.6)",
                border: "none",
                color: "#fff",
                cursor: "pointer",
                fontSize: "16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ×
            </button>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          style={{ display: "none" }}
          onChange={handleFileSelect}
        />

        <div style={{ marginBottom: "16px" }}>
          <label
            style={{
              fontSize: "12px",
              fontWeight: 700,
              color: "#E8742A",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              display: "block",
              marginBottom: "8px",
            }}
          >
            {lang === "fr" ? "Titre du souvenir *" : lang === "ar" ? "عنوان الذكرى *" : "Memory title *"}
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={
              lang === "fr"
                ? "Ex : Le jour où j'ai appelé ma mère depuis Dubai"
                : lang === "ar"
                  ? "مثال: اليوم الذي اتصلت فيه بأمي من دبي"
                  : "Ex: The day I called my mom from Dubai"
            }
            style={{
              width: "100%",
              padding: "14px 16px",
              borderRadius: "14px",
              border: "1px solid rgba(232,116,42,0.3)",
              background: "#fff",
              fontSize: "15px",
              color: "#3D2B1F",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>

        <div style={{ marginBottom: "24px" }}>
          <label
            style={{
              fontSize: "12px",
              fontWeight: 700,
              color: "#E8742A",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              display: "block",
              marginBottom: "8px",
            }}
          >
            {lang === "fr"
              ? "Question liée (optionnel)"
              : lang === "ar"
                ? "السؤال المرتبط (اختياري)"
                : "Related question (optional)"}
          </label>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={
              lang === "fr"
                ? "Ex : Quel est le plat que ta maman aimait préparer ?"
                : lang === "ar"
                  ? "مثال: ما الطبق الذي كانت أمك تحبّ إعداده؟"
                  : "Ex: What dish did your mom love to make?"
            }
            style={{
              width: "100%",
              padding: "14px 16px",
              borderRadius: "14px",
              border: "1px solid rgba(232,116,42,0.15)",
              background: "#fff",
              fontSize: "15px",
              color: "#3D2B1F",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>

        {error && (
          <div
            style={{
              padding: "12px 16px",
              borderRadius: "12px",
              background: "rgba(220,38,38,0.08)",
              border: "1px solid rgba(220,38,38,0.2)",
              marginBottom: "16px",
            }}
          >
            <p style={{ fontSize: "14px", color: "#dc2626", margin: 0 }}>{error}</p>
          </div>
        )}

        {uploading && (
          <div style={{ marginBottom: "16px" }}>
            <div
              style={{
                height: "6px",
                background: "rgba(232,116,42,0.15)",
                borderRadius: "999px",
                overflow: "hidden",
              }}
            >
              <