import { AlertCircle } from "lucide-react";
import Button from "./Button";
import { useTranslation } from "../../i18n/context";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  /** Renders inside a card shell instead of raw centered block */
  card?: boolean;
}

/**
 * ErrorState — full-page or card-wrapped error placeholder.
 * For in-table error states, DataTable handles this internally.
 */
export default function ErrorState({
  title,
  message,
  onRetry,
  card = false,
}: ErrorStateProps) {
  const { t } = useTranslation();

  const inner = (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <AlertCircle
        size={36}
        className="text-danger opacity-80"
        aria-hidden="true"
      />
      {title && (
        <p className="text-sm font-semibold text-danger-text">{title}</p>
      )}
      <p className="text-sm text-text-muted">
        {message ?? t("common.somethingWentWrong")}
      </p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          {t("common.tryAgain")}
        </Button>
      )}
    </div>
  );

  if (card) {
    return (
      <div className="rounded-xl border border-border bg-surface shadow-sm">
        {inner}
      </div>
    );
  }

  return inner;
}
