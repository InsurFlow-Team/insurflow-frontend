import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import {
  getClaimById,
  requestClaimCorrection,
  startClaimReview,
  submitClaimDecision,
  type ClaimDecision,
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
import ReviewDecisionDialog, {
  type ReviewAction,
} from "../components/claim-details/ReviewDecisionDialog";
import EvidenceAttachmentsSection from "../components/claim-details/EvidenceAttachmentsSection";
import SignatureSection from "../components/claim-details/SignatureSection";
import DecisionsSection from "../components/claim-details/DecisionsSection";
import CorrectionNotesSection from "../components/claim-details/CorrectionNotesSection";
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
  const [reviewAction, setReviewAction] = useState<ReviewAction | null>(null);
  const [decisionNotes, setDecisionNotes] = useState("");
  const [decisionError, setDecisionError] = useState("");
  const [decisionSubmitting, setDecisionSubmitting] = useState(false);

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

  async function handleReviewDecision() {
    if (!claimId || !reviewAction) return;

    if (
      reviewAction === "REJECTED" &&
      decisionNotes.trim().length === 0
    ) {
      setDecisionError("Please provide a rejection reason.");
      return;
    }

    if (
      reviewAction === "CORRECTION" &&
      decisionNotes.trim().length === 0
    ) {
      setDecisionError("Please provide correction notes.");
      return;
    }

    setDecisionSubmitting(true);

    try {
      if (reviewAction === "CORRECTION") {
        await requestClaimCorrection(claimId, decisionNotes.trim());
      } else {
        await submitClaimDecision(
          claimId,
          reviewAction as ClaimDecision,
          decisionNotes.trim(),
        );
      }

      await loadClaim();
      setReviewAction(null);
      setDecisionNotes("");
      setDecisionError("");
      toast("success", "Claim reviewed successfully.");
    } catch (requestError) {
      setDecisionError(getApiErrorMessage(requestError));
    } finally {
      setDecisionSubmitting(false);
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

  const isAdminOrOfficer =
    user?.role === "ADMIN" || user?.role === "CLAIMS_OFFICER";

  const canManageAssignment = isAdminOrOfficer;

  const canStartReview =
    claim.status === "SUBMITTED" && user?.role === "CLAIMS_OFFICER";

  const canAssign = claim.status === "NEW" && canManageAssignment;

  const isUnderReview = claim.status === "UNDER_REVIEW";

  const canSubmitDecision = isUnderReview && isAdminOrOfficer;

  const canRequestCorrection =
    isUnderReview && user?.role === "CLAIMS_OFFICER";

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
        claimNumber={claim.claimNumber}
        status={claim.status}
        canStartReview={canStartReview}
        reviewing={reviewing}
        canSubmitDecision={canSubmitDecision}
        canRequestCorrection={canRequestCorrection}
        onStartReview={() => setShowReviewDialog(true)}
        onApprove={() => setReviewAction("APPROVED")}
        onReject={() => setReviewAction("REJECTED")}
        onRequestCorrection={() => setReviewAction("CORRECTION")}
      />

      {claim.status === "PENDING_ACCEPTANCE" && <PendingAcceptanceBanner />}

      <div className="grid gap-6 lg:grid-cols-2">
        <ClaimInfoSections
          claim={claim}
          canAssign={canAssign}
          onAssign={() => setShowAssignModal(true)}
        />

        <div className="space-y-6">
          <EvidenceAttachmentsSection claim={claim} />
          <SignatureSection claim={claim} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <DecisionsSection claim={claim} />
        <CorrectionNotesSection claim={claim} />
      </div>

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

      <ReviewDecisionDialog
        action={reviewAction}
        submitting={decisionSubmitting}
        notes={decisionNotes}
        error={decisionError}
        onNotesChange={(value) => {
          setDecisionNotes(value);
          setDecisionError("");
        }}
        onClose={() => {
          if (!decisionSubmitting) {
            setReviewAction(null);
            setDecisionNotes("");
            setDecisionError("");
          }
        }}
        onSubmit={() => void handleReviewDecision()}
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