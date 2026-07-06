import { createClient } from "npm:@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-api-version",
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

type ProfileRow = {
  id: string;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  linkedin_url?: string | null;
  whatsapp?: string | null;
  linkedin_summary?: string | null;
  avatar_url?: string | null;
  q1?: string | null;
  q2?: string | null;
  q3?: string | null;
  total_events_attended?: number | null;
  member_since?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

type ParticipantRow = {
  id: string;
  profile_id: string;
  event_id: string;
  event_date: string;
  mode?: string | null;
  q1?: string | null;
  q2?: string | null;
  q3?: string | null;
  luma_bio?: string | null;
  suggestions_shown?: number | null;
  match_count?: number | null;
  onboarding_complete?: boolean | null;
  checked_in_at?: string | null;
  created_at?: string | null;
};

type AttendeeRow = {
  id: string;
  email?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  full_name?: string | null;
  mode?: string | null;
  onboarding_complete?: boolean | null;
  manifesto_accepted?: boolean | null;
  event_date?: string | null;
  q1?: string | null;
  q2?: string | null;
  q3?: string | null;
  luma_bio?: string | null;
  linkedin_summary?: string | null;
  visits?: number | null;
  linkedin_url?: string | null;
  whatsapp?: string | null;
  suggestions_shown?: number | null;
  match_count?: number | null;
  checked_in_at?: string | null;
};

type MergedAttendee = AttendeeRow & {
  profile_id?: string;
  participant_id?: string;
};

type ParticipantWithProfile = ParticipantRow & {
  profiles: ProfileRow | null;
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function mergeParticipantWithProfile(
  profile: ProfileRow,
  participant: ParticipantRow,
  attendee?: AttendeeRow | null,
): MergedAttendee {
  const firstName = profile.first_name ?? attendee?.first_name ?? null;
  const lastName = profile.last_name ?? attendee?.last_name ?? null;
  const fullName =
    [firstName, lastName].filter(Boolean).join(" ") || attendee?.full_name || null;

  return {
    id: attendee?.id ?? participant.id,
    email: profile.email,
    first_name: firstName,
    full_name: fullName,
    mode: participant.mode ?? attendee?.mode ?? null,
    onboarding_complete: participant.onboarding_complete ?? attendee?.onboarding_complete ?? false,
    manifesto_accepted: attendee?.manifesto_accepted ?? false,
    event_date: participant.event_date ?? attendee?.event_date ?? null,
    q1: participant.q1 ?? profile.q1 ?? attendee?.q1 ?? null,
    q2: participant.q2 ?? profile.q2 ?? attendee?.q2 ?? null,
    q3: participant.q3 ?? profile.q3 ?? attendee?.q3 ?? null,
    luma_bio: participant.luma_bio ?? attendee?.luma_bio ?? null,
    linkedin_summary: profile.linkedin_summary ?? attendee?.linkedin_summary ?? null,
    visits: attendee?.visits ?? profile.total_events_attended ?? 0,
    linkedin_url: profile.linkedin_url ?? attendee?.linkedin_url ?? null,
    whatsapp: profile.whatsapp ?? attendee?.whatsapp ?? null,
    suggestions_shown: participant.suggestions_shown ?? attendee?.suggestions_shown ?? 0,
    match_count: participant.match_count ?? attendee?.match_count ?? 0,
    checked_in_at: participant.checked_in_at ?? attendee?.checked_in_at ?? null,
    profile_id: profile.id,
    participant_id: participant.id,
  };
}

async function getProfileByEmail(email: string): Promise<ProfileRow | null> {
  const normalized = email.toLowerCase();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("email", normalized)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as ProfileRow | null;
}

async function getAttendeeByEmail(email: string): Promise<AttendeeRow | null> {
  const normalized = email.toLowerCase();
  const { data, error } = await supabase
    .from("attendees")
    .select(SELECT_FIELDS)
    .eq("email", normalized)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as AttendeeRow | null;
}

async function getParticipantForProfile(
  profileId: string,
  eventDate?: string,
): Promise<ParticipantRow | null> {
  if (eventDate) {
    const { data, error } = await supabase
      .from("event_participants")
      .select("*")
      .eq("profile_id", profileId)
      .eq("event_date", eventDate)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data as ParticipantRow | null;
  }

  const { data, error } = await supabase
    .from("event_participants")
    .select("*")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as ParticipantRow | null;
}

async function syncAttendeeFromProfile(
  profile: ProfileRow,
  participant: ParticipantRow,
): Promise<AttendeeRow | null> {
  const email = profile.email.toLowerCase();
  const { data: existing, error: checkError } = await supabase
    .from("attendees")
    .select("id, event_date, manifesto_accepted, visits")
    .eq("email", email)
    .maybeSingle();

  if (checkError) throw new Error(checkError.message);

  const firstName = profile.first_name ?? null;
  const lastName = profile.last_name ?? null;
  const payload: Record<string, unknown> = {
    email,
    first_name: firstName,
    last_name: lastName,
    full_name: [firstName, lastName].filter(Boolean).join(" ") || null,
    linkedin_url: profile.linkedin_url ?? null,
    whatsapp: profile.whatsapp ?? null,
    linkedin_summary: profile.linkedin_summary ?? null,
    q1: participant.q1 ?? profile.q1 ?? null,
    q2: participant.q2 ?? profile.q2 ?? null,
    q3: participant.q3 ?? profile.q3 ?? null,
    mode: participant.mode ?? null,
    onboarding_complete: participant.onboarding_complete ?? false,
    event_date: participant.event_date,
    luma_bio: participant.luma_bio ?? null,
    suggestions_shown: participant.suggestions_shown ?? 0,
    match_count: participant.match_count ?? 0,
    checked_in_at: participant.checked_in_at ?? null,
  };

  if (existing) {
    const isNewEventDay = participant.event_date && existing.event_date !== participant.event_date;
    if (isNewEventDay) {
      payload.suggestions_shown = participant.suggestions_shown ?? 0;
      payload.match_count = participant.match_count ?? 0;
    }

    const { data, error } = await supabase
      .from("attendees")
      .update(payload)
      .eq("email", email)
      .select(SELECT_FIELDS)
      .single();

    if (error) throw new Error(error.message);
    return data as AttendeeRow;
  }

  const { data, error } = await supabase
    .from("attendees")
    .insert({
      ...payload,
      manifesto_accepted: false,
      data_consent: true,
      onboarding_complete: participant.onboarding_complete ?? false,
      match_count: participant.match_count ?? 0,
      suggestions_shown: participant.suggestions_shown ?? 0,
      visits: profile.total_events_attended ?? 0,
    })
    .select(SELECT_FIELDS)
    .single();

  if (error) throw new Error(error.message);
  return data as AttendeeRow;
}

async function getActiveMerged(eventDate: string): Promise<MergedAttendee[]> {
  const { data: participants, error: participantsError } = await supabase
    .from("event_participants")
    .select("*, profiles(*)")
    .eq("event_date", eventDate)
    .eq("onboarding_complete", true);

  if (participantsError) throw new Error(participantsError.message);

  const merged: MergedAttendee[] = [];
  const seenEmails = new Set<string>();

  for (const row of (participants as ParticipantWithProfile[]) || []) {
    const profile = row.profiles;
    if (!profile?.email) continue;

    const email = profile.email.toLowerCase();
    seenEmails.add(email);

    const attendee = await syncAttendeeFromProfile(profile, row);
    merged.push(mergeParticipantWithProfile(profile, row, attendee));
  }

  const { data: walkIns, error: walkInsError } = await supabase
    .from("attendees")
    .select(SELECT_FIELDS)
    .eq("event_date", eventDate)
    .eq("onboarding_complete", true);

  if (walkInsError) throw new Error(walkInsError.message);

  for (const attendee of (walkIns as AttendeeRow[]) || []) {
    const email = (attendee.email || "").toLowerCase();
    if (!email || seenEmails.has(email)) continue;
    seenEmails.add(email);
    merged.push(attendee);
  }

  return merged;
}

const ATTENDEE_UPDATE_ALLOWED = [
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
] as const;

const PROFILE_UPDATE_ALLOWED = [
  "first_name",
  "last_name",
  "linkedin_url",
  "whatsapp",
  "linkedin_summary",
  "q1",
  "q2",
  "q3",
] as const;

const PARTICIPANT_UPDATE_ALLOWED = [
  "mode",
  "q1",
  "q2",
  "q3",
  "luma_bio",
  "onboarding_complete",
  "checked_in_at",
  "event_date",
  "match_count",
  "suggestions_shown",
] as const;

function pickAllowed(body: Record<string, unknown>, allowed: readonly string[]) {
  const updateData: Record<string, unknown> = {};
  for (const key of allowed) {
    if (body[key] !== undefined) {
      updateData[key] = body[key];
    }
  }
  return updateData;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed. Use POST." }, 405);
  }

  try {
    const body = await req.json();
    const { action, email, event_date: eventDate } = body;

    // ============ ACTION: upsert (legacy attendees) ============
    if (action === "upsert") {
      const {
        email: upsertEmail,
        first_name,
        data_consent,
        checked_in_at,
        event_date,
      } = body;

      if (!upsertEmail) {
        return jsonResponse({ error: "Missing email" }, 400);
      }

      const normalizedEmail = upsertEmail.toLowerCase();
      const { data: existing, error: checkError } = await supabase
        .from("attendees")
        .select("id, event_date")
        .eq("email", normalizedEmail)
        .maybeSingle();

      if (checkError) {
        return jsonResponse({ error: checkError.message }, 500);
      }

      if (existing) {
        const isNewEventDay = event_date && existing.event_date !== event_date;
        const updatePayload: Record<string, unknown> = {
          first_name,
          data_consent,
          checked_in_at,
          event_date,
        };

        if (isNewEventDay) {
          updatePayload.suggestions_shown = 0;
          updatePayload.match_count = 0;
        }

        const { error: updateError } = await supabase
          .from("attendees")
          .update(updatePayload)
          .eq("email", normalizedEmail);

        if (updateError) {
          return jsonResponse({ error: updateError.message }, 500);
        }

        return jsonResponse({ success: true, action: "updated" });
      }

      const { error: insertError } = await supabase.from("attendees").insert({
        email: normalizedEmail,
        first_name,
        data_consent,
        checked_in_at,
        event_date,
        onboarding_complete: false,
        manifesto_accepted: false,
        match_count: 0,
        suggestions_shown: 0,
      });

      if (insertError) {
        return jsonResponse({ error: insertError.message }, 500);
      }

      return jsonResponse({ success: true, action: "inserted" });
    }

    // ============ ACTION: get ============
    if (action === "get" && email) {
      const normalizedEmail = email.toLowerCase();
      const profile = await getProfileByEmail(normalizedEmail);

      if (profile) {
        const participant = await getParticipantForProfile(profile.id, eventDate);
        if (participant) {
          const attendee = await getAttendeeByEmail(normalizedEmail);
          const synced = attendee ?? (await syncAttendeeFromProfile(profile, participant));
          return jsonResponse({
            data: mergeParticipantWithProfile(profile, participant, synced),
          });
        }
      }

      const { data, error } = await supabase
        .from("attendees")
        .select(SELECT_FIELDS)
        .eq("email", normalizedEmail)
        .maybeSingle();

      if (error) {
        return jsonResponse({ error: error.message }, 500);
      }

      return jsonResponse({ data });
    }

    // ============ ACTION: get-active ============
    if (action === "get-active") {
      if (!eventDate) {
        return jsonResponse({ error: "Missing event_date" }, 400);
      }

      const data = await getActiveMerged(eventDate);
      return jsonResponse({ data });
    }

    // ============ ACTION: get-active-participants ============
    if (action === "get-active-participants") {
      if (!eventDate) {
        return jsonResponse({ error: "Missing event_date" }, 400);
      }

      const data = await getActiveMerged(eventDate);
      return jsonResponse({ data });
    }

    // ============ ACTION: update ============
    if (action === "update") {
      if (!email) {
        return jsonResponse({ error: "Missing email" }, 400);
      }

      const normalizedEmail = email.toLowerCase();
      const attendeeUpdate = pickAllowed(body, ATTENDEE_UPDATE_ALLOWED);

      const { error: attendeeError } = await supabase
        .from("attendees")
        .update(attendeeUpdate)
        .eq("email", normalizedEmail);

      if (attendeeError) {
        return jsonResponse({ error: attendeeError.message }, 500);
      }

      const profile = await getProfileByEmail(normalizedEmail);
      if (profile) {
        const profileUpdate = pickAllowed(body, PROFILE_UPDATE_ALLOWED);
        if (Object.keys(profileUpdate).length > 0) {
          const { error: profileError } = await supabase
            .from("profiles")
            .update({ ...profileUpdate, updated_at: new Date().toISOString() })
            .eq("id", profile.id);

          if (profileError) {
            return jsonResponse({ error: profileError.message }, 500);
          }
        }

        const attendee = await getAttendeeByEmail(normalizedEmail);
        const participantEventDate =
          (body.event_date as string | undefined) ?? attendee?.event_date ?? eventDate;
        const participant = await getParticipantForProfile(profile.id, participantEventDate);

        if (participant) {
          const participantUpdate = pickAllowed(body, PARTICIPANT_UPDATE_ALLOWED);
          if (Object.keys(participantUpdate).length > 0) {
            const { data: updatedParticipant, error: participantError } = await supabase
              .from("event_participants")
              .update(participantUpdate)
              .eq("id", participant.id)
              .select("*")
              .single();

            if (participantError) {
              return jsonResponse({ error: participantError.message }, 500);
            }

            await syncAttendeeFromProfile(profile, updatedParticipant as ParticipantRow);
          }
        }
      }

      return jsonResponse({ success: true });
    }

    // ============ ACTION: count ============
    if (action === "count") {
      if (!eventDate) {
        return jsonResponse({ error: "Missing event_date" }, 400);
      }

      const merged = await getActiveMerged(eventDate);
      return jsonResponse({ count: merged.length });
    }

    // ============ ACTION: create-profile ============
    if (action === "create-profile") {
      const {
        email: profileEmail,
        first_name,
        last_name,
        linkedin_url,
        whatsapp,
        linkedin_summary,
        avatar_url,
        q1,
        q2,
        q3,
      } = body;

      if (!profileEmail) {
        return jsonResponse({ error: "Missing email" }, 400);
      }

      const normalizedEmail = profileEmail.toLowerCase();
      const { data: profile, error } = await supabase
        .from("profiles")
        .insert({
          email: normalizedEmail,
          first_name: first_name ?? null,
          last_name: last_name ?? null,
          linkedin_url: linkedin_url ?? null,
          whatsapp: whatsapp ?? null,
          linkedin_summary: linkedin_summary ?? null,
          avatar_url: avatar_url ?? null,
          q1: q1 ?? null,
          q2: q2 ?? null,
          q3: q3 ?? null,
        })
        .select("*")
        .single();

      if (error) {
        return jsonResponse({ error: error.message }, 500);
      }

      return jsonResponse({ profile });
    }

    // ============ ACTION: get-profile ============
    if (action === "get-profile") {
      if (!email) {
        return jsonResponse({ error: "Missing email" }, 400);
      }

      const normalizedEmail = email.toLowerCase();
      const profile = await getProfileByEmail(normalizedEmail);

      if (!profile) {
        return jsonResponse({ profile: null, participant: null });
      }

      const participant = await getParticipantForProfile(profile.id, eventDate);
      return jsonResponse({ profile, participant });
    }

    // ============ ACTION: upsert-participant ============
    if (action === "upsert-participant") {
      const {
        profile_id,
        event_id,
        event_date,
        checked_in_at,
        mode,
        q1,
        q2,
        q3,
        luma_bio,
        onboarding_complete,
      } = body;

      if (!profile_id || !event_id || !event_date) {
        return jsonResponse({ error: "Missing profile_id, event_id, or event_date" }, 400);
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", profile_id)
        .maybeSingle();

      if (profileError) {
        return jsonResponse({ error: profileError.message }, 500);
      }

      if (!profile) {
        return jsonResponse({ error: "Profile not found" }, 404);
      }

      const { data: existingParticipant, error: existingError } = await supabase
        .from("event_participants")
        .select("*")
        .eq("profile_id", profile_id)
        .eq("event_date", event_date)
        .maybeSingle();

      if (existingError) {
        return jsonResponse({ error: existingError.message }, 500);
      }

      let participant: ParticipantRow;

      if (existingParticipant) {
        const updatePayload: Record<string, unknown> = {
          event_id,
        };
        if (checked_in_at !== undefined) updatePayload.checked_in_at = checked_in_at;
        if (mode !== undefined) updatePayload.mode = mode;
        if (q1 !== undefined) updatePayload.q1 = q1;
        if (q2 !== undefined) updatePayload.q2 = q2;
        if (q3 !== undefined) updatePayload.q3 = q3;
        if (luma_bio !== undefined) updatePayload.luma_bio = luma_bio;
        if (onboarding_complete !== undefined) {
          updatePayload.onboarding_complete = onboarding_complete;
        }

        const { data, error } = await supabase
          .from("event_participants")
          .update(updatePayload)
          .eq("id", existingParticipant.id)
          .select("*")
          .single();

        if (error) {
          return jsonResponse({ error: error.message }, 500);
        }

        participant = data as ParticipantRow;
      } else {
        const { data, error } = await supabase
          .from("event_participants")
          .insert({
            profile_id,
            event_id,
            event_date,
            checked_in_at: checked_in_at ?? null,
            mode: mode ?? null,
            q1: q1 ?? null,
            q2: q2 ?? null,
            q3: q3 ?? null,
            luma_bio: luma_bio ?? null,
            onboarding_complete: onboarding_complete ?? false,
            suggestions_shown: 0,
            match_count: 0,
          })
          .select("*")
          .single();

        if (error) {
          return jsonResponse({ error: error.message }, 500);
        }

        participant = data as ParticipantRow;
      }

      const attendee = await syncAttendeeFromProfile(profile as ProfileRow, participant);
      return jsonResponse({
        success: true,
        participant,
        attendee,
      });
    }

    return jsonResponse(
      {
        error:
          "Invalid action. Allowed: upsert, get, get-active, update, count, get-profile, create-profile, upsert-participant, get-active-participants",
      },
      400,
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return jsonResponse({ error: message }, 500);
  }
});
