import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

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
    return new Response("Not found", { status: 404 });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data: memory } = await supabase
    .from("memories")
    .select("title, transcript_fr, transcript_en, thumbnail_url")
    .eq("id", memoryId)
    .eq("is_public", true)
    .single();

  if (!memory) {
    return new Response("Not found", { status: 404 });
  }

  const transcript = memory.transcript_fr || memory.transcript_en || "";
  const teaser = transcript
    ? transcript.slice(0, 100) + "..."
    : "A voice preserved forever on Infeelit";

  let thumbnailUrl: string | null = null;
  if (memory.thumbnail_url) {
    if (memory.thumbnail_url.startsWith("http")) {
      // Prefer signed URLs for private bucket; skip broken public URLs
      const pathMatch = memory.thumbnail_url.match(
        /\/storage\/v1\/object\/(?:public|sign)\/memories\/([^?]+)/,
      );
      if (pathMatch) {
        const { data } = await supabase.storage
          .from("memories")
          .createSignedUrl(decodeURIComponent(pathMatch[1]), 3600);
        thumbnailUrl = data?.signedUrl || null;
      } else {
        thumbnailUrl = memory.thumbnail_url;
      }
    } else {
      const { data } = await supabase.storage
        .from("memories")
        .createSignedUrl(memory.thumbnail_url, 3600);
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
