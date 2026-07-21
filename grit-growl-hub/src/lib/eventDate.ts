/** Event date in Asia/Dubai (YYYY-MM-DD). Matches the Wednesday evening window. */
export function getDubaiEventDate(date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Dubai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}
