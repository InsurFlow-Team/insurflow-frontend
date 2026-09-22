import { Link } from "react-router-dom";
import type { Column } from "../ui/DataTable";
import DataTable from "../ui/DataTable";
import StatusBadge from "../ui/StatusBadge";
import { formatDate } from "../../utils/claims";
import type { ClaimSummary } from "../../types";

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
    render: (claim) => <StatusBadge status={claim.status} />,
  },
  {
    key: "createdAt",
    header: "Created Date",
    render: (claim) => (
      <span className="text-sm text-text">{formatDate(claim.createdAt)}</span>
    ),
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