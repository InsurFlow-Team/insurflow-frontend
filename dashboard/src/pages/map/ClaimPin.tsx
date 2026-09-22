import { Marker, Popup } from "react-leaflet";
import { claimIcon } from "../../utils/leafletIcons";
import type { MapCoordinates } from "../../utils/map";
import type { ClaimSummary } from "../../types";
import StatusChip from "./StatusChip";

interface ClaimPinProps {
  claim: ClaimSummary;
  coordinates: MapCoordinates;
  isSelected: boolean;
  canAssign: boolean;
  onSelect: (claim: ClaimSummary) => void;
  onAssign: (claim: ClaimSummary) => void;
}

export default function ClaimPin({
  claim,
  coordinates,
  isSelected,
  canAssign,
  onSelect,
  onAssign,
}: ClaimPinProps) {
  return (
    <Marker
      key={`claim-${claim.id}`}
      position={[coordinates.latitude, coordinates.longitude]}
      icon={claimIcon(claim.status)}
      eventHandlers={{
        click: () => onSelect(claim),
      }}
    >
      <Popup>
        <div className="space-y-1.5">
          <p className="text-sm font-semibold text-text">
            {claim.claimNumber}
            {isSelected && " (Selected)"}
          </p>
          <p className="text-xs text-text-muted">
            {claim.customerName} · {claim.initialPlateNumber || "No plate"}
          </p>
          <StatusChip status={claim.status} />

          {canAssign && claim.status === "NEW" && (
            <button
              type="button"
              onClick={() => onAssign(claim)}
              className="text-xs font-semibold text-primary hover:text-primary-dark mt-2 block"
            >
              Assign Field Adjuster
            </button>
          )}
        </div>
      </Popup>
    </Marker>
  );
}