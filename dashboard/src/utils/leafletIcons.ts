import L from "leaflet";
import type { ClaimStatus, FieldAdjuster } from "../types";
import { CLAIM_STATUS_COLORS, adjusterPinColor } from "./map";

// Custom div icons: Leaflet's default marker PNGs point at missing assets under
// Vite, so we render small colored pins instead (theme-independent, no images).

// Incident markers are teardrop pins — visually distinct from the square
// adjuster dots, matching the "incident location" mental model.
function teardropIcon(color: string, label: string) {
  const svg =
    '<svg width="24" height="32" viewBox="0 0 24 32" xmlns="http://www.w3.org/2000/svg">' +
    '<path d="M12 0C5.373 0 0 5.373 0 12c0 8.25 12 20 12 20s12-11.75 12-20C24 5.373 18.627 0 12 0z" fill="' +
    color +
    '" stroke="#ffffff" stroke-width="1.5"/>' +
    '<circle cx="12" cy="11.5" r="4.5" fill="#ffffff" opacity="0.3"/></svg>';

  return L.divIcon({
    className: "",
    html: `<div role="img" aria-label="${label}" style="filter:drop-shadow(0 1px 3px rgba(0,0,0,0.45))">${svg}</div>`,
    iconSize: [24, 32],
    iconAnchor: [12, 32],
    popupAnchor: [0, -30],
  });
}

function dotIcon(color: string, label: string) {
  return L.divIcon({
    className: "",
    html: `<div role="img" aria-label="${label}" style="width:15px;height:15px;border-radius:3px;background:${color};border:2px solid #ffffff;box-shadow:0 1px 4px rgba(0,0,0,0.45)"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    popupAnchor: [0, -10],
  });
}

export function claimIcon(status: ClaimStatus) {
  return teardropIcon(
    CLAIM_STATUS_COLORS[status],
    `Incident location ${status.replace(/_/g, " ")}`,
  );
}

export function adjusterIcon(adjuster: FieldAdjuster) {
  return dotIcon(
    adjusterPinColor(adjuster),
    `Field adjuster ${adjuster.availability === "UNAVAILABLE" ? "busy" : adjuster.status === "INACTIVE" ? "inactive" : "available"}`,
  );
}