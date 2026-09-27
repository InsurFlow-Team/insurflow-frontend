import { Link } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import type { Column } from "../ui/DataTable";
import DataTable from "../ui/DataTable";
import StatusBadge from "../ui/StatusBadge";
import { formatDate } from "../../utils/claims";
import { claimAgeInDays, isOverdue } from "../../utils/attention";
import type { ClaimSummary } from "../../types";

function ageLabel(days: number): string {
  if (days === 0) return "Today";
  if (days === 1) return "1 day";
  return `${days} days`;
}

const recentClaimColumns: Column<ClaimSummary>[] = [
  {
    key: "claimNumber",
    header: "Claim Number",
    render: (claim) => (
      <Link
        to={`/claims/${claim.id}`}
        className="text-sm font-semibold text-primary hover:text-primary-dark transition-colors"
      >
        {claim.claimNumber}
      </Link>
    ),
  },
  {
    key: "customer",
    header: "Customer",
    render: (claim) => (
      <span className="text-sm text-text">{claim.customerName}</span>
    ),
  },
  {
    key: "plate",
    header: "Vehicle",
    render: (claim) => (
      <span className="text-sm text-text">
        {claim.initialPlateNumber || "—"}
      </span>
    ),
  },
  {
    key: "status",
    header: "Status",
    render: (claim) => (
      <div className="flex flex-col gap-1 items-start">
        <StatusBadge status={claim.status} />
        {claim.status === "NEW" && claim.lastDecline && (
          <span className="inline-flex items-center gap-1 rounded border border-warning-border-strong bg-warning-bg px-1.5 py-0.5 text-[10px] font-semibold text-warning-deep">
            <AlertTriangle size={9} />
            Re-dispatch Needed
          </span>
        )}
      </div>
    ),
  },
  {
    key: "assignedTo",
    header: "Assigned To",
    render: (claim) => (
      <span className="text-sm text-text">
        {claim.assignedTo?.name || <span className="text-warning-text">Unassigned</span>}
      </span>
    ),
  },
  {
    key: "createdAt",
    header: "Created Date",
    render: (claim) => (
      <span className="text-sm text-text">{formatDate(claim.createdAt)}</span>
    ),
  },
  {
    key: "age",
    header: "Age",
    render: (claim) => {
      const days = claimAgeInDays(claim.createdAt);
      const overdue = isOverdue(claim.createdAt);

      return (
        <span
          className={`inline-flex items-center gap-1 text-sm font-medium ${
            overdue ? "text-warning-text" : "text-text-muted"
          }`}
        >
          {overdue && <AlertTriangle size={12} />}
          {ageLabel(days)}
        </span>
      );
    },
  },
];

interface RecentClaimsTableProps {
  claims: ClaimSummary[];
  loading: boolean;
}

export default function RecentClaimsTable({
  claims,
  loading,
}: RecentClaimsTableProps) {
  return (
    <section className="space-y-3">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-base font-semibold text-text">Recent Claims</h2>
        <Link
          to="/claims"
          className="text-sm font-medium text-primary hover:text-primary-dark transition-colors"
        >
          View all claims
        </Link>
      </div>

      <DataTable
        columns={recentClaimColumns}
        data={claims}
        loading={loading}
        emptyMessage="No claims yet."
        keyExtractor={(claim) => claim.id}
      />
    </section>
  );
}