#!/usr/bin/env python3
"""
Prematch offline script — store TOP 5 oracle matches per attendee.

Usage:
  export SUPABASE_URL=...
  export SUPABASE_SERVICE_ROLE_KEY=...
  export DEEPSEEK_API_KEY=...
  python scripts/prematch.py --event-date 2026-07-16

Requires SQL migration first:
  ALTER TABLE pre_matches DROP CONSTRAINT IF EXISTS pre_matches_attendee_id_event_date_key;
  ALTER TABLE pre_matches ADD CONSTRAINT pre_matches_unique UNIQUE(attendee_id, match_id, event_date);
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
from typing import Any

import requests

SUPABASE_URL = os.environ.get("SUPABASE_URL", "").rstrip("/")
SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
DEEPSEEK_KEY = os.environ.get("DEEPSEEK_API_KEY", "")

HEADERS = {
    "apikey": SERVICE_KEY,
    "Authorization": f"Bearer {SERVICE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "resolution=merge-duplicates,return=representation",
}

ORACLE_SYSTEM = """You are the Oracle of Grit & Growl. Return TOP 5 matches as a JSON array,
ordered by confidence descending. Each match must have a unique match_id.
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
"""


def sb_get(path: str, params: dict[str, str] | None = None) -> Any:
    r = requests.get(f"{SUPABASE_URL}/rest/v1/{path}", headers=HEADERS, params=params or {}, timeout=60)
    r.raise_for_status()
    return r.json()


def sb_upsert_pre_matches(rows: list[dict[str, Any]]) -> None:
    if not rows:
        return
    r = requests.post(
        f"{SUPABASE_URL}/rest/v1/pre_matches",
        headers={**HEADERS, "Prefer": "resolution=merge-duplicates,return=minimal"},
        params={"on_conflict": "attendee_id,match_id,event_date"},
        json=rows,
        timeout=60,
    )
    r.raise_for_status()


def call_deepseek(arrival: dict, candidates: list[dict]) -> list[dict]:
    payload = {
        "model": "deepseek-chat",
        "temperature": 0.5,
        "max_tokens": 1200,
        "messages": [
            {"role": "system", "content": ORACLE_SYSTEM},
            {"role": "user", "content": json.dumps({"arrival": arrival, "candidates": candidates})},
        ],
    }
    r = requests.post(
        "https://api.deepseek.com/chat/completions",
        headers={"Authorization": f"Bearer {DEEPSEEK_KEY}", "Content-Type": "application/json"},
        json=payload,
        timeout=90,
    )
    r.raise_for_status()
    content = r.json()["choices"][0]["message"]["content"]
    raw = re.sub(r"```json\n?", "", content)
    raw = re.sub(r"```\n?", "", raw).strip()
    parsed = json.loads(raw)
    if isinstance(parsed, dict) and "matches" in parsed:
        parsed = parsed["matches"]
    if not isinstance(parsed, list):
        return []
    return parsed


def to_oracle_profile(row: dict) -> dict:
    return {
        "id": row["id"],
        "firstName": row.get("first_name") or (row.get("full_name") or "Guest").split(" ")[0],
        "mode": row.get("mode") or "lounge",
        "visits": row.get("visits") or 1,
        "q1": row.get("q1") or "",
        "q2": row.get("q2") or "",
        "q3": row.get("q3") or "",
        "lumaBio": row.get("luma_bio"),
        "linkedinSummary": row.get("linkedin_summary"),
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--event-date", required=True, help="YYYY-MM-DD Dubai event date")
    parser.add_argument("--limit", type=int, default=0, help="Optional attendee limit for dry runs")
    args = parser.parse_args()

    if not SUPABASE_URL or not SERVICE_KEY or not DEEPSEEK_KEY:
        print("Missing SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, or DEEPSEEK_API_KEY", file=sys.stderr)
        return 1

    attendees = sb_get(
        "attendees",
        {
            "select": "id,email,first_name,full_name,mode,visits,q1,q2,q3,luma_bio,linkedin_summary",
            "event_date": f"eq.{args.event_date}",
            "onboarding_complete": "eq.true",
        },
    )
    if args.limit:
        attendees = attendees[: args.limit]

    print(f"Prematching {len(attendees)} attendees for {args.event_date}")

    for i, attendee in enumerate(attendees, 1):
        candidates = [to_oracle_profile(a) for a in attendees if a["id"] != attendee["id"]][:25]
        arrival = to_oracle_profile(attendee)
        try:
            matches = call_deepseek(arrival, candidates)
        except Exception as e:
            print(f"[{i}/{len(attendees)}] {attendee.get('email')}: oracle failed: {e}")
            continue

        seen = set()
        rows = []
        for m in matches:
            mid = m.get("match_id")
            conf = float(m.get("confidence") or 0)
            if not mid or mid in seen or conf < 0.70:
                continue
            if not any(c["id"] == mid for c in candidates):
                continue
            seen.add(mid)
            rows.append(
                {
                    "attendee_id": attendee["id"],
                    "match_id": mid,
                    "event_date": args.event_date,
                    "confidence": conf,
                    "bond_type": m.get("bond_type"),
                    "resonance": m.get("resonance"),
                    "ice_breaker": m.get("ice_breaker"),
                    "for_match": m.get("for_match"),
                }
            )
            if len(rows) >= 5:
                break

        try:
            sb_upsert_pre_matches(rows)
            print(f"[{i}/{len(attendees)}] {attendee.get('email')}: stored {len(rows)} matches")
        except Exception as e:
            print(f"[{i}/{len(attendees)}] {attendee.get('email')}: upsert failed: {e}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
