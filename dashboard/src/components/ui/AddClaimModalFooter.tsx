import Button from "./Button";

interface AddClaimModalFooterProps {
  isSubmitting: boolean;
  isValid: boolean;
  onCancel: () => void;
}

export default function AddClaimModalFooter({
  isSubmitting,
  isValid,
  onCancel,
}: AddClaimModalFooterProps) {
  return (
    <div className="flex items-center justify-between gap-3 pt-4 border-t border-border">
      <p className="text-xs text-text-muted">
        <span className="text-danger">*</span> Required fields must be filled
      </p>
      <div className="flex gap-3">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
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
          Create Claim
        </Button>
      </div>
    </div>
  );
}