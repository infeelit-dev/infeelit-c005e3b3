import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { resolveMemoryUrl } from "@/lib/memoryUrl";
import MemoryFullscreen from "@/components/MemoryFullscreen";

const MemoryDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [memory, setMemory] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [signedFileUrl, setSignedFileUrl] = useState<string | null>(null);
  const [signedThumbUrl, setSignedThumbUrl] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | undefined>();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUserId(session?.user?.id);
    });
  }, []);

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
        const [fileUrl, thumbUrl] = await Promise.all([
          resolveMemoryUrl(data.file_url),
          resolveMemoryUrl(data.thumbnail_url),
        ]);
        setSignedFileUrl(fileUrl);
        setSignedThumbUrl(thumbUrl);
      }
      setLoading(false);
    };
    fetchMemory();
  }, [id]);

  useEffect(() => {
    if (!memory) return;

    const transcript =
      memory.transcript_fr || memory.transcript_en || memory.transcript_ar || "";
    const teaser = transcript
      ? `"${transcript.slice(0, 100)}..."`
      : "A voice preserved forever on Infeelit";

    document.title = `${memory.title || "A memory"} — Infeelit`;

    const setMeta = (property: string, content: string) => {
      let el = document.querySelector(
        `meta[property="${property}"]`,
      ) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute("property", property);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    setMeta("og:title", memory.title || "A memory on Infeelit");
    setMeta("og:description", teaser);
    setMeta("og:image", "https://infeelit.com/infeelit-logo.png");
    setMeta("og:url", `https://infeelit.com/memory/${memory.id}`);
    setMeta("og:type", "article");

    const setMetaName = (name: string, content: string) => {
      let el = document.querySelector(
        `meta[name="${name}"]`,
      ) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute("name", name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    setMetaName("twitter:card", "summary_large_image");
    setMetaName("twitter:title", memory.title || "A memory on Infeelit");
    setMetaName("twitter:description", teaser);
  }, [memory]);

  if (loading)
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#000",
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

  if (!memory)
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#000",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          flexDirection: "column",
          gap: "16px",
        }}
      >
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
    user_name: memory.profiles?.display_name?.split(" ")[0] || "Quelqu'un",
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
      userName={bubble.user_name}
      onClose={() => navigate(-1)}
      currentUserId={currentUserId}
    />
  );
};

export default MemoryDetail;
