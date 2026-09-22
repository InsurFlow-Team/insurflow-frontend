import type { PolicyInfo } from "../types";

/**
 * Policy verification — claim intake Step 1.
 *
 * The backend policy-verification contract is NOT available yet (محمد has not
 * provided the endpoint / request / response shapes). Until then this module
 * exposes the ONLY seam the UI depends on — `verifyPolicy(policyNumber)`. When
 * the contract lands, replace the mock body below with a real `apiClient`
 * call; no component, page, or test needs to change beyond this file.
 *
 * TODO(backend): connect to the real policy-verification endpoint once the
 * contract is provided. The result reuses the existing `PolicyInfo` domain
 * type on purpose; user-expected extras (insured name, insurance company,
 * vehicle, plate number) are intentionally NOT modeled until the backend
 * defines them — nothing here is registered as a contract field.
 */

// ── MOCK POLICY DATA — development ONLY ─────────────────────────────────────
// Clearly marked, never shipped as real data. Removed/replaced with the live
// backend response in one place right here.
const DEVELOPMENT_MOCK_POLICY: PolicyInfo = {
  policyNumber: "POL-1000203",
  status: "ACTIVE",
  startDate: "2026-01-01T00:00:00.000Z",
  expiryDate: "2026-12-31T23:59:59.000Z",
};

// Simulated "policy not found" in the exact axios shape the rest of the app
// normalizes via getApiErrorMessage, so the UI error path is identical to a
// real backend 404 once the contract exists.
function mockPolicyNotFound(policyNumber: string): Error {
  const message = `Policy ${policyNumber} was not found. Check the number and try again.`;
  return Object.assign(new Error(message), {
    isAxiosError: true,
    response: {
      status: 404,
      data: {
        success: false,
        message,
      },
    },
  });
}

/**
 * Verifies an insurance policy by number. Resolves with the verified policy on
 * success; rejects (axios-shaped error) on failure. No claim is created unless
 * this resolves.
 *
 * MOCK behaviour (dev only, 600ms simulated latency): every number verifies
 * OK — except "00000000", which fails like a not-found policy so the UI error
 * state can be exercised manually: `verifyPolicy("00000000")` → rejected.
 */
export function verifyPolicy(policyNumber: string): Promise<PolicyInfo> {
  const normalized = policyNumber.trim();

  return new Promise<PolicyInfo>((resolve, reject) => {
    setTimeout(() => {
      if (normalized === "00000000") {
        reject(mockPolicyNotFound(normalized));
        return;
      }

      resolve({ ...DEVELOPMENT_MOCK_POLICY, policyNumber: normalized });
    }, 600);
  });
}