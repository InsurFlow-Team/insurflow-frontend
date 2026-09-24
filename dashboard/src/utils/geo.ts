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

  if (latitude === null && longitude === null && capturedAt === null) {
    return null;
  }

  return { latitude, longitude, capturedAt };
}