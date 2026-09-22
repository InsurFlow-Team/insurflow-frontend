import Button from "../Button";

interface AssignmentActionsProps {
  submitting: boolean;
  canSubmit: boolean;
  onCancel: () => void;
}

export default function AssignmentActions({
  submitting,
  canSubmit,
  onCancel,
}: AssignmentActionsProps) {
  return (
    <div className="flex gap-3 pt-2">
      <Button
        type="button"
        variant="secondary"
        className="flex-1"
        onClick={onCancel}
        disabled={submitting}
      >
        Cancel
      </Button>
      <Button
        type="submit"
        className="flex-1"
        loading={submitting}
        disabled={!canSubmit}
      >
        Save Assignment
      </Button>
    </div>
  );
}