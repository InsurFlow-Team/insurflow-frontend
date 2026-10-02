/**
 * Compact relative time for notification rows, e.g. "5m ago", "3h ago".
 *
 * Hand-rolled on purpose: the project has no date library and adding one for
 * a single formatter is not worth the bundle. The backend sends ISO strings,
 * so this is a pure string -> string function with no `Date.now()` of its own
 * by default, which keeps it deterministic under test.
 *
 * Anything older than a week, unparseable, or in the future degrades to an
 * absolute date so a broken timestamp is visible rather than silently "now".
 */

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function absolute(date: Date): string {
  return `${MONTHS[date.getMonth()]} ${date.getDate()}`;
}

export function formatRelativeTime(
  iso: string,
  now: number = Date.now(),
): string {
  const timestamp = new Date(iso).getTime();

  if (Number.isNaN(timestamp)) return "";

  const elapsed = now - timestamp;

  // A clock skew or a timezone bug upstream must not render as "0m ago".
  if (elapsed < 0) return absolute(new Date(timestamp));
  if (elapsed < MINUTE) return "just now";
  if (elapsed < HOUR) return `${Math.floor(elapsed / MINUTE)}m ago`;
  if (elapsed < DAY) return `${Math.floor(elapsed / HOUR)}h ago`;
  if (elapsed < WEEK) return `${Math.floor(elapsed / DAY)}d ago`;

  return absolute(new Date(timestamp));
}

/** The tooltip, so the compact label is never the only date available. */
export function formatAbsoluteTime(iso: string): string {
  const timestamp = new Date(iso).getTime();
  if (Number.isNaN(timestamp)) return "";

  const date = new Date(timestamp);
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${absolute(date)}, ${hours}:${minutes}`;
}
