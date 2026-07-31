#!/usr/bin/env python3
"""Generate src/data/localizedQuestions.ts from lang_data modules."""

import sys
from collections import Counter
from pathlib import Path

from lang_data.hi import HI
from lang_data.ur import UR
from lang_data.es import ES
from lang_data.ru import RU
from lang_data.zh import ZH
from lang_data.pt import PT
from lang_data.tr import TR
from lang_data.sw import SW

CHAPTER_COUNTS = {
    "childhood": 20,
    "family": 20,
    "lessons": 15,
    "traditions": 15,
    "migration": 15,
    "legacy": 15,
}

LANG_DATA = {
    "hi": HI,
    "ur": UR,
    "es": ES,
    "ru": RU,
    "zh": ZH,
    "pt": PT,
    "tr": TR,
    "sw": SW,
}

REVIEW_COMMENT = "AI-generated - pending native review"


def escape_ts(s: str) -> str:
    return s.replace("\\", "\\\\").replace('"', '\\"')


def validate():
    errors = []
    for lang, questions in LANG_DATA.items():
        if len(questions) != 100:
            errors.append(f"{lang}: expected 100 questions, got {len(questions)}")
        counts = Counter(ch for ch, _, _ in questions)
        for chapter, expected in CHAPTER_COUNTS.items():
            if counts[chapter] != expected:
                errors.append(
                    f"{lang}/{chapter}: expected {expected}, got {counts[chapter]}"
                )
    return errors


def format_questions(questions: list[tuple[str, str, str]]) -> str:
    lines: list[str] = []
    seen_chapters: set[str] = set()
    for chapter, bubble, text in questions:
        if chapter not in seen_chapters:
            lines.append(f"    // {REVIEW_COMMENT}")
            seen_chapters.add(chapter)
        lines.append(
            f'    {{ text: "{escape_ts(text)}", bubble: "{escape_ts(bubble)}", chapter: "{chapter}" }},'
        )
    return "\n".join(lines)


def generate_ts() -> str:
    header = '''import type { Lang } from "@/lib/i18n";

export type LocalizedQuestion = {
  /** AI-generated - pending native review */
  text: string;
  bubble: string;
  chapter:
    | "childhood"
    | "family"
    | "lessons"
    | "traditions"
    | "migration"
    | "legacy";
};

export type NewLang = Exclude<Lang, "en" | "fr" | "ar">;

export const LOCALIZED_QUESTIONS: Record<NewLang, LocalizedQuestion[]> = {
'''
    parts = [header]
    for i, (lang, questions) in enumerate(LANG_DATA.items()):
        parts.append(f"  {lang}: [\n{format_questions(questions)}\n  ]")
        if i < len(LANG_DATA) - 1:
            parts[-1] += ","
    parts.append("};\n")
    parts.append(
        '''/** Get prompt text for any UI language with EN/FR/AR fallbacks via caller */
export function getLocalizedQuestions(lang: Lang): LocalizedQuestion[] | null {
  if (lang === "en" || lang === "fr" || lang === "ar") return null;
  return LOCALIZED_QUESTIONS[lang as NewLang] || null;
}
'''
    )
    return "\n".join(parts)


def main() -> int:
    errors = validate()
    if errors:
        print("VALIDATION FAILED:")
        for e in errors:
            print(f"  - {e}")
        return 1

    out = Path(__file__).resolve().parent.parent / "src" / "data" / "localizedQuestions.ts"
    content = generate_ts()
    out.write_text(content, encoding="utf-8")
    print(f"Wrote {out} ({len(content):,} bytes)")

    # Summary
    for lang, questions in LANG_DATA.items():
        counts = Counter(ch for ch, _, _ in questions)
        print(f"  {lang}: {len(questions)} total — {dict(counts)}")
    print("All counts OK.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
