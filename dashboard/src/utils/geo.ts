import type { GeoPoint } from "../types";

export function normalizeGeoPoint(value: unknown): GeoPoint | null {
  if (!value || typeof value !== "object") return null;

  const point = value as Record<string, unknown>;

  const latitude = typeof point.latitude === "number" ? point.latitude : null;
  const longitude =
    typeof point.longitude === "number" ? point.longitude : null;
  // The backend timestamps an adjuster's live `location` with `updatedAt`
  // (field-adjuster GPS), while claim `incidentCoordinates` use `capturedAt`.
  // Normalize both into the single capturedAt slot.
  const capturedAt =
    typeof point.capturedAt === "string"
      ? point.capturedAt
      : typeof point.updatedAt === "string"
        ? point.updatedAt
        : null;

  // If both coordinates are missing there is no usable location — return null
  // so callers (e.g. adjusterCoordinates) don't try to render a pin.
  if (latitude === null && longitude === null) {
    return null;
  }

  return { latitude, longitude, capturedAt };
}