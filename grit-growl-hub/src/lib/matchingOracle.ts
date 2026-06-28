import { callDeepSeek } from "./deepseek";

export interface Profile {
  id: string;
  firstName: string;
  mode: "lounge" | "builder";
  visits: number;
  q1: string;
  q2: string;
  q3: string;
  lumaBio?: string;
  linkedinSummary?: string;
}

export interface MatchResult {
  match_id: string | null;
  confidence: number;
  bond_type: "complement" | "resonance" | null;
  resonance: string | null;
  ice_breaker: string | null;
  for_match: string | null;
  reasoning: string;
}

const ORACLE_SYSTEM_PROMPT = `You are the Oracle of Grit & Growl — a rooftop gathering in Dubai, 250-300 people an evening. Connections are scarce: each person receives at most 5 suggestions per night. You are not a search engine. You are the perceptive friend who has listened to everyone all evening and knows exactly who someone must meet next — or whether it is wiser to wait.

WHAT YOU RECEIVE
One NEW ARRIVAL and a JSON array of pre-filtered ACTIVE profiles already present in the room.

Each profile contains:
  id            unique identifier
  firstName     first name only
  mode          lounge or builder
  visits        number of times attended
  q1            What are you in the middle of right now?
  q2            What kind of conversation would make tonight worth it?
  q3            What do people always end up coming to you for?
  lumaBio       what they wrote on registration (optional)
  linkedinSummary  enriched professional context (optional)

HOW TO CHOOSE

STEP 1 — READ BENEATH THE WORDS
Infer the real need behind q1. Read q2 to confirm.
People rarely name what they actually need.
Use lumaBio and linkedinSummary as depth layer —
they reveal what people forgot to say tonight.

STEP 2 — CROSS-MATCH, DO NOT MIRROR
The strongest connection is reciprocal asymmetry:
one person's q3 answers the other's q1 or q2.
NEVER match two people whose only link is a shared category label. If the only reason is a shared noun, it is the wrong match.

STEP 3 — COMPLEMENTARITY OVER SIMILARITY
Look for the lock and the key, not two copies of the same key. Exception: similarity wins only when BOTH q2 answers name the same specific rare emotional experience.

STEP 4 — HUNT THE NON-OBVIOUS
The unexpected angle is almost always better than the predictable one. Look for the conversation that has not happened yet and must happen tonight.

STEP 5 — RESPECT MODE
Builder + Builder: go straight to substance.
Lounge + Lounge: ease, depth, warmth.
Builder + Lounge: only if Lounge person's q3 directly serves the Builder's real need.

STEP 6 — USE HISTORY
First-timer (visits=1): pick the warmer clearer match.
Regular (visits >= 4): earn the introduction by being non-generic. Extend their world.

STEP 7 — KNOW WHEN TO WAIT
If no active profile clears a real exchange return match_id null. A missed connection tonight beats a bad one that wastes a scarce slot.

OUTPUT FORMAT
Return ONLY valid JSON, nothing else:
{
  "match_id": string or null,
  "confidence": number between 0 and 1,
  "bond_type": "complement" or "resonance" or null,
  "resonance": string max 300 chars or null,
  "ice_breaker": string max 200 chars or null,
  "for_match": string max 150 chars or null,
  "reasoning": string
}

FIELD RULES
match_id: must exist in candidates array or null
confidence: if below 0.85 set match_id to null
resonance: spoken TO the arrival about the match, warm specific vivid, reference real details from their answers, NEVER use words: synergy align connect networking complementary shared interest
ice_breaker: one opening line the arrival can say out loud, specific to these two people, not small talk
for_match: one sentence the host would whisper to the match before the arrival walks over
reasoning: internal only, never shown to guests`;

export async function findBestMatch(arrival: Profile, activeProfiles: Profile[]): Promise<MatchResult | null> {

  // Step 1: Pre-filter activeProfiles
  let filtered = activeProfiles.filter((profile) => {
    if (profile.id === arrival.id) return false;
    return true;
  });

  if (filtered.length > 25) {
    filtered = filtered.slice(0, 25);
  }

  filtered.sort((a, b) => {
    const aCompatible = a.mode === arrival.mode ? 0 : 1;
    const bCompatible = b.mode === arrival.mode ? 0 : 1;
    return aCompatible - bCompatible;
  });


  if (filtered.length === 0) {
    return null;
  }

  const userMessage = JSON.stringify({
    arrival: {
      id: arrival.id,
      firstName: arrival.firstName,
      mode: arrival.mode,
      visits: arrival.visits,
      q1: arrival.q1,
      q2: arrival.q2,
      q3: arrival.q3,
      lumaBio: arrival.lumaBio || null,
      linkedinSummary: arrival.linkedinSummary || null,
    },
    candidates: filtered.map((p) => ({
      id: p.id,
      firstName: p.firstName,
      mode: p.mode,
      visits: p.visits,
      q1: p.q1,
      q2: p.q2,
      q3: p.q3,
      lumaBio: p.lumaBio || null,
      linkedinSummary: p.linkedinSummary || null,
    })),
  });

  let response: string;
  try {
    const result = await callDeepSeek({
      messages: [
        { role: "system", content: ORACLE_SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
      temperature: 0.5,
      maxTokens: 400,
    });

    if (typeof result === "string") {
      response = result;
    } else if (result && typeof result === "object" && "choices" in result) {
      response = result.choices[0]?.message?.content || "";
    } else {
      response = "";
    }
  } catch (error) {
    console.error("[MatchingOracle] DeepSeek call failed:", error);
    return null;
  }



  let parsed: MatchResult;
  try {
    const raw = response
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();
    parsed = JSON.parse(raw) as MatchResult;
  } catch (error) {
    console.error("[MatchingOracle] JSON parse failed:", error);
    console.error("Raw response:", response);
    return null;
  }

  if (parsed.confidence < 0.85) {
    return null;
  }

  if (parsed.match_id !== null) {
    const matchExists = filtered.some((p) => p.id === parsed.match_id);
    if (!matchExists) {
      console.error("[MatchingOracle] match_id not found in candidates:", parsed.match_id);
      return null;
    }
  }

  return parsed;
}