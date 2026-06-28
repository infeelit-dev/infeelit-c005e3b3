import { createClient } from "npm:@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-api-version",
};

const SELECT_FIELDS = `
  id,
  email,
  first_name,
  full_name,
  mode,
  onboarding_complete,
  manifesto_accepted,
  event_date,
  q1,
  q2,
  q3,
  luma_bio,
  linkedin_summary,
  visits,
  linkedin_url,
  whatsapp,
  suggestions_shown,
  match_count,
  checked_in_at
`;

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
    const { action, email, event_date } = body;

    // ============ ACTION: upsert ============
    if (action === "upsert") {
      const { email, first_name, data_consent, checked_in_at, event_date } = body;

      if (!email) {
        return new Response(JSON.stringify({ error: "Missing email" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: existing, error: checkError } = await supabase
        .from("attendees")
        .select("id, event_date")
        .eq("email", email)
        .maybeSingle();

      if (checkError) {
        return new Response(JSON.stringify({ error: checkError.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (existing) {
        const isNewEventDay = event_date && existing.event_date !== event_date;
        const updatePayload: Record<string, unknown> = {
          first_name: first_name,
          data_consent: data_consent,
          checked_in_at: checked_in_at,
          event_date: event_date,
        };

        if (isNewEventDay) {
          updatePayload.suggestions_shown = 0;
          updatePayload.match_count = 0;
        }

        const { error: updateError } = await supabase
          .from("attendees")
          .update(updatePayload)
          .eq("email", email);

        if (updateError) {
          return new Response(JSON.stringify({ error: updateError.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        return new Response(JSON.stringify({ success: true, action: "updated" }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } else {
        const { error: insertError } = await supabase.from("attendees").insert({
          email: email,
          first_name: first_name,
          data_consent: data_consent,
          checked_in_at: checked_in_at,
          event_date: event_date,
          onboarding_complete: false,
          manifesto_accepted: false,
          match_count: 0,
          suggestions_shown: 0,
        });

        if (insertError) {
          return new Response(JSON.stringify({ error: insertError.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        return new Response(JSON.stringify({ success: true, action: "inserted" }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // ============ ACTION: get ============
    if (action === "get" && email) {
      const { data, error } = await supabase.from("attendees").select(SELECT_FIELDS).eq("email", email).maybeSingle();

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

    // ============ ACTION: get-active ============
    if (action === "get-active") {
      if (!event_date) {
        return new Response(JSON.stringify({ error: "Missing event_date" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data, error } = await supabase
        .from("attendees")
        .select(SELECT_FIELDS)
        .eq("event_date", event_date)
        .eq("onboarding_complete", true);

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

    // ============ ACTION: update (with whitelist) ============
    if (action === "update") {
      const allowed = [
        "first_name",
        "last_name",
        "mode",
        "manifesto_accepted",
        "onboarding_complete",
        "q1",
        "q2",
        "q3",
        "data_consent",
        "checked_in_at",
        "event_date",
        "lounge_interests",
        "match_count",
        "suggestions_shown",
        "linkedin_summary",
        "building",
        "needs",
        "passion",
        "linkedin_url",
        "whatsapp",
      ];

      const updateData: Record<string, unknown> = {};
      for (const key of allowed) {
        if (body[key] !== undefined) {
          updateData[key] = body[key];
        }
      }

      if (!email) {
        return new Response(JSON.stringify({ error: "Missing email" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { error } = await supabase.from("attendees").update(updateData).eq("email", email);

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ============ ACTION: count ============
    if (action === "count") {
      if (!event_date) {
        return new Response(JSON.stringify({ error: "Missing event_date" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { count, error } = await supabase
        .from("attendees")
        .select("*", { count: "exact", head: true })
        .eq("event_date", event_date)
        .eq("onboarding_complete", true);

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ count }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ============ ACTION non reconnue ============
    return new Response(JSON.stringify({ error: "Invalid action. Allowed: upsert, get, get-active, update, count" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});