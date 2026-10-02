import type { LossAssessmentCalculation } from "../../../utils/lossAssessment";

interface CalculationPreviewProps {
  calculation: LossAssessmentCalculation;
}

export default function CalculationPreview({
  calculation,
}: CalculationPreviewProps) {
  return (
    <div className="rounded-lg bg-surface-secondary p-4">
      <h4 className="mb-3 text-sm font-semibold text-text">معاينة الحساب</h4>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-text-muted">تكلفة القطع:</span>
          <span className="font-medium text-text">
            {calculation.partsCost.toFixed(2)} ₪
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-text-muted">تكلفة العمالة:</span>
          <span className="font-medium text-text">
            {calculation.labor.toFixed(2)} ₪
          </span>
        </div>
        <div className="flex justify-between border-t border-border pt-2">
          <span className="text-text-muted">إجمالي الضرر:</span>
          <span className="font-medium text-text">
            {calculation.totalDamage.toFixed(2)} ₪
          </span>
        </div>
        <div className="flex justify-between text-danger">
          <span>التحمل:</span>
          <span className="font-medium">
            - {calculation.deductible.toFixed(2)} ₪
          </span>
        </div>
        <div className="flex justify-between border-t border-border pt-2 text-base font-bold">
          <span className="text-text">المبلغ المستحق:</span>
          <span className="text-success-strong">
            {calculation.amountAfterDeductible.toFixed(2)} ₪
          </span>
        </div>
      </div>
    </div>
  );
}
