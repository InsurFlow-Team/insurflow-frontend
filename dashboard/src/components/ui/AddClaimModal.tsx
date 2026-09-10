import { useState, useEffect } from "react";
import { AlertCircle } from "lucide-react";
import Modal from "./Modal";
import Button from "./Button";
import { assignClaim } from "../../api/claims.service";
import {
  getApiErrorMessage,
  getApiErrorCode,
} from "../../api/client";
import { useForm } from "../../hooks/useForm";
import { useFieldAdjusters } from "../../hooks/useFieldAdjusters";
import {
  INITIAL_FORM_STATE,
  FORM_VALIDATORS,
  isPrioritySelected,
} from "../claim-form/claimFormConstants";
import CustomerInfoSection from "../claim-form/CustomerInfoSection";
import VehicleInfoSection from "../claim-form/VehicleInfoSection";
import IncidentInfoSection from "../claim-form/IncidentInfoSection";
import AccidentDescriptionSection from "../claim-form/AccidentDescriptionSection";
import PreciseLocationSection from "../claim-form/PreciseLocationSection";
import AssignmentSection from "../claim-form/AssignmentSection";
import type { ClaimPriority, ClaimSummary } from "../../types";
import type { NewClaimData } from "../claim-form/claimFormConstants";

export type { NewClaimData };

interface AddClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (claimData: NewClaimData) => Promise<ClaimSummary>;
}

export default function AddClaimModal({
  isOpen,
  onClose,
  onSubmit,
}: AddClaimModalProps) {
  const { values, errors, handleChange, isValid, reset } = useForm(
    INITIAL_FORM_STATE,
    FORM_VALIDATORS,
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOptionalFields, setShowOptionalFields] = useState(false);
  const [showAssignment, setShowAssignment] = useState(false);
  const [createdClaim, setCreatedClaim] = useState<ClaimSummary | null>(null);
  const [assignmentError, setAssignmentError] = useState("");
  const [submitError, setSubmitError] = useState("");

  const { adjusters, loading: adjustersLoading, reload: reloadAdjusters } =
    useFieldAdjusters();

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      reset();
      setShowOptionalFields(false);
      setShowAssignment(false);
      setCreatedClaim(null);
      setAssignmentError("");
      setSubmitError("");
    }
  }, [isOpen, reset]);

  const selectedAdjuster = values.adjusterId
    ? adjusters.find((adjuster) => adjuster.id === values.adjusterId)
    : undefined;

  const runAssignment = async (claimId: string) => {
    try {
      await assignClaim(claimId, {
        adjusterId: values.adjusterId as string,
        priority: values.priority as ClaimPriority,
        notes: values.assignmentNotes ?? "",
      });
      return true;
    } catch (assignError) {
      const code = getApiErrorCode(assignError);

      const reason =
        code === "INVALID_STATUS_TRANSITION"
          ? "This claim is no longer assignable."
          : code === "ADJUSTER_UNAVAILABLE"
            ? "This adjuster is no longer available — pick another and retry."
            : null;

      setSubmitError(
        "The claim was created, but assigning the field adjuster failed." +
          (reason ? ` ${reason}` : "") +
          " You can retry the assignment or finish without assigning an adjuster.",
      );

      if (code === "ADJUSTER_UNAVAILABLE") {
        // Availability can change between the GET and the POST; refresh the
        // list so the now-busy adjuster disappears.
        void reloadAdjusters();
      }

      return false;
    }
  };

  const completeSuccess = () => {
    reset();
    setShowOptionalFields(false);
    setShowAssignment(false);
    setCreatedClaim(null);
    setAssignmentError("");
    setSubmitError("");
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValid || isSubmitting) {
      return;
    }

    setSubmitError("");
    setAssignmentError("");

    // Priority is only required when an adjuster is actually selected
    if (values.adjusterId && !isPrioritySelected(values.priority)) {
      setAssignmentError(
        "Select a priority when assigning a field adjuster.",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Create the claim
      const newClaim = await onSubmit(values);

      // 2. Optionally assign a field adjuster
      if (values.adjusterId) {
        const assigned = await runAssignment(newClaim.id);
        if (!assigned) {
          // Claim created but assignment failed — keep the modal open with the
          // created claim so the assignment can be retried without re-creating.
          setCreatedClaim(newClaim);
          return;
        }
      }

      completeSuccess();
    } catch (createError) {
      setSubmitError(getApiErrorMessage(createError));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetryAssignment = async () => {
    if (!createdClaim || !values.adjusterId || isSubmitting) {
      return;
    }

    setSubmitError("");
    setIsSubmitting(true);

    try {
      const assigned = await runAssignment(createdClaim.id);
      if (assigned) {
        completeSuccess();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      completeSuccess();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create New Claim" size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Info Banner */}
        <div className="flex items-start gap-3 p-4 rounded-lg bg-primary-light border border-primary/10">
          <AlertCircle size={18} className="text-primary mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-primary mb-1">Required Information</p>
            <p className="text-text-muted">
              Please provide accurate customer, vehicle, and incident details to initiate the claim processing.
            </p>
          </div>
        </div>

        <CustomerInfoSection
          values={values}
          errors={errors}
          onChange={handleChange}
          disabled={isSubmitting}
        />

        <VehicleInfoSection
          values={values}
          errors={errors}
          onChange={handleChange}
          disabled={isSubmitting}
        />

        <IncidentInfoSection
          values={values}
          errors={errors}
          onChange={handleChange}
          disabled={isSubmitting}
        />

        <AccidentDescriptionSection
          values={values}
          errors={errors}
          onChange={handleChange}
          disabled={isSubmitting}
        />

        <PreciseLocationSection
          values={values}
          errors={errors}
          onChange={handleChange}
          disabled={isSubmitting}
          open={showOptionalFields}
          onToggle={() => setShowOptionalFields((open) => !open)}
        />

        <AssignmentSection
          values={values}
          errors={errors}
          onChange={handleChange}
          disabled={isSubmitting}
          adjusters={adjusters}
          adjustersLoading={adjustersLoading}
          selectedAdjuster={selectedAdjuster}
          open={showAssignment}
          assignmentError={assignmentError}
          onToggle={() => {
            setShowAssignment((open) => !open);
            setAssignmentError("");
          }}
        />

        {/* Create / assignment errors */}
        {submitError && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-lg border border-danger/20 bg-red-50 px-4 py-3 text-sm text-danger"
          >
            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
            <span>{submitError}</span>
          </div>
        )}

        {/* Actions */}
        {createdClaim ? (
          <div className="flex items-center justify-between gap-3 pt-4 border-t border-border">
            <p className="text-xs text-text-muted">
              Claim {createdClaim.claimNumber} was created. Assignment was not saved.
            </p>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Finish Without Assignment
              </Button>
              <Button
                type="button"
                variant="primary"
                loading={isSubmitting}
                onClick={() => void handleRetryAssignment()}
                disabled={isSubmitting || !values.adjusterId || !isPrioritySelected(values.priority)}
              >
                Retry Assignment
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3 pt-4 border-t border-border">
            <p className="text-xs text-text-muted">
              <span className="text-danger">*</span> Required fields must be filled
            </p>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={isSubmitting}
                disabled={isSubmitting || !isValid}
              >
                {values.adjusterId ? "Create & Assign" : "Create Claim"}
              </Button>
            </div>
          </div>
        )}
      </form>
    </Modal>
  );
}