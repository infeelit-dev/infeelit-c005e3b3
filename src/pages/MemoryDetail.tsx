import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import MemoryFullscreen from "@/components/MemoryFullscreen";

const MemoryDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [memory, setMemory] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [signedFileUrl, setSignedFileUrl] = useState<string | null>(null);
  const [signedThumbUrl, setSignedThumbUrl] = useState<string | null>(null);

  const signUrl = async (path: string | null): Promise<string | null> => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    try {
      const { data } = await supabase.storage
        .from("memories")
        .createSignedUrl(path, 3600);
      return data?.signedUrl || null;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    if (!id) return;
    const fetchMemory = async () => {
      const { data } = await supabase
        .from("memories")
        .select("*, profiles(display_name, avatar_url)")
        .eq("id", id)
        .single();
      if (data) {
        setMemory(data);
        const fileUrl = await signUrl(data.file_url);
        const thumbUrl = await signUrl(data.thumbnail_url);
        setSignedFileUrl(fileUrl);
        setSignedThumbUrl(thumbUrl);
      }
      setLoading(false);
    };
    fetchMemory();
  }, [id]);

  if (loading) return (
    <div style={{
      minHeight: "100vh",
      background: "#000",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#E8742A",
      fontSize: "24px",
    }}>
      ✦
    </div>
  );

  if (!memory) return (
    <div style={{
      minHeight: "100vh",
      background: "#000",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#fff",
      flexDirection: "column",
      gap: "16px",
    }}>
      <p>Ce souvenir n'existe pas ou n'est plus accessible.</p>
      <button
        onClick={() => navigate("/")}
        style={{
          padding: "12px 24px",
          borderRadius: "999px",
          background: "#E8742A",
          color: "#fff",
          border: "none",
          cursor: "pointer",
          fontWeight: 700,
        }}
      >
        Retour
      </button>
    </div>
  );

  const bubble = {
    id: memory.id,
    type: "real" as const,
    title: memory.title || "Un souvenir",
    file_url: signedFileUrl || "",
    file_type: memory.file_type || "video",
    thumbnail_url: signedThumbUrl,
    user_name:
      memory.profiles?.display_name?.split(" ")[0] || "Quelqu'un",
    user_id: memory.user_id,
    sparks_count: memory.sparks_count || 0,
    transcript_fr: memory.transcript_fr || null,
    transcript_en: memory.transcript_en || null,
    transcript_ar: memory.transcript_ar || null,
    translation_status: memory.translation_status || null,
    detected_lang: memory.detected_lang || null,
    image: signedThumbUrl || "",
    size: 140,
    x: 50,
    y: 50,
    animClass: "",
    animDuration: "8s",
    animDelay: "0s",
  };

  return (
    <MemoryFullscreen
      bubble={bubble}
      onClose={() => navigate(-1)}
    />
  );
};

export default MemoryDetail;
