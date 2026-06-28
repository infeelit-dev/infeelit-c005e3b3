export function normalizeWhatsAppPhone(raw: string | null | undefined): string {
  return (raw || "").replace(/\D/g, "");
}

export function normalizeLinkedInUrl(raw: string | null | undefined): string | null {
  const trimmed = (raw || "").trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith("linkedin.com") || trimmed.startsWith("www.linkedin.com")) {
    return `https://${trimmed}`;
  }
  if (trimmed.includes("linkedin.com")) return `https://${trimmed.replace(/^\/+/, "")}`;
  return `https://linkedin.com/in/${trimmed.replace(/^\/+/, "")}`;
}

export function buildWhatsAppUrl(phone: string, message: string): string {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

/** Mobile Safari blocks window.open; direct navigation works reliably. */
export function openWhatsApp(phone: string, message: string): void {
  window.location.href = buildWhatsAppUrl(phone, message);
}
