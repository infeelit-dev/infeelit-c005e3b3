import { createClient } from "npm:@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-api-version",
};

type AttendeeRow = {
  id: string;
  first_name?: string | null;
  mode?: string | null;
  q1?: string | null;
  q2?: string | null;
  event_date?: string | null;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed. Use POST." }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const { action, recipient_id, newcomer_id, resonance, why_now, event_date, pulse_id } = body;

    if (action === "process-newcomer") {
      if (!newcomer_id || !event_date) {
        return new Response(JSON.stringify({ error: "Missing newcomer_id or event_date" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: newcomer, error: newcomerError } = await supabase
        .from("attendees")
        .select("id, first_name, mode, q1, q2, event_date")
        .eq("id", newcomer_id)
        .maybeSingle();

      if (newcomerError || !newcomer) {
        return new Response(JSON.stringify({ error: newcomerError?.message || "Newcomer not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: recipients, error: recipientsError } = await supabase
        .from("attendees")
        .select("id, first_name, mode")
        .eq("event_date", event_date)
        .eq("onboarding_complete", true)
        .eq("mode", "builder")
        .neq("id", newcomer_id)
        .limit(50);

      if (recipientsError) {
        return new Response(JSON.stringify({ error: recipientsError.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const firstName = newcomer.first_name || "Someone";
      const whyNow =
        newcomer.q2?.trim() ||
        newcomer.q1?.trim() ||
        `${firstName} just finished onboarding and is ready to connect.`;
      const pulseResonance = `${firstName} just walked in — worth a look if you're still open tonight.`;

      let created = 0;
      for (const recipient of (recipients as AttendeeRow[]) || []) {
        const { error: insertError } = await supabase.from("pulses").insert({
          recipient_id: recipient.id,
          newcomer_id,
          event_date,
          confidence: 0.9,
          resonance: pulseResonance,
          why_now: whyNow.slice(0, 300),
          read: false,
        });

        if (!insertError) created++;
      }

      return new Response(JSON.stringify({ success: true, created }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "create") {
      if (!recipient_id || !newcomer_id || !event_date) {
        return new Response(
          JSON.stringify({ error: "Missing required fields: recipient_id, newcomer_id, event_date" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      const { data, error } = await supabase
        .from("pulses")
        .insert({
          recipient_id,
          newcomer_id,
          event_date,
          confidence: body.confidence ?? 0.9,
          resonance: resonance || null,
          why_now: why_now || null,
          read: false,
        })
        .select()
        .maybeSingle();

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ data }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "mark-read") {
      if (!pulse_id) {
        return new Response(JSON.stringify({ error: "Missing pulse_id" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data, error } = await supabase
        .from("pulses")
        .update({ read: true })
        .eq("id", pulse_id)
        .select()
        .maybeSingle();

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ data }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "get") {
      if (!recipient_id) {
        return new Response(JSON.stringify({ error: "Missing recipient_id" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data, error } = await supabase
        .from("pulses")
        .select("*")
        .eq("recipient_id", recipient_id)
        .eq("read", false)
        .order("created_at", { ascending: false });

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ data }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ error: "Invalid action. Allowed: process-newcomer, create, mark-read, get" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
