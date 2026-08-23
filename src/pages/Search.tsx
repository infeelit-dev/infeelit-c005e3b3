import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { resolveMemoryUrl } from "@/lib/memoryUrl";
import { useLanguage } from "@/contexts/LanguageContext";
import { pickLocalized } from "@/lib/pickLocalized";

interface SearchMemory {
  id: string;
  title: string | null;
  description: string | null;
  thumbnail_url: string | null;
  file_type: string | null;
  sparks_count: number | null;
  created_at: string;
}

const Search = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { lang } = useLanguage();
  const tag = (searchParams.get("tag") || "").trim();

  const [memories, setMemories] = useState<SearchMemory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      if (!tag) {
        setMemories([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("memories")
        .select("id, title, description, thumbnail_url, file_type, sparks_count, created_at")
        .ilike("description", `%#${tag}%`)
        .eq("is_public", true)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) {
        console.error("Hashtag search failed:", error);
        if (!cancelled) {
          setMemories([]);
          setLoading(false);
        }
        return;
      }

      const rows = data || [];
      const withThumbs = await Promise.all(
        rows.map(async (m) => ({
          ...m,
          thumbnail_url: await resolveMemoryUrl(m.thumbnail_url),
        })),
      );

      if (!cancelled) {
        setMemories(withThumbs);
        setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [tag]);

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#0f0501",
        color: "#fff",
        paddingBottom: "40px",
      }}
    >
      <div
        style={{
          padding: "56px 20px 16px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <button
          type="button"
          onClick={() => navigate("/")}
          style={{
            background: "rgba(255,255,255,0.1)",
            border: "none",
            color: "#fff",
            borderRadius: "999px",
            padding: "10px 16px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          ←{" "}
          {pickLocalized(lang, {
            fr: "Retour au feed",
            ar: "العودة للخلاصة",
            en: "Back to feed",
          })}
        </button>
      </div>

      <div style={{ padding: "24px 20px" }}>
        <h1
          style={{
            fontFamily: "Georgia, serif",
            fontStyle: "italic",
            fontSize: "22px",
            marginBottom: "8px",
          }}
        >
          {tag
            ? `#${tag}`
            : pickLocalized(lang, { fr: "Recherche", ar: "البحث", en: "Search" })}
        </h1>
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px", marginBottom: "24px" }}>
          {tag
            ? pickLocalized(lang, {
                fr: "Souvenirs avec ce hashtag",
                ar: "ذكريات بهذا الوسم",
                en: "Memories with this hashtag",
              })
            : pickLocalized(lang, {
                fr: "Tape un hashtag depuis un souvenir pour chercher.",
                ar: "اضغط وسمًا من ذكرى للبحث.",
                en: "Tap a hashtag on a memory to search.",
              })}
        </p>

        {loading && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "200px",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                border: "3px solid rgba(232,116,42,0.3)",
                borderTop: "3px solid #E8742A",
                animation: "spin 1s linear infinite",
              }}
            />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {!loading && tag && memories.length === 0 && (
          <p style={{ color: "rgba(255,255,255,0.45)", textAlign: "center", marginTop: "48px" }}>
            {pickLocalized(lang, {
              fr: "Aucun souvenir trouvé pour ce hashtag.",
              ar: "لا توجد ذكريات لهذا الوسم.",
              en: "No memories found for this hashtag.",
            })}
          </p>
        )}

        {!loading && memories.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {memories.map((memory) => (
              <button
                key={memory.id}
                type="button"
                onClick={() => navigate(`/memory/${memory.id}`)}
                style={{
                  display: "flex",
                  gap: "14px",
                  alignItems: "center",
                  textAlign: "left",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "16px",
                  padding: "12px",
                  cursor: "pointer",
                  color: "#fff",
                }}
              >
                <div
                  style={{
                    width: "64px",
                    height: "80px",
                    borderRadius: "10px",
                    overflow: "hidden",
                    flexShrink: 0,
                    background: "linear-gradient(135deg, #2D1810, #E8742A)",
                  }}
                >
                  {memory.thumbnail_url ? (
                    <img
                      src={memory.thumbnail_url}
                      alt=""
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "22px",
                      }}
                    >
                      {memory.file_type === "audio" ? "🎙️" : "▶"}
                    </div>
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      fontWeight: 700,
                      fontSize: "15px",
                      marginBottom: "6px",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {memory.title || "A memory"}
                  </p>
                  {memory.description && (
                    <p
                      style={{
                        fontSize: "13px",
                        color: "rgba(255,255,255,0.55)",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {memory.description}
                    </p>
                  )}
                  {(memory.sparks_count || 0) > 0 && (
                    <p style={{ fontSize: "12px", color: "#E8742A", marginTop: "6px" }}>
                      ✦ {memory.sparks_count}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
