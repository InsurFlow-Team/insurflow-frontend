import { CheckCircle2 } from "lucide-react";
import FormSectionHeader from "./FormSectionHeader";
import InfoGrid from "../claim-details/InfoGrid";
import InfoRow from "../claim-details/InfoRow";
import type { PolicyVerificationResponse } from "../../types";

interface VerifiedPolicySummaryProps {
  verifiedPolicy: PolicyVerificationResponse;
}

/**
 * Read-only display of verified policy, vehicle, and customer information.
 * 
 * This data comes from successful policy verification and cannot be edited.
 * The user should not re-enter this information manually.
 */
export default function VerifiedPolicySummary({
  verifiedPolicy,
}: VerifiedPolicySummaryProps) {
  const { policy, vehicle, customer } = verifiedPolicy;

  return (
    <div className="space-y-4">
      {/* Success indicator */}
      <div className="flex items-start gap-3 p-4 rounded-lg bg-emerald-50 border border-emerald-200">
        <CheckCircle2
          size={18}
          className="text-emerald-600 mt-0.5 flex-shrink-0"
        />
        <div className="text-sm">
          <p className="font-medium text-emerald-700">
            تم التحقق من البوليصة بنجاح
          </p>
          <p className="text-emerald-600 text-xs mt-1">
            البيانات التالية محققة من النظام
          </p>
        </div>
      </div>

      {/* Policy Info */}
      <div>
        <FormSectionHeader
          title="معلومات البوليصة"
          subtitle="من نظام إدارة البوليصات"
        />
        <div className="mt-3 rounded-lg border border-border bg-surface-soft p-4">
          <InfoGrid columns="2">
            <InfoRow label="رقم البوليصة" value={policy.policyNumber} />
            <InfoRow
              label="الحالة"
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
          </InfoGrid>
        </div>
      </div>

      {/* Vehicle Info */}
      <div>
        <FormSectionHeader
          title="معلومات المركبة"
          subtitle="من سجل المركبات"
        />
        <div className="mt-3 rounded-lg border border-border bg-surface-soft p-4">
          <InfoGrid columns="2">
            <InfoRow label="رقم اللوحة" value={vehicle.plateNumber} />
            {vehicle.make && (
              <InfoRow
                label="الصانع والموديل"
                value={`${vehicle.make} ${vehicle.model || ""}`}
              />
            )}
            {vehicle.year && <InfoRow label="السنة" value={String(vehicle.year)} />}
            {vehicle.color && <InfoRow label="اللون" value={vehicle.color} />}
          </InfoGrid>
        </div>
      </div>

      {/* Customer Info */}
      <div>
        <FormSectionHeader
          title="معلومات العميل"
          subtitle="من سجل العملاء"
        />
        <div className="mt-3 rounded-lg border border-border bg-surface-soft p-4">
          <InfoGrid columns="2">
            <InfoRow label="الاسم الكامل" value={customer.name} />
            <InfoRow label="رقم الهاتف" value={customer.phone} />
          </InfoGrid>
        </div>
      </div>
    </div>
  );
}
