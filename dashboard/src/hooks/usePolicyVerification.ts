import { useState } from "react";
import { verifyPolicy } from "../api/policy.service";
import { getApiErrorCode, getApiErrorMessage } from "../api/client";
import type {
  PolicyVerificationRequest,
  PolicyVerificationResponse,
  PolicyVerificationErrorCode,
} from "../types";

interface UsePolicyVerificationResult {
  verifying: boolean;
  verifiedPolicy: PolicyVerificationResponse | null;
  error: string | null;
  errorCode: PolicyVerificationErrorCode | null;
  verify: (request: PolicyVerificationRequest) => Promise<void>;
  reset: () => void;
}

/**
 * Hook for policy verification before claim creation.
 * 
 * Usage:
 * ```tsx
 * const { verifying, verifiedPolicy, error, errorCode, verify, reset } = usePolicyVerification();
 * 
 * // User enters policy/plate number
 * await verify({ policyNumber: "POL-123", plateNumber: "ABC-1234" });
 * 
 * // If verifiedPolicy is set, proceed to claim creation
 * // Use verifiedPolicy.policy.id as policyId in create claim request
 * ```
 */
export function usePolicyVerification(): UsePolicyVerificationResult {
  const [verifying, setVerifying] = useState(false);
  const [verifiedPolicy, setVerifiedPolicy] =
    useState<PolicyVerificationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] =
    useState<PolicyVerificationErrorCode | null>(null);

  const verify = async (request: PolicyVerificationRequest) => {
    setVerifying(true);
    setError(null);
    setErrorCode(null);
    setVerifiedPolicy(null);

    try {
      const result = await verifyPolicy(request);
      setVerifiedPolicy(result);
    } catch (err) {
      setError(getApiErrorMessage(err));
      setErrorCode(
        getApiErrorCode(err) as PolicyVerificationErrorCode | null,
      );
    } finally {
      setVerifying(false);
    }
  };

  const reset = () => {
    setVerifying(false);
    setVerifiedPolicy(null);
    setError(null);
    setErrorCode(null);
  };

  return {
    verifying,
    verifiedPolicy,
    error,
    errorCode,
    verify,
    reset,
  };
}
