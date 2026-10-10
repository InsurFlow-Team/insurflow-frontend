import { Wrench, DollarSign, MinusCircle, AlertTriangle } from "lucide-react";
import Input from "../../ui/Input";
import Textarea from "../../ui/Textarea";
import { useTranslation } from "../../../i18n/context";

interface LossAssessmentFieldsProps {
  estimatedPartsCost: string;
  onEstimatedPartsCostChange: (value: string) => void;
  laborCost: string;
  onLaborCostChange: (value: string) => void;
  deductibleApplied: string;
  onDeductibleAppliedChange: (value: string) => void;
  deductibleOverrideReason: string;
  onDeductibleOverrideReasonChange: (value: string) => void;
  defaultDeductible: number;
  isDeductibleOverridden: boolean;
  errors: Record<string, string>;
}

export default function LossAssessmentFields({
  estimatedPartsCost,
  onEstimatedPartsCostChange,
  laborCost,
  onLaborCostChange,
  deductibleApplied,
  onDeductibleAppliedChange,
  deductibleOverrideReason,
  onDeductibleOverrideReasonChange,
  defaultDeductible,
  isDeductibleOverridden,
  errors,
}: LossAssessmentFieldsProps) {
  const { t } = useTranslation();
  return (
    <>
      {/* Parts Cost */}
      <div>
        <label
          htmlFor="estimatedPartsCost"
          className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-text"
        >
          <Wrench size={16} className="text-text-muted" aria-hidden="true" />
          {t("decision.partsCost")} (₪)
          <span className="text-danger" aria-hidden="true">*</span>
        </label>
        <Input
          id="estimatedPartsCost"
          type="number"
          min="0"
          step="0.01"
          aria-required="true"
          value={estimatedPartsCost}
          onChange={(e) => onEstimatedPartsCostChange(e.target.value)}
          placeholder={t("decision.partsCostPlaceholder")}
          error={errors.estimatedPartsCost}
        />
        {errors.estimatedPartsCost && (
          <p className="mt-1 text-xs text-danger">
            {errors.estimatedPartsCost}
          </p>
        )}
      </div>

      {/* Labor Cost */}
      <div>
        <label
          htmlFor="laborCost"
          className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-text"
        >
          <DollarSign size={16} className="text-text-muted" aria-hidden="true" />
          {t("decision.laborCost")} (₪)
          <span className="text-danger" aria-hidden="true">*</span>
        </label>
        <Input
          id="laborCost"
          type="number"
          min="0"
          step="0.01"
          aria-required="true"
          value={laborCost}
          onChange={(e) => onLaborCostChange(e.target.value)}
          placeholder={t("decision.laborCostPlaceholder")}
          error={errors.laborCost}
        />
        {errors.laborCost && (
          <p className="mt-1 text-xs text-danger">{errors.laborCost}</p>
        )}
      </div>

      {/* Deductible */}
      <div>
        <label
          htmlFor="deductibleApplied"
          className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-text"
        >
          <MinusCircle size={16} className="text-text-muted" aria-hidden="true" />
          {t("decision.deductible")} (₪)
          <span className="text-danger" aria-hidden="true">*</span>
        </label>
        <Input
          id="deductibleApplied"
          type="number"
          min="0"
          step="0.01"
          aria-required="true"
          value={deductibleApplied}
          onChange={(e) => onDeductibleAppliedChange(e.target.value)}
          placeholder={t("decision.deductiblePlaceholder", {
            amount: defaultDeductible.toFixed(2),
          })}
          error={errors.deductibleApplied}
        />
        {errors.deductibleApplied && (
          <p className="mt-1 text-xs text-danger">
            {errors.deductibleApplied}
          </p>
        )}
        {defaultDeductible > 0 && (
          <p className="mt-1 text-xs text-text-muted">
            {t("decision.policyDeductible", {
              amount: defaultDeductible.toFixed(2),
            })}
          </p>
        )}
      </div>

      {/* Deductible Override Reason (conditional) */}
      {isDeductibleOverridden && (
        <div>
          <label
            htmlFor="deductibleOverrideReason"
            className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-text"
          >
            <AlertTriangle
              size={16}
              className="text-warning"
              aria-hidden="true"
            />
            {t("decision.overrideReason")}
            <span className="text-danger" aria-hidden="true">*</span>
          </label>
          <Textarea
            id="deductibleOverrideReason"
            value={deductibleOverrideReason}
            onChange={(e) => onDeductibleOverrideReasonChange(e.target.value)}
            placeholder={t("decision.overrideReasonPlaceholder")}
            rows={2}
            error={errors.deductibleOverrideReason}
          />
          {errors.deductibleOverrideReason && (
            <p className="mt-1 text-xs text-danger">
              {errors.deductibleOverrideReason}
            </p>
          )}
        </div>
      )}
    </>
  );
}
