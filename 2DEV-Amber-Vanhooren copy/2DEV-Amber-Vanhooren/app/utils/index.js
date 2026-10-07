/**
 * formatDuration(minutes) → "3h", "1h 30m", "45m"
 */
export function formatDuration(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (m === 0) return `${h}h`;
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}

/**
 * formatDate("2026-05-07") → "Wednesday, May 7, 2026"
 */
export function formatDate(dateString) {
  return new Date(dateString + "T12:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
