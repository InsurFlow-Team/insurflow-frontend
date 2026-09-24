import { useState } from "react";
import { getClaimReport } from "../../api/claims.service";
import { getApiErrorMessage } from "../../api/client";
import { toast } from "../../contexts/ToastContext";

import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  Download,
  PlayCircle,
  Printer,
  XCircle,
  RefreshCcw,
} from "lucide-react";
import StatusBadge from "../ui/StatusBadge";
import Button from "../ui/Button";
import { Link } from "react-router-dom";
import type { ClaimDetails as ClaimDetailsType } from "../../types";

interface ClaimDetailHeaderProps {
    claimId: string;
  reportMode: boolean;
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
    claimId,
  reportMode,
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
  const [downloadingReport, setDownloadingReport] = useState(false);

async function handleDownloadReport() {
  setDownloadingReport(true);

  try {
    const report = await getClaimReport(claimId);
    const url = URL.createObjectURL(report);
    const link = document.createElement("a");

    link.href = url;
    link.download = `${claimNumber}-final-report.pdf`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
    toast("success", "Claim report downloaded successfully.");
  } catch (error) {
    toast("error", getApiErrorMessage(error));
  } finally {
    setDownloadingReport(false);
  }
}

  return (
    <>
      <Link
  to={reportMode ? `/claims/${claimId}` : "/claims"}
  className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-dark"
>
  <ArrowLeft size={16} />
  {reportMode ? "Back to claim details" : "Back to claims"}
</Link>

      <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          {reportMode && (
  <p className="mb-2 text-xl font-bold text-primary-dark">
    Final Claim Report
  </p>
)}
          <p className="text-sm text-text-muted">Claim number</p>

          <h1 className="mt-1 text-2xl font-bold text-text">{claimNumber}</h1>

          <div className="mt-3">
            <StatusBadge status={status} />
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {reportMode ? (
  <Button
    onClick={() => window.print()}
    icon={<Printer size={17} />}
  >
    Print Report
  </Button>
) : (
  ["APPROVED", "REJECTED", "CLOSED"].includes(status) && (
   <>
  <Link
    to={`/claims/${claimId}/report`}
    className="inline-flex items-center justify-center gap-2 rounded-lg border border-primary px-4 py-2.5 text-sm font-semibold text-primary hover:bg-primary-light"
  >
    <FileText size={17} />
    Preview Report
  </Link>

  <Button
    onClick={() => void handleDownloadReport()}
    disabled={downloadingReport}
    icon={<Download size={17} />}
  >
    {downloadingReport ? "Downloading..." : "Download PDF"}
  </Button>
</>
  )
)}


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