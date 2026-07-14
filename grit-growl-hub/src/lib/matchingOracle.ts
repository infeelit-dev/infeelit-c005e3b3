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
  match_id: string;
  confidence: number;
  bond_type: "complement" | "resonance" | null;
  resonance: string | null;
  ice_breaker: string | null;
  for_match: string | null;
}

/** @deprecated Prefer findTopMatches — kept for compatibility. */
export interface SingleMatchResult {
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
If no active profile clears a real exchange, return an empty array []. A missed connection tonight beats a bad one that wastes a scarce slot.

OUTPUT FORMAT
Return TOP 5 matches as a JSON array, ordered by confidence descending.
Each match must have a unique match_id.
If fewer than 5 strong matches exist, return as many as you can above 0.70 confidence.
Never return the same person twice.

Return ONLY valid JSON, nothing else:
[
  {
    "match_id": "uuid",
    "confidence": 0.95,
    "bond_type": "complement",
    "resonance": "max 150 chars",
    "ice_breaker": "max 100 chars",
    "for_match": "max 100 chars"
  }
]

FIELD RULES
match_id: must exist in candidates array
confidence: only include matches with confidence >= 0.70
resonance: spoken TO the arrival about the match, warm specific vivid, reference real details from their answers, NEVER use words: synergy align connect networking complementary shared interest
ice_breaker: one opening line the arrival can say out loud, specific to these two people, not small talk
for_match: one sentence the host would whisper to the match before the arrival walks over`;

const MIN_CONFIDENCE = 0.7;
const MAX_MATCHES = 5;
const MAX_CANDIDATES = 25;

function prefilterCandidates(arrival: Profile, activeProfiles: Profile[]): Profile[] {
  let filtered = activeProfiles.filter((profile) => profile.id !== arrival.id);

  if (filtered.length > MAX_CANDIDATES) {
    filtered = filtered.slice(0, MAX_CANDIDATES);
  }

  filtered.sort((a, b) => {
    const aCompatible = a.mode === arrival.mode ? 0 : 1;
    const bCompatible = b.mode === arrival.mode ? 0 : 1;
    return aCompatible - bCompatible;
  });

  return filtered;
}

function stripJsonFence(response: string): string {
  return response
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();
}

function validateMatches(parsed: unknown, filtered: Profile[]): MatchResult[] {
  const list = Array.isArray(parsed) ? parsed : parsed && typeof parsed === "object" && Array.isArray((parsed as { matches?: unknown }).matches)
    ? (parsed as { matches: unknown[] }).matches
    : parsed && typeof parsed === "object" && "match_id" in (parsed as object)
      ? [parsed]
      : [];

  const seen = new Set<string>();
  const valid: MatchResult[] = [];

  for (const item of list) {
    if (!item || typeof item !== "object") continue;
    const row = item as Partial<MatchResult>;
    if (!row.match_id || typeof row.match_id !== "string") continue;
    if (seen.has(row.match_id)) continue;
    if (!filtered.some((p) => p.id === row.match_id)) continue;

    const confidence = typeof row.confidence === "number" ? row.confidence : 0;
    if (confidence < MIN_CONFIDENCE) continue;

    seen.add(row.match_id);
    valid.push({
      match_id: row.match_id,
      confidence,
      bond_type: row.bond_type === "complement" || row.bond_type === "resonance" ? row.bond_type : null,
      resonance: typeof row.resonance === "string" ? row.resonance : null,
      ice_breaker: typeof row.ice_breaker === "string" ? row.ice_breaker : null,
      for_match: typeof row.for_match === "string" ? row.for_match : null,
    });
  }

  return valid.sort((a, b) => b.confidence - a.confidence).slice(0, MAX_MATCHES);
}

export async function findTopMatches(arrival: Profile, activeProfiles: Profile[]): Promise<MatchResult[]> {
  const filtered = prefilterCandidates(arrival, activeProfiles);
  if (filtered.length === 0) return [];

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
      maxTokens: 1200,
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
    return [];
  }

  try {
    const raw = stripJsonFence(response);
    const parsed = JSON.parse(raw) as unknown;
    return validateMatches(parsed, filtered);
  } catch (error) {
    console.error("[MatchingOracle] JSON parse failed:", error);
    console.error("Raw response:", response);
    return [];
  }
}

/** @deprecated Use findTopMatches. Returns the single best match or null. */
export async function findBestMatch(arrival: Profile, activeProfiles: Profile[]): Promise<SingleMatchResult | null> {
  const top = await findTopMatches(arrival, activeProfiles);
  if (top.length === 0) return null;
  const best = top[0];
  return {
    match_id: best.match_id,
    confidence: best.confidence,
    bond_type: best.bond_type,
    resonance: best.resonance,
    ice_breaker: best.ice_breaker,
    for_match: best.for_match,
    reasoning: "",
  };
}
