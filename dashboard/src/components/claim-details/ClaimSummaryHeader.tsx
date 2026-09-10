import { Link } from "react-router-dom";
import { ArrowLeft, PlayCircle } from "lucide-react";
import StatusBadge from "../ui/StatusBadge";
import type { ClaimStatus } from "../../types";

interface ClaimSummaryHeaderProps {
  claimNumber: string;
  status: ClaimStatus;
  canStartReview: boolean;
  reviewing: boolean;
  onStartReview: () => void;
}

export default function ClaimSummaryHeader({
  claimNumber,
  status,
  canStartReview,
  reviewing,
  onStartReview,
}: ClaimSummaryHeaderProps) {
  return (
    <div className="space-y-6">
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
            {claimNumber}
          </h1>

          <div className="mt-3">
            <StatusBadge status={status} />
          </div>
        </div>

        {canStartReview && (
          <button
            type="button"
            onClick={onStartReview}
            disabled={reviewing}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-dark px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary disabled:cursor-not-allowed disabled:opacity-60"
          >
            <PlayCircle size={17} />
            Start Review
          </button>
        )}
      </div>
    </div>
  );
}