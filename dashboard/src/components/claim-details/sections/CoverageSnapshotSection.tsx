import { Shield, Clock, CheckCircle2, XCircle } from "lucide-react";
import DetailSection from "../DetailSection";
import type { ClaimDetails } from "../../../types";

interface CoverageSnapshotSectionProps {
  claim: ClaimDetails;
}

/**
 * CoverageSnapshotSection - Shows the frozen coverage at time of claim creation.
 * 
 * This is a static snapshot captured when the claim was created, so it represents
 * the exact coverage terms at the moment of the incident - regardless of any
 * subsequent policy changes.
 * 
 * Only shown if coverageSnapshot exists in the claim data.
 */
export default function CoverageSnapshotSection({
  claim,
}: CoverageSnapshotSectionProps) {
  const { coverageSnapshot } = claim;

  // Don't render if no coverage snapshot available
  if (!coverageSnapshot) {
    return null;
  }

  const {
    policyType,
    coveredPerils,
    deductibleAmount,
    capturedAt,
  } = coverageSnapshot;

  return (
    <DetailSection title="لقطة التغطية وقت الحادث">
      <div className="space-y-4">
        {/* Info banner */}
        <div className="flex items-start gap-3 p-4 rounded-lg bg-info-bg border border-info-border">
          <Clock size={18} className="text-info-text mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-info-strong mb-1">
              لقطة ثابتة من شروط التغطية
            </p>
            <p className="text-info-text text-xs">
              هذه نسخة محفوظة من شروط التغطية بتاريخ إنشاء المطالبة. لا تتأثر
              بأي تعديلات لاحقة على الوثيقة.
            </p>
          </div>
        </div>

        {/* Coverage details grid */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Policy Type */}
          <div className="p-4 rounded-lg border border-border bg-surface-soft">
            <div className="flex items-center gap-2 mb-2">
              <Shield size={16} className="text-text-muted" />
              <p className="text-xs font-medium text-text-muted">نوع التأمين</p>
            </div>
            <p className="text-sm font-semibold text-text">
              {policyType === "COMPREHENSIVE"
                ? "شامل"
                : policyType === "THIRD_PARTY"
                  ? "ضد الغير"
                  : policyType}
            </p>
          </div>

          {/* Deductible */}
          <div className="p-4 rounded-lg border border-border bg-surface-soft">
            <div className="flex items-center gap-2 mb-2">
              <Shield size={16} className="text-text-muted" />
              <p className="text-xs font-medium text-text-muted">مبلغ التحمل</p>
            </div>
            <p className="text-sm font-semibold text-text">
              {deductibleAmount} ₪
            </p>
          </div>
        </div>

        {/* Covered Perils */}
        {coveredPerils && coveredPerils.length > 0 && (
          <div className="p-4 rounded-lg border border-border bg-surface">
            <p className="text-sm font-medium text-text mb-3">
              الأخطار المشمولة:
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {coveredPerils.map((peril) => (
                <div
                  key={peril}
                  className="flex items-center gap-2 text-sm"
                >
                  <CheckCircle2
                    size={16}
                    className="text-success-strong flex-shrink-0"
                  />
                  <span className="text-text">{peril}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Timestamp */}
        <div className="pt-2 border-t border-border">
          <p className="text-xs text-text-subtle">
            تم حفظ اللقطة بتاريخ:{" "}
            {new Date(capturedAt).toLocaleString("ar-SA", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
        </div>
      </div>
    </DetailSection>
  );
}
