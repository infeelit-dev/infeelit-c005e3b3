import { getDubaiEventDate } from "./eventDate";

export type AttendeeProfile = {
  id: string;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  full_name?: string | null;
  q1?: string | null;
  q2?: string | null;
  q3?: string | null;
  luma_bio?: string | null;
  linkedin_summary?: string | null;
  linkedin_url?: string | null;
  whatsapp?: string | null;
  mode?: string | null;
  visits?: number | null;
  onboarding_complete?: boolean | null;
};

export function hasProfileData(profile: AttendeeProfile | null | undefined): boolean {
  if (!profile) return false;
  return !!(
    profile.linkedin_summary?.trim() ||
    profile.luma_bio?.trim() ||
    profile.q1?.trim()
  );
}

export function storeEmail(email: string) {
  localStorage.setItem("gg_email", email.trim().toLowerCase());
}

export function getStoredEmail(): string | null {
  return localStorage.getItem("gg_email");
}

export function setMatchSource(source: "precomputed" | "oracle") {
  sessionStorage.setItem("gg_match_source", source);
}

export function getMatchSource(): "precomputed" | "oracle" | null {
  const v = sessionStorage.getItem("gg_match_source");
  return v === "precomputed" || v === "oracle" ? v : null;
}

export function todayEventDate() {
  return getDubaiEventDate();
}
