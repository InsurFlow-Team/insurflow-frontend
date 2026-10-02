import apiClient from "./client";
import type { ApiResponse } from "./client";
import type { ClaimSummary } from "../types";
import type { CreateClaimDraft } from "../types";
import { toClaimSummary } from "./claims.transform";

export interface CreateClaimRequest {
  policyId: string; // Required: from policy verification
  plateNumber: string; // Required: verified plate
  incidentType: string;
  incidentLocation: string; // Place description, e.g. "شارع الملك فهد، بالقرب من..."
  incidentDate: string; // YYYY-MM-DD
  latitude?: number;
  longitude?: number;
}

export function toCreateClaimRequest(
  draft: CreateClaimDraft,
): CreateClaimRequest {
  // The officer pins the incident on the intake map; the resulting coordinates
  // are REQUIRED before submit (2026-09-20 ruling, restored 2026-09-24). A
  // partial/empty pair never goes on the wire — the form blocks it first.
  const rawLatitude =
    typeof draft.latitude === "string" ? draft.latitude.trim() : "";
  const rawLongitude =
    typeof draft.longitude === "string" ? draft.longitude.trim() : "";

  if (rawLatitude === "" || rawLongitude === "") {
    throw new Error("Valid incident coordinates are required");
  }

  const latitude = Number(rawLatitude);
  const longitude = Number(rawLongitude);

  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    Math.abs(latitude) > 90 ||
    Math.abs(longitude) > 180
  ) {
    throw new Error("Valid incident coordinates are required");
  }

  return {
    policyId: draft.policyId,
    plateNumber: draft.plateNumber,
    incidentType: draft.incidentType,
    incidentLocation: draft.incidentLocation,
    incidentDate: draft.incidentDate,
    latitude,
    longitude,
  };
}

export async function createClaim(
  payload: CreateClaimRequest,
): Promise<ClaimSummary> {
  const response = await apiClient.post<ApiResponse<ClaimSummary>>(
    "/claims",
    payload,
  );

  // Normalize the created claim (id/status/incidentCoordinates from the
  // response) so the result can feed the map marker straight from the
  // backend's incidentCoordinates echo.
  return toClaimSummary(response.data.data);
}