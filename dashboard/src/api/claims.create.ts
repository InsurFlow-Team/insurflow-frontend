import apiClient from "./client";
import type { ApiResponse } from "./client";
import type { ClaimSummary } from "../types";
import type { CreateClaimDraft } from "../types";
import { toClaimSummary } from "./claims.transform";

export interface CreateClaimRequest {
  customerName: string;
  customerPhone: string;
  initialPlateNumber: string;
  incidentType: string;
  incidentLocation: string;
  // Backend contract (confirmed): coordinates are top-level fields, NOT nested
  // inside incidentCoordinates. They are optional but must be sent as a pair —
  // a partial coordinate is a frontend validation error, never a request.
  latitude?: number;
  longitude?: number;
}

export function toCreateClaimRequest(
  draft: CreateClaimDraft,
): CreateClaimRequest {
  const request: CreateClaimRequest = {
    customerName: draft.customerName,
    customerPhone: draft.customerPhone,
    initialPlateNumber: draft.initialPlateNumber,
    incidentType: draft.incidentType,
    incidentLocation: draft.incidentLocation,
  };

  // Both-or-neither: a single coordinate would be an incomplete request. Only
  // a fully valid pair is ever attached (top-level, per the backend contract).
  const latitude = Number(draft.latitude);
  const longitude = Number(draft.longitude);
  const hasLatitude =
    draft.latitude.trim() !== "" &&
    Number.isFinite(latitude) &&
    Math.abs(latitude) <= 90;
  const hasLongitude =
    draft.longitude.trim() !== "" &&
    Number.isFinite(longitude) &&
    Math.abs(longitude) <= 180;

  if (hasLatitude && hasLongitude) {
    request.latitude = latitude;
    request.longitude = longitude;
  }

  return request;
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