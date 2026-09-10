import { AlertCircle, RefreshCw, UserCheck } from "lucide-react";
import FormField from "../ui/FormField";
import Select from "../ui/Select";
import Button from "../ui/Button";
import StatusBadge from "../ui/StatusBadge";
import { userInitials, avatarClasses } from "../../utils/user";
import {
  PRIORITY_OPTIONS,
  MAX_ASSIGNMENT_NOTES_LENGTH,
} from "./claimFormConstants";
import type { ClaimFormSectionProps } from "./claimFormConstants";
import type { FieldAdjuster } from "../../types";

interface AssignmentSectionProps extends ClaimFormSectionProps {
  adjusters: FieldAdjuster[];
  adjustersLoading: boolean;
  adjustersError?: string | null;
  onRetryAdjusters?: () => void;
  selectedAdjuster: FieldAdjuster | undefined;
  open: boolean;
  assignmentError: string;
  onToggle: () => void;
}

export default function AssignmentSection({
  values,
  errors,
  onChange,
  disabled,
  adjusters,
  adjustersLoading,
  adjustersError,
  onRetryAdjusters,
  selectedAdjuster,
  open,
  assignmentError,
  onToggle,
}: AssignmentSectionProps) {
  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-dark transition-colors"
      >
        <UserCheck size={16} />
        <span>{open ? "Hide" : "Optionally"} Assign Field Adjuster</span>
        <span className="text-xs text-text-muted ml-1">(Optional)</span>
      </button>

      {open && (
        <div className="space-y-4 p-4 rounded-lg bg-surface-soft border border-border">
          <FormField label="Field Adjuster">
            {adjustersLoading ? (
              <Select
                name="adjusterId"
                value={values.adjusterId || ""}
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
                  onClick={() => onRetryAdjusters?.()}
                >
                  <RefreshCw size={15} />
                  Retry
                </Button>
              </div>
            ) : (
              <>
                <Select
                  name="adjusterId"
                  value={values.adjusterId || ""}
                  onChange={onChange}
                  disabled={disabled}
                  placeholder="Select field adjuster"
                  options={adjusters.map((adjuster) => ({
                    value: adjuster.id,
                    label: `${adjuster.name} (${adjuster.employeeCode}) — ${adjuster.availability === "AVAILABLE" ? "Available" : "Busy"}`,
                  }))}
                />
                {selectedAdjuster && (
                  <div className="mt-2 flex items-center gap-3 rounded-lg border border-border bg-surface px-3 py-2">
                    <span
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${avatarClasses(selectedAdjuster.name)}`}
                    >
                      {userInitials(selectedAdjuster.name)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-text truncate">
                        {selectedAdjuster.name}
                        <span className="text-text-muted"> ({selectedAdjuster.employeeCode})</span>
                      </p>
                      <p className="text-xs text-text-muted">
                        Active tasks:{" "}
                        {selectedAdjuster.activeTasksCount > 0
                          ? selectedAdjuster.activeTasksCount
                          : "—"}
                      </p>
                    </div>
                    <StatusBadge status={selectedAdjuster.availability} />
                  </div>
                )}
                <p className="mt-1.5 text-xs text-text-muted">
                  {adjusters.length === 0
                    ? "No field adjusters available. The claim will be created without an assignment."
                    : "Assignment is sent after the claim is created."}
                </p>
              </>
            )}
          </FormField>

          <FormField label="Priority" error={assignmentError}>
            <Select
              name="priority"
              value={values.priority || ""}
              onChange={onChange}
              disabled={disabled}
              error={assignmentError}
              placeholder="Select assignment priority"
              options={PRIORITY_OPTIONS}
            />
            <p className="mt-1.5 text-xs text-text-muted">
              Optional in the backend; defaults to Medium.
            </p>
          </FormField>

          <FormField label="Assignment Notes">
            <textarea
              name="assignmentNotes"
              value={values.assignmentNotes || ""}
              onChange={onChange}
              placeholder="e.g., Please inspect this as soon as possible"
              rows={3}
              maxLength={MAX_ASSIGNMENT_NOTES_LENGTH}
              disabled={disabled}
              className={`
                w-full rounded-lg border bg-background text-sm text-text
                px-4 py-2.5 placeholder:text-text-muted/50
                focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary
                disabled:opacity-50 disabled:cursor-not-allowed
                transition duration-150 resize-none
                ${errors.assignmentNotes ? "border-danger focus:ring-danger/40 focus:border-danger" : "border-border"}
              `}
            />
            <p className="mt-1.5 text-xs text-text-muted">
              Optional. Shown to the field adjuster with the assignment.
            </p>
          </FormField>
        </div>
      )}
    </div>
  );
}