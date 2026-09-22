import { Link } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  PlayCircle,
  XCircle,
  RefreshCcw,
} from "lucide-react";
import StatusBadge from "../ui/StatusBadge";
import Button from "../ui/Button";
import type { ClaimDetails as ClaimDetailsType } from "../../types";

interface ClaimDetailHeaderProps {
  claimNumber: string;
  status: ClaimDetailsType["status"];
  canStartReview: boolean;
  reviewing: boolean;
  canSubmitDecision: boolean;
  canRequestCorrection: boolean;
  onStartReview: () => void;
  onApprove: () => void;
  onReject: () => void;
  onRequestCorrection: () => void;
}

export default function ClaimDetailHeader({
  claimNumber,
  status,
  canStartReview,
  reviewing,
  canSubmitDecision,
  canRequestCorrection,
  onStartReview,
  onApprove,
  onReject,
  onRequestCorrection,
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

          <h1 className="mt-1 text-2xl font-bold text-text">{claimNumber}</h1>

          <div className="mt-3">
            <StatusBadge status={status} />
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {canSubmitDecision && (
            <>
              <Button
                onClick={onApprove}
                variant="success"
                icon={<CheckCircle2 size={17} />}
              >
                Approve
              </Button>

              <Button
                onClick={onReject}
                icon={<XCircle size={17} />}
                className="bg-danger text-white hover:opacity-90"
              >
                Reject
              </Button>
            </>
          )}

          {canRequestCorrection && (
            <Button
              onClick={onRequestCorrection}
              variant="secondary"
              icon={<RefreshCcw size={17} />}
            >
              Request Correction
            </Button>
          )}

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