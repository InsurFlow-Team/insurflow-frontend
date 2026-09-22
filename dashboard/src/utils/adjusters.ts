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
    chipClass: "border-emerald-200 bg-emerald-50 text-emerald-700",
    barClass: "bg-emerald-500",
  },
  HIGH: {
    label: "Near capacity",
    chipClass: "border-amber-200 bg-amber-50 text-amber-700",
    barClass: "bg-amber-500",
  },
  FULL: {
    label: "Full",
    chipClass: "border-rose-200 bg-rose-50 text-rose-700",
    barClass: "bg-rose-500",
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