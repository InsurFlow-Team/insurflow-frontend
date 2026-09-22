import apiClient from "./client";
import type { ApiResponse } from "./client";
import type { ClaimStatus } from "../types";

export async function startClaimReview(claimId: string) {
  const response = await apiClient.post<
    ApiResponse<{ status: ClaimStatus }>
  >(`/claims/${claimId}/review/start`);

  return response.data.data;
}