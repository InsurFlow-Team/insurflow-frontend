import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { CheckCircle2, XCircle } from "lucide-react";

import {
  decideClaim,
  downloadClaimReport,
  getClaimById,
  getClaimExportStatus,
  startClaimReview,
  type ClaimDecision,
  type DecideClaimPayload,
} from "../api/claims.service";
import { getApiErrorMessage } from "../api/client";
import type { ClaimDetails as ClaimDetailsType } from "../types";
import LoadingState from "../components/ui/LoadingState";
import ErrorState from "../components/ui/ErrorState";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import AssignClaimModal from "../components/ui/AssignClaimModal";
import ClaimDetailHeader from "../components/claim-details/ClaimDetailHeader";
import ClaimStageTimeline from "../components/claim-details/ClaimStageTimeline";
import NextActionPanel from "../components/claim-details/NextActionPanel";
import ClaimInfoSections from "../components/claim-details/ClaimInfoSections";
import ClaimTimeline from "../components/claim-details/ClaimTimeline";
import PendingAcceptanceBanner from "../components/claim-details/PendingAcceptanceBanner";
import CurrentStepBanner from "../components/claim-details/CurrentStepBanner";
import DecisionDialog from "../components/claim-details/DecisionDialog";
import { toast } from "../contexts/ToastContext";
import { useAuth } from "../contexts/AuthContext";
import { useTranslation } from "../i18n/context";

export default function ClaimDetails() {
  const { claimId } = useParams<{ claimId: string }>();

  const { user } = useAuth();
  const { t } = useTranslation();

  const [claim, setClaim] = useState<ClaimDetailsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState(false);
  const [deciding, setDeciding] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [pendingDecision, setPendingDecision] =
    useState<ClaimDecision | null>(null);
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

      toast("success", t("toast.reviewStarted"));
    } catch (requestError) {
      toast("error", getApiErrorMessage(requestError));
    } finally {
      setReviewing(false);
      setShowReviewDialog(false);
    }
  }

  async function handleDecide(payload: DecideClaimPayload) {
    if (!claimId) return;

    setDeciding(true);

    try {
      await decideClaim(claimId, payload);
      await loadClaim();

      toast(
        "success",
        payload.decision === "APPROVED"
          ? t("toast.decisionApproved")
          : t("toast.decisionRejected"),
      );
    } catch (requestError) {
      toast("error", getApiErrorMessage(requestError));
    } finally {
      setDeciding(false);
      setPendingDecision(null);
    }
  }

  if (loading) {
    return <LoadingState message={t("claim.loading")} />;
  }

  if (error || !claim) {
    return (
      <ErrorState
        message={error || t("claim.notFound")}
        onRetry={() => void loadClaim()}
      />
    );
  }

  const canManageAssignment =
    user?.role === "ADMIN" || user?.role === "CLAIMS_OFFICER";

  const canDecide = claim.status === "UNDER_REVIEW" && user?.role === "ADMIN";

  const canAssign = claim.status === "NEW" && canManageAssignment;

  const exportStatus = getClaimExportStatus(claim);

  async function handleExportReport() {
    if (!claimId || !claim || !exportStatus.exportable || exporting) return;

    setExporting(true);

    try {
      await downloadClaimReport(claimId, claim.claimNumber);
      toast("success", t("toast.reportDownloaded"));
    } catch (requestError) {
      toast("error", getApiErrorMessage(requestError));
    } finally {
      setExporting(false);
    }
  }

  function handleAssigned() {
    setShowAssignModal(false);
    void loadClaim();
    toast("success", t("toast.offeredToAdjuster"));
  }

  function handleMakeDecision() {
    document
      .getElementById("decision-section")
      ?.scrollIntoView?.({ block: "start" });
  }

  return (
    <div className="space-y-6">
      <ClaimDetailHeader
        claim={claim}
        canExportReport={exportStatus.exportable}
        exportDisabledReason={exportStatus.disabledReason}
        exporting={exporting}
        onExportReport={() => void handleExportReport()}
      />

      {claim.status === "PENDING_ACCEPTANCE" && <PendingAcceptanceBanner />}

      {/* Decision Result Banner - shown to Claims Officer when decision is made */}
      {(claim.status === "APPROVED" || claim.status === "REJECTED") &&
        user?.role === "CLAIMS_OFFICER" && (
          <div
            className={`flex items-start gap-3 rounded-xl border p-4 ${
              claim.status === "APPROVED"
                ? "border-success-border bg-success-bg"
                : "border-danger-border bg-danger-bg"
            }`}
            role="alert"
          >
            {claim.status === "APPROVED" ? (
              <CheckCircle2 size={22} className="mt-0.5 shrink-0 text-success-strong" />
            ) : (
              <XCircle size={22} className="mt-0.5 shrink-0 text-danger" />
            )}
            <div>
              <p className={`font-semibold text-sm ${claim.status === "APPROVED" ? "text-success-strong" : "text-danger"}`}>
                {claim.status === "APPROVED"
                  ? t("claim.decisionBanner.approved")
                  : t("claim.decisionBanner.rejected")}
              </p>
              {claim.decisionNotes && (
                <p className="mt-1 text-sm text-text-muted">
                  {`${t("claim.decisionBanner.notes")} ${claim.decisionNotes}`}
                </p>
              )}
            </div>
          </div>
        )}

      {/* Where the claim stands in the lifecycle (backend-available stages). */}
      <ClaimStageTimeline status={claim.status} />

      {/* Who owns it, the SLA, and the single next action for this state. */}
      <NextActionPanel
        claim={claim}
        role={user?.role ?? null}
        reviewing={reviewing}
        onAssign={() => setShowAssignModal(true)}
        onStartReview={() => setShowReviewDialog(true)}
        onMakeDecision={handleMakeDecision}
      />

      {/* Current Step Banner - explains why the claim is in this state */}
      <CurrentStepBanner status={claim.status} />

      <ClaimInfoSections
        claim={claim}
        canAssign={canAssign}
        onAssign={() => setShowAssignModal(true)}
        canDecide={canDecide}
        deciding={deciding}
        onApprove={() => setPendingDecision("APPROVED")}
        onReject={() => setPendingDecision("REJECTED")}
      />

      <ClaimTimeline timeline={claim.timeline} />

      <ConfirmDialog
        isOpen={showReviewDialog}
        onCancel={() => setShowReviewDialog(false)}
        onConfirm={() => void handleStartReview()}
        title={t("claim.startReviewTitle")}
        message={t("claim.startReviewMessage")}
        confirmLabel={t("action.START_REVIEW")}
        cancelLabel={t("common.cancel")}
        loading={reviewing}
      />

      {pendingDecision !== null && (
        <DecisionDialog
          isOpen
          onCancel={() => setPendingDecision(null)}
          onConfirm={(payload) => void handleDecide(payload)}
          decision={pendingDecision}
          claim={claim}
          loading={deciding}
        />
      )}

      {showAssignModal && claimId && (
        <AssignClaimModal
          isOpen
          onClose={() => setShowAssignModal(false)}
          claimId={claimId}
          claimNumber={claim.claimNumber}
          onAssigned={handleAssigned}
        />
      )}
    </div>
  );
}
