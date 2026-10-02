import { useState, useEffect } from "react";
import type { ClaimDecision, DecideClaimPayload, ClaimDetails } from "../types";
import { calculateLossAssessment, validateDecisionForm } from "../utils/lossAssessment";

interface UseDecisionFormProps {
  isOpen: boolean;
  decision: ClaimDecision;
  claim: ClaimDetails;
  onConfirm: (payload: DecideClaimPayload) => void;
}

export function useDecisionForm({
  isOpen,
  decision,
  claim,
  onConfirm,
}: UseDecisionFormProps) {
  const isApproval = decision === "APPROVED";

  // Form state
  const [notes, setNotes] = useState("");
  const [estimatedPartsCost, setEstimatedPartsCost] = useState("");
  const [laborCost, setLaborCost] = useState("");
  const [deductibleApplied, setDeductibleApplied] = useState("");
  const [deductibleOverrideReason, setDeductibleOverrideReason] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!isOpen) {
      setNotes("");
      setEstimatedPartsCost("");
      setLaborCost("");
      setDeductibleApplied("");
      setDeductibleOverrideReason("");
      setErrors({});
    } else if (isOpen && isApproval && claim.coverageSnapshot) {
      // Pre-fill deductible from coverage snapshot
      setDeductibleApplied(claim.coverageSnapshot.deductibleAmount.toString());
    }
  }, [isOpen, isApproval, claim.coverageSnapshot]);

  // Calculate totals
  const defaultDeductible = claim.coverageSnapshot?.deductibleAmount || 0;
  const calculation = calculateLossAssessment(
    estimatedPartsCost,
    laborCost,
    deductibleApplied,
    defaultDeductible,
  );

  // Handle form submission
  function handleSubmit() {
    const validationErrors = validateDecisionForm(
      isApproval,
      estimatedPartsCost,
      laborCost,
      deductibleApplied,
      notes,
      calculation.isDeductibleOverridden,
      deductibleOverrideReason,
    );

    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    const payload: DecideClaimPayload = {
      decision,
      notes: notes.trim() || undefined,
    };

    // Add loss assessment for approvals
    if (isApproval) {
      payload.lossAssessment = {
        estimatedPartsCost: calculation.partsCost,
        laborCost: calculation.labor,
        deductibleApplied: calculation.deductible,
        deductibleOverrideReason: calculation.isDeductibleOverridden
          ? deductibleOverrideReason.trim()
          : undefined,
      };
    }

    onConfirm(payload);
  }

  return {
    // Form state
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

    // Computed values
    isApproval,
    defaultDeductible,
    calculation,

    // Actions
    handleSubmit,
  };
}
