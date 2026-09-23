import { AlertCircle, Shield } from "lucide-react";
import Button from "../Button";
import FormField from "../FormField";

const FIELD_CLASS =
  "w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50";

interface PolicyVerificationFormProps {
  policyNumber: string;
  plateNumber: string;
  incidentDate: string;
  verifying: boolean;
  /** Non-empty only when the verification request failed (already mapped from the error code). */
  error: string;
  canSubmit: boolean;
  onPolicyNumberChange: (value: string) => void;
  onPlateNumberChange: (value: string) => void;
  onIncidentDateChange: (value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export default function PolicyVerificationForm({
  policyNumber,
  plateNumber,
  incidentDate,
  verifying,
  error,
  canSubmit,
  onPolicyNumberChange,
  onPlateNumberChange,
  onIncidentDateChange,
  onSubmit,
  onCancel,
}: PolicyVerificationFormProps) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="space-y-5"
    >
      {/* Info banner */}
      <div className="flex items-start gap-3 p-4 rounded-lg bg-primary-light border border-primary/10">
        <Shield size={18} className="text-primary mt-0.5 flex-shrink-0" />
        <div className="text-sm">
          <p className="font-medium text-primary mb-1">التحقق من الأهلية</p>
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
          onChange={(e) => onPolicyNumberChange(e.target.value)}
          placeholder="POL-1234567"
          disabled={verifying}
          className={FIELD_CLASS}
        />
      </FormField>

      <FormField label="رقم اللوحة">
        <input
          type="text"
          value={plateNumber}
          onChange={(e) => onPlateNumberChange(e.target.value)}
          placeholder="ABC-1234"
          disabled={verifying}
          className={FIELD_CLASS}
        />
      </FormField>

      <FormField label="تاريخ الحادث (اختياري)">
        <input
          type="date"
          value={incidentDate}
          onChange={(e) => onIncidentDateChange(e.target.value)}
          disabled={verifying}
          className={FIELD_CLASS}
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
          <span>{error}</span>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="secondary"
          className="flex-1"
          onClick={onCancel}
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
  );
}