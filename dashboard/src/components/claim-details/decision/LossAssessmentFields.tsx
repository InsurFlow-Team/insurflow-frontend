import { Wrench, DollarSign, MinusCircle, AlertTriangle } from "lucide-react";
import Input from "../../ui/Input";
import Textarea from "../../ui/Textarea";

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
  return (
    <>
      {/* Parts Cost */}
      <div>
        <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-text">
          <Wrench size={16} className="text-text-muted" />
          تكلفة القطع المقدّرة (₪)
          <span className="text-danger">*</span>
        </label>
        <Input
          type="number"
          min="0"
          step="0.01"
          value={estimatedPartsCost}
          onChange={(e) => onEstimatedPartsCostChange(e.target.value)}
          placeholder="مثال: 5000.00"
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
        <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-text">
          <DollarSign size={16} className="text-text-muted" />
          تكلفة العمالة (₪)
          <span className="text-danger">*</span>
        </label>
        <Input
          type="number"
          min="0"
          step="0.01"
          value={laborCost}
          onChange={(e) => onLaborCostChange(e.target.value)}
          placeholder="مثال: 2000.00"
          error={errors.laborCost}
        />
        {errors.laborCost && (
          <p className="mt-1 text-xs text-danger">{errors.laborCost}</p>
        )}
      </div>

      {/* Deductible */}
      <div>
        <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-text">
          <MinusCircle size={16} className="text-text-muted" />
          التحمّل المطبّق (₪)
          <span className="text-danger">*</span>
        </label>
        <Input
          type="number"
          min="0"
          step="0.01"
          value={deductibleApplied}
          onChange={(e) => onDeductibleAppliedChange(e.target.value)}
          placeholder={`مثال: ${defaultDeductible.toFixed(2)}`}
          error={errors.deductibleApplied}
        />
        {errors.deductibleApplied && (
          <p className="mt-1 text-xs text-danger">
            {errors.deductibleApplied}
          </p>
        )}
        {defaultDeductible > 0 && (
          <p className="mt-1 text-xs text-text-muted">
            التحمل الافتراضي من البوليصة: {defaultDeductible.toFixed(2)} ₪
          </p>
        )}
      </div>

      {/* Deductible Override Reason (conditional) */}
      {isDeductibleOverridden && (
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-text">
            <AlertTriangle size={16} className="text-warning" />
            سبب تغيير التحمل
            <span className="text-danger">*</span>
          </label>
          <Textarea
            value={deductibleOverrideReason}
            onChange={(e) => onDeductibleOverrideReasonChange(e.target.value)}
            placeholder="مثال: تخفيض التحمل لعميل VIP حسب سياسة الشركة"
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
