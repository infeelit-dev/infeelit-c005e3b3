import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function normalize(s: string) {
  return s.replace(/\s+/g, " ").trim();
}

function verbatimInTranscript(sentence: string, transcript: string): string | null {
  const s = normalize(sentence).replace(/^["«»""]+|["«»""]+$/g, "");
  const t = normalize(transcript);
  if (!s || s.length < 8) return null;
  if (t.includes(s)) return s;
  const folded = (x: string) => x.toLowerCase();
  const i = folded(t).indexOf(folded(s));
  if (i >= 0) return t.slice(i, i + s.length);
  return null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_KEY!);
  let answerId = "";

  try {
    const body = await req.json();
    answerId = body.answer_id;
    if (!answerId) {
      return new Response(JSON.stringify({ error: "answer_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: answer, error } = await supabase
      .from("interview_answers")
      .select("id, media_url")
      .eq("id", answerId)
      .maybeSingle();

    if (error || !answer?.media_url) {
      throw new Error("answer not found");
    }

    await supabase.from("interview_answers").update({ transcript_status: "pending" }).eq("id", answerId);

    let transcript = "";
    if (GROQ_API_KEY) {
      const { data: fileData, error: fileError } = await supabase.storage.from("interview-media").download(answer.media_url);
      if (!fileError && fileData) {
        const formData = new FormData();
        const name = answer.media_url.split("/").pop() || "take.webm";
        formData.append("file", fileData, name);
        formData.append("model", "whisper-large-v3");
        formData.append("response_format", "text");
        const whisperResponse = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
          method: "POST",
          headers: { Authorization: `Bearer ${GROQ_API_KEY}` },
          body: formData,
        });
        if (whisperResponse.ok) {
          const text = await whisperResponse.text();
          if (text?.trim()) transcript = text.trim();
        }
      }
    }

    if (!transcript) {
      await supabase
        .from("interview_answers")
        .update({ transcript_status: "failed", strong_sentence: null })
        .eq("id", answerId);
      return new Response(JSON.stringify({ success: false, transcript: null }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let extracted: string | null = null;
    const extractPrompt = `From this transcript, copy ONE sentence VERBATIM that is the strongest line the speaker said.
Rules:
- Copy characters exactly as in the transcript
- No rewriting, no summarizing
- If none is a full sentence, return null

Transcript:
${transcript}

Respond ONLY with JSON: {"sentence": "exact sentence" } or {"sentence": null}`;

    if (OPENAI_API_KEY) {
      const r = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          temperature: 0,
          messages: [{ role: "user", content: extractPrompt }],
        }),
      });
      if (r.ok) {
        const data = await r.json();
        const raw = data.choices?.[0]?.message?.content || "{}";
        const match = String(raw).match(/\{[\s\S]*\}/);
        const parsed = JSON.parse(match ? match[0] : "{}");
        extracted = verbatimInTranscript(parsed.sentence || "", transcript);
      }
    } else if (ANTHROPIC_API_KEY) {
      const r = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 256,
          messages: [{ role: "user", content: extractPrompt }],
        }),
      });
      if (r.ok) {
        const data = await r.json();
        const raw = data.content?.[0]?.text || "{}";
        const match = String(raw).match(/\{[\s\S]*\}/);
        const parsed = JSON.parse(match ? match[0] : "{}");
        extracted = verbatimInTranscript(parsed.sentence || "", transcript);
      }
    }

    await supabase
      .from("interview_answers")
      .update({
        transcript,
        strong_sentence: extracted,
        transcript_status: "done",
      })
      .eq("id", answerId);

    return new Response(JSON.stringify({ success: true, transcript, strong_sentence: extracted }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    if (answerId) {
      await supabase.from("interview_answers").update({ transcript_status: "failed" }).eq("id", answerId);
    }
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
