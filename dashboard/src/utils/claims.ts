import type { ClaimStatus } from "../types";

export type ClaimStatusFilter = "" | ClaimStatus;
export type DateRangeFilter = "all" | "7days" | "30days" | "90days";

export const STATUS_OPTIONS: Array<{
  label: string;
  value: ClaimStatusFilter;
}> = [
  { label: "All Statuses", value: "" },
  { label: "New", value: "NEW" },
  { label: "Assigned", value: "ASSIGNED" },
  { label: "Submitted", value: "SUBMITTED" },
  { label: "Under Review", value: "UNDER_REVIEW" },
  { label: "Approved", value: "APPROVED" },
  { label: "Closed", value: "CLOSED" },
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