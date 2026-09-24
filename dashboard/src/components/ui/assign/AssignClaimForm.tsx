import { useState } from "react";
import ConfirmDialog from "../ConfirmDialog";
import InlineError from "../InlineError";
import AdjusterSelectField from "./AdjusterSelectField";
import PriorityField, { DEFAULT_PRIORITY } from "./PriorityField";
import NotesField from "./NotesField";
import AssignmentActions from "./AssignmentActions";
import { assignClaim } from "../../../api/claims.service";
import {
  getApiErrorMessage,
  getApiErrorCode,
} from "../../../api/client";
import { useForm } from "../../../hooks/useForm";
import { useFieldAdjusters } from "../../../hooks/useFieldAdjusters";
import { validateRequired } from "../../../utils/validation";
import type { ClaimPriority, FieldAdjuster } from "../../../types";

interface AssignClaimFormProps {
  claimId: string;
  initialPriority?: ClaimPriority;
  initialNotes?: string;
  // Map Dispatch passes the claim-scoped adjusters it already fetched for the
  // pins, so the modal shares ONE dataset (markers + dropdown) and never
  // starts a duplicate GET /users/adjusters. Undefined keeps the normal
  // self-fetch path used by the Claims pages.
  adjusters?: FieldAdjuster[];
  adjustersLoading?: boolean;
  initialAdjusterId?: string;
  onRefetchAdjusters?: () => void;
  onAssigned: () => void;
  onClose: () => void;
}

export default function AssignClaimForm({
  claimId,
  initialPriority,
  initialNotes,
  adjusters: preloadedAdjusters,
  adjustersLoading: preloadedAdjustersLoading,
  initialAdjusterId,
  onRefetchAdjusters,
  onAssigned,
  onClose,
}: AssignClaimFormProps) {
  const hasPreloaded = preloadedAdjusters !== undefined;

  const { values, errors, handleChange, isValid, reset } = useForm(
    {
      adjusterId: initialAdjusterId ?? "",
      priority: initialPriority ?? DEFAULT_PRIORITY,
      notes: initialNotes ?? "",
    },
    {
      adjusterId: validateRequired,
    },
  );

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [overrideAttempt, setOverrideAttempt] = useState<{
    adjusterId: string;
    priority: ClaimPriority;
    notes: string;
  } | null>(null);
  const [overriding, setOverriding] = useState(false);

  const {
    adjusters: fetchedAdjusters,
    loading: fetchedAdjustersLoading,
    error: fetchedAdjustersError,
    reload: fetchedReload,
  } = useFieldAdjusters(claimId, !hasPreloaded);

  const adjusters = hasPreloaded ? preloadedAdjusters : fetchedAdjusters;
  const adjustersLoading = hasPreloaded
    ? preloadedAdjustersLoading ?? false
    : fetchedAdjustersLoading;
  const adjustersError = hasPreloaded ? null : fetchedAdjustersError;
  const reload = hasPreloaded
    ? onRefetchAdjusters ?? fetchedReload
    : fetchedReload;

  // The backend only ever assigns ACTIVE adjusters (INACTIVE → 404
  // ADJUSTER_NOT_FOUND). Never offer a deactivated user — they only remain
  // visible in the Field Adjusters directory.
  const activeAdjusters = adjusters.filter(
    (adjuster) => adjuster.status === "ACTIVE",
  );

  const hasAdjusters = activeAdjusters.length > 0;

  function completeAssignment(
    attempt: {
      adjusterId: string;
      priority: ClaimPriority;
      notes: string;
    },
    override = false,
  ) {
    return assignClaim(claimId, {
      adjusterId: attempt.adjusterId,
      priority: attempt.priority,
      notes: attempt.notes,
      ...(override ? { overrideCapacity: true } : {}),
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!isValid || submitting || !hasAdjusters) {
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await assignClaim(claimId, {
        adjusterId: values.adjusterId,
        priority: values.priority as ClaimPriority,
        notes: values.notes,
      });
      reset();
      onAssigned();
      onClose();
    } catch (assignError) {
      const code = getApiErrorCode(assignError);

      if (code === "INVALID_STATUS_TRANSITION") {
        setError(
          "This claim is no longer assignable. The assignment was rejected by the backend.",
        );
      } else if (code === "ADJUSTER_NOT_FOUND") {
        // Contract: not-found means the adjuster is deactivated (the backend
        // only assigns ACTIVE users), NOT a capacity problem — no override is
        // ever offered. The stale adjuster disappears from the list on reload.
        setError(
          "The selected field adjuster is no longer active. Pick another adjuster.",
        );
        void reload();
      } else if (code === "ADJUSTER_UNAVAILABLE") {
        setError(
          "This field adjuster is currently unavailable. You can pick another adjuster or confirm an emergency override.",
        );
        // Offer a confirmation before retrying with overrideCapacity.
        setOverrideAttempt({
          adjusterId: values.adjusterId,
          priority: values.priority as ClaimPriority,
          notes: values.notes,
        });
      } else {
        setError(getApiErrorMessage(assignError));
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleOverrideConfirm() {
    if (!overrideAttempt) return;

    setOverriding(true);
    setError("");

    try {
      await completeAssignment(overrideAttempt, true);
      setOverrideAttempt(null);
      reset();
      onAssigned();
      onClose();
    } catch (overrideError) {
      setOverrideAttempt(null);
      setError(getApiErrorMessage(overrideError));
      // A failed override means the adjuster really cannot take this claim;
      // refresh so the list reflects the backend reality.
      void reload();
    } finally {
      setOverriding(false);
    }
  }

  function handleOverrideCancel() {
    setOverrideAttempt(null);
    setError(
      "This field adjuster is currently unavailable. Please pick another adjuster.",
    );
    // Availability can change between the GET and the POST; refresh the
    // list so the now-busy adjuster disappears.
    void reload();
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <AdjusterSelectField
          value={values.adjusterId}
          onChange={handleChange}
          disabled={submitting}
          loading={adjustersLoading}
          loadError={adjustersError}
          hasAdjusters={hasAdjusters}
          adjusters={activeAdjusters}
          fieldError={errors.adjusterId}
          onRetry={() => void reload()}
        />

        <PriorityField
          value={values.priority as ClaimPriority}
          onChange={handleChange}
          disabled={submitting}
        />

        <NotesField
          value={values.notes}
          onChange={handleChange}
          disabled={submitting}
        />

        {error && <InlineError message={error} />}

        <AssignmentActions
          submitting={submitting}
          canSubmit={isValid && !submitting && hasAdjusters}
          onCancel={onClose}
        />
      </form>

      <ConfirmDialog
        isOpen={overrideAttempt !== null}
        title="Capacity Override"
        message="المعاين لديه أكثر من الحد المسموح من المهام حالياً. هل تريد تأكيد التعيين وتجاوز السعة كحالة طارئة؟"
        confirmLabel="Override Capacity"
        cancelLabel="Pick Another"
        loading={overriding}
        onCancel={handleOverrideCancel}
        onConfirm={() => void handleOverrideConfirm()}
      />
    </>
  );
}