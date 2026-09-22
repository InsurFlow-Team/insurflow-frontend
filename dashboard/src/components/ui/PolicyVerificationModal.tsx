import { useState } from "react";
import { AlertCircle, CheckCircle2, Shield } from "lucide-react";
import Modal from "./Modal";
import Button from "./Button";
import FormField from "./FormField";
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
    if (verifiedPolicy) {
      onVerified(verifiedPolicy);
      handleClose();
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
      POLICY_NOT_FOUND: "بوليصة التأمين غير موجودة. تحقق من الرقم وحاول مرة أخرى.",
      VEHICLE_NOT_FOUND: "المركبة غير موجودة. تحقق من رقم اللوحة وحاول مرة أخرى.",
      POLICY_EXPIRED: "بوليصة التأمين منتهية الصلاحية. لا يمكن إنشاء مطالبة.",
      POLICY_CANCELLED: "بوليصة التأمين ملغاة. لا يمكن إنشاء مطالبة.",
      POLICY_NOT_ACTIVE_ON_DATE:
        "بوليصة التأمين غير فعّالة في تاريخ الحادث المحدد.",
      VEHICLE_MISMATCH:
        "عدم تطابق بين رقم اللوحة والبوليصة. تحقق من البيانات.",
      INVALID_INCIDENT_DATE: "تاريخ الحادث غير صالح. استخدم الصيغة YYYY-MM-DD.",
      VALIDATION_ERROR: "خطأ في البيانات المدخلة. تحقق من جميع الحقول.",
    };

    return messages[errorCode] || error || "حدث خطأ في التحقق من البوليصة";
  };

  const canSubmit =
    !verifying &&
    !verifiedPolicy &&
    (policyNumber.trim() || plateNumber.trim());

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="التحقق من بوليصة التأمين"
      size="md"
    >
      {!verifiedPolicy ? (
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Info banner */}
          <div className="flex items-start gap-3 p-4 rounded-lg bg-primary-light border border-primary/10">
            <Shield size={18} className="text-primary mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-primary mb-1">
                التحقق من الأهلية
              </p>
              <p className="text-text-muted">
                يجب إدخال رقم البوليصة أو رقم اللوحة (أو كلاهما) للتحقق من أهلية
                المطالبة.
              </p>
            </div>
          </div>

          <FormField label="رقم بوليصة التأمين">
            <input
              type="text"
              value={policyNumber}
              onChange={(e) => setPolicyNumber(e.target.value)}
              placeholder="POL-1234567"
              disabled={verifying}
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
            />
          </FormField>

          <FormField label="رقم اللوحة">
            <input
              type="text"
              value={plateNumber}
              onChange={(e) => setPlateNumber(e.target.value)}
              placeholder="ABC-1234"
              disabled={verifying}
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
            />
          </FormField>

          <FormField label="تاريخ الحادث (اختياري)">
            <input
              type="date"
              value={incidentDate}
              onChange={(e) => setIncidentDate(e.target.value)}
              disabled={verifying}
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
            />
            <p className="mt-1.5 text-xs text-text-muted">
              اختياري: للتحقق من صلاحية البوليصة في تاريخ الحادث
            </p>
          </FormField>

          {error && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-lg border border-danger/20 bg-red-50 px-4 py-3 text-sm text-danger"
            >
              <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
              <span>{getErrorMessage()}</span>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={handleClose}
              disabled={verifying}
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
              loading={verifying}
              disabled={!canSubmit}
            >
              التحقق من البوليصة
            </Button>
          </div>
        </form>
      ) : (
        <div className="space-y-5">
          {/* Success banner */}
          <div className="flex items-start gap-3 p-4 rounded-lg bg-emerald-50 border border-emerald-200">
            <CheckCircle2
              size={18}
              className="text-emerald-600 mt-0.5 flex-shrink-0"
            />
            <div className="text-sm">
              <p className="font-medium text-emerald-700 mb-1">
                تم التحقق بنجاح
              </p>
              <p className="text-emerald-600">
                البوليصة صالحة ويمكن المتابعة لإنشاء المطالبة.
              </p>
            </div>
          </div>

          {/* Verified data */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-text mb-3">
                معلومات البوليصة
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-muted">رقم البوليصة:</span>
                  <span className="text-text font-medium">
                    {verifiedPolicy.policy.policyNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">الحالة:</span>
                  <span className="text-text font-medium">
                    {verifiedPolicy.policy.status === "ACTIVE"
                      ? "فعّالة"
                      : verifiedPolicy.policy.status}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-text mb-3">
                معلومات المركبة
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-muted">رقم اللوحة:</span>
                  <span className="text-text font-medium">
                    {verifiedPolicy.vehicle.plateNumber}
                  </span>
                </div>
                {verifiedPolicy.vehicle.make && (
                  <div className="flex justify-between">
                    <span className="text-text-muted">الصانع:</span>
                    <span className="text-text">
                      {verifiedPolicy.vehicle.make}{" "}
                      {verifiedPolicy.vehicle.model}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-text mb-3">
                معلومات العميل
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-muted">الاسم:</span>
                  <span className="text-text font-medium">
                    {verifiedPolicy.customer.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">الهاتف:</span>
                  <span className="text-text">
                    {verifiedPolicy.customer.phone}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={handleClose}
            >
              إلغاء
            </Button>
            <Button
              type="button"
              variant="primary"
              className="flex-1"
              onClick={handleVerified}
            >
              المتابعة لإنشاء المطالبة
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
