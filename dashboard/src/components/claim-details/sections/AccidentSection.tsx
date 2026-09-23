import DetailSection from "../DetailSection";
import InfoGrid from "../InfoGrid";
import InfoRow from "../InfoRow";
import { formatDate } from "../../../utils/claims";
import type { ClaimDetails } from "../../../types";

interface AccidentSectionProps {
  claim: ClaimDetails;
}

export default function AccidentSection({ claim }: AccidentSectionProps) {
  const accident = claim.accident;

  const hasAccidentData =
    accident !== null &&
    Boolean(
      accident.accidentType ||
        accident.accidentDate ||
        accident.accidentTime ||
        accident.description ||
        accident.damageDescription,
    );

  if (!hasAccidentData) {
    return (
      <DetailSection title="Accident information">
        <p className="text-sm text-text-muted">
          لا توجد بيانات عن الحادث بعد.
        </p>
      </DetailSection>
    );
  }

  return (
    <DetailSection title="Accident information">
      <InfoGrid columns="2">
        <InfoRow label="Accident Type" value={accident.accidentType} />
        <InfoRow label="Accident Date" value={formatDate(accident.accidentDate)} />
        <InfoRow label="Accident Time" value={accident.accidentTime} />
        <InfoRow label="Accident Description" value={accident.description} />
        <InfoRow label="Damage Description" value={accident.damageDescription} />
      </InfoGrid>
    </DetailSection>
  );
}