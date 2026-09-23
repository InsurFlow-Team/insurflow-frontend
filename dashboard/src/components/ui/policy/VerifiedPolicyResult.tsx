import { CheckCircle2 } from "lucide-react";
import Button from "../Button";
import type { PolicyVerificationResponse } from "../../../types";

interface VerifiedPolicyResultProps {
  verifiedPolicy: PolicyVerificationResponse;
  onContinue: () => void;
  onCancel: () => void;
}

function FieldRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-text-muted">{label}</span>
      <span className="text-text font-medium">{value}</span>
    </div>
  );
}

function FieldGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-text mb-3">{title}</h3>
      <div className="space-y-2 text-sm">{children}</div>
    </div>
  );
}

export default function VerifiedPolicyResult({
  verifiedPolicy,
  onContinue,
  onCancel,
}: VerifiedPolicyResultProps) {
  return (
    <div className="space-y-5">
      {/* Success banner */}
      <div className="flex items-start gap-3 p-4 rounded-lg bg-emerald-50 border border-emerald-200">
        <CheckCircle2 size={18} className="text-emerald-600 mt-0.5 flex-shrink-0" />
        <div className="text-sm">
          <p className="font-medium text-emerald-700 mb-1">تم التحقق بنجاح</p>
          <p className="text-emerald-600">
            البوليصة صالحة ويمكن المتابعة لإنشاء المطالبة.
          </p>
        </div>
      </div>

      {/* Verified data */}
      <div className="space-y-4">
        <FieldGroup title="معلومات البوليصة">
          <FieldRow
            label="رقم البوليصة:"
            value={verifiedPolicy.policy.policyNumber}
          />
          <FieldRow
            label="الحالة:"
            value={
              verifiedPolicy.policy.status === "ACTIVE"
                ? "فعّالة"
                : verifiedPolicy.policy.status
            }
          />
        </FieldGroup>

        <FieldGroup title="معلومات المركبة">
          <FieldRow label="رقم اللوحة:" value={verifiedPolicy.vehicle.plateNumber} />
          {(verifiedPolicy.vehicle.make || verifiedPolicy.vehicle.model) && (
            <div className="flex justify-between">
              <span className="text-text-muted">الصانع:</span>
              <span className="text-text">
                {verifiedPolicy.vehicle.make} {verifiedPolicy.vehicle.model}
              </span>
            </div>
          )}
        </FieldGroup>

        <FieldGroup title="معلومات العميل">
          <FieldRow label="الاسم:" value={verifiedPolicy.customer.fullName} />
          <div className="flex justify-between">
            <span className="text-text-muted">الهاتف:</span>
            <span className="text-text">{verifiedPolicy.customer.phone}</span>
          </div>
        </FieldGroup>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="secondary" className="flex-1" onClick={onCancel}>
          إلغاء
        </Button>
        <Button type="button" variant="primary" className="flex-1" onClick={onContinue}>
          المتابعة لإنشاء المطالبة
        </Button>
      </div>
    </div>
  );
}