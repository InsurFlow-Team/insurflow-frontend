import DetailSection from "../DetailSection";
import InfoGrid from "../InfoGrid";
import InfoRow from "../InfoRow";
import { accidentTypeLabel } from "../../../utils/claims";
import type { ClaimDetails } from "../../../types";
import { useTranslation } from "../../../i18n/context";
import type { MessageKey } from "../../../i18n/messages.en";

const ACCIDENT_TYPE_KEYS: Record<string, MessageKey> = {
  COLLISION: "claimInfo.accidentType.COLLISION",
  REAR_END_COLLISION: "claimInfo.accidentType.REAR_END_COLLISION",
  SIDE_IMPACT: "claimInfo.accidentType.SIDE_IMPACT",
  PARKING_DAMAGE: "claimInfo.accidentType.PARKING_DAMAGE",
  OTHER: "claimInfo.accidentType.OTHER",
};

interface AccidentSectionProps {
  claim: ClaimDetails;
}

export default function AccidentSection({ claim }: AccidentSectionProps) {
  const { t } = useTranslation();
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
      <DetailSection title={t("claimInfo.accident.title")}>
        <p className="text-sm text-text-muted">
          {t("claimInfo.accident.empty")}
        </p>
      </DetailSection>
    );
  }

  return (
    <DetailSection title={t("claimInfo.accident.title")}>
      <InfoGrid columns="2">
        <InfoRow
          label={t("claimInfo.accident.type")}
          value={
            accident.accidentType && ACCIDENT_TYPE_KEYS[accident.accidentType]
              ? t(ACCIDENT_TYPE_KEYS[accident.accidentType])
              : accidentTypeLabel(accident.accidentType)
          }
        />
        <InfoRow
          label={t("claimInfo.accident.date")}
          value={accident.accidentDate}
        />
        <InfoRow
          label={t("claimInfo.accident.time")}
          value={accident.accidentTime}
        />
        <InfoRow
          label={t("claimInfo.accident.description")}
          value={accident.description}
        />
        <InfoRow
          label={t("claimInfo.accident.damageDescription")}
          value={accident.damageDescription}
        />
      </InfoGrid>
    </DetailSection>
  );
}