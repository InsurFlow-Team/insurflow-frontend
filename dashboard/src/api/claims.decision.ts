import apiClient from "./client";
import type { ApiResponse } from "./client";
import type { ClaimStatus, LossAssessment } from "../types";

export type ClaimDecision = "APPROVED" | "REJECTED";

export interface DecideClaimPayload {
  decision: ClaimDecision;
  notes?: string;
  lossAssessment?: LossAssessment;
}

/**
 * Make a final decision on a claim (approve or reject).
 * For approvals, optionally include loss assessment details.
 */
export async function decideClaim(
  claimId: string,
  payload: DecideClaimPayload,
): Promise<{ status: ClaimStatus }>;

/**
 * @deprecated Legacy signature - use the payload version instead
 */
export async function decideClaim(
  claimId: string,
  decision: ClaimDecision,
  notes?: string,
): Promise<{ status: ClaimStatus }>;

export async function decideClaim(
  claimId: string,
  payloadOrDecision: DecideClaimPayload | ClaimDecision,
  notes?: string,
) {
  // Support both new payload format and legacy (decision, notes?) signature
  const payload: DecideClaimPayload =
    typeof payloadOrDecision === "string"
      ? { decision: payloadOrDecision, ...(notes ? { notes } : {}) }
      : payloadOrDecision;

  const response = await apiClient.post<
    ApiResponse<{ status: ClaimStatus }>
  >(`/claims/${claimId}/decision`, payload);

  return response.data.data;
}