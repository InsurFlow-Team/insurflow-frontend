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
}

export function toCreateClaimRequest(
  draft: CreateClaimDraft,
): CreateClaimRequest {
  // Incident location is descriptive TEXT only — coordinates are never sent
  // from the intake (ruling 2026-09-24). The backend stores incidentCoordinates
  // as null for text-only claims; the dispatch map falls back to the text.
  return {
    policyId: draft.policyId,
    plateNumber: draft.plateNumber,
    incidentType: draft.incidentType,
    incidentLocation: draft.incidentLocation,
    incidentDate: draft.incidentDate,
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