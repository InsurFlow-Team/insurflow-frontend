import { describe, expect, it } from "vitest";

import {
  adjusterLegend,
  adjusterPinColor,
  adjustersWithCoordinates,
  claimCoordinates,
  claimLegend,
  CLAIM_STATUS_COLORS,
  claimsWithCoordinates,
  toMapCoordinates,
} from "./map";
import type { ClaimSummary, FieldAdjuster } from "../types";

function makeClaim(
  overrides: Partial<ClaimSummary> & { claimNumber: string },
): ClaimSummary {
  return {
    id: `id-${overrides.claimNumber}`,
    status: "NEW",
    customerName: "Ahmed Ibrahim",
    initialPlateNumber: "ABC-1234",
    createdAt: "2026-09-01T10:00:00.000Z",
    ...overrides,
  };
}

function makeAdjuster(
  overrides: Partial<FieldAdjuster> & { employeeCode: string },
): FieldAdjuster {
  return {
    id: `id-${overrides.employeeCode}`,
    name: "Aya",
    role: "FIELD_ADJUSTER",
    organizationId: "org-1",
    organizationName: "InsurFlow",
    status: "ACTIVE",
    availability: "AVAILABLE",
    activeTasksCount: 0,
    capacityLimit: 3,
    ...overrides,
  };
}

describe("toMapCoordinates", () => {
  it("accepts valid lat/lng numbers", () => {
    expect(toMapCoordinates(21.4858, 39.1925)).toEqual({
      latitude: 21.4858,
      longitude: 39.1925,
    });
  });

  it("accepts numeric strings (backend may send strings)", () => {
    expect(toMapCoordinates("21.4858", "39.1925")).toEqual({
      latitude: 21.4858,
      longitude: 39.1925,
    });
  });

  it("rejects missing, malformed, or out-of-range values", () => {
    expect(toMapCoordinates(undefined, undefined)).toBeNull();
    expect(toMapCoordinates(null, null)).toBeNull();
    expect(toMapCoordinates(NaN, 39.1925)).toBeNull();
    expect(toMapCoordinates(91, 39)).toBeNull();
    expect(toMapCoordinates(21, 181)).toBeNull();
  });
});

describe("claimsWithCoordinates (null-safe)", () => {
  it("keeps only claims whose incidentCoordinates are valid", () => {
    const claims = [
      makeClaim({ claimNumber: "C1", incidentCoordinates: { latitude: 21.4, longitude: 39.1 } }),
      makeClaim({ claimNumber: "C2", incidentCoordinates: null }),
      makeClaim({ claimNumber: "C3", incidentCoordinates: { latitude: NaN, longitude: 39.1 } }),
    ];

    const pins = claimsWithCoordinates(claims);

    expect(pins).toHaveLength(1);
    expect(pins[0].claim.claimNumber).toBe("C1");
    expect(pins[0].coordinates).toEqual({ latitude: 21.4, longitude: 39.1 });
  });

  it("returns an empty array when nothing has coordinates", () => {
    expect(claimsWithCoordinates([makeClaim({ claimNumber: "C1" })])).toEqual([]);
    expect(claimsWithCoordinates([])).toEqual([]);
  });

  it("never invents coordinates for a bare claim", () => {
    expect(claimCoordinates(makeClaim({ claimNumber: "C1" }))).toBeNull();
  });
});

describe("adjustersWithCoordinates (null-safe)", () => {
  it("keeps only adjusters with a live GPS location", () => {
    const adjusters = [
      makeAdjuster({ employeeCode: "FA-1", location: { latitude: 21.5, longitude: 39.2 } }),
      makeAdjuster({ employeeCode: "FA-2", location: null }),
    ];

    const pins = adjustersWithCoordinates(adjusters);

    expect(pins).toHaveLength(1);
    expect(pins[0].adjuster.employeeCode).toBe("FA-1");
  });
});

describe("pin coloring", () => {
  it("covers every claim status with a color", () => {
    expect(Object.keys(CLAIM_STATUS_COLORS)).toHaveLength(10);
  });

  it("colors by backend availability, never a hardcoded capacity", () => {
    expect(
      adjusterPinColor(makeAdjuster({ employeeCode: "FA-1", availability: "AVAILABLE" })),
    ).toBe("#22C55E");
    expect(
      adjusterPinColor(makeAdjuster({ employeeCode: "FA-2", availability: "UNAVAILABLE" })),
    ).toBe("#EF4444");
    expect(
      adjusterPinColor(makeAdjuster({ employeeCode: "FA-3", status: "INACTIVE" })),
    ).toBe("#9CA3AF");
  });
});

describe("legends", () => {
  it("builds a claim legend from the statuses present", () => {
    expect(claimLegend(["NEW", "IN_PROGRESS"])).toEqual([
      { key: "NEW", label: "New", color: CLAIM_STATUS_COLORS.NEW },
      { key: "IN_PROGRESS", label: "In Progress", color: CLAIM_STATUS_COLORS.IN_PROGRESS },
    ]);
  });

  it("dedupes adjuster legend entries", () => {
    const items = adjusterLegend([
      { status: "ACTIVE", availability: "AVAILABLE" },
      { status: "ACTIVE", availability: "AVAILABLE" },
      { status: "ACTIVE", availability: "UNAVAILABLE" },
    ]);

    expect(items.map((item) => item.key)).toEqual(["available", "busy"]);
  });
});