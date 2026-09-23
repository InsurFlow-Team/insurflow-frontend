import DetailSection from "../DetailSection";
import InfoGrid from "../InfoGrid";
import InfoRow from "../InfoRow";
import { formatDateTime } from "../../../utils/claims";
import type { ClaimDetails } from "../../../types";

interface SignatureSectionProps {
  claim: ClaimDetails;
}

export default function SignatureSection({ claim }: SignatureSectionProps) {
  const signature = claim.signature;

  if (!signature) {
    return (
      <DetailSection title="Signature">
        <p className="text-sm text-text-muted">لا توجد توقيع بعد.</p>
      </DetailSection>
    );
  }

  return (
    <DetailSection title="Signature">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        {signature.url ? (
          <img
            src={signature.url}
            alt="Customer signature"
            className="h-40 rounded-lg border border-border bg-surface-soft object-contain"
          />
        ) : (
          <div className="flex h-40 w-full max-w-xs items-center justify-center rounded-lg border border-border bg-surface-soft text-xs text-text-muted">
            Signature image unavailable
          </div>
        )}

        <div className="flex-1">
          <InfoGrid columns="2">
            <InfoRow label="Captured By" value={signature.capturedBy} />
            <InfoRow
              label="Captured At"
              value={formatDateTime(signature.capturedAt)}
            />
          </InfoGrid>
        </div>
      </div>
    </DetailSection>
  );
}