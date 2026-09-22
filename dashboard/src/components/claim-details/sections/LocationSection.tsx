import { ExternalLink } from "lucide-react";
import DetailSection from "../DetailSection";
import InfoGrid from "../InfoGrid";
import InfoRow from "../InfoRow";
import type { ClaimDetails } from "../../../types";

interface LocationSectionProps {
  claim: ClaimDetails;
}

export default function LocationSection({ claim }: LocationSectionProps) {
  const location = claim.location as {
    latitude?: number;
    longitude?: number;
    address?: string;
  } | null;

  const hasCoordinates =
    location?.latitude !== undefined && location?.longitude !== undefined;

  return (
    <DetailSection title="Location information">
      <InfoGrid columns="3">
        <InfoRow label="Street" value={location?.address} />
        <InfoRow label="Area" value={claim.incidentLocation} />
        <InfoRow
          label="Coordinates"
          value={
            hasCoordinates
              ? `${location.latitude}, ${location.longitude}`
              : null
          }
        />
      </InfoGrid>

      {hasCoordinates && (
        <a
          href={`https://www.google.com/maps?q=${location.latitude},${location.longitude}`}
          target="_blank"
          rel="noreferrer"
          className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-dark"
        >
          <ExternalLink size={16} />
          View on Map
        </a>
      )}
    </DetailSection>
  );
}