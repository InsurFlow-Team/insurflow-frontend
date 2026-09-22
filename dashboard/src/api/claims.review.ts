import apiClient from "./client";
import type { ApiResponse } from "./client";
import type { ClaimStatus } from "../types";

export async function startClaimReview(claimId: string) {
  const response = await apiClient.post<
    ApiResponse<{ status: ClaimStatus }>
  >(`/claims/${claimId}/review/start`);

  return response.data.data;
}

export type ClaimDecision = "APPROVED" | "REJECTED";

export interface ClaimDecisionResult {
  id: string;
  claimNumber: string;
  status: ClaimStatus;
  decisionNotes: string | null;
}

export async function submitClaimDecision(
  claimId: string,
  decision: ClaimDecision,
  notes: string,
) {
  const response = await apiClient.post<ApiResponse<ClaimDecisionResult>>(
    `/claims/${claimId}/decision`,
    {
      decision,
      notes,
    },
  );

  return response.data.data;
}

export async function requestClaimCorrection(
  claimId: string,
  notes: string,
) {
  const response = await apiClient.post<ApiResponse<{ status: ClaimStatus }>>(
    `/claims/${claimId}/review/request-correction`,
    {
      notes,
    },
  );

  return response.data.data;
}