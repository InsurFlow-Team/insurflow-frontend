import DetailSection from "../DetailSection";
import InfoGrid from "../InfoGrid";
import InfoRow from "../InfoRow";
import { accidentTypeLabel } from "../../../utils/claims";
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
      <DetailSection title="تفاصيل الحادث">
        <p className="text-sm text-text-muted">
          لم يتم إدخال تفاصيل الحادث بعد.
        </p>
      </DetailSection>
    );
  }

  return (
    <DetailSection title="تفاصيل الحادث">
      <InfoGrid columns="2">
        <InfoRow
          label="نوع الحادث"
          value={accidentTypeLabel(accident.accidentType)}
        />
        <InfoRow label="تاريخ الحادث" value={accident.accidentDate} />
        <InfoRow label="وقت الحادث" value={accident.accidentTime} />
        <InfoRow label="وصف الحادث" value={accident.description} />
        <InfoRow label="وصف الأضرار" value={accident.damageDescription} />
      </InfoGrid>
    </DetailSection>
  );
}