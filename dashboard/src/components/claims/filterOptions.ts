import type { ClaimStatus } from "../../types";

export type DateRangeFilter = "all" | "7days" | "30days" | "90days";

export interface StatusOption {
  label: string;
  value: "" | ClaimStatus;
}

export interface DateRangeOption {
  label: string;
  value: DateRangeFilter;
}

export const STATUS_OPTIONS: StatusOption[] = [
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
];

export const DATE_RANGE_OPTIONS: DateRangeOption[] = [
  { label: "All Time", value: "all" },
  { label: "Last 7 Days", value: "7days" },
  { label: "Last 30 Days", value: "30days" },
  { label: "Last 90 Days", value: "90days" },
];

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