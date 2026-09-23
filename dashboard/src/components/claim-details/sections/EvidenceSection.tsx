import DetailSection from "../DetailSection";
import InfoGrid from "../InfoGrid";
import InfoRow from "../InfoRow";
import { formatDateTime } from "../../../utils/claims";
import type { ClaimDetails } from "../../../types";

interface EvidenceSectionProps {
  claim: ClaimDetails;
}

/**
 * Evidence images captured by the Field Adjuster (mobile). Rendered straight
 * from the claim-details response — no extra API calls. Uploader may be null.
 */
export default function EvidenceSection({ claim }: EvidenceSectionProps) {
  const { evidence } = claim;

  if (evidence.length === 0) {
    return (
      <DetailSection title="Evidence">
        <p className="text-sm text-text-muted">لا توجد صور للمعاينة بعد.</p>
      </DetailSection>
    );
  }

  return (
    <DetailSection title="Evidence">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {evidence.map((item, index) => (
          <div
            key={`${item.url}-${index}`}
            className="overflow-hidden rounded-lg border border-border bg-surface-soft"
          >
            {item.url ? (
              <img
                src={item.url}
                alt={item.imageType || "Evidence image"}
                className="h-40 w-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="flex h-40 w-full items-center justify-center bg-surface-soft text-xs text-text-muted">
                Image unavailable
              </div>
            )}

            <div className="space-y-1 p-3">
              <p className="text-sm font-medium text-text">
                {item.imageType || "Unspecified"}
              </p>
              <InfoGrid columns="2">
                <InfoRow
                  label="Uploaded By"
                  value={item.uploadedBy?.name ?? null}
                />
                <InfoRow
                  label="Uploaded At"
                  value={formatDateTime(item.uploadedAt)}
                />
              </InfoGrid>
            </div>
          </div>
        ))}
      </div>
    </DetailSection>
  );
}