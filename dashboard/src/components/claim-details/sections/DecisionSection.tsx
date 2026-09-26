import Button from "../../ui/Button";
import DetailSection from "../DetailSection";
import InfoGrid from "../InfoGrid";
import InfoRow from "../InfoRow";
import { CheckCircle2, XCircle } from "lucide-react";
import { formatDateTime } from "../../../utils/claims";
import type { ClaimDetails } from "../../../types";

interface DecisionSectionProps {
  claim: ClaimDetails;
  canDecide: boolean;
  deciding: boolean;
  onApprove: () => void;
  onReject: () => void;
}

export default function DecisionSection({
  claim,
  canDecide,
  deciding,
  onApprove,
  onReject,
}: DecisionSectionProps) {
  const { status, decisionNotes, closedBy, closedAt, closingNotes } = claim;

  const isClosed = Boolean(closedAt || closedBy || closingNotes);

  const hasDecision =
    isClosed ||
    status === "APPROVED" ||
    status === "REJECTED" ||
    status === "CLOSED" ||
    Boolean(decisionNotes);

  if (!hasDecision) {
    return (
      <DetailSection title="Decision / Closing">
        <div className="space-y-4">
          <p className="text-sm text-text-muted">
            لم يتم اتخاذ قرار أو إغلاق المطالبة بعد.
          </p>

          {canDecide && (
            <div className="flex flex-wrap items-center gap-3">
              <Button
                onClick={onApprove}
                disabled={deciding}
                icon={<CheckCircle2 size={17} />}
              >
                Approve
              </Button>

              <Button
                onClick={onReject}
                disabled={deciding}
                variant="danger"
                icon={<XCircle size={17} />}
              >
                Reject
              </Button>

              <p className="w-full text-xs text-text-muted">
                القرار النهائي يُتخذ من قِبل الأدمن فقط.
              </p>
            </div>
          )}
        </div>
      </DetailSection>
    );
  }

  if (status === "CLOSED") {
    return (
      <DetailSection title="Decision / Closing">
        <p className="text-sm font-medium text-text">تم إغلاق المطالبة.</p>

        <div className="mt-3">
          <InfoGrid columns="2">
            <InfoRow label="Decision Notes" value={decisionNotes} />
            <InfoRow label="Closed By" value={closedBy} />
            <InfoRow label="Closed At" value={formatDateTime(closedAt)} />
            <InfoRow label="Closing Notes" value={closingNotes} />
          </InfoGrid>
        </div>
      </DetailSection>
    );
  }

  const approved = status === "APPROVED";

  return (
    <DetailSection title="Decision / Closing">
      <div className="flex items-center gap-2">
        {approved ? (
          <CheckCircle2 size={18} className="text-emerald-600" />
        ) : (
          <XCircle size={18} className="text-red-600" />
        )}
        <p className="text-sm font-medium text-text">
          {approved ? "تم قبول المطالبة." : "تم رفض المطالبة."}
        </p>
      </div>

      {decisionNotes && (
        <div className="mt-3">
          <InfoGrid columns="2">
            <InfoRow label="Decision Notes" value={decisionNotes} />
          </InfoGrid>
        </div>
      )}
    </DetailSection>
  );
}