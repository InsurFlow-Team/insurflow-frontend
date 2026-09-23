import { useState, useEffect } from "react";
import { AlertCircle } from "lucide-react";
import Modal from "./Modal";
import AddClaimModalFooter from "./AddClaimModalFooter";
import ClaimIntakeBanner from "../claim-form/ClaimIntakeBanner";
import VerifiedPolicySummary from "../claim-form/VerifiedPolicySummary";
import ClaimIncidentSection from "../claim-form/ClaimIncidentSection";
import PreciseLocationSection from "../claim-form/PreciseLocationSection";
import { getApiErrorMessage } from "../../api/client";
import { useForm } from "../../hooks/useForm";
import {
  INITIAL_FORM_STATE,
  FORM_VALIDATORS,
} from "../claim-form/claimFormConstants";
import type { ClaimSummary, PolicyVerificationResponse } from "../../types";
import type { NewClaimData } from "../claim-form/claimFormConstants";

export type { NewClaimData };

interface AddClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (claimData: NewClaimData) => Promise<ClaimSummary>;
  // The verified-policy data carried from the Policy Verification gate. It is
  // the source of truth for the read-only customer/vehicle summary AND for the
  // policyId/plateNumber that are merged into the create request at submit
  // time — never collected as editable form state.
  verifiedPolicy: PolicyVerificationResponse | null;
}

export default function AddClaimModal({
  isOpen,
  onClose,
  onSubmit,
  verifiedPolicy,
}: AddClaimModalProps) {
  const { values, errors, handleChange, isValid, reset } = useForm(
    INITIAL_FORM_STATE,
    FORM_VALIDATORS,
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreciseLocation, setShowPreciseLocation] = useState(true);
  const [submitError, setSubmitError] = useState("");

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      reset();
      setShowPreciseLocation(true);
      setSubmitError("");
    }
  }, [isOpen, reset]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValid || isSubmitting) {
      return;
    }

    // Hard gate: creation is impossible without a verified policy id. Never
    // falls back to an empty policyId on the wire.
    if (!verifiedPolicy?.policy.id) {
      setSubmitError(
        "لم يتم التحقق من بوليصة التأمين. أعد التحقق قبل إنشاء المطالبة.",
      );
      return;
    }

    setSubmitError("");
    setIsSubmitting(true);

    try {
      // Only incident details come from the form; policyId/plateNumber are
      // merged in from the verified policy by the caller (ClaimsList).
      const payload: NewClaimData = {
        incidentType: values.incidentType,
        incidentLocation: values.incidentLocation,
        incidentDate: values.incidentDate,
        latitude: values.latitude,
        longitude: values.longitude,
      };

      // Create claim only - no assignment
      await onSubmit(payload);

      // Success: close modal and reset
      reset();
      setShowPreciseLocation(true);
      setSubmitError("");
      onClose();
    } catch (createError) {
      setSubmitError(getApiErrorMessage(createError));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      reset();
      setShowPreciseLocation(true);
      setSubmitError("");
      onClose();
    }
  };

  // The form only accepts ChangeEvents one field at a time; "Use My Current
  // Location" fills both coordinates, so fabricate a change for each.
  const handleSetPreciseLocation = (latitude: number, longitude: number) => {
    handleChange({
      target: { name: "latitude", value: String(latitude) },
    } as React.ChangeEvent<HTMLInputElement>);
    handleChange({
      target: { name: "longitude", value: String(longitude) },
    } as React.ChangeEvent<HTMLInputElement>);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create New Claim" size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        <ClaimIntakeBanner />

        {verifiedPolicy && (
          <VerifiedPolicySummary verifiedPolicy={verifiedPolicy} />
        )}

        <ClaimIncidentSection
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
          open={showPreciseLocation}
          onToggle={() => setShowPreciseLocation((open) => !open)}
          onSetLocation={handleSetPreciseLocation}
        />

        {/* Create error */}
        {submitError && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-lg border border-danger/20 bg-red-50 px-4 py-3 text-sm text-danger"
          >
            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
            <span>{submitError}</span>
          </div>
        )}

        <AddClaimModalFooter
          isSubmitting={isSubmitting}
          isValid={isValid}
          onCancel={handleClose}
        />
      </form>
    </Modal>
  );
}