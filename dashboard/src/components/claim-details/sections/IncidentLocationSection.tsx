import { ExternalLink } from "lucide-react";
import DetailSection from "../DetailSection";
import InfoGrid from "../InfoGrid";
import InfoRow from "../InfoRow";
import { formatDateTime } from "../../../utils/claims";
import type { ClaimDetails } from "../../../types";

interface IncidentLocationSectionProps {
  claim: ClaimDetails;
}

/**
 * The REPORTED incident location (موقع الحادث المُبلغ عنه).
 *
 * Source: Claims Officer / Claim Intake. This is where the accident was
 * reported to have occurred — never merged with the field inspection location.
 */
export default function IncidentLocationSection({
  claim,
}: IncidentLocationSectionProps) {
  const { incidentLocation, incidentCoordinates } = claim;

  return (
    <DetailSection title="موقع الحادث المُبلغ عنه">
      <InfoGrid columns="3">
        <InfoRow label="Incident Location" value={incidentLocation} />
        <InfoRow
          label="Reported Coordinates"
          value={
            incidentCoordinates
              ? `${incidentCoordinates.latitude}, ${incidentCoordinates.longitude}`
              : null
          }
        />
        <InfoRow
          label="Reported At"
          value={incidentCoordinates ? formatDateTime(incidentCoordinates.capturedAt) : null}
        />
      </InfoGrid>

      {incidentCoordinates && (
        <a
          href={`https://www.google.com/maps?q=${incidentCoordinates.latitude},${incidentCoordinates.longitude}`}
          target="_blank"
          rel="noreferrer"
          className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-dark"
        >
          <ExternalLink size={16} />
          View Reported Location on Map
        </a>
      )}
    </DetailSection>
  );
}