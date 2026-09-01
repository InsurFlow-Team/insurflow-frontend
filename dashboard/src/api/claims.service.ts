import apiClient from "./client";
import type { ApiResponse } from "./client";
import type { ClaimDetails, ClaimStatus, ClaimSummary } from "../types";

export async function getClaims(status?: ClaimStatus) {
  const response = await apiClient.get<ApiResponse<ClaimSummary[]>>(
    "/claims",
    {
      params: status ? { status } : undefined,
    },
  );

  return response.data.data;
}

export async function getClaimById(claimId: string) {
  const response = await apiClient.get<ApiResponse<ClaimDetails>>(
    `/claims/${claimId}`,
  );

  return response.data.data;
}

export async function startClaimReview(claimId: string) {
  const response = await apiClient.post<
    ApiResponse<{ status: ClaimStatus }>
  >(`/claims/${claimId}/review/start`);

  return response.data.data;
}
