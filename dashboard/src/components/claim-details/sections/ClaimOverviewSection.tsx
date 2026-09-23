import DetailSection from "../DetailSection";
import InfoGrid from "../InfoGrid";
import InfoRow from "../InfoRow";
import { formatDateTime } from "../../../utils/claims";
import type { ClaimDetails } from "../../../types";

interface ClaimOverviewSectionProps {
  claim: ClaimDetails;
}

export default function ClaimOverviewSection({
  claim,
}: ClaimOverviewSectionProps) {
  return (
    <DetailSection title="Claim information">
      <InfoGrid columns="4">
        <InfoRow label="Claim Number" value={claim.claimNumber} />
        <InfoRow label="Claim Status" value={claim.status} />
        <InfoRow label="Incident Type" value={claim.incidentType} />
        <InfoRow label="Submission Date" value={formatDateTime(claim.createdAt)} />
        <InfoRow label="Last Updated" value={formatDateTime(claim.updatedAt)} />
      </InfoGrid>
    </DetailSection>
  );
}