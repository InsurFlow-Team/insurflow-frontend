import { Link } from "react-router-dom";
import { CalendarCheck, ClipboardCheck, Clock, ListChecks } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { Column } from "../ui/DataTable";
import DataTable from "../ui/DataTable";
import StatusBadge from "../ui/StatusBadge";
import EmptyState from "../ui/EmptyState";
import { formatDate, formatDateTime } from "../../utils/claims";
import { formatDuration, summarizeWorkHistory } from "../../utils/adjusterHistory";
import { useTranslation } from "../../i18n/context";
import type { I18nContextValue } from "../../i18n/context";
import type { MessageKey } from "../../i18n/messages.en";
import type {
  AdjusterWorkHistory,
  AdjusterWorkHistoryEntry,
} from "../../types";

function MetricTile({
  label,
  value,
  icon: Icon,
  iconClass,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  iconClass: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-text-muted">
          {label}
        </span>
        <Icon size={16} className={`shrink-0 ${iconClass}`} />
      </div>

      <p className="mt-2 text-xl font-bold text-text">{value}</p>
    </div>
  );
}

function buildHistoryColumns(
  t: I18nContextValue["t"],
): Column<AdjusterWorkHistoryEntry>[] {
  return [
    {
      key: "claimNumber",
      header: t("workHistory.col.claimNumber"),
      render: (entry) => (
        <Link
          to={`/claims/${entry.claimId}`}
          className="text-sm font-semibold text-primary hover:text-primary-dark transition-colors"
        >
          {entry.claimNumber}
        </Link>
      ),
    },
    {
      key: "customer",
      header: t("workHistory.col.customer"),
      render: (entry) => (
        <span className="text-sm text-text">
          {entry.customerName || "—"}
          {entry.plateNumber && (
            <span className="ml-2 text-xs text-text-muted">
              {entry.plateNumber}
            </span>
          )}
        </span>
      ),
    },
    {
      key: "status",
      header: t("workHistory.col.outcome"),
      render: (entry) => (
        <StatusBadge
          status={entry.status}
          label={t(`claimStatus.${entry.status}` as MessageKey)}
        />
      ),
    },
    {
      key: "inspections",
      header: t("workHistory.col.inspections"),
      render: (entry) => (
        <span className="text-sm font-medium text-text">
          {entry.inspectionCount ?? "—"}
        </span>
      ),
    },
    {
      key: "duration",
      header: t("workHistory.col.turnaround"),
      render: (entry) => (
        <span className="text-sm text-text">
          {formatDuration(entry.durationHours)}
        </span>
      ),
    },
    {
      key: "completedAt",
      header: t("workHistory.col.completed"),
      render: (entry) => (
        <span className="text-sm text-text">
          {formatDateTime(entry.completedAt)}
        </span>
      ),
    },
  ];
}

interface WorkHistorySectionProps {
  history: AdjusterWorkHistory | null;
  loading: boolean;
  error: string;
  onRetry: () => void;
}

export default function WorkHistorySection({
  history,
  loading,
  error,
  onRetry,
}: WorkHistorySectionProps) {
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, index) => (
          <div
            key={index}
            className="rounded-xl border border-border bg-surface p-4 shadow-sm animate-pulse"
          >
            <div className="h-3 w-20 bg-surface-disabled rounded" />
            <div className="mt-3 h-6 w-14 bg-surface-disabled rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <p role="alert" className="text-sm text-danger">
        {error}{" "}
        <button
          type="button"
          onClick={onRetry}
          className="font-medium text-primary hover:text-primary-dark underline"
        >
          {t("workHistory.retry")}
        </button>
      </p>
    );
  }

  if (!history || history.entries.length === 0) {
    return <EmptyState message={t("workHistory.empty")} />;
  }

  const totals = summarizeWorkHistory(history.entries, history.totalCompleted);
  const historyColumns = buildHistoryColumns(t);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricTile
          label={t("workHistory.metric.completed")}
          value={String(totals.completedCount)}
          icon={ListChecks}
          iconClass="text-success-strong"
        />
        <MetricTile
          label={t("workHistory.metric.inspections")}
          value={String(totals.totalInspections ?? "—")}
          icon={ClipboardCheck}
          iconClass="text-info-muted"
        />
        <MetricTile
          label={t("workHistory.metric.avgTurnaround")}
          value={formatDuration(totals.averageDurationHours)}
          icon={Clock}
          iconClass="text-warning-muted"
        />
        <MetricTile
          label={t("workHistory.metric.lastCompleted")}
          value={formatDate(totals.lastCompletedAt)}
          icon={CalendarCheck}
          iconClass="text-primary"
        />
      </div>

      <DataTable
        columns={historyColumns}
        data={history.entries}
        keyExtractor={(entry) => entry.claimId}
        emptyMessage={t("workHistory.empty")}
      />

      {history.truncated && (
        <p className="text-xs text-text-muted">
          {t("workHistory.truncatedNote", {
            count: history.entries.length,
            total: history.totalCompleted,
          })}
        </p>
      )}
    </div>
  );
}
