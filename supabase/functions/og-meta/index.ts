import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

serve(async (req) => {
  const url = new URL(req.url);
  const memoryId = url.searchParams.get("id");

  if (!memoryId) {
    return new Response("Missing id", { status: 400 });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");

  if (!supabaseUrl || !(serviceKey || anonKey)) {
    return new Response("Server misconfigured", { status: 500 });
  }

  const supabase = createClient(supabaseUrl, serviceKey || anonKey!);

  // Select only columns known to exist on production memories table
  const { data: memory, error } = await supabase
    .from("memories")
    .select(
      "title, description, thumbnail_url, is_public, question_fr, question_en, question_ar",
    )
    .eq("id", memoryId)
    .maybeSingle();

  if (error) {
    console.error("og-meta query error:", error);
    return new Response(`Query failed: ${error.message}`, { status: 500 });
  }

  if (!memory || memory.is_public !== true) {
    return new Response("Not found", { status: 404 });
  }

  const teaserSource =
    memory.description ||
    memory.question_fr ||
    memory.question_en ||
    memory.question_ar ||
    "";
  const teaser = teaserSource
    ? String(teaserSource).slice(0, 100) + (String(teaserSource).length > 100 ? "..." : "")
    : "A voice preserved forever on Infeelit";

  let thumbnailUrl: string | null = null;
  if (memory.thumbnail_url) {
    if (memory.thumbnail_url.startsWith("http")) {
      const pathMatch = memory.thumbnail_url.match(
        /\/storage\/v1\/object\/(?:public|sign)\/memories\/([^?]+)/,
      );
      if (pathMatch) {
        const { data } = await supabase.storage
          .from("memories")
          .createSignedUrl(decodeURIComponent(pathMatch[1]), 86400);
        thumbnailUrl = data?.signedUrl || null;
      } else {
        thumbnailUrl = memory.thumbnail_url;
      }
    } else {
      const { data } = await supabase.storage
        .from("memories")
        .createSignedUrl(memory.thumbnail_url, 86400);
      thumbnailUrl = data?.signedUrl || null;
    }
  }

  const ogImage = thumbnailUrl || "https://infeelit.com/infeelit-logo.png";
  const title = escapeHtml(memory.title || "A memory on Infeelit");
  const description = escapeHtml(teaser);
  const image = escapeHtml(ogImage);
  const pageUrl = `https://infeelit.com/memory/${encodeURIComponent(memoryId)}`;

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title} — Infeelit</title>
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${image}">
  <meta property="og:url" content="${pageUrl}">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="Infeelit">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${image}">
  <meta http-equiv="refresh" content="0;url=${pageUrl}">
  <link rel="canonical" href="${pageUrl}">
</head>
<body>
  <p>Redirecting to Infeelit...</p>
  <p><a href="${pageUrl}">Continue</a></p>
</body>
</html>`;

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
});
