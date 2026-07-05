import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import MemoryFullscreen from "@/components/MemoryFullscreen";

const MemoryDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [memory, setMemory] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchMemory = async () => {
      const { data } = await supabase
        .from("memories")
        .select("*, profiles(display_name, avatar_url)")
        .eq("id", id)
        .single();
      if (data) setMemory(data);
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

  return (
    <MemoryFullscreen
      memory={memory}
      onClose={() => navigate(-1)}
    />
  );
};

export default MemoryDetail;
