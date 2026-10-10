import { CheckCircle2, XCircle, AlertTriangle, DollarSign } from "lucide-react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import Textarea from "../ui/Textarea";
import { useDecisionForm } from "../../hooks/useDecisionForm";
import LossAssessmentFields from "./decision/LossAssessmentFields";
import CalculationPreview from "./decision/CalculationPreview";
import type { ClaimDecision, DecideClaimPayload, ClaimDetails } from "../../types";
import { useTranslation } from "../../i18n/context";

interface DecisionDialogProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: (payload: DecideClaimPayload) => void;
  decision: ClaimDecision;
  claim: ClaimDetails;
  loading: boolean;
}

export default function DecisionDialog({
  isOpen,
  onCancel,
  onConfirm,
  decision,
  claim,
  loading,
}: DecisionDialogProps) {
  const { t } = useTranslation();
  const {
    notes,
    setNotes,
    estimatedPartsCost,
    setEstimatedPartsCost,
    laborCost,
    setLaborCost,
    deductibleApplied,
    setDeductibleApplied,
    deductibleOverrideReason,
    setDeductibleOverrideReason,
    errors,
    isApproval,
    defaultDeductible,
    calculation,
    handleSubmit,
  } = useDecisionForm({ isOpen, decision, claim, onConfirm });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title={
        <div className="flex items-center gap-2">
          {isApproval ? (
            <CheckCircle2 size={20} className="text-success-strong" />
          ) : (
            <XCircle size={20} className="text-danger" />
          )}
          <span>
            {isApproval ? t("action.APPROVE_CLAIM") : t("action.REJECT_CLAIM")}
          </span>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Warning for rejection */}
        {!isApproval && (
          <div className="flex gap-3 rounded-lg bg-warning-bg p-4">
            <AlertTriangle size={18} className="mt-0.5 shrink-0 text-warning-strong" />
            <div className="text-sm">
              <p className="font-medium text-warning-strong">
                {t("decision.rejectWarningTitle")}
              </p>
              <p className="mt-1 text-warning">
                {t("decision.rejectWarning")}
              </p>
            </div>
          </div>
        )}

        {/* Loss Assessment Form (Approval only) */}
        {isApproval && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-border pb-2">
              <DollarSign size={18} className="text-text-muted" />
              <h3 className="text-sm font-semibold text-text">
                {t("decision.financialAssessment")}
              </h3>
            </div>

            <LossAssessmentFields
              estimatedPartsCost={estimatedPartsCost}
              onEstimatedPartsCostChange={setEstimatedPartsCost}
              laborCost={laborCost}
              onLaborCostChange={setLaborCost}
              deductibleApplied={deductibleApplied}
              onDeductibleAppliedChange={setDeductibleApplied}
              deductibleOverrideReason={deductibleOverrideReason}
              onDeductibleOverrideReasonChange={setDeductibleOverrideReason}
              defaultDeductible={defaultDeductible}
              isDeductibleOverridden={calculation.isDeductibleOverridden}
              errors={errors}
            />

            <CalculationPreview calculation={calculation} />
          </div>
        )}

        {/* Decision Notes */}
        <div>
          <label
            htmlFor="decisionNotes"
            className="mb-1.5 block text-sm font-medium text-text"
          >
            {t(
              isApproval
                ? "decision.notesOptional"
                : "decision.notesRecommended",
            )}
          </label>
          <Textarea
            id="decisionNotes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={
              isApproval
                ? t("decision.notesPlaceholder.approve")
                : t("decision.notesPlaceholder.reject")
            }
            rows={3}
            error={errors.notes}
          />
          {errors.notes && !isApproval && (
            <p className="mt-1 text-xs text-warning">{errors.notes}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 border-t border-border pt-4">
          <Button onClick={onCancel} variant="secondary" disabled={loading}>
            {t("common.cancel")}
          </Button>
          <Button
            onClick={handleSubmit}
            variant={isApproval ? "primary" : "destructive"}
            disabled={loading}
            icon={isApproval ? <CheckCircle2 size={17} /> : <XCircle size={17} />}
          >
            {loading
              ? t("common.saving")
              : isApproval
                ? t("action.APPROVE_CLAIM")
                : t("action.REJECT_CLAIM")}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
