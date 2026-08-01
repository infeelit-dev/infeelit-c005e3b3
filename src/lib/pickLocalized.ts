import type { Lang } from "@/lib/i18n";
import { UI_STRING_OVERLAYS } from "@/lib/uiStringOverlays";

/** Languages that prefer French when a direct translation is missing */
const FR_FALLBACK_LANGS: ReadonlySet<string> = new Set(["kab", "zgh"]);

/**
 * Pick a localized string with layered fallbacks:
 * 1) exact map[lang]
 * 2) English-keyed overlay for that language (covers es/de/… without editing every call site)
 * 3) French for Kabyle / Standard Moroccan Tamazight
 * 4) English
 *
 * Prefer `t` from LanguageContext for shared UI copy already in i18n.ts.
 */
export function pickLocalized(
  lang: Lang | string,
  map: Partial<Record<Lang, string>> & { en: string },
): string {
  const code = lang as Lang;
  const direct = map[code];
  if (direct) return direct;

  const overlay = UI_STRING_OVERLAYS[code]?.[map.en];
  if (overlay) return overlay;

  if (FR_FALLBACK_LANGS.has(code) && map.fr) return map.fr;

  return map.en;
}

/**
 * Resolve CHAPTERS / category fields that only exist as fr|en|ar
 * (or age_fr / tagline_fr …). Falls back via pickLocalized overlays + FR for kab/zgh.
 */
export function pickChapterField(
  item: Record<string, unknown>,
  lang: Lang | string,
  field?: string,
): string {
  const code = String(lang);

  if (field) {
    const keyed = item[`${field}_${code}`];
    if (typeof keyed === "string" && keyed) return keyed;

    const enVal = typeof item[`${field}_en`] === "string" ? (item[`${field}_en`] as string) : "";
    const frVal = typeof item[`${field}_fr`] === "string" ? (item[`${field}_fr`] as string) : "";
    const arVal = typeof item[`${field}_ar`] === "string" ? (item[`${field}_ar`] as string) : "";

    if (enVal) {
      return pickLocalized(code, { en: enVal, fr: frVal || undefined, ar: arVal || undefined });
    }
    if (FR_FALLBACK_LANGS.has(code) && frVal) return frVal;
    return frVal || arVal || "";
  }

  const direct = item[code];
  if (typeof direct === "string" && direct) return direct;

  const enVal = typeof item.en === "string" ? item.en : "";
  const frVal = typeof item.fr === "string" ? item.fr : "";
  const arVal = typeof item.ar === "string" ? item.ar : "";

  if (enVal) {
    return pickLocalized(code, { en: enVal, fr: frVal || undefined, ar: arVal || undefined });
  }
  if (FR_FALLBACK_LANGS.has(code) && frVal) return frVal;
  return frVal || arVal || "";
}
