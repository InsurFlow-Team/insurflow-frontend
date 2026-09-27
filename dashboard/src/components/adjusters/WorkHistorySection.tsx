import { Link } from "react-router-dom";
import { CalendarCheck, ClipboardCheck, Clock, ListChecks } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { Column } from "../ui/DataTable";
import DataTable from "../ui/DataTable";
import StatusBadge from "../ui/StatusBadge";
import EmptyState from "../ui/EmptyState";
import { formatDate, formatDateTime } from "../../utils/claims";
import { formatDuration, summarizeWorkHistory } from "../../utils/adjusterHistory";
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

const historyColumns: Column<AdjusterWorkHistoryEntry>[] = [
  {
    key: "claimNumber",
    header: "Claim Number",
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
    header: "Customer",
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
    header: "Outcome",
    render: (entry) => <StatusBadge status={entry.status} />,
  },
  {
    key: "inspections",
    header: "Inspections",
    render: (entry) => (
      <span className="text-sm font-medium text-text">
        {entry.inspectionCount ?? "—"}
      </span>
    ),
  },
  {
    key: "duration",
    header: "Turnaround",
    render: (entry) => (
      <span className="text-sm text-text">{formatDuration(entry.durationHours)}</span>
    ),
  },
  {
    key: "completedAt",
    header: "Completed",
    render: (entry) => (
      <span className="text-sm text-text">
        {formatDateTime(entry.completedAt)}
      </span>
    ),
  },
];

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
          Retry
        </button>
      </p>
    );
  }

  if (!history || history.entries.length === 0) {
    return (
      <EmptyState message="This adjuster has no completed claims yet." />
    );
  }

  const totals = summarizeWorkHistory(history.entries, history.totalCompleted);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricTile
          label="Completed claims"
          value={String(totals.completedCount)}
          icon={ListChecks}
          iconClass="text-success-strong"
        />
        <MetricTile
          label="Total inspections"
          value={String(totals.totalInspections ?? "—")}
          icon={ClipboardCheck}
          iconClass="text-info-muted"
        />
        <MetricTile
          label="Avg. turnaround"
          value={formatDuration(totals.averageDurationHours)}
          icon={Clock}
          iconClass="text-warning-muted"
        />
        <MetricTile
          label="Last completed"
          value={formatDate(totals.lastCompletedAt)}
          icon={CalendarCheck}
          iconClass="text-primary"
        />
      </div>

      <DataTable
        columns={historyColumns}
        data={history.entries}
        keyExtractor={(entry) => entry.claimId}
        emptyMessage="This adjuster has no completed claims yet."
      />

      {history.truncated && (
        <p className="text-xs text-text-muted">
          Showing the {history.entries.length} most recent completed claims out
          of {history.totalCompleted}.
        </p>
      )}
    </div>
  );
}
