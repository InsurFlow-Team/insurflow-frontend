import Button from "../../ui/Button";
import DetailSection from "../DetailSection";
import InfoGrid from "../InfoGrid";
import InfoRow from "../InfoRow";
import { CheckCircle2, XCircle, DollarSign, Wrench, MinusCircle, AlertTriangle } from "lucide-react";
import { formatDateTime } from "../../../utils/claims";
import type { ClaimDetails } from "../../../types";

interface DecisionSectionProps {
  claim: ClaimDetails;
  canDecide: boolean;
  deciding: boolean;
  onApprove: () => void;
  onReject: () => void;
}

export default function DecisionSection({
  claim,
  canDecide,
  deciding,
  onApprove,
  onReject,
}: DecisionSectionProps) {
  const { status, decisionNotes, closedBy, closedAt, closingNotes, lossAssessment, coverageSnapshot } = claim;

  const isClosed = Boolean(closedAt || closedBy || closingNotes);

  const hasDecision =
    isClosed ||
    status === "APPROVED" ||
    status === "REJECTED" ||
    status === "CLOSED" ||
    Boolean(decisionNotes);

  if (!hasDecision) {
    return (
      <DetailSection title="Decision / Closing">
        <div className="space-y-4">
          <p className="text-sm text-text-muted">
            لم يتم اتخاذ قرار أو إغلاق المطالبة بعد.
          </p>

          {canDecide && (
            <div className="flex flex-wrap items-center gap-3">
              <Button
                onClick={onApprove}
                disabled={deciding}
                icon={<CheckCircle2 size={17} />}
              >
                Approve
              </Button>

              <Button
                onClick={onReject}
                disabled={deciding}
                variant="danger"
                icon={<XCircle size={17} />}
              >
                Reject
              </Button>

              <p className="w-full text-xs text-text-muted">
                القرار النهائي يُتخذ من قِبل الأدمن فقط.
              </p>
            </div>
          )}
        </div>
      </DetailSection>
    );
  }

  if (status === "CLOSED") {
    return (
      <DetailSection title="Decision / Closing">
        <p className="text-sm font-medium text-text">تم إغلاق المطالبة.</p>

        <div className="mt-3">
          <InfoGrid columns="2">
            <InfoRow label="Decision Notes" value={decisionNotes} />
            <InfoRow label="Closed By" value={closedBy} />
            <InfoRow label="Closed At" value={formatDateTime(closedAt)} />
            <InfoRow label="Closing Notes" value={closingNotes} />
          </InfoGrid>
        </div>
      </DetailSection>
    );
  }

  const approved = status === "APPROVED";

  // Calculate payable amount if loss assessment exists
  let totalDamage = 0;
  let amountAfterDeductible = 0;
  let isDeductibleOverridden = false;

  if (lossAssessment) {
    totalDamage = lossAssessment.estimatedPartsCost + lossAssessment.laborCost;
    amountAfterDeductible = Math.max(0, totalDamage - lossAssessment.deductibleApplied);
    
    // Check if deductible was overridden
    const defaultDeductible = coverageSnapshot?.deductibleAmount || 0;
    isDeductibleOverridden = 
      lossAssessment.deductibleApplied !== defaultDeductible && defaultDeductible > 0;
  }

  return (
    <DetailSection title="Decision / Closing">
      <div className="flex items-center gap-2">
        {approved ? (
          <CheckCircle2 size={18} className="text-success-strong" />
        ) : (
          <XCircle size={18} className="text-danger" />
        )}
        <p className="text-sm font-medium text-text">
          {approved ? "تم قبول المطالبة." : "تم رفض المطالبة."}
        </p>
      </div>

      {/* Loss Assessment Display (Approval only) */}
      {approved && lossAssessment && (
        <div className="mt-4 space-y-4">
          {/* Financial Details */}
          <div>
            <div className="mb-3 flex items-center gap-2 border-b border-border pb-2">
              <DollarSign size={16} className="text-text-muted" />
              <h4 className="text-sm font-semibold text-text">تقييم الخسارة المالية</h4>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-text-muted">
                  <Wrench size={14} />
                  تكلفة القطع:
                </span>
                <span className="font-medium text-text">
                  {lossAssessment.estimatedPartsCost.toFixed(2)} ₪
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-text-muted">
                  <DollarSign size={14} />
                  تكلفة العمالة:
                </span>
                <span className="font-medium text-text">
                  {lossAssessment.laborCost.toFixed(2)} ₪
                </span>
              </div>
              
              <div className="flex justify-between border-t border-border pt-2">
                <span className="text-text-muted">إجمالي الضرر:</span>
                <span className="font-medium text-text">
                  {totalDamage.toFixed(2)} ₪
                </span>
              </div>
              
              <div className="flex items-center justify-between text-danger">
                <span className="flex items-center gap-1.5">
                  <MinusCircle size={14} />
                  التحمل:
                </span>
                <span className="font-medium">
                  - {lossAssessment.deductibleApplied.toFixed(2)} ₪
                </span>
              </div>
              
              {isDeductibleOverridden && lossAssessment.deductibleOverrideReason && (
                <div className="flex items-start gap-2 rounded bg-warning-bg p-2 text-xs">
                  <AlertTriangle size={14} className="mt-0.5 shrink-0 text-warning" />
                  <div>
                    <p className="font-medium text-warning">تم تعديل التحمل:</p>
                    <p className="mt-0.5 text-text-muted">{lossAssessment.deductibleOverrideReason}</p>
                  </div>
                </div>
              )}
              
              <div className="flex justify-between border-t-2 border-border pt-2 text-base font-bold">
                <span className="text-text">المبلغ المستحق:</span>
                <span className="text-success-strong">
                  {amountAfterDeductible.toFixed(2)} ₪
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {decisionNotes && (
        <div className="mt-3">
          <InfoRow label="ملاحظات القرار" value={decisionNotes} />
        </div>
      )}
    </DetailSection>
  );
}