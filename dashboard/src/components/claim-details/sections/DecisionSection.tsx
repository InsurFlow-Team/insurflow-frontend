import DetailSection from "../DetailSection";
import InfoGrid from "../InfoGrid";
import InfoRow from "../InfoRow";
import { formatDateTime } from "../../../utils/claims";
import type { ClaimDetails } from "../../../types";

interface DecisionSectionProps {
  claim: ClaimDetails;
}

export default function DecisionSection({ claim }: DecisionSectionProps) {
  const { decisionNotes, closedBy, closedAt, closingNotes } = claim;

  const isClosed = Boolean(closedAt || closedBy || closingNotes || decisionNotes);

  if (!isClosed) {
    return (
      <DetailSection title="Decision / Closing">
        <p className="text-sm text-text-muted">
          لم يتم اتخاذ قرار أو إغلاق المطالبة بعد.
        </p>
      </DetailSection>
    );
  }

  return (
    <DetailSection title="Decision / Closing">
      <InfoGrid columns="2">
        <InfoRow label="Decision Notes" value={decisionNotes} />
        <InfoRow label="Closed By" value={closedBy} />
        <InfoRow label="Closed At" value={formatDateTime(closedAt)} />
        <InfoRow label="Closing Notes" value={closingNotes} />
      </InfoGrid>
    </DetailSection>
  );
}