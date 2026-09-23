import { ExternalLink } from "lucide-react";
import DetailSection from "../DetailSection";
import InfoGrid from "../InfoGrid";
import InfoRow from "../InfoRow";
import { formatDateTime } from "../../../utils/claims";
import type { ClaimDetails } from "../../../types";

interface InspectionLocationSectionProps {
  claim: ClaimDetails;
}

/**
 * The ACTUAL field inspection location (موقع المعاينة الميدانية الفعلي).
 *
 * Source: Field Adjuster Mobile, recorded during inspection. Never merge this
 * with the reported incident location. When null, show the "waiting for the
 * adjuster" state — do NOT invent coordinates.
 */
export default function InspectionLocationSection({
  claim,
}: InspectionLocationSectionProps) {
  const location = claim.location;

  const hasCoordinates =
    location !== null &&
    location.latitude !== null &&
    location.longitude !== null;

  if (!hasCoordinates) {
    return (
      <DetailSection title="موقع المعاينة الميدانية الفعلي">
        <p className="text-sm text-text-muted">
          بانتظار وصول المعاين وتحديد موقع المعاينة
        </p>
      </DetailSection>
    );
  }

  return (
    <DetailSection title="موقع المعاينة الميدانية الفعلي">
      <InfoGrid columns="3">
        <InfoRow label="Address" value={location.address} />
        <InfoRow
          label="Coordinates"
          value={`${location.latitude}, ${location.longitude}`}
        />
        <InfoRow label="Captured At" value={formatDateTime(location.capturedAt)} />
      </InfoGrid>

      <a
        href={`https://www.google.com/maps?q=${location.latitude},${location.longitude}`}
        target="_blank"
        rel="noreferrer"
        className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-dark"
      >
        <ExternalLink size={16} />
        View Inspection Location on Map
      </a>
    </DetailSection>
  );
}