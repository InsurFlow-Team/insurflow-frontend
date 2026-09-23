import DetailSection from "../DetailSection";
import InfoGrid from "../InfoGrid";
import InfoRow from "../InfoRow";
import { formatDate } from "../../../utils/claims";
import type { ClaimDetails } from "../../../types";

interface PolicySectionProps {
  claim: ClaimDetails;
}

export default function PolicySection({ claim }: PolicySectionProps) {
  return (
    <DetailSection title="Policy information">
      <InfoGrid columns="2">
        <InfoRow label="Policy Number" value={claim.policy?.policyNumber} />
        <InfoRow label="Policy Status" value={claim.policy?.status} />
        <InfoRow
          label="Policy Start Date"
          value={formatDate(claim.policy?.startDate)}
        />
        <InfoRow
          label="Policy Expiry Date"
          value={formatDate(claim.policy?.expiryDate)}
        />
      </InfoGrid>
    </DetailSection>
  );
}