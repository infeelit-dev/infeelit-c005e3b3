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

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}

function mergeParticipantWithProfile(participant: Record<string, unknown>, profile: Record<string, unknown>) {
  return {
    id: participant.id,
    profile_id: profile.id,
    email: profile.email,
    first_name: profile.first_name,
    last_name: profile.last_name,
    full_name: [profile.first_name, profile.last_name].filter(Boolean).join(" ") || profile.first_name,
    mode: participant.mode,
    visits: profile.total_events_attended || 1,
    q1: participant.q1,
    q2: participant.q2,
    q3: participant.q3,
    luma_bio: participant.luma_bio,
    linkedin_summary: profile.linkedin_summary,
    linkedin_url: profile.linkedin_url,
    whatsapp: profile.whatsapp,
    suggestions_shown: participant.suggestions_shown,
    match_count: participant.match_count,
    onboarding_complete: participant.onboarding_complete,
    event_date: participant.event_date,
    checked_in_at: participant.checked_in_at,
  };
}

async function getActiveMerged(eventDate: string) {
  const merged: Record<string, unknown>[] = [];
  const seen = new Set<string>();

  const { data: participants, error: pErr } = await supabase
    .from("event_participants")
    .select("*, profiles(*)")
    .eq("event_date", eventDate)
    .eq("onboarding_complete", true);

  if (pErr) throw new Error(pErr.message);

  for (const row of participants || []) {
    const profile = row.profiles as Record<string, unknown>;
    if (!profile?.email) continue;
    seen.add(String(profile.email).toLowerCase());
    merged.push(mergeParticipantWithProfile(row, profile));
  }

  const { data: walkins, error: wErr } = await supabase
    .from("attendees")
    .select(SELECT_FIELDS)
    .eq("event_date", eventDate)
    .eq("onboarding_complete", true);

  if (wErr) throw new Error(wErr.message);

  for (const row of walkins || []) {
    const key = String(row.email || "").toLowerCase();
    if (!key || seen.has(key)) continue;
    merged.push(row);
  }

  return merged;
}

async function ensureWalkinProfile(email: string, firstName?: string) {
  const { data: existing } = await supabase.from("profiles").select("id").eq("email", email).maybeSingle();
  if (!existing) {
    await supabase.from("profiles").insert({
      email,
      first_name: firstName || null,
    });
  }
}

function normalizeMode(mode: unknown): string | undefined {
  if (mode === "hunt" || mode === "builder") return "builder";
  if (mode === "chill" || mode === "lounge") return "lounge";
  if (mode === "builder" || mode === "lounge") return mode;
  return undefined;
}

async function syncAttendeeFromProfile(profile: Record<string, unknown>, participant: Record<string, unknown>) {
  const email = String(profile.email || "").toLowerCase();
  if (!email) return;

  const payload: Record<string, unknown> = {
    email,
    first_name: profile.first_name,
    last_name: profile.last_name,
    full_name: [profile.first_name, profile.last_name].filter(Boolean).join(" ") || profile.first_name,
    mode: participant.mode,
    q1: participant.q1,
    q2: participant.q2,
    q3: participant.q3,
    linkedin_url: profile.linkedin_url,
    whatsapp: profile.whatsapp,
    linkedin_summary: profile.linkedin_summary,
    event_date: participant.event_date,
    onboarding_complete: participant.onboarding_complete,
    suggestions_shown: participant.suggestions_shown ?? 0,
    match_count: participant.match_count ?? 0,
    checked_in_at: participant.checked_in_at,
    visits: profile.total_events_attended || 1,
  };

  const { data: existing } = await supabase.from("attendees").select("id, event_date").eq("email", email).maybeSingle();
  if (existing) {
    if (participant.event_date && existing.event_date !== participant.event_date) {
      payload.suggestions_shown = 0;
      payload.match_count = 0;
    }
    await supabase.from("attendees").update(payload).eq("email", email);
  } else {
    await supabase.from("attendees").insert({ ...payload, manifesto_accepted: false, data_consent: true });
  }
}

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
    const normalizedEmail = email ? String(email).trim().toLowerCase() : "";

    if (action === "get-profile") {
      if (!normalizedEmail) return json({ error: "Missing email" }, 400);
      const { data: profile, error } = await supabase.from("profiles").select("*").eq("email", normalizedEmail).maybeSingle();
      if (error) return json({ error: error.message }, 500);
      let participant = null;
      if (profile) {
        const q = supabase.from("event_participants").select("*").eq("profile_id", profile.id);
        const { data: p } = event_date ? await q.eq("event_date", event_date).maybeSingle() : await q.order("event_date", { ascending: false }).limit(1).maybeSingle();
        participant = p;
      }
      return json({ profile, participant });
    }

    if (action === "create-profile") {
      if (!normalizedEmail) return json({ error: "Missing email" }, 400);
      const { data: profile, error } = await supabase
        .from("profiles")
        .upsert(
          {
            email: normalizedEmail,
            first_name: body.first_name,
            last_name: body.last_name,
            linkedin_url: body.linkedin_url,
            whatsapp: body.whatsapp,
            linkedin_summary: body.linkedin_summary,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "email" },
        )
        .select()
        .maybeSingle();
      if (error) return json({ error: error.message }, 500);
      return json({ success: true, profile });
    }

    if (action === "upsert-participant") {
      const evDate = body.event_date;
      if (!evDate) return json({ error: "Missing event_date" }, 400);

      let profile_id = body.profile_id as string | undefined;
      let profile: Record<string, unknown> | null = null;

      if (profile_id) {
        const { data, error: pErr } = await supabase.from("profiles").select("*").eq("id", profile_id).maybeSingle();
        if (pErr || !data) return json({ error: pErr?.message || "Profile not found" }, 404);
        profile = data;
      } else if (normalizedEmail) {
        const { data } = await supabase.from("profiles").select("*").eq("email", normalizedEmail).maybeSingle();
        if (data) {
          profile = data;
          profile_id = data.id as string;
        } else {
          const { data: attendee } = await supabase.from("attendees").select("first_name").eq("email", normalizedEmail).maybeSingle();
          const { data: created, error: createErr } = await supabase
            .from("profiles")
            .insert({ email: normalizedEmail, first_name: attendee?.first_name || null })
            .select()
            .maybeSingle();
          if (createErr) return json({ error: createErr.message }, 500);
          profile = created;
          profile_id = created?.id as string | undefined;
        }
      }

      if (!profile_id || !profile) {
        return json({ error: "Missing profile_id or email with existing profile" }, 400);
      }

      const fields: Record<string, unknown> = {
        profile_id,
        event_id: body.event_id || `gg-${evDate}`,
        event_date: evDate,
      };
      for (const k of ["q1", "q2", "q3", "luma_bio", "suggestions_shown", "match_count", "onboarding_complete", "checked_in_at"]) {
        if (body[k] !== undefined) fields[k] = body[k];
      }
      const mode = normalizeMode(body.mode);
      if (mode) fields.mode = mode;

      const { data: existing } = await supabase
        .from("event_participants")
        .select("id")
        .eq("profile_id", profile_id)
        .eq("event_date", evDate)
        .maybeSingle();
      let participant;
      if (existing) {
        const { data, error } = await supabase.from("event_participants").update(fields).eq("id", existing.id).select().maybeSingle();
        if (error) return json({ error: error.message }, 500);
        participant = data;
      } else {
        const { data, error } = await supabase
          .from("event_participants")
          .insert({
            ...fields,
            suggestions_shown: fields.suggestions_shown ?? 0,
            match_count: fields.match_count ?? 0,
            onboarding_complete: fields.onboarding_complete ?? false,
          })
          .select()
          .maybeSingle();
        if (error) return json({ error: error.message }, 500);
        participant = data;
        await supabase
          .from("profiles")
          .update({ total_events_attended: (Number(profile.total_events_attended) || 0) + 1 })
          .eq("id", profile_id);
      }

      if (body.q1 !== undefined || body.q2 !== undefined || body.q3 !== undefined) {
        const pq: Record<string, unknown> = {};
        if (body.q1 !== undefined) pq.q1 = body.q1;
        if (body.q2 !== undefined) pq.q2 = body.q2;
        if (body.q3 !== undefined) pq.q3 = body.q3;
        await supabase.from("profiles").update(pq).eq("id", profile_id);
      }

      if (participant) await syncAttendeeFromProfile(profile, participant);
      return json({ success: true, participant, profile });
    }

    if (action === "get-active-participants") {
      if (!event_date) return json({ error: "Missing event_date" }, 400);
      try {
        return json({ data: await getActiveMerged(event_date) });
      } catch (e) {
        return json({ error: (e as Error).message }, 500);
      }
    }

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

        await ensureWalkinProfile(String(email).trim().toLowerCase(), first_name);

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

        await ensureWalkinProfile(String(email).trim().toLowerCase(), first_name);

        return new Response(JSON.stringify({ success: true, action: "inserted" }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // ============ ACTION: get ============
    if (action === "get" && normalizedEmail) {
      if (event_date) {
        const { data: profile } = await supabase.from("profiles").select("*").eq("email", normalizedEmail).maybeSingle();
        if (profile) {
          const { data: participant } = await supabase.from("event_participants").select("*").eq("profile_id", profile.id).eq("event_date", event_date).maybeSingle();
          if (participant) return json({ data: mergeParticipantWithProfile(participant, profile) });
        }
      }
      const { data, error } = await supabase.from("attendees").select(SELECT_FIELDS).eq("email", normalizedEmail).maybeSingle();
      if (error) return json({ error: error.message }, 500);
      return json({ data });
    }

    if (action === "get-active") {
      if (!event_date) return json({ error: "Missing event_date" }, 400);
      try {
        return json({ data: await getActiveMerged(event_date) });
      } catch (e) {
        return json({ error: (e as Error).message }, 500);
      }
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

      if (!normalizedEmail) {
        return new Response(JSON.stringify({ error: "Missing email" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: profile } = await supabase.from("profiles").select("id").eq("email", normalizedEmail).maybeSingle();
      if (profile && event_date) {
        const pUpdate: Record<string, unknown> = {};
        for (const k of ["mode", "q1", "q2", "q3", "onboarding_complete", "suggestions_shown", "match_count", "checked_in_at"]) {
          if (body[k] !== undefined) pUpdate[k] = body[k];
        }
        if (body.q3 !== undefined) await supabase.from("profiles").update({ q3: body.q3 }).eq("id", profile.id);
        if (body.q1 !== undefined || body.q2 !== undefined) {
          const pq: Record<string, unknown> = {};
          if (body.q1 !== undefined) pq.q1 = body.q1;
          if (body.q2 !== undefined) pq.q2 = body.q2;
          await supabase.from("profiles").update(pq).eq("id", profile.id);
        }
        if (Object.keys(pUpdate).length > 0) {
          await supabase.from("event_participants").update(pUpdate).eq("profile_id", profile.id).eq("event_date", event_date);
        }
      }

      const { error } = await supabase.from("attendees").update(updateData).eq("email", normalizedEmail);

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
      try {
        const merged = await getActiveMerged(event_date);
        return new Response(JSON.stringify({ count: merged.length }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: (e as Error).message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
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