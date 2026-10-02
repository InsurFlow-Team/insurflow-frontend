import { CheckCircle2, Circle, Loader2 } from "lucide-react";
import DetailSection from "../DetailSection";
import type { ClaimDetails } from "../../../types";

interface ReadinessItem {
  id: string;
  label: string;
  completed: boolean;
  pending?: boolean;
}

interface ClaimReadinessSectionProps {
  claim: ClaimDetails;
}

/**
 * ClaimReadinessSection - Shows what's completed and what's still missing.
 * 
 * This is NOT a score or percentage. It's a clear checklist built ONLY from
 * actual data in the claim response. No invented completion states.
 * 
 * Each item is marked as:
 * - ✓ Completed: data exists and is valid
 * - ○ Pending: data is missing or incomplete
 * - ⟳ In Progress: actively being worked on
 */
export default function ClaimReadinessSection({
  claim,
}: ClaimReadinessSectionProps) {
  const items: ReadinessItem[] = [
    {
      id: "policy",
      label: "التحقق من الوثيقة",
      completed: Boolean(claim.policy?.id),
    },
    {
      id: "vehicle",
      label: "بيانات المركبة",
      completed: Boolean(claim.vehicle.plateNumber),
    },
    {
      id: "customer",
      label: "بيانات العميل",
      completed: Boolean(claim.customer.name),
    },
    {
      id: "incident",
      label: "بيانات الحادث",
      completed: Boolean(claim.incidentType && claim.incidentLocation),
    },
    {
      id: "incidentLocation",
      label: "موقع الحادث المُبلَّغ عنه",
      completed: Boolean(claim.incidentCoordinates),
    },
    {
      id: "assignment",
      label: "تعيين المعاين",
      completed: Boolean(claim.assignment.assignedTo),
      pending: claim.status === "PENDING_ACCEPTANCE",
    },
    {
      id: "inspectionLocation",
      label: "موقع المعاينة الميدانية",
      completed: Boolean(claim.location?.latitude && claim.location?.longitude),
      pending: ["ASSIGNED", "IN_PROGRESS"].includes(claim.status),
    },
    {
      id: "evidence",
      label: "الأدلة والصور",
      completed: claim.evidence.length > 0,
      pending: ["IN_PROGRESS", "CORRECTION_REQUIRED"].includes(claim.status),
    },
    {
      id: "signature",
      label: "التوقيع",
      completed: Boolean(claim.signature?.url),
      pending: claim.status === "IN_PROGRESS",
    },
    {
      id: "review",
      label: "المراجعة",
      completed: ["UNDER_REVIEW", "APPROVED", "REJECTED", "CLOSED"].includes(
        claim.status,
      ),
      pending: claim.status === "SUBMITTED",
    },
    {
      id: "decision",
      label: "القرار النهائي",
      completed: ["APPROVED", "REJECTED", "CLOSED"].includes(claim.status),
      pending: claim.status === "UNDER_REVIEW",
    },
  ];

  const completedCount = items.filter((item) => item.completed).length;
  const totalCount = items.length;
  const completionRatio = (completedCount / totalCount) * 100;

  return (
    <DetailSection title="جاهزية المطالبة">
      <div className="space-y-4">
        {/* Progress summary */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-text-muted">
            العناصر المكتملة: {completedCount} من {totalCount}
          </p>
          <div className="flex items-center gap-2">
            <div className="w-32 h-2 bg-surface-soft rounded-full overflow-hidden">
              <div
                className="h-full bg-info transition-all duration-300"
                style={{ width: `${completionRatio}%` }}
                role="progressbar"
                aria-valuenow={completedCount}
                aria-valuemin={0}
                aria-valuemax={totalCount}
              />
            </div>
          </div>
        </div>

        {/* Checklist */}
        <div className="grid gap-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-soft transition-colors"
            >
              {item.completed ? (
                <CheckCircle2
                  size={18}
                  className="text-success-strong flex-shrink-0"
                  aria-label="مكتمل"
                />
              ) : item.pending ? (
                <Loader2
                  size={18}
                  className="text-warning animate-spin flex-shrink-0"
                  aria-label="قيد التنفيذ"
                />
              ) : (
                <Circle
                  size={18}
                  className="text-text-subtle flex-shrink-0"
                  aria-label="غير مكتمل"
                />
              )}
              <span
                className={`text-sm ${
                  item.completed
                    ? "text-text font-medium"
                    : item.pending
                      ? "text-warning-text font-medium"
                      : "text-text-muted"
                }`}
              >
                {item.label}
              </span>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <p className="text-xs text-text-subtle pt-2 border-t border-border">
          تُحدّث حالة العناصر تلقائياً بناءً على البيانات المتوفرة في المطالبة.
        </p>
      </div>
    </DetailSection>
  );
}
