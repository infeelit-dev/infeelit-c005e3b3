import type { Lang } from "@/lib/i18n";

/**
 * Pick a localized string with English fallback.
 * Prefer `t` from LanguageContext for shared UI copy.
 */
export function pickLocalized(
  lang: Lang | string,
  map: Partial<Record<Lang, string>> & { en: string },
): string {
  return map[lang as Lang] || map.en;
}
