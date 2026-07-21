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
  last_name,
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

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed. Use POST." }, 405);
  }

  try {
    const body = await req.json();
    const { action, email, event_date } = body;
    const normalizedEmail = email ? String(email).trim().toLowerCase() : "";

    // ============ get-profile (attendees table) ============
    if (action === "get-profile") {
      if (!normalizedEmail) return json({ error: "Missing email" }, 400);
      const { data: profile, error } = await supabase
        .from("attendees")
        .select(SELECT_FIELDS)
        .eq("email", normalizedEmail)
        .maybeSingle();
      if (error) return json({ error: error.message }, 500);
      return json({ profile });
    }

    // ============ get-pre-matches (unused, with match person details) ============
    if (action === "get-pre-matches") {
      const { attendee_id, event_date: evDate } = body;
      if (!attendee_id || !evDate) return json({ error: "Missing attendee_id or event_date" }, 400);

      const { data: rows, error } = await supabase
        .from("pre_matches")
        .select("*")
        .eq("attendee_id", attendee_id)
        .eq("event_date", evDate)
        .eq("used", false)
        .order("confidence", { ascending: false });

      if (error) return json({ error: error.message }, 500);
      if (!rows?.length) return json({ pre_matches: [] });

      const matchIds = rows.map((r) => r.match_id);
      const { data: people, error: pErr } = await supabase
        .from("attendees")
        .select(SELECT_FIELDS)
        .in("id", matchIds);

      if (pErr) return json({ error: pErr.message }, 500);

      const byId = new Map((people || []).map((p) => [p.id, p]));
      const pre_matches = rows
        .map((row) => {
          const person = byId.get(row.match_id);
          if (!person) return null;
          return {
            id: row.id,
            match_id: row.match_id,
            confidence: row.confidence,
            bond_type: row.bond_type,
            resonance: row.resonance,
            ice_breaker: row.ice_breaker,
            for_match: row.for_match,
            person,
          };
        })
        .filter(Boolean);

      return json({ pre_matches });
    }

    // ============ mark-pre-matches-used ============
    if (action === "mark-pre-matches-used") {
      const { attendee_id, event_date: evDate, pre_match_ids } = body;
      if (!attendee_id || !evDate) return json({ error: "Missing attendee_id or event_date" }, 400);

      let query = supabase
        .from("pre_matches")
        .update({ used: true })
        .eq("attendee_id", attendee_id)
        .eq("event_date", evDate)
        .eq("used", false);

      if (Array.isArray(pre_match_ids) && pre_match_ids.length > 0) {
        query = query.in("id", pre_match_ids);
      }

      const { error } = await query;
      if (error) return json({ error: error.message }, 500);
      return json({ success: true });
    }

    // ============ upsert ============
    if (action === "upsert") {
      const { first_name, data_consent, checked_in_at, event_date: evDate } = body;

      if (!normalizedEmail) return json({ error: "Missing email" }, 400);

      const { data: existing, error: checkError } = await supabase
        .from("attendees")
        .select("id, event_date")
        .eq("email", normalizedEmail)
        .maybeSingle();

      if (checkError) return json({ error: checkError.message }, 500);

      if (existing) {
        const isNewEventDay = evDate && existing.event_date !== evDate;
        const updatePayload: Record<string, unknown> = {
          checked_in_at: checked_in_at,
          event_date: evDate,
        };
        if (first_name) updatePayload.first_name = first_name;
        if (data_consent !== undefined) updatePayload.data_consent = data_consent;
        if (isNewEventDay) {
          updatePayload.suggestions_shown = 0;
          updatePayload.match_count = 0;
        }

        const { error: updateError } = await supabase
          .from("attendees")
          .update(updatePayload)
          .eq("email", normalizedEmail);

        if (updateError) return json({ error: updateError.message }, 500);
        return json({ success: true, action: "updated" });
      }

      const { error: insertError } = await supabase.from("attendees").insert({
        email: normalizedEmail,
        first_name: first_name || null,
        data_consent: data_consent ?? true,
        checked_in_at: checked_in_at,
        event_date: evDate,
        onboarding_complete: false,
        manifesto_accepted: false,
        match_count: 0,
        suggestions_shown: 0,
      });

      if (insertError) return json({ error: insertError.message }, 500);
      return json({ success: true, action: "inserted" });
    }

    // ============ get ============
    if (action === "get" && normalizedEmail) {
      const { data, error } = await supabase
        .from("attendees")
        .select(SELECT_FIELDS)
        .eq("email", normalizedEmail)
        .maybeSingle();
      if (error) return json({ error: error.message }, 500);
      return json({ data });
    }

    // ============ get-active / get-active-participants ============
    if (action === "get-active" || action === "get-active-participants") {
      if (!event_date) return json({ error: "Missing event_date" }, 400);

      const { data, error } = await supabase
        .from("attendees")
        .select(SELECT_FIELDS)
        .eq("event_date", event_date)
        .or(
          "onboarding_complete.eq.true,linkedin_summary.not.is.null,luma_bio.not.is.null,q1.not.is.null",
        );

      if (error) return json({ error: error.message }, 500);
      return json({ data });
    }

    // ============ update ============
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
        "luma_bio",
      ];

      const updateData: Record<string, unknown> = {};
      for (const key of allowed) {
        if (body[key] !== undefined) updateData[key] = body[key];
      }

      if (!normalizedEmail) return json({ error: "Missing email" }, 400);

      const { error } = await supabase.from("attendees").update(updateData).eq("email", normalizedEmail);
      if (error) return json({ error: error.message }, 500);
      return json({ success: true });
    }

    // ============ count ============
    if (action === "count") {
      if (!event_date) return json({ error: "Missing event_date" }, 400);

      const { count, error } = await supabase
        .from("attendees")
        .select("*", { count: "exact", head: true })
        .eq("event_date", event_date)
        .eq("onboarding_complete", true);

      if (error) return json({ error: error.message }, 500);
      return json({ count });
    }

    return json({
      error:
        "Invalid action. Allowed: upsert, get, get-profile, get-pre-matches, mark-pre-matches-used, get-active, get-active-participants, update, count",
    }, 400);
  } catch (error) {
    console.error("Unexpected error:", error);
    return json({ error: "Internal server error" }, 500);
  }
});
