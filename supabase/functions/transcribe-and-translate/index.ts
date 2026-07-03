import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const { memory_id, file_url, title } = await req.json();

  if (!memory_id) {
    return new Response(
      JSON.stringify({ error: "memory_id required" }),
      { status: 400, headers: corsHeaders }
    );
  }

  const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_KEY!);

  await supabase
    .from("memories")
    .update({ translation_status: "processing" })
    .eq("id", memory_id);

  try {
    let originalTranscript = title || "";

    if (file_url && GROQ_API_KEY) {
      try {
        const { data: fileData, error: fileError } = await supabase.storage
          .from("memories")
          .download(file_url);

        if (!fileError && fileData) {
          const formData = new FormData();
          formData.append("file", fileData, "audio.webm");
          formData.append("model", "whisper-large-v3");
          formData.append("response_format", "text");

          const whisperResponse = await fetch(
            "https://api.groq.com/openai/v1/audio/transcriptions",
            {
              method: "POST",
              headers: { "Authorization": `Bearer ${GROQ_API_KEY}` },
              body: formData,
            }
          );

          if (whisperResponse.ok) {
            const text = await whisperResponse.text();
            if (text?.trim()) originalTranscript = text.trim();
          }
        }
      } catch (err) {
        console.error("Groq Whisper failed:", err);
      }
    }

    const claudeResponse = await fetch(
      "https://api.anthropic.com/v1/messages",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": ANTHROPIC_API_KEY!,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 1024,
          messages: [{
            role: "user",
            content: `Translate this memory text into French, English, and Arabic.
Keep the emotional and warm tone. Keep names unchanged.

Text: "${originalTranscript}"

Respond ONLY with valid JSON:
{
  "detected_lang": "fr" or "en" or "ar" or "other",
  "fr": "French translation",
  "en": "English translation",
  "ar": "Arabic translation"
}`
          }]
        })
      }
    );

    const claudeData = await claudeResponse.json();
    const content = claudeData.content?.[0]?.text || "{}";

    let translations: Record<string, string> = {};
    try {
      translations = JSON.parse(content);
    } catch {
      const match = content.match(/\{[\s\S]*\}/);
      if (match) translations = JSON.parse(match[0]);
    }

    await supabase
      .from("memories")
      .update({
        transcript: originalTranscript,
        detected_lang: translations.detected_lang || "unknown",
        transcript_fr: translations.fr || null,
        transcript_en: translations.en || null,
        transcript_ar: translations.ar || null,
        translation_status: "done",
      })
      .eq("id", memory_id);

    return new Response(
      JSON.stringify({ success: true, transcript: originalTranscript }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    await supabase
      .from("memories")
      .update({ translation_status: "error" })
      .eq("id", memory_id);

    return new Response(
      JSON.stringify({ error: String(error) }),
      { status: 500, headers: corsHeaders }
    );
  }
});
