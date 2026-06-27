import { createClient } from "npm:@supabase/supabase-js@2.49.1";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { memory_id, file_url, title } = await req.json();

    if (!memory_id) {
      return new Response(JSON.stringify({ error: "memory_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_KEY!);

    await supabase.from("memories").update({ translation_status: "processing" }).eq("id", memory_id);

    let originalTranscript = title || "";

    if (file_url && OPENAI_API_KEY) {
      try {
        const { data: fileData, error: fileError } = await supabase.storage.from("memories").download(file_url);

        if (!fileError && fileData) {
          const ext = file_url.split(".").pop()?.toLowerCase() || "webm";
          const formData = new FormData();
          formData.append("file", fileData, `audio.${ext}`);
          formData.append("model", "whisper-1");
          formData.append("response_format", "text");

          const whisperResponse = await fetch("https://api.openai.com/v1/audio/transcriptions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${OPENAI_API_KEY}`,
            },
            body: formData,
          });

          if (whisperResponse.ok) {
            const transcriptText = await whisperResponse.text();
            if (transcriptText && transcriptText.trim()) {
              originalTranscript = transcriptText.trim();
            }
          }
        }
      } catch (whisperError) {
        console.error("Whisper failed, using title as fallback:", whisperError);
      }
    }

    if (!ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY not configured");
    }

    const claudeResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: `You are a translation assistant for Infeelit, an app that preserves family memories.

Translate the following memory text into French, English, and Arabic.
Preserve the warmth, emotion, and personal tone.
Keep proper nouns and names unchanged.
For Arabic, use natural warm Modern Standard Arabic.

Text to translate:
"${originalTranscript}"

Respond ONLY with valid JSON, no markdown, no backticks:
{
  "detected_lang": "fr" or "en" or "ar" or "other",
  "fr": "French translation",
  "en": "English translation",
  "ar": "Arabic translation"
}`,
          },
        ],
      }),
    });

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
      JSON.stringify({
        success: true,
        transcript: originalTranscript,
        translations,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    try {
      const body = await req.clone().json().catch(() => ({}));
      if (body.memory_id && SUPABASE_URL && SUPABASE_SERVICE_KEY) {
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
        await supabase.from("memories").update({ translation_status: "error" }).eq("id", body.memory_id);
      }
    } catch {
      /* ignore cleanup errors */
    }

    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
