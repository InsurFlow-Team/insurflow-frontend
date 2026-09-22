import DetailSection from "../DetailSection";
import InfoGrid from "../InfoGrid";
import InfoRow from "../InfoRow";
import type { ClaimDetails } from "../../../types";

interface AccidentSectionProps {
  claim: ClaimDetails;
}

export default function AccidentSection({ claim }: AccidentSectionProps) {
  const accident = claim.accident as {
    accidentType?: string;
    accidentDate?: string;
    accidentTime?: string;
    description?: string;
    damageDescription?: string;
  } | null;

  return (
    <DetailSection title="Accident information">
      <InfoGrid columns="2">
        <InfoRow label="Accident Type" value={accident?.accidentType} />
        <InfoRow label="Accident Date" value={accident?.accidentDate} />
        <InfoRow label="Accident Time" value={accident?.accidentTime} />
        <InfoRow
          label="Accident Description"
          value={accident?.description}
        />
        <InfoRow
          label="Damage Description"
          value={accident?.damageDescription}
        />
      </InfoGrid>
    </DetailSection>
  );
}