import { describe, expect, it } from "vitest";
import {
  DEMO_ADJUSTER_LOCATIONS,
  DEMO_ANCHOR,
  DEMO_CAPTURED_AT,
  applyDemoLocations,
  haversineKm,
} from "./demo";
import type { FieldAdjuster } from "../types";

function makeAdjuster(overrides: Partial<FieldAdjuster> = {}): FieldAdjuster {
  return {
    id: "adj-1",
    name: "Aya",
    employeeCode: "FA-001",
    role: "FIELD_ADJUSTER",
    organizationId: "org-1",
    organizationName: "InsurFlow",
    status: "ACTIVE",
    availability: "AVAILABLE",
    activeTasksCount: 0,
    capacityLimit: 3,
    location: null,
    distanceKm: null,
    ...overrides,
  };
}

describe("haversineKm", () => {
  it("is zero for the same point", () => {
    expect(haversineKm(DEMO_ANCHOR, DEMO_ANCHOR)).toBeCloseTo(0, 6);
  });

  it("is symmetric", () => {
    const a = DEMO_ANCHOR;
    const b = DEMO_ADJUSTER_LOCATIONS[0];
    expect(haversineKm(a, b)).toBeCloseTo(haversineKm(b, a), 6);
  });

  it("approximates the Nablus → Ramallah road distance (~35.5 km)", () => {
    const distance = haversineKm(
      DEMO_ADJUSTER_LOCATIONS[0], // نابلس
      DEMO_ANCHOR, // رام الله
    );
    expect(distance).toBeCloseTo(35.5, 0);
  });
});

describe("applyDemoLocations", () => {
  it("is a no-op when demo is disabled (OFF by default)", () => {
    const adjuster = makeAdjuster();
    const result = applyDemoLocations([adjuster], DEMO_ANCHOR);

    expect(result[0].location).toBeNull();
    expect(result[1]).toBeUndefined();
  });

  it("assigns a West Bank point to adjusters without a real location", () => {
    const result = applyDemoLocations([makeAdjuster()], null, true);

    expect(result[0].location?.latitude).toBe(DEMO_ADJUSTER_LOCATIONS[0].latitude);
    expect(result[0].location?.longitude).toBe(DEMO_ADJUSTER_LOCATIONS[0].longitude);
    expect(result[0].location?.capturedAt).toBe(DEMO_CAPTURED_AT);
  });

  it("assigns points round-robin so multiple adjusters spread across cities", () => {
    const adjusters = [makeAdjuster(), makeAdjuster({ id: "adj-2" }), makeAdjuster({ id: "adj-3" })];
    const result = applyDemoLocations(adjusters, null, true);

    expect(result[0].location?.latitude).toBe(DEMO_ADJUSTER_LOCATIONS[0].latitude);
    expect(result[1].location?.latitude).toBe(DEMO_ADJUSTER_LOCATIONS[1].latitude);
    expect(result[2].location?.latitude).toBe(DEMO_ADJUSTER_LOCATIONS[2].latitude);
  });

  it("computes distance only when a reference incident point is provided", () => {
    const withoutReference = applyDemoLocations([makeAdjuster()], null, true);
    expect(withoutReference[0].distanceKm).toBeNull();

    // Index 0 → نابلس; reference رام الله → ~35.6 km apart.
    const withReference = applyDemoLocations([makeAdjuster()], DEMO_ANCHOR, true);
    expect(withReference[0].distanceKm).toBeCloseTo(35.6, 0);
    expect(withReference[0].distanceKm).toBeGreaterThan(0);
  });

  it("never overwrites an adjuster that already has a real location", () => {
    const realLocation = { latitude: 31.7111, longitude: 35.2386, capturedAt: "2026-09-23T11:00:00.000Z" };
    const result = applyDemoLocations(
      [makeAdjuster({ location: realLocation, distanceKm: 4.2 })],
      DEMO_ANCHOR,
      true,
    );

    expect(result[0].location).toEqual(realLocation);
    expect(result[0].distanceKm).toBe(4.2);
  });
});