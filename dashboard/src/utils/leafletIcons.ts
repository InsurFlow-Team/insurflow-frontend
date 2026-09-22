import L from "leaflet";
import type { ClaimStatus, FieldAdjuster } from "../types";
import { CLAIM_STATUS_COLORS, adjusterPinColor } from "./map";

// Custom div icons: Leaflet's default marker PNGs point at missing assets under
// Vite, so we render small colored pins instead (theme-independent, no images).
function dotIcon(kind: "claim" | "adjuster", color: string, label: string) {
  const shape = kind === "claim" ? "border-radius:50%" : "border-radius:3px";

  return L.divIcon({
    className: "",
    html: `<div role="img" aria-label="${label}" style="width:${kind === "claim" ? 14 : 15}px;height:${kind === "claim" ? 14 : 15}px;${shape};background:${color};border:2px solid #ffffff;box-shadow:0 1px 4px rgba(0,0,0,0.45)"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    popupAnchor: [0, -10],
  });
}

export function claimIcon(status: ClaimStatus) {
  return dotIcon(
    "claim",
    CLAIM_STATUS_COLORS[status],
    `Claim ${status.replace(/_/g, " ")}`,
  );
}

export function adjusterIcon(adjuster: FieldAdjuster) {
  return dotIcon(
    "adjuster",
    adjusterPinColor(adjuster),
    `Field adjuster ${adjuster.availability === "UNAVAILABLE" ? "busy" : adjuster.status === "INACTIVE" ? "inactive" : "available"}`,
  );
}