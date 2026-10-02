import { describe, expect, it } from "vitest";
import { normalizeGeoPoint } from "./geo";

describe("normalizeGeoPoint", () => {
  it("reads capturedAt for claim incidentCoordinates", () => {
    expect(
      normalizeGeoPoint({
        latitude: 32.2211,
        longitude: 35.2544,
        capturedAt: "2026-09-24T09:00:00.000Z",
      }),
    ).toEqual({
      latitude: 32.2211,
      longitude: 35.2544,
      capturedAt: "2026-09-24T09:00:00.000Z",
    });
  });

  it("falls back to updatedAt for an adjuster's live GPS location (backend field name)", () => {
    expect(
      normalizeGeoPoint({
        latitude: 31.9038,
        longitude: 35.2034,
        updatedAt: "2026-09-24T10:45:00.000Z",
      }),
    ).toEqual({
      latitude: 31.9038,
      longitude: 35.2034,
      capturedAt: "2026-09-24T10:45:00.000Z",
    });
  });

  it("returns null when the point is empty or not an object", () => {
    expect(normalizeGeoPoint(null)).toBeNull();
    expect(normalizeGeoPoint({ latitude: null, longitude: null })).toBeNull();
  });
});