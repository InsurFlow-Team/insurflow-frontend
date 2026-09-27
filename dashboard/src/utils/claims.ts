import type { ClaimStatus, ClaimSummary } from "../types";

// Every status a claim can hold. The stat cards are generated from this list, so
// a new status must be added here or the cards will silently under-report.
export const ALL_CLAIM_STATUSES: readonly ClaimStatus[] = [
  "NEW",
  "PENDING_ACCEPTANCE",
  "ASSIGNED",
  "IN_PROGRESS",
  "SUBMITTED",
  "UNDER_REVIEW",
  "CORRECTION_REQUIRED",
  "APPROVED",
  "REJECTED",
  "CLOSED",
] as const;

export type ClaimStatusCounts = Record<ClaimStatus, number>;

export function emptyClaimStatusCounts(): ClaimStatusCounts {
  return ALL_CLAIM_STATUSES.reduce<ClaimStatusCounts>((acc, status) => {
    acc[status] = 0;
    return acc;
  }, {} as ClaimStatusCounts);
}

// One counting rule for every stat card, so the Claims page and the Dashboard
// can never drift apart. Unknown statuses from a newer backend are counted into
// the total but get no card, which is why the total is claims.length and not the
// sum of the buckets.
export function countClaimsByStatus(claims: ClaimSummary[]): ClaimStatusCounts {
  const counts = emptyClaimStatusCounts();

  for (const claim of claims) {
    if (ALL_CLAIM_STATUSES.includes(claim.status)) {
      counts[claim.status] += 1;
    }
  }

  return counts;
}

export function sumClaimStatusCounts(counts: ClaimStatusCounts): number {
  return ALL_CLAIM_STATUSES.reduce((sum, status) => sum + counts[status], 0);
}

export type ClaimStatusFilter = "" | ClaimStatus;
export type DateRangeFilter = "all" | "7days" | "30days" | "90days";

export const STATUS_OPTIONS: Array<{
  label: string;
  value: ClaimStatusFilter;
}> = [
  { label: "All Statuses", value: "" },
  { label: "New", value: "NEW" },
  { label: "Awaiting Reply", value: "PENDING_ACCEPTANCE" },
  { label: "Assigned", value: "ASSIGNED" },
  { label: "In Progress", value: "IN_PROGRESS" },
  { label: "Submitted", value: "SUBMITTED" },
  { label: "Under Review", value: "UNDER_REVIEW" },
  { label: "Correction Required", value: "CORRECTION_REQUIRED" },
  { label: "Approved", value: "APPROVED" },
  { label: "Closed", value: "CLOSED" },
  { label: "Rejected", value: "REJECTED" },
];

export const DATE_RANGE_OPTIONS: Array<{
  label: string;
  value: DateRangeFilter;
}> = [
  { label: "All Time", value: "all" },
  { label: "Last 7 Days", value: "7days" },
  { label: "Last 30 Days", value: "30days" },
  { label: "Last 90 Days", value: "90days" },
];

export const ROWS_PER_PAGE_OPTIONS = [10, 25, 50];

export const ACCIDENT_TYPE_LABELS: Record<string, string> = {
  COLLISION: "تصادم",
  REAR_END_COLLISION: "تصادم خلفي",
  SIDE_IMPACT: "اصطدام جانبي",
  PARKING_DAMAGE: "أضرار أثناء الوقوف",
  OTHER: "أخرى",
};

export function accidentTypeLabel(value?: string | null): string {
  if (!value) return "—";
  return ACCIDENT_TYPE_LABELS[value] ?? value;
}

export function formatDate(value?: string | null): string {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function formatDateTime(value?: string | null): string {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function getDateCutoff(range: DateRangeFilter): Date | null {
  if (range === "all") return null;

  const now = Date.now();
  const millisecondsPerDay = 24 * 60 * 60 * 1000;

  switch (range) {
    case "7days":
      return new Date(now - 7 * millisecondsPerDay);
    case "30days":
      return new Date(now - 30 * millisecondsPerDay);
    case "90days":
      return new Date(now - 90 * millisecondsPerDay);
    default:
      return null;
  }
}