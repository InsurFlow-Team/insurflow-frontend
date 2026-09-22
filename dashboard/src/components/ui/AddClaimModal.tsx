import { useState, useEffect } from "react";
import { AlertCircle } from "lucide-react";
import Modal from "./Modal";
import AddClaimModalFooter from "./AddClaimModalFooter";
import ClaimIntakeBanner from "../claim-form/ClaimIntakeBanner";
import { getApiErrorMessage } from "../../api/client";
import { useForm } from "../../hooks/useForm";
import {
  INITIAL_FORM_STATE,
  FORM_VALIDATORS,
} from "../claim-form/claimFormConstants";
import CustomerInfoSection from "../claim-form/CustomerInfoSection";
import VehicleInfoSection from "../claim-form/VehicleInfoSection";
import IncidentInfoSection from "../claim-form/IncidentInfoSection";
import AccidentDescriptionSection from "../claim-form/AccidentDescriptionSection";
import PreciseLocationSection from "../claim-form/PreciseLocationSection";
import type { ClaimSummary } from "../../types";
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

    setSubmitError("");
    setIsSubmitting(true);

    try {
      // Create claim only - no assignment
      await onSubmit(values);

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