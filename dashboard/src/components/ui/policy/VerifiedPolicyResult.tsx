import { CheckCircle2, AlertTriangle, Shield, Calendar, DollarSign } from "lucide-react";
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
  icon: Icon,
  children,
}: {
  title: string;
  icon?: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        {Icon && <Icon size={16} className="text-text-muted" />}
        <h3 className="text-sm font-semibold text-text">{title}</h3>
      </div>
      <div className="space-y-2 text-sm">{children}</div>
    </div>
  );
}

export default function VerifiedPolicyResult({
  verifiedPolicy,
  onContinue,
  onCancel,
}: VerifiedPolicyResultProps) {
  const { isEligible, eligibilityHint, policy, coverage, vehicle, customer } =
    verifiedPolicy;

  // Determine if we have full coverage information
  const hasCoverageInfo = coverage !== null && coverage !== undefined;
  const hasPolicyExtras =
    policy.policyType || policy.coveredPerils || policy.deductibleAmount;

  return (
    <div className="space-y-5">
      {/* Success/Warning banner */}
      <div
        className={`flex items-start gap-3 p-4 rounded-lg border ${
          isEligible
            ? "bg-success-bg border-success-border"
            : "bg-warning-bg border-warning-border"
        }`}
      >
        {isEligible ? (
          <CheckCircle2
            size={18}
            className="text-success-strong mt-0.5 flex-shrink-0"
          />
        ) : (
          <AlertTriangle
            size={18}
            className="text-warning-text mt-0.5 flex-shrink-0"
          />
        )}
        <div className="text-sm">
          <p
            className={`font-medium mb-1 ${
              isEligible ? "text-success-text" : "text-warning-text"
            }`}
          >
            {isEligible ? "تم التحقق بنجاح" : "تنبيه"}
          </p>
          <p
            className={
              isEligible ? "text-success-strong" : "text-warning-strong"
            }
          >
            {eligibilityHint ||
              (isEligible
                ? "الوثيقة صالحة ويمكن المتابعة لإنشاء المطالبة."
                : "يرجى مراجعة التفاصيل أدناه.")}
          </p>
        </div>
      </div>

      {/* Verified data */}
      <div className="space-y-4">
        {/* Policy Information */}
        <FieldGroup title="معلومات الوثيقة" icon={Shield}>
          <FieldRow label="رقم الوثيقة:" value={policy.policyNumber} />
          <FieldRow
            label="الحالة:"
            value={
              policy.status === "ACTIVE"
                ? "فعّالة"
                : policy.status === "EXPIRED"
                  ? "منتهية"
                  : policy.status === "CANCELLED"
                    ? "ملغاة"
                    : policy.status
            }
          />
          {policy.policyType && (
            <FieldRow
              label="نوع التأمين:"
              value={
                policy.policyType === "COMPREHENSIVE"
                  ? "شامل"
                  : policy.policyType === "THIRD_PARTY"
                    ? "ضد الغير"
                    : policy.policyType
              }
            />
          )}
          {policy.deductibleAmount !== undefined &&
            policy.deductibleAmount !== null && (
              <FieldRow
                label="مبلغ التحمل:"
                value={`${policy.deductibleAmount} ريال`}
              />
            )}
        </FieldGroup>

        {/* Coverage Period */}
        <FieldGroup title="فترة التغطية" icon={Calendar}>
          <FieldRow
            label="من:"
            value={new Date(policy.startDate).toLocaleDateString("ar-SA")}
          />
          <FieldRow
            label="إلى:"
            value={new Date(policy.expiryDate).toLocaleDateString("ar-SA")}
          />
        </FieldGroup>

        {/* Coverage Details */}
        {hasCoverageInfo && coverage && (
          <FieldGroup title="تفاصيل التغطية" icon={Shield}>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-text-muted">التحمل:</span>
                <span className="text-text font-medium">
                  {coverage.deductible} ريال
                </span>
              </div>

              {coverage.incidents && coverage.incidents.length > 0 && (
                <div className="pt-2 border-t border-border">
                  <p className="text-xs font-medium text-text-muted mb-2">
                    الأخطار المشمولة:
                  </p>
                  <div className="space-y-1">
                    {coverage.incidents.map((incident) => (
                      <div
                        key={incident.code}
                        className="flex items-center justify-between text-xs"
                      >
                        <span className="text-text">{incident.code}</span>
                        <span
                          className={
                            incident.covered
                              ? "text-success-strong font-medium"
                              : "text-danger font-medium"
                          }
                        >
                          {incident.covered ? "✓ مشمول" : "✗ غير مشمول"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </FieldGroup>
        )}

        {/* Coverage unavailable notice */}
        {!hasCoverageInfo && hasPolicyExtras && policy.coveredPerils && (
          <FieldGroup title="الأخطار المشمولة" icon={Shield}>
            <div className="space-y-1">
              {policy.coveredPerils.map((peril) => (
                <div key={peril} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 size={14} className="text-success-strong" />
                  <span className="text-text">{peril}</span>
                </div>
              ))}
            </div>
          </FieldGroup>
        )}

        {/* No coverage data available */}
        {!hasCoverageInfo && !hasPolicyExtras && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-surface-soft border border-border">
            <AlertTriangle size={16} className="text-warning-text mt-0.5" />
            <p className="text-xs text-text-muted">
              بيانات التغطية التفصيلية غير متاحة حالياً. سيتم مراجعة المطالبة
              إدارياً.
            </p>
          </div>
        )}

        {/* Vehicle */}
        <FieldGroup title="معلومات المركبة">
          <FieldRow label="رقم اللوحة:" value={vehicle.plateNumber} />
          {(vehicle.make || vehicle.model) && (
            <div className="flex justify-between">
              <span className="text-text-muted">الصانع والطراز:</span>
              <span className="text-text">
                {vehicle.make} {vehicle.model}
              </span>
            </div>
          )}
          {vehicle.year && <FieldRow label="السنة:" value={String(vehicle.year)} />}
        </FieldGroup>

        {/* Customer */}
        <FieldGroup title="معلومات العميل">
          <FieldRow label="الاسم:" value={customer.fullName} />
          <div className="flex justify-between">
            <span className="text-text-muted">الهاتف:</span>
            <span className="text-text">{customer.phone}</span>
          </div>
        </FieldGroup>
      </div>

      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="secondary"
          className="flex-1"
          onClick={onCancel}
        >
          إلغاء
        </Button>
        <Button
          type="button"
          variant="primary"
          className="flex-1"
          onClick={onContinue}
          disabled={!isEligible}
        >
          المتابعة لإنشاء المطالبة
        </Button>
      </div>
    </div>
  );
}