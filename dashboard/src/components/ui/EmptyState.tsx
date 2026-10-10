import type { ReactNode } from "react";
import { Inbox } from "lucide-react";
import Button from "./Button";
import { useTranslation } from "../../i18n/context";

interface EmptyStateProps {
  message?: string;
  /** Override the default Inbox icon */
  icon?: ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  /** Renders inside a card shell instead of raw centered block */
  card?: boolean;
}

/**
 * EmptyState — full-page or card-wrapped empty placeholder.
 * For in-table empty states, DataTable handles this internally.
 */
export default function EmptyState({
  message,
  icon,
  action,
  card = false,
}: EmptyStateProps) {
  const { t } = useTranslation();

  const inner = (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-text-muted">
      <span className="opacity-30">
        {icon ?? <Inbox size={40} aria-hidden="true" />}
      </span>
      <p className="text-sm">{message ?? t("common.noData")}</p>
      {action && (
        <Button variant="secondary" size="sm" onClick={action.onClick}>
          {action.label}
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
