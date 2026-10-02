import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createClaim, toCreateClaimRequest } from "../api/claims.service";
import { toast } from "../contexts/ToastContext";
import type { ClaimSummary, PolicyVerificationResponse } from "../types";
import type { NewClaimData } from "../components/claim-form/claimFormConstants";

interface UseClaimIntakeOptions {
  /**
   * Best-effort post-create refresh. Called after the claim is committed but
   * before navigation; it must never throw into the create flow.
   */
  onCreated?: (created: ClaimSummary) => void;
}

/**
 * Owns the claim-creation chain: policy-verification gate → intake modal →
 * POST /claims → toast + navigate to the new claim's details.
 *
 * The verified policy is referentially stable useState data (never rebuilt per
 * render), so the intake's read-only summary and submit merge use the same
 * object for the whole open session.
 */
export function useClaimIntake(options: UseClaimIntakeOptions = {}) {
  const navigate = useNavigate();
  const [isPolicyVerificationOpen, setIsPolicyVerificationOpen] =
    useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [verifiedPolicy, setVerifiedPolicy] =
    useState<PolicyVerificationResponse | null>(null);

  // Claim intake is gated by policy verification: "Add Claim" opens the
  // verification step first, and the intake form is reachable only after a
  // successful check (PolicyVerificationModal → onVerified).
  const openPolicyVerification = () => {
    setIsPolicyVerificationOpen(true);
  };

  const handlePolicyVerified = (verified: PolicyVerificationResponse) => {
    setVerifiedPolicy(verified);
    setIsPolicyVerificationOpen(false);
    setIsCreateModalOpen(true);
  };

  const closeVerification = () => setIsPolicyVerificationOpen(false);
  const closeCreate = () => setIsCreateModalOpen(false);

  async function handleCreate(claimData: NewClaimData): Promise<ClaimSummary> {
    // Hard guard: creation is impossible without a verified policy id. Never
    // falls back to an empty policyId on the wire.
    const policyId = verifiedPolicy?.policy.id ?? "";
    if (!policyId) {
      throw new Error(
        "لم يتم التحقق من البوليصة. أعد التحقق قبل إنشاء المطالبة.",
      );
    }

    const plateNumber = verifiedPolicy?.vehicle.plateNumber ?? "";
    const created = await createClaim(
      toCreateClaimRequest({ ...claimData, policyId, plateNumber }),
    );

    // A successful create is a committed business operation: navigate the user
    // straight to the new claim's details using the returned id. The list
    // refresh afterwards is best-effort only and must never turn this into a
    // failure (the caller's onCreated handles its own errors).
    toast("success", `تم إنشاء المطالبة ${created.claimNumber} بنجاح.`);
    options.onCreated?.(created);
    navigate(`/claims/${created.id}`);

    return created;
  }

  return {
    isPolicyVerificationOpen,
    isCreateModalOpen,
    verifiedPolicy,
    openPolicyVerification,
    handlePolicyVerified,
    handleCreate,
    closeVerification,
    closeCreate,
  };
}