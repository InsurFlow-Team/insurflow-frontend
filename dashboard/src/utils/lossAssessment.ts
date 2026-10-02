/**
 * Loss Assessment Utilities
 * 
 * Financial calculations and validation for claim decisions.
 */

export interface LossAssessmentCalculation {
  partsCost: number;
  labor: number;
  totalDamage: number;
  deductible: number;
  amountAfterDeductible: number;
  isDeductibleOverridden: boolean;
}

/**
 * Calculate loss assessment amounts
 */
export function calculateLossAssessment(
  estimatedPartsCost: string,
  laborCost: string,
  deductibleApplied: string,
  defaultDeductible: number,
): LossAssessmentCalculation {
  const partsCost = parseFloat(estimatedPartsCost) || 0;
  const labor = parseFloat(laborCost) || 0;
  const deductible = parseFloat(deductibleApplied) || 0;

  const totalDamage = partsCost + labor;
  const amountAfterDeductible = Math.max(0, totalDamage - deductible);

  const isDeductibleOverridden =
    deductible !== defaultDeductible && defaultDeductible > 0;

  return {
    partsCost,
    labor,
    totalDamage,
    deductible,
    amountAfterDeductible,
    isDeductibleOverridden,
  };
}

/**
 * Validate decision form data
 */
export function validateDecisionForm(
  isApproval: boolean,
  estimatedPartsCost: string,
  laborCost: string,
  deductibleApplied: string,
  notes: string,
  isDeductibleOverridden: boolean,
  deductibleOverrideReason: string,
): Record<string, string> {
  const errors: Record<string, string> = {};

  if (isApproval) {
    // Loss assessment is required for approval
    const partsCost = parseFloat(estimatedPartsCost) || 0;
    const labor = parseFloat(laborCost) || 0;
    const deductible = parseFloat(deductibleApplied);

    if (!estimatedPartsCost || partsCost < 0) {
      errors.estimatedPartsCost = "يجب إدخال تكلفة القطع";
    }
    if (!laborCost || labor < 0) {
      errors.laborCost = "يجب إدخال تكلفة العمالة";
    }
    if (deductibleApplied === "" || deductible < 0) {
      errors.deductibleApplied = "يجب إدخال التحمل";
    }

    // If deductible was overridden, reason is required
    if (isDeductibleOverridden && !deductibleOverrideReason.trim()) {
      errors.deductibleOverrideReason = "يجب توضيح سبب تغيير التحمل";
    }
  } else {
    // Rejection notes are recommended but not required
    if (!notes.trim()) {
      errors.notes = "يُفضّل كتابة سبب الرفض";
    }
  }

  return errors;
}
