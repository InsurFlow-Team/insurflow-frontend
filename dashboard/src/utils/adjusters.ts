import type { Availability, FieldAdjuster, UserStatus } from "../types";

export type WorkloadTier = "OK" | "HIGH" | "FULL";

export type AdjusterSortValue =
  | "workload-desc"
  | "workload-asc"
  | "name-asc";

export const WORKLOAD_TIER_META: Record<
  WorkloadTier,
  { label: string; chipClass: string; barClass: string }
> = {
  OK: {
    label: "Healthy",
    chipClass: "border-success-border bg-success-bg text-success-text",
    barClass: "bg-success-strong",
  },
  HIGH: {
    label: "Near capacity",
    chipClass: "border-warning-border bg-warning-bg text-warning-text",
    barClass: "bg-warning-muted",
  },
  FULL: {
    label: "Full",
    chipClass: "border-rose-border bg-rose-bg text-rose-text",
    barClass: "bg-rose-strong",
  },
};

export function getWorkloadPercent(
  activeTasksCount: number,
  capacityLimit: number,
): number {
  if (capacityLimit <= 0) {
    return 0;
  }

  return Math.min(
    100,
    Math.max(0, Math.round((activeTasksCount / capacityLimit) * 100)),
  );
}

export function getWorkloadTier(
  activeTasksCount: number,
  capacityLimit: number,
): WorkloadTier {
  if (capacityLimit > 0 && activeTasksCount >= capacityLimit) {
    return "FULL";
  }

  if (capacityLimit > 0 && activeTasksCount >= Math.floor(capacityLimit * 0.75)) {
    return "HIGH";
  }

  return "OK";
}

export const AVAILABILITY_OPTIONS: {
  value: Availability;
  label: string;
}[] = [
  { value: "AVAILABLE", label: "Available" },
  { value: "UNAVAILABLE", label: "Busy" },
];

export const STATUS_OPTIONS: { value: UserStatus; label: string }[] = [
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
];

export const SORT_OPTIONS: { value: AdjusterSortValue; label: string }[] = [
  { value: "workload-desc", label: "Workload: High → Low" },
  { value: "workload-asc", label: "Workload: Low → High" },
  { value: "name-asc", label: "Name: A → Z" },
];

// The assign dropdown must make the adjuster's real load visible so the
// "unavailable" answer is never a surprise: e.g. "Ahmed (FA-001) — Available · 2/3".
// Capacity stays a soft guardrail — the user may still assign beyond it via the
// Capacity Override confirmation, exactly as agreed.
export function formatAdjusterSelectLabel(adjuster: FieldAdjuster): string {
  const state =
    adjuster.availability === "AVAILABLE" ? "Available" : "Busy";

  const load =
    typeof adjuster.capacityLimit === "number"
      ? `${adjuster.activeTasksCount}/${adjuster.capacityLimit}`
      : null;

  return load
    ? `${adjuster.name} (${adjuster.employeeCode}) — ${state} · ${load}`
    : `${adjuster.name} (${adjuster.employeeCode}) — ${state}`;
}

export function formatCapacitySummary(
  adjuster: FieldAdjuster | undefined,
): string | null {
  if (!adjuster || typeof adjuster.capacityLimit !== "number") {
    return null;
  }

  return `${adjuster.activeTasksCount}/${adjuster.capacityLimit}`;
}