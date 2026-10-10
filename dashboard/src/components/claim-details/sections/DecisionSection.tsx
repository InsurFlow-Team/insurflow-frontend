import Button from "../../ui/Button";
import DetailSection from "../DetailSection";
import InfoGrid from "../InfoGrid";
import InfoRow from "../InfoRow";
import { CheckCircle2, XCircle, DollarSign, Wrench, MinusCircle, AlertTriangle } from "lucide-react";
import { formatDateTime } from "../../../utils/claims";
import type { ClaimDetails } from "../../../types";
import { useTranslation } from "../../../i18n/context";

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
  const { t } = useTranslation();
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
      <DetailSection title={t("decision.sectionTitle")}>
        <div className="space-y-4">
          <p className="text-sm text-text-muted">
            {t("decision.notYet")}
          </p>

          {canDecide && (
            <div className="flex flex-wrap items-center gap-3">
              <Button
                onClick={onApprove}
                disabled={deciding}
                icon={<CheckCircle2 size={17} />}
              >
                {t("action.APPROVE_CLAIM")}
              </Button>

              <Button
                onClick={onReject}
                disabled={deciding}
                variant="destructive"
                icon={<XCircle size={17} />}
              >
                {t("action.REJECT_CLAIM")}
              </Button>

              <p className="w-full text-xs text-text-muted">
                {t("decision.finalAdminOnly")}
              </p>
            </div>
          )}
        </div>
      </DetailSection>
    );
  }

  if (status === "CLOSED") {
    return (
      <DetailSection title={t("decision.sectionTitle")}>
        <p className="text-sm font-medium text-text">{t("decision.closed")}</p>

        <div className="mt-3">
          <InfoGrid columns="2">
            <InfoRow label={t("decision.notes")} value={decisionNotes} />
            <InfoRow label={t("decision.closedBy")} value={closedBy} />
            <InfoRow label={t("decision.closedAt")} value={formatDateTime(closedAt)} />
            <InfoRow label={t("decision.closingNotes")} value={closingNotes} />
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
    <DetailSection title={t("decision.sectionTitle")}>
      <div className="flex items-center gap-2">
        {approved ? (
          <CheckCircle2 size={18} className="text-success-strong" />
        ) : (
          <XCircle size={18} className="text-danger" />
        )}
        <p className="text-sm font-medium text-text">
          {approved ? t("decision.approved") : t("decision.rejected")}
        </p>
      </div>

      {/* Loss Assessment Display (Approval only) */}
      {approved && lossAssessment && (
        <div className="mt-4 space-y-4">
          {/* Financial Details */}
          <div>
            <div className="mb-3 flex items-center gap-2 border-b border-border pb-2">
              <DollarSign size={16} className="text-text-muted" />
              <h4 className="text-sm font-semibold text-text">
                {t("decision.financialAssessment")}
              </h4>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-text-muted">
                  <Wrench size={14} />
                  {t("decision.partsCost")}:
                </span>
                <span className="font-medium text-text">
                  {lossAssessment.estimatedPartsCost.toFixed(2)} ₪
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-text-muted">
                  <DollarSign size={14} />
                  {t("decision.laborCost")}:
                </span>
                <span className="font-medium text-text">
                  {lossAssessment.laborCost.toFixed(2)} ₪
                </span>
              </div>
              
              <div className="flex justify-between border-t border-border pt-2">
                <span className="text-text-muted">{t("decision.totalDamage")}:</span>
                <span className="font-medium text-text">
                  {totalDamage.toFixed(2)} ₪
                </span>
              </div>
              
              <div className="flex items-center justify-between text-danger">
                <span className="flex items-center gap-1.5">
                  <MinusCircle size={14} />
                  {t("decision.deductible")}:
                </span>
                <span className="font-medium">
                  - {lossAssessment.deductibleApplied.toFixed(2)} ₪
                </span>
              </div>
              
              {isDeductibleOverridden && lossAssessment.deductibleOverrideReason && (
                <div className="flex items-start gap-2 rounded bg-warning-bg p-2 text-xs">
                  <AlertTriangle size={14} className="mt-0.5 shrink-0 text-warning" />
                  <div>
                    <p className="font-medium text-warning">
                      {t("decision.deductibleChanged")}
                    </p>
                    <p className="mt-0.5 text-text-muted">{lossAssessment.deductibleOverrideReason}</p>
                  </div>
                </div>
              )}
              
              <div className="flex justify-between border-t-2 border-border pt-2 text-base font-bold">
                <span className="text-text">{t("decision.amountPayable")}:</span>
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
          <InfoRow label={t("decision.notes")} value={decisionNotes} />
        </div>
      )}
    </DetailSection>
  );
}