import type { LossAssessmentCalculation } from "../../../utils/lossAssessment";
import { useTranslation } from "../../../i18n/context";

interface CalculationPreviewProps {
  calculation: LossAssessmentCalculation;
}

export default function CalculationPreview({
  calculation,
}: CalculationPreviewProps) {
  const { t } = useTranslation();
  return (
    <div className="rounded-lg bg-surface-secondary p-4">
      <h4 className="mb-3 text-sm font-semibold text-text">
        {t("decision.preview")}
      </h4>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-text-muted">{t("decision.partsCost")}:</span>
          <span className="font-medium text-text">
            {calculation.partsCost.toFixed(2)} ₪
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-text-muted">{t("decision.laborCost")}:</span>
          <span className="font-medium text-text">
            {calculation.labor.toFixed(2)} ₪
          </span>
        </div>
        <div className="flex justify-between border-t border-border pt-2">
          <span className="text-text-muted">{t("decision.totalDamage")}:</span>
          <span className="font-medium text-text">
            {calculation.totalDamage.toFixed(2)} ₪
          </span>
        </div>
        <div className="flex justify-between text-danger">
          <span>{t("decision.deductible")}:</span>
          <span className="font-medium">
            - {calculation.deductible.toFixed(2)} ₪
          </span>
        </div>
        <div className="flex justify-between border-t border-border pt-2 text-base font-bold">
          <span className="text-text">{t("decision.amountPayable")}:</span>
          <span className="text-success-strong">
            {calculation.amountAfterDeductible.toFixed(2)} ₪
          </span>
        </div>
      </div>
    </div>
  );
}
