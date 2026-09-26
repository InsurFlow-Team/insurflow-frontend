import apiClient from "./client";
import type { ApiResponse } from "./client";
import type { ClaimStatus } from "../types";

export type ClaimDecision = "APPROVED" | "REJECTED";

export async function decideClaim(
  claimId: string,
  decision: ClaimDecision,
  notes?: string,
) {
  const response = await apiClient.post<
    ApiResponse<{ status: ClaimStatus }>
  >(`/claims/${claimId}/decision`, {
    decision,
    ...(notes ? { notes } : {}),
  });

  return response.data.data;
}