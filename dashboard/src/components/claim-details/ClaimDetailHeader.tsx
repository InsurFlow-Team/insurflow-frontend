import { Link } from "react-router-dom";
import { ArrowLeft, PlayCircle } from "lucide-react";
import StatusBadge from "../ui/StatusBadge";
import Button from "../ui/Button";
import { formatDateTime } from "../../utils/claims";
import type { ClaimDetails as ClaimDetailsType } from "../../types";

interface ClaimDetailHeaderProps {
  claim: ClaimDetailsType;
  canStartReview: boolean;
  reviewing: boolean;
  onStartReview: () => void;
}

export default function ClaimDetailHeader({
  claim,
  canStartReview,
  reviewing,
  onStartReview,
}: ClaimDetailHeaderProps) {
  return (
    <>
      <Link
        to="/claims"
        className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-dark"
      >
        <ArrowLeft size={16} />
        Back to claims
      </Link>

      <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-text-muted">Claim number</p>

          <h1 className="mt-1 text-2xl font-bold text-text">
            {claim.claimNumber}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <StatusBadge status={claim.status} />
            <span className="text-sm text-text-muted">
              {claim.incidentType || "—"}
            </span>
          </div>

          <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-xs text-text-muted">
            <span>Created: {formatDateTime(claim.createdAt)}</span>
            <span>Updated: {formatDateTime(claim.updatedAt)}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {canStartReview && (
            <Button
              onClick={onStartReview}
              disabled={reviewing}
              icon={<PlayCircle size={17} />}
            >
              Start Review
            </Button>
          )}
        </div>
      </div>
    </>
  );
}