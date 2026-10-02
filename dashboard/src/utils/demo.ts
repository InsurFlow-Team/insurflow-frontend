import type { FieldAdjuster, GeoPoint } from "../types";
import type { MapCoordinates } from "./map";

// DEMO MODE — simulated reference data, never used in the normal path.
//
// The live backend returns `location: null` for every field adjuster today
// (GPS will come from the adjuster mobile app later). A clearly-labelled,
// OFF-by-default demo mode lets the dispatch map show adjuster pins and
// claim-relative distances without touching the backend or inventing data in
// normal operation. Everything produced here is tagged DEMO in the UI and is
// never persisted to the backend.

export interface DemoPoint {
  label: string;
  latitude: number;
  longitude: number;
}

// Incident reference used when the selected claim has NO coordinates (a
// text-only claim). The claimed distance column is relative to this simulated
// point and is explicitly labelled as a demo anchor.
export const DEMO_ANCHOR: DemoPoint = {
  label: "رام الله (نقطة مرجع تجريبية)",
  latitude: 31.9038,
  longitude: 35.2034,
};

// Simulated field-adjuster locations across West Bank cities, assigned to
// active adjusters round-robin (index-based, same order every render).
export const DEMO_ADJUSTER_LOCATIONS: DemoPoint[] = [
  { label: "نابلس", latitude: 32.2211, longitude: 35.2544 },
  { label: "رام الله", latitude: 31.9038, longitude: 35.2034 },
  { label: "بيت لحم", latitude: 31.7054, longitude: 35.2024 },
  { label: "جنين", latitude: 32.4597, longitude: 35.3008 },
  { label: "الخليل", latitude: 31.5326, longitude: 35.095 },
];

// Fixed timestamp so demo state is deterministic across re-renders and tests.
export const DEMO_CAPTURED_AT = "2026-09-24T09:00:00.000Z";

const EARTH_RADIUS_KM = 6371;

// Great-circle distance between two coordinate pairs (haversine, km).
export function haversineKm(
  from: MapCoordinates,
  to: MapCoordinates,
): number {
  const toRad = (deg: number): number => (deg * Math.PI) / 180;

  const dLat = toRad(to.latitude - from.latitude);
  const dLng = toRad(to.longitude - from.longitude);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(from.latitude)) *
      Math.cos(toRad(to.latitude)) *
      Math.sin(dLng / 2) ** 2;

  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a));
}

// In DEMO mode: give every adjuster the backend reports WITHOUT a GPS location
// a simulated West Bank position, and compute a client-side haversine distance
// when a reference incident point is available (so "nearest adjuster" works).
// Adjusters that already have a real location are never overwritten. With
// `enabled` false the input array is returned untouched (OFF by default).
export function applyDemoLocations(
  adjusters: FieldAdjuster[],
  reference: MapCoordinates | null,
  enabled = false,
): FieldAdjuster[] {
  if (!enabled) return adjusters;

  return adjusters.map((adjuster, index) => {
    if (adjuster.location) return adjuster;

    const point = DEMO_ADJUSTER_LOCATIONS[index % DEMO_ADJUSTER_LOCATIONS.length];
    if (!point) return adjuster;

    const location: GeoPoint = {
      latitude: point.latitude,
      longitude: point.longitude,
      capturedAt: DEMO_CAPTURED_AT,
    };

    return {
      ...adjuster,
      location,
      distanceKm: reference
        ? haversineKm(reference, {
            latitude: point.latitude,
            longitude: point.longitude,
          })
        : null,
    };
  });
}