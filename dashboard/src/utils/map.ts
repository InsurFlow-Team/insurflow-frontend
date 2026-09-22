import type {
  Availability,
  ClaimStatus,
  ClaimSummary,
  FieldAdjuster,
  UserStatus,
} from "../types";

export interface MapCoordinates {
  latitude: number;
  longitude: number;
}

// Status → pin color. Kept as a single source of truth so markers, the legend
// and future layers share one palette.
export const CLAIM_STATUS_COLORS: Record<ClaimStatus, string> = {
  NEW: "#6B7280",
  PENDING_ACCEPTANCE: "#3B82F6",
  ASSIGNED: "#8B5CF6",
  IN_PROGRESS: "#F59E0B",
  SUBMITTED: "#0EA5E9",
  UNDER_REVIEW: "#14B8A6",
  CORRECTION_REQUIRED: "#EF4444",
  APPROVED: "#10B981",
  CLOSED: "#64748B",
};

// Capacity is decided by the backend (availability + activeTasksCount +
// capacityLimit). We never hardcode a limit — colors just reflect availability.
export function adjusterPinColor(adjuster: FieldAdjuster): string {
  if (adjuster.status === "INACTIVE") return "#9CA3AF";
  if (adjuster.availability === "UNAVAILABLE") return "#EF4444";
  return "#22C55E";
}

export function toMapCoordinates(
  latitude: unknown,
  longitude: unknown,
): MapCoordinates | null {
  if (
    latitude === null ||
    latitude === undefined ||
    latitude === "" ||
    longitude === null ||
    longitude === undefined ||
    longitude === ""
  ) {
    return null;
  }

  const lat = Number(latitude);
  const lng = Number(longitude);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;

  return { latitude: lat, longitude: lng };
}

export function claimCoordinates(claim: ClaimSummary): MapCoordinates | null {
  const point = claim.incidentCoordinates;
  if (!point || typeof point !== "object") return null;
  return toMapCoordinates(point.latitude, point.longitude);
}

export function adjusterCoordinates(
  adjuster: FieldAdjuster,
): MapCoordinates | null {
  const point = adjuster.location;
  if (!point || typeof point !== "object") return null;
  return toMapCoordinates(point.latitude, point.longitude);
}

export interface ClaimPin {
  claim: ClaimSummary;
  coordinates: MapCoordinates;
}

export interface AdjusterPin {
  adjuster: FieldAdjuster;
  coordinates: MapCoordinates;
}

// Null-safe: entries without valid coordinates are dropped, never invented.
export function claimsWithCoordinates(claims: ClaimSummary[]): ClaimPin[] {
  return claims.flatMap((claim) => {
    const coordinates = claimCoordinates(claim);
    return coordinates ? [{ claim, coordinates }] : [];
  });
}

export function adjustersWithCoordinates(
  adjusters: FieldAdjuster[],
): AdjusterPin[] {
  return adjusters.flatMap((adjuster) => {
    const coordinates = adjusterCoordinates(adjuster);
    return coordinates ? [{ adjuster, coordinates }] : [];
  });
}

export interface MapLegendItem {
  key: string;
  label: string;
  color: string;
}

export function humanizeLabel(value: string): string {
  return value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export function claimLegend(claims: ClaimStatus[]): MapLegendItem[] {
  return claims.map((status) => ({
    key: status,
    label: humanizeLabel(status),
    color: CLAIM_STATUS_COLORS[status],
  }));
}

export function adjusterLegend(
  adjusters: Array<{ status: UserStatus; availability: Availability }>,
): MapLegendItem[] {
  const seen = new Set<string>();
  const items: MapLegendItem[] = [];

  for (const adjuster of adjusters) {
    const item =
      adjuster.status === "INACTIVE"
        ? { key: "inactive", label: "Inactive", color: "#9CA3AF" }
        : adjuster.availability === "UNAVAILABLE"
          ? { key: "busy", label: "Busy", color: "#EF4444" }
          : { key: "available", label: "Available", color: "#22C55E" };

    if (!seen.has(item.key)) {
      seen.add(item.key);
      items.push(item);
    }
  }

  return items;
}