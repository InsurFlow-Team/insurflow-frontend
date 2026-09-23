import { useEffect, useState } from "react";
import Modal from "./Modal";
import PolicyVerificationForm from "./policy/PolicyVerificationForm";
import VerifiedPolicyResult from "./policy/VerifiedPolicyResult";
import { usePolicyVerification } from "../../hooks/usePolicyVerification";
import type { PolicyVerificationResponse } from "../../types";

interface PolicyVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: (verifiedPolicy: PolicyVerificationResponse) => void;
}

/**
 * Policy Verification Modal - Step 1 of claim creation.
 *
 * Claims Officer must verify the policy before creating a claim.
 * At least one of policyNumber or plateNumber is required.
 *
 * Error codes are handled and displayed in Arabic:
 * - POLICY_NOT_FOUND: بوليصة التأمين غير موجودة
 * - VEHICLE_NOT_FOUND: المركبة غير موجودة
 * - POLICY_EXPIRED: بوليصة التأمين منتهية الصلاحية
 * - POLICY_CANCELLED: بوليصة التأمين ملغاة
 * - POLICY_NOT_ACTIVE_ON_DATE: بوليصة التأمين غير فعّالة في تاريخ الحادث
 * - VEHICLE_MISMATCH: عدم تطابق بين رقم اللوحة والبوليصة
 * - INVALID_INCIDENT_DATE: تاريخ الحادث غير صالح
 * - VALIDATION_ERROR: خطأ في البيانات المدخلة
 */
export default function PolicyVerificationModal({
  isOpen,
  onClose,
  onVerified,
}: PolicyVerificationModalProps) {
  const [policyNumber, setPolicyNumber] = useState("");
  const [plateNumber, setPlateNumber] = useState("");
  const [incidentDate, setIncidentDate] = useState("");

  const { verifying, verifiedPolicy, error, errorCode, verify, reset } =
    usePolicyVerification();

  // Reset the whole step whenever the modal closes so the next open starts at
  // the verification form again (never the previous success state).
  useEffect(() => {
    if (!isOpen) {
      setPolicyNumber("");
      setPlateNumber("");
      setIncidentDate("");
      reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!policyNumber.trim() && !plateNumber.trim()) {
      return;
    }

    await verify({
      policyNumber: policyNumber.trim() || undefined,
      plateNumber: plateNumber.trim() || undefined,
      incidentDate: incidentDate.trim() || undefined,
    });
  };

  const handleVerified = () => {
    // The parent owns the step transition: it flips this modal closed and, in
    // the claim-intake flow, opens the next step. The modal itself only reports
    // the result — it must NOT self-close, otherwise the parent's onClose runs
    // twice and the caller can be left in an inconsistent open/close state.
    if (verifiedPolicy) {
      onVerified(verifiedPolicy);
    }
  };

  const handleClose = () => {
    setPolicyNumber("");
    setPlateNumber("");
    setIncidentDate("");
    reset();
    onClose();
  };

  const getErrorMessage = (): string => {
    if (!errorCode) return error || "حدث خطأ في التحقق من البوليصة";

    const messages: Record<string, string> = {
      VALIDATION_ERROR:
        "يرجى إدخال رقم وثيقة التأمين أو رقم لوحة المركبة على الأقل.",
      INVALID_INCIDENT_DATE: "تاريخ الحادث لا يمكن أن يكون في المستقبل.",
      POLICY_NOT_FOUND:
        "وثيقة التأمين غير موجودة في سجلات الشركة.",
      VEHICLE_NOT_FOUND: "المركبة غير مسجلة في قاعدة بيانات الشركة.",
      POLICY_EXPIRED:
        "وثيقة التأمين منتهية الصلاحية ولا يمكن فتح مطالبة عليها.",
      POLICY_CANCELLED: "وثيقة التأمين ملغاة.",
      POLICY_NOT_ACTIVE_ON_DATE:
        "وثيقة التأمين لم تكن سارية المفعول في تاريخ وقوع الحادث.",
      VEHICLE_MISMATCH:
        "رقم اللوحة لا يطابق المركبة المشمولة في هذه الوثيقة.",
    };

    return messages[errorCode] || error || "حدث خطأ في التحقق من البوليصة";
  };

  const canSubmit =
    !verifying &&
    !verifiedPolicy &&
    Boolean(policyNumber.trim() || plateNumber.trim());

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="التحقق من بوليصة التأمين"
      size="md"
    >
      {!verifiedPolicy ? (
        <PolicyVerificationForm
          policyNumber={policyNumber}
          plateNumber={plateNumber}
          incidentDate={incidentDate}
          verifying={verifying}
          error={error ? getErrorMessage() : ""}
          canSubmit={canSubmit}
          onPolicyNumberChange={setPolicyNumber}
          onPlateNumberChange={setPlateNumber}
          onIncidentDateChange={setIncidentDate}
          onSubmit={() => void handleSubmit()}
          onCancel={handleClose}
        />
      ) : (
        <VerifiedPolicyResult
          verifiedPolicy={verifiedPolicy}
          onContinue={handleVerified}
          onCancel={handleClose}
        />
      )}
    </Modal>
  );
}