import apiClient from "./client";
import type { ApiResponse } from "./client";
import type {
  PolicyVerificationRequest,
  PolicyVerificationResponse,
} from "../types";

/**
 * Policy verification — claim intake Step 1.
 *
 * Before creating a claim, the Claims Officer must verify the policy using
 * policy number and/or plate number. Only after successful verification can
 * the user proceed to claim creation.
 *
 * Backend contract:
 * POST /api/v1/policies/verify
 * 
 * Request: { policyNumber?, plateNumber?, incidentDate? }
 * - At least one of policyNumber or plateNumber is required
 * - incidentDate is optional (YYYY-MM-DD format)
 * 
 * Response: { isEligible, policy, vehicle, customer }
 * 
 * Error codes (handle via getApiErrorCode):
 * - VALIDATION_ERROR
 * - INVALID_INCIDENT_DATE
 * - POLICY_NOT_FOUND
 * - VEHICLE_NOT_FOUND
 * - POLICY_EXPIRED
 * - POLICY_CANCELLED
 * - POLICY_NOT_ACTIVE_ON_DATE
 * - VEHICLE_MISMATCH
 */

export async function verifyPolicy(
  request: PolicyVerificationRequest,
): Promise<PolicyVerificationResponse> {
  const response = await apiClient.post<
    ApiResponse<PolicyVerificationResponse>
  >("/policies/verify", request);

  return response.data.data;
}