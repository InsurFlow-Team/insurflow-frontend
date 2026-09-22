import { describe, expect, it } from "vitest";
import {
  formatAdjusterSelectLabel,
  formatCapacitySummary,
  getWorkloadPercent,
  getWorkloadTier,
  WORKLOAD_TIER_META,
} from "./adjusters";
import type { FieldAdjuster } from "../types";

const ADJUSTER: FieldAdjuster = {
  id: "adj-1",
  name: "Ahmed",
  employeeCode: "FA-001",
  role: "FIELD_ADJUSTER",
  organizationId: "org-1",
  organizationName: "InsurFlow",
  status: "ACTIVE",
  availability: "AVAILABLE",
  activeTasksCount: 2,
  capacityLimit: 3,
};

describe("formatAdjusterSelectLabel", () => {
  it("shows state and load when a capacity limit exists", () => {
    expect(formatAdjusterSelectLabel(ADJUSTER)).toBe(
      "Ahmed (FA-001) — Available · 2/3",
    );
  });

  it("marks a full adjuster as Busy with their load", () => {
    expect(
      formatAdjusterSelectLabel({ ...ADJUSTER, availability: "UNAVAILABLE" }),
    ).toBe("Ahmed (FA-001) — Busy · 2/3");
  });

  it("omits the load when the backend sends no capacity limit", () => {
    expect(
      formatAdjusterSelectLabel({ ...ADJUSTER, capacityLimit: null }),
    ).toBe("Ahmed (FA-001) — Available");
  });
});

describe("formatCapacitySummary", () => {
  it("shows current vs max", () => {
    expect(formatCapacitySummary(ADJUSTER)).toBe("2/3");
  });

  it("is null for unknown adjusters or missing limits", () => {
    expect(formatCapacitySummary(undefined)).toBeNull();
    expect(
      formatCapacitySummary({ ...ADJUSTER, capacityLimit: null }),
    ).toBeNull();
  });
});

describe("workload tiers", () => {
  it("classifies by percentage of capacity", () => {
    expect(getWorkloadTier(0, 3)).toBe("OK");
    expect(getWorkloadTier(2, 3)).toBe("HIGH");
    expect(getWorkloadTier(3, 3)).toBe("FULL");
    expect(getWorkloadTier(5, 3)).toBe("FULL");
  });

  it("is OK when no capacity is defined", () => {
    expect(getWorkloadTier(2, 0)).toBe("OK");
  });

  it("computes a clamped percentage", () => {
    expect(getWorkloadPercent(0, 3)).toBe(0);
    expect(getWorkloadPercent(2, 3)).toBe(67);
    expect(getWorkloadPercent(3, 3)).toBe(100);
    expect(getWorkloadPercent(9, 3)).toBe(100);
    expect(getWorkloadPercent(2, 0)).toBe(0);
  });

  it("keeps every tier styled", () => {
    for (const meta of Object.values(WORKLOAD_TIER_META)) {
      expect(meta.label).toBeTruthy();
      expect(meta.chipClass).toContain("border-");
      expect(meta.barClass).toContain("bg-");
    }
  });
});