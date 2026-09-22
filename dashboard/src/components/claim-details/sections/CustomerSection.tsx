import DetailSection from "../DetailSection";
import InfoGrid from "../InfoGrid";
import InfoRow from "../InfoRow";
import type { ClaimDetails } from "../../../types";

interface CustomerSectionProps {
  claim: ClaimDetails;
}

export default function CustomerSection({ claim }: CustomerSectionProps) {
  return (
    <DetailSection title="Customer information">
      <InfoGrid columns="2">
        <InfoRow label="Customer Name" value={claim.customer.name} />
        <InfoRow label="Phone Number" value={claim.customer.phone} />
        <InfoRow
          label="Customer Policy Number"
          value={claim.vehicle.policyId}
        />
      </InfoGrid>
    </DetailSection>
  );
}