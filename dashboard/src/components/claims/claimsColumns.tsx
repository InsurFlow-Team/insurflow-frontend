import { Link } from "react-router-dom";
import { UserCheck } from "lucide-react";
import type { Column } from "../ui/DataTable";
import StatusBadge from "../ui/StatusBadge";
import { formatDate } from "../../utils/claims";
import type { ClaimSummary } from "../../types";

interface ClaimColumnsOptions {
  // Role gate (CLAIMS_OFFICER only) computed by the page. The per-row status
  // check (assign only from NEW) stays here so the matrix is enforced in one
  // place.
  canAssign?: boolean;
  onAssign?: (claim: ClaimSummary) => void;
}

export function buildClaimColumns(
  options: ClaimColumnsOptions = {},
): Column<ClaimSummary>[] {
  const { canAssign, onAssign } = options;

  return [
    {
      key: "claimNumber",
      header: "Claim Number",
      render: (claim) => (
        <span className="font-semibold text-text">{claim.claimNumber}</span>
      ),
    },
    {
      key: "customer",
      header: "Customer & Policy ID",
      render: (claim) => (
        <div className="min-w-0">
          <p className="text-sm text-text">{claim.customerName}</p>
          <p className="text-xs text-text-muted">Policy: —</p>
        </div>
      ),
    },
    {
      key: "vehicle",
      header: "Vehicle Information",
      render: (claim) => (
        <div className="min-w-0">
          <p className="text-sm text-text">
            {claim.initialPlateNumber || "—"}
          </p>
          <p className="text-xs text-text-muted">—</p>
        </div>
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
    {
      key: "updatedAt",
      header: "Updated Date",
      render: (claim) => (
        <span className="text-sm text-text">
          {formatDate(claim.updatedAt || claim.createdAt)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (claim) => (
        <div className="flex items-center gap-3">
          {canAssign && claim.status === "NEW" && (
            <button
              type="button"
              onClick={() => onAssign?.(claim)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs font-medium text-text hover:bg-background transition-colors"
            >
              <UserCheck size={13} />
              Assign
            </button>
          )}
          <Link
            to={`/claims/${claim.id}`}
            className="text-sm font-semibold text-primary hover:text-primary-dark transition-colors"
          >
            View Details
          </Link>
        </div>
      ),
    },
  ];
}