import { useState } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import Modal from "./Modal";
import FormField from "./FormField";
import Select from "./Select";
import Button from "./Button";
import { assignClaim } from "../../api/claims.service";
import {
  getApiErrorMessage,
  getApiErrorCode,
} from "../../api/client";
import { useForm } from "../../hooks/useForm";
import { useFieldAdjusters } from "../../hooks/useFieldAdjusters";
import { validateRequired } from "../../utils/validation";
import type { ClaimPriority } from "../../types";

interface AssignClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
  claimId: string;
  current?: {
    priority?: ClaimPriority;
    notes?: string;
  };
  onAssigned: () => void;
}

const PRIORITY_OPTIONS: Array<{ value: ClaimPriority; label: string }> = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
];

// The backend treats priority as optional and defaults it to MEDIUM. Preselect
// MEDIUM so the form always reflects the backend default instead of sending an
// empty value.
const DEFAULT_PRIORITY: ClaimPriority = "MEDIUM";

interface AssignClaimFormProps {
  claimId: string;
  initialPriority?: ClaimPriority;
  initialNotes?: string;
  onAssigned: () => void;
  onClose: () => void;
}

function AssignClaimForm({
  claimId,
  initialPriority,
  initialNotes,
  onAssigned,
  onClose,
}: AssignClaimFormProps) {
  const { values, errors, handleChange, isValid, reset } = useForm(
    {
      adjusterId: "",
      priority: initialPriority ?? DEFAULT_PRIORITY,
      notes: initialNotes ?? "",
    },
    {
      adjusterId: validateRequired,
    },
  );

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const {
    adjusters,
    loading: adjustersLoading,
    error: adjustersError,
    reload,
  } = useFieldAdjusters();

  const hasAdjusters = adjusters.length > 0;

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
      } else if (code === "ADJUSTER_UNAVAILABLE") {
        setError(
          "This field adjuster is no longer available. Please pick another adjuster.",
        );
        // Availability can change between the GET and the POST; refresh the
        // list so the now-busy adjuster disappears.
        void reload();
      } else {
        setError(getApiErrorMessage(assignError));
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField label="Field Adjuster" required error={errors.adjusterId}>
        {adjustersLoading ? (
          <Select
            name="adjusterId"
            value={values.adjusterId}
            disabled
            placeholder="Loading field adjusters..."
            options={[]}
          />
        ) : adjustersError ? (
          <div className="space-y-3">
            <div
              role="alert"
              className="flex items-start gap-2 rounded-lg border border-danger/20 bg-red-50 px-3 py-2.5 text-sm text-danger"
            >
              <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
              <span>{adjustersError}</span>
            </div>
            <Button
              type="button"
              variant="secondary"
              onClick={() => void reload()}
            >
              <RefreshCw size={15} />
              Retry
            </Button>
          </div>
        ) : !hasAdjusters ? (
          <div
            role="status"
            className="rounded-lg border border-border bg-surface-soft px-3 py-2.5 text-sm text-text-muted"
          >
            No available field adjusters. This claim can be assigned later once
            an adjuster becomes available.
          </div>
        ) : (
          <Select
            name="adjusterId"
            value={values.adjusterId}
            onChange={handleChange}
            disabled={submitting}
            error={errors.adjusterId}
            placeholder="Select field adjuster"
            options={adjusters.map((adjuster) => ({
              value: adjuster.id,
              label: `${adjuster.name} (${adjuster.employeeCode}) — ${adjuster.availability === "AVAILABLE" ? "Available" : "Busy"}`,
            }))}
          />
        )}
      </FormField>

      <FormField label="Priority">
        <Select
          name="priority"
          value={values.priority}
          onChange={handleChange}
          disabled={submitting}
          options={PRIORITY_OPTIONS}
        />
        <p className="mt-1.5 text-xs text-text-muted">
          Optional in the backend; defaults to Medium.
        </p>
      </FormField>

      <FormField label="Assignment Notes">
        <textarea
          name="notes"
          value={values.notes}
          onChange={handleChange}
          placeholder="e.g., Please inspect this as soon as possible"
          rows={3}
          maxLength={300}
          disabled={submitting}
          className={`
            w-full rounded-lg border bg-background text-sm text-text
            px-4 py-2.5 placeholder:text-text-muted/50
            focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary
            disabled:opacity-50 disabled:cursor-not-allowed
            transition duration-150 resize-none
            border-border
          `}
        />
      </FormField>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-danger/20 bg-red-50 px-3 py-2.5 text-sm text-danger"
        >
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="secondary"
          className="flex-1"
          onClick={onClose}
          disabled={submitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="flex-1"
          loading={submitting}
          disabled={!isValid || submitting || !hasAdjusters}
        >
          Save Assignment
        </Button>
      </div>
    </form>
  );
}

export default function AssignClaimModal({
  isOpen,
  onClose,
  claimId,
  current,
  onAssigned,
}: AssignClaimModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Assign Field Adjuster" size="md">
      <AssignClaimForm
        key={claimId}
        claimId={claimId}
        initialPriority={current?.priority}
        initialNotes={current?.notes}
        onAssigned={onAssigned}
        onClose={onClose}
      />
    </Modal>
  );
}