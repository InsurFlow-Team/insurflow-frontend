import DetailSection from "../DetailSection";
import InfoGrid from "../InfoGrid";
import InfoRow from "../InfoRow";
import type { ClaimDetails } from "../../../types";

interface VehicleSectionProps {
  claim: ClaimDetails;
}

export default function VehicleSection({ claim }: VehicleSectionProps) {
  const vehicle = claim.vehicle;

  return (
    <DetailSection title="Vehicle information">
      <InfoGrid columns="5">
        <InfoRow label="Plate Number" value={vehicle.plateNumber} />
        <InfoRow label="Vehicle Make" value={vehicle.make} />
        <InfoRow label="Vehicle Model" value={vehicle.model} />
        <InfoRow label="Vehicle Year" value={vehicle.year} />
        <InfoRow label="Vehicle Color" value={vehicle.color} />
      </InfoGrid>
    </DetailSection>
  );
}