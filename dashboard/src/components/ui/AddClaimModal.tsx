import { useState, useEffect } from "react";
import { AlertCircle, ArrowRight } from "lucide-react";
import Modal from "./Modal";
import Button from "./Button";
import PolicyVerificationModal from "./PolicyVerificationModal";
import VerifiedPolicySummary from "../claim-form/VerifiedPolicySummary";
import ClaimIncidentSection from "../claim-form/ClaimIncidentSection";
import ClaimIncidentLocationSection from "../claim-form/ClaimIncidentLocationSection";
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
}

/**
 * Create Claim Modal - Two-step flow:
 * 
 * STEP 1: Policy Verification
 * - User enters policyNumber and/or plateNumber
 * - Backend verifies and returns policy, vehicle, customer data
 * 
 * STEP 2: Claim Intake
 * - Display verified data (read-only)
 * - Collect incident information
 * - Select incident location on map
 * - Submit claim (status = NEW)
 * 
 * Assignment happens LATER via Map Dispatch (not during claim creation).
 */
export default function AddClaimModal({
  isOpen,
  onClose,
  onSubmit,
}: AddClaimModalProps) {
  const [showPolicyVerification, setShowPolicyVerification] = useState(false);
  const [verifiedPolicy, setVerifiedPolicy] =
    useState<PolicyVerificationResponse | null>(null);

  const { values, errors, handleChange, isValid, reset, setValues } = useForm(
    INITIAL_FORM_STATE,
    FORM_VALIDATORS,
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Reset all state when modal closes
  useEffect(() => {
    if (!isOpen) {
      reset();
      setVerifiedPolicy(null);
      setShowPolicyVerification(false);
      setSubmitError("");
    }
  }, [isOpen, reset]);

  // Open policy verification when modal opens
  useEffect(() => {
    if (isOpen && !verifiedPolicy) {
      setShowPolicyVerification(true);
    }
  }, [isOpen, verifiedPolicy]);

  const handlePolicyVerified = (verified: PolicyVerificationResponse) => {
    setVerifiedPolicy(verified);
    setShowPolicyVerification(false);

    // Pre-fill form with verified data
    setValues({
      ...values,
      policyId: verified.policy.id,
      plateNumber: verified.vehicle.plateNumber,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValid || isSubmitting || !verifiedPolicy) {
      return;
    }

    setSubmitError("");
    setIsSubmitting(true);

    try {
      await onSubmit(values);

      // Success: reset and close
      reset();
      setVerifiedPolicy(null);
      setShowPolicyVerification(false);
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
      setVerifiedPolicy(null);
      setShowPolicyVerification(false);
      setSubmitError("");
      onClose();
    }
  };

  const handleChangeVerification = () => {
    setVerifiedPolicy(null);
    setShowPolicyVerification(true);
    reset();
  };

  // If verification not done yet, don't show main modal
  if (!verifiedPolicy) {
    return (
      <PolicyVerificationModal
        isOpen={showPolicyVerification}
        onClose={handleClose}
        onVerified={handlePolicyVerified}
      />
    );
  }

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title="إنشاء مطالبة جديدة"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Info Banner */}
          <div className="flex items-start gap-3 p-4 rounded-lg bg-primary-light border border-primary/10">
            <AlertCircle
              size={18}
              className="text-primary mt-0.5 flex-shrink-0"
            />
            <div className="text-sm">
              <p className="font-medium text-primary mb-1">
                معلومات المطالبة المطلوبة
              </p>
              <p className="text-text-muted">
                البيانات أدناه محققة من النظام. يرجى إدخال معلومات الحادث
                وتحديد موقعه على الخريطة.
              </p>
            </div>
          </div>

          {/* Verified Policy Summary */}
          <VerifiedPolicySummary verifiedPolicy={verifiedPolicy} />

          {/* Change verification button */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleChangeVerification}
              disabled={isSubmitting}
              className="text-sm text-primary hover:text-primary-dark font-medium disabled:opacity-50"
            >
              <ArrowRight size={14} className="inline mr-1" />
              تغيير البوليصة
            </button>
          </div>

          {/* Incident Information */}
          <ClaimIncidentSection
            values={values}
            errors={errors}
            onChange={handleChange}
            disabled={isSubmitting}
          />

          {/* Incident Location */}
          <ClaimIncidentLocationSection
            values={values}
            errors={errors}
            onChange={handleChange}
            disabled={isSubmitting}
          />

          {/* Submit Error */}
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
          <div className="flex items-center justify-between gap-3 pt-4 border-t border-border">
            <p className="text-xs text-text-muted">
              <span className="text-danger">*</span> جميع الحقول مطلوبة
            </p>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={isSubmitting}
                disabled={isSubmitting || !isValid}
              >
                إنشاء المطالبة
              </Button>
            </div>
          </div>
        </form>
      </Modal>

      {/* Policy Verification Modal (can be re-opened) */}
      <PolicyVerificationModal
        isOpen={showPolicyVerification && verifiedPolicy !== null}
        onClose={() => setShowPolicyVerification(false)}
        onVerified={handlePolicyVerified}
      />
    </>
  );
}