import apiClient from "./client";
import type { ApiResponse } from "./client";
import type { ClaimSummary } from "../types";
import type { CreateClaimDraft } from "../types";
import { toClaimSummary } from "./claims.transform";

export interface CreateClaimRequest {
  policyId: string; // Required: from policy verification
  plateNumber: string; // Required: verified plate
  incidentType: string;
  incidentLocation: string;
  incidentDate: string; // YYYY-MM-DD
  latitude: number;
  longitude: number;
}

export function toCreateClaimRequest(
  draft: CreateClaimDraft,
): CreateClaimRequest {
  const latitude = Number(draft.latitude);
  const longitude = Number(draft.longitude);

  // Coordinates are now REQUIRED (not optional)
  // Validation happens at form level
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