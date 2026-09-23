import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import {
  getClaimById,
  startClaimReview,
} from "../api/claims.service";
import { getApiErrorMessage } from "../api/client";
import type { ClaimDetails as ClaimDetailsType } from "../types";
import LoadingState from "../components/ui/LoadingState";
import ErrorState from "../components/ui/ErrorState";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import AssignClaimModal from "../components/ui/AssignClaimModal";
import ClaimDetailHeader from "../components/claim-details/ClaimDetailHeader";
import ClaimInfoSections from "../components/claim-details/ClaimInfoSections";
import ClaimTimeline from "../components/claim-details/ClaimTimeline";
import PendingAcceptanceBanner from "../components/claim-details/PendingAcceptanceBanner";
import { toast } from "../contexts/ToastContext";
import { useAuth } from "../contexts/AuthContext";

export default function ClaimDetails() {
  const { claimId } = useParams<{ claimId: string }>();

  const { user } = useAuth();

  const [claim, setClaim] = useState<ClaimDetailsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [error, setError] = useState("");

  const loadClaim = useCallback(async () => {
    if (!claimId) return;

    setLoading(true);
    setError("");

    try {
      const data = await getClaimById(claimId);
      setClaim(data);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, [claimId]);

  useEffect(() => {
    void loadClaim();
  }, [loadClaim]);

  async function handleStartReview() {
    if (!claimId) return;

    setReviewing(true);

    try {
      await startClaimReview(claimId);
      await loadClaim();

      toast(
        "success",
        "Claim review started successfully. Status changed to UNDER_REVIEW.",
      );
    } catch (requestError) {
      toast("error", getApiErrorMessage(requestError));
    } finally {
      setReviewing(false);
      setShowReviewDialog(false);
    }
  }

  if (loading) {
    return <LoadingState message="Loading claim details..." />;
  }

  if (error || !claim) {
    return (
      <ErrorState
        message={error || "Claim not found."}
        onRetry={() => void loadClaim()}
      />
    );
  }

  const canManageAssignment =
    user?.role === "ADMIN" || user?.role === "CLAIMS_OFFICER";

  const canStartReview = claim.status === "SUBMITTED";

  const canAssign = claim.status === "NEW" && canManageAssignment;

  function handleAssigned() {
    setShowAssignModal(false);
    void loadClaim();
    toast(
      "success",
      "Claim offered to the field adjuster. Awaiting their acceptance.",
    );
  }

  return (
    <div className="space-y-6">
      <ClaimDetailHeader
        claim={claim}
        canStartReview={canStartReview}
        reviewing={reviewing}
        onStartReview={() => setShowReviewDialog(true)}
      />

      {claim.status === "PENDING_ACCEPTANCE" && <PendingAcceptanceBanner />}

      <ClaimInfoSections
        claim={claim}
        canAssign={canAssign}
        onAssign={() => setShowAssignModal(true)}
      />

      <ClaimTimeline timeline={claim.timeline} />

      <ConfirmDialog
        isOpen={showReviewDialog}
        onCancel={() => setShowReviewDialog(false)}
        onConfirm={() => void handleStartReview()}
        title="Start claim review?"
        message="This will change the claim status from SUBMITTED to UNDER_REVIEW."
        confirmLabel="Start Review"
        cancelLabel="Cancel"
        loading={reviewing}
      />

      {showAssignModal && claimId && (
        <AssignClaimModal
          isOpen
          onClose={() => setShowAssignModal(false)}
          claimId={claimId}
          onAssigned={handleAssigned}
        />
      )}
    </div>
  );
}