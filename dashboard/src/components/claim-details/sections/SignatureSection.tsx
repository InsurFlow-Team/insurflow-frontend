import DetailSection from "../DetailSection";
import InfoGrid from "../InfoGrid";
import InfoRow from "../InfoRow";
import { formatDateTime } from "../../../utils/claims";
import type { ClaimDetails } from "../../../types";
import { useTranslation } from "../../../i18n/context";

interface SignatureSectionProps {
  claim: ClaimDetails;
}

export default function SignatureSection({ claim }: SignatureSectionProps) {
  const { t } = useTranslation();
  const signature = claim.signature;

  if (!signature) {
    return (
      <DetailSection title={t("claimInfo.signature.title")}>
        <p className="text-sm text-text-muted">
          {t("claimInfo.signature.empty")}
        </p>
      </DetailSection>
    );
  }

  return (
    <DetailSection title={t("claimInfo.signature.title")}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        {signature.url ? (
          <img
            src={signature.url}
            alt={t("claimInfo.signature.alt")}
            className="h-40 rounded-lg border border-border bg-surface-soft object-contain"
          />
        ) : (
          <div className="flex h-40 w-full max-w-xs items-center justify-center rounded-lg border border-border bg-surface-soft text-xs text-text-muted">
            {t("claimInfo.signature.unavailable")}
          </div>
        )}

        <div className="flex-1">
          <InfoGrid columns="2">
            <InfoRow
              label={t("claimInfo.signature.capturedBy")}
              value={signature.capturedBy}
            />
            <InfoRow
              label={t("claimInfo.signature.capturedAt")}
              value={formatDateTime(signature.capturedAt)}
            />
          </InfoGrid>
        </div>
      </div>
    </DetailSection>
  );
}