const STOP = new Set([
  "a",
  "an",
  "the",
  "and",
  "or",
  "of",
  "my",
  "i",
  "im",
  "i'm",
  "to",
  "for",
  "in",
  "on",
  "at",
  "with",
  "is",
  "it",
  "its",
  "it's",
  "love",
  "loving",
  "into",
  "about",
]);

const KEYWORD_MAP: { cluster: string; keywords: string[] }[] = [
  { cluster: "Cinema", keywords: ["cinema", "film", "films", "movies", "movie", "shorts", "filmmaking", "filmmaker"] },
  { cluster: "Music", keywords: ["music", "guitar", "piano", "singing", "jazz", "drums", "song", "songs", "dj"] },
  { cluster: "Travel", keywords: ["travel", "travelling", "traveling", "exploring", "adventure", "adventures"] },
  { cluster: "Horse riding", keywords: ["horses", "horse", "riding", "equestrian", "polo"] },
  { cluster: "The ocean", keywords: ["ocean", "sea", "sailing", "surf", "surfing", "dive", "diving"] },
  { cluster: "Fitness", keywords: ["fitness", "running", "gym", "crossfit", "workout", "training", "yoga"] },
  { cluster: "Photography", keywords: ["photography", "photos", "photo", "camera", "photographer"] },
  { cluster: "Reading", keywords: ["reading", "books", "book", "literature", "novel", "novels"] },
];

/** Normalize free text into a passion cluster label for counting. */
export function normalizePassionCluster(raw: string): string {
  const cleaned = raw
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) return "Other";

  const tokens = cleaned.split(" ");

  for (const { cluster, keywords } of KEYWORD_MAP) {
    if (tokens.some((t) => keywords.includes(t))) return cluster;
  }

  const meaningful = tokens.filter((t) => t.length > 1 && !STOP.has(t));
  if (meaningful.length === 0) {
    return titleCase(tokens.slice(0, 2).join(" "));
  }
  return titleCase(meaningful.slice(0, 2).join(" "));
}

function titleCase(s: string): string {
  return s
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/** Enforce max 5 words for passion input. */
export function clampPassionWords(text: string, maxWords = 5): string {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return text.trimStart();
  return words.slice(0, maxWords).join(" ");
}

export function countPassionWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function passionTribeLine(cluster: string, othersCount: number): string {
  const label = cluster.toLowerCase();
  if (othersCount > 1) {
    return `Tonight, ${othersCount} people here share your passion for ${label}.`;
  }
  if (othersCount === 1) {
    return `One other person here shares your passion for ${label}. Find them.`;
  }
  return `You're the first ${label} signal tonight. More may land later.`;
}
