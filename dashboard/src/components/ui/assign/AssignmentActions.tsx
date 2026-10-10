import Button from "../Button";
import { useTranslation } from "../../../i18n/context";

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
  const { t } = useTranslation();

  return (
    <div className="flex gap-3 pt-2">
      <Button
        type="button"
        variant="secondary"
        className="flex-1"
        onClick={onCancel}
        disabled={submitting}
      >
        {t("common.cancel")}
      </Button>
      <Button
        type="submit"
        className="flex-1"
        loading={submitting}
        disabled={!canSubmit}
      >
        {t("assign.confirm")}
      </Button>
    </div>
  );
}