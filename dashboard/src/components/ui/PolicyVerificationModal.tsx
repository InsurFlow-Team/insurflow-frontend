import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import Modal from "./Modal";
import VerifiedPolicyResult from "./policy/VerifiedPolicyResult";
import PolicyVerificationForm from "./policy/PolicyVerificationForm";
import { getApiErrorMessage } from "../../api/client";
import { verifyPolicy } from "../../api/policy.service";
import type { PolicyInfo } from "../../types";

interface PolicyVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
}

/**
 * Claim intake Step 1 — Policy Verification. Nothing about the claim flow
 * continues until `verifyPolicy` resolves. The verified policy result area
 * renders only the existing `PolicyInfo` type (see policy.service.ts); insured /
 * insurance-company / vehicle details are reserved until the backend contract.
 */
export default function PolicyVerificationModal({
  isOpen,
  onClose,
  onContinue,
}: PolicyVerificationModalProps) {
  const [policyNumber, setPolicyNumber] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState("");
  const [verifiedPolicy, setVerifiedPolicy] = useState<PolicyInfo | null>(null);

  // Reset the whole step whenever the modal closes.
  useEffect(() => {
    if (!isOpen) {
      setPolicyNumber("");
      setIsVerifying(false);
      setError("");
      setVerifiedPolicy(null);
    }
  }, [isOpen]);

  const handlePolicyNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPolicyNumber(e.target.value);
    // Editing invalidates a stale result / error for a different number.
    setVerifiedPolicy(null);
    setError("");
  };

  const handleVerify = async () => {
    if (isVerifying || policyNumber.trim() === "") {
      return;
    }

    setError("");
    setIsVerifying(true);

    try {
      const policy = await verifyPolicy(policyNumber);
      setVerifiedPolicy(policy);
    } catch (verifyError) {
      setError(getApiErrorMessage(verifyError));
    } finally {
      setIsVerifying(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      void handleVerify();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Policy Verification"
      size="md"
    >
      <div className="space-y-5">
        {/* Step banner */}
        <div className="flex items-start gap-3 p-4 rounded-lg bg-primary-light border border-primary/10">
          <ShieldCheck size={18} className="text-primary mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-primary mb-1">
              Step 1 of 2 — verify the insurance policy
            </p>
            <p className="text-text-muted">
              A claim can only be created after a successful policy check.
            </p>
          </div>
        </div>

        {verifiedPolicy ? (
          <VerifiedPolicyResult
            policy={verifiedPolicy}
            onReset={() => {
              setVerifiedPolicy(null);
              setError("");
            }}
            onContinue={onContinue}
          />
        ) : (
          <PolicyVerificationForm
            policyNumber={policyNumber}
            isVerifying={isVerifying}
            error={error}
            onPolicyNumberChange={handlePolicyNumberChange}
            onVerify={() => void handleVerify()}
            onKeyDown={handleKeyDown}
            onClose={onClose}
          />
        )}
      </div>
    </Modal>
  );
}