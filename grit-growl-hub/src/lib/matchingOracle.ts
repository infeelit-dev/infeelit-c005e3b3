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

const MIN_CONFIDENCE = 0.7;
const MAX_MATCHES = 5;
const MAX_CANDIDATES = 25;

const ORACLE_SYSTEM_PROMPT = `You are the Oracle of Grit & Growl — a rooftop gathering in Dubai, 250-300 people an evening.

Return TOP 5 matches as a JSON array, ordered by confidence descending.
Each match must have a unique match_id from the candidates list.
If fewer than 5 strong matches exist, return as many as you can above 0.70 confidence.
Never return the same person twice.

Return ONLY valid JSON:
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

resonance: spoken TO the arrival about the match, warm specific vivid
ice_breaker: one opening line the arrival can say out loud
Never use words: synergy align connect networking complementary shared interest`;

function prefilterCandidates(arrival: Profile, activeProfiles: Profile[]): Profile[] {
  let filtered = activeProfiles.filter((p) => p.id !== arrival.id);
  if (filtered.length > MAX_CANDIDATES) filtered = filtered.slice(0, MAX_CANDIDATES);
  filtered.sort((a, b) => {
    const aCompatible = a.mode === arrival.mode ? 0 : 1;
    const bCompatible = b.mode === arrival.mode ? 0 : 1;
    return aCompatible - bCompatible;
  });
  return filtered;
}

function stripJsonFence(response: string): string {
  return response.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
}

function validateMatches(parsed: unknown, filtered: Profile[]): MatchResult[] {
  const list = Array.isArray(parsed)
    ? parsed
    : parsed && typeof parsed === "object" && Array.isArray((parsed as { matches?: unknown }).matches)
      ? (parsed as { matches: unknown[] }).matches
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

  let response = "";
  try {
    const result = await callDeepSeek({
      messages: [
        { role: "system", content: ORACLE_SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
      temperature: 0.5,
      maxTokens: 1200,
    });

    if (typeof result === "string") response = result;
    else if (result && typeof result === "object" && "choices" in result) {
      response = result.choices[0]?.message?.content || "";
    }
  } catch (error) {
    console.error("[MatchingOracle] DeepSeek call failed:", error);
    return [];
  }

  try {
    return validateMatches(JSON.parse(stripJsonFence(response)), filtered);
  } catch (error) {
    console.error("[MatchingOracle] JSON parse failed:", error, response);
    return [];
  }
}

/** @deprecated Use findTopMatches */
export async function findBestMatch(arrival: Profile, activeProfiles: Profile[]) {
  const top = await findTopMatches(arrival, activeProfiles);
  if (!top.length) return null;
  return { ...top[0], reasoning: "" };
}
