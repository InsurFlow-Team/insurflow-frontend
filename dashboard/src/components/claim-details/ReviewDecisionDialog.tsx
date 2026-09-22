import Modal from "../ui/Modal";
import Button from "../ui/Button";
import InlineError from "../ui/InlineError";
import type { ClaimDecision } from "../../api/claims.service";

export type ReviewAction = ClaimDecision | "CORRECTION";

interface ReviewDecisionDialogProps {
  action: ReviewAction | null;
  submitting: boolean;
  notes: string;
  error: string;
  onNotesChange: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}

export default function ReviewDecisionDialog({
  action,
  submitting,
  notes,
  error,
  onNotesChange,
  onClose,
  onSubmit,
}: ReviewDecisionDialogProps) {
  const title =
    action === "APPROVED"
      ? "Approve Claim"
      : action === "REJECTED"
        ? "Reject Claim"
        : action === "CORRECTION"
          ? "Request Correction"
          : "";

  const label =
    action === "REJECTED"
      ? "Rejection Reason"
      : action === "CORRECTION"
        ? "Correction Notes"
        : "Decision Notes (Optional)";

  return (
    <Modal isOpen={action !== null} onClose={onClose} title={title} size="md">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
        className="space-y-4"
      >
        <div>
          <label
            htmlFor="decision-notes"
            className="text-sm font-semibold text-text"
          >
            {label}
          </label>

          <textarea
            id="decision-notes"
            value={notes}
            onChange={(event) => onNotesChange(event.target.value)}
            rows={5}
            disabled={submitting}
            placeholder="Enter notes..."
            className="mt-2 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text outline-none focus:border-primary"
          />
        </div>

        {error && <InlineError message={error} />}

        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button type="submit" loading={submitting} disabled={submitting}>
            Confirm
          </Button>
        </div>
      </form>
    </Modal>
  );
}