import { Marker, Popup } from "react-leaflet";
import { adjusterPinColor } from "../../utils/map";
import type { MapCoordinates } from "../../utils/map";
import { adjusterIcon } from "../../utils/leafletIcons";
import { formatCapacitySummary } from "../../utils/adjusters";
import type { FieldAdjuster } from "../../types";

interface AdjusterPinProps {
  adjuster: FieldAdjuster;
  coordinates: MapCoordinates;
}

export default function AdjusterPin({
  adjuster,
  coordinates,
}: AdjusterPinProps) {
  return (
    <Marker
      key={`adjuster-${adjuster.id}`}
      position={[coordinates.latitude, coordinates.longitude]}
      icon={adjusterIcon(adjuster)}
    >
      <Popup>
        <div className="space-y-1.5">
          <p className="text-sm font-semibold text-text">
            {adjuster.name}{" "}
            <span className="font-normal text-text-muted">
              ({adjuster.employeeCode})
            </span>
          </p>
          <div className="flex items-center gap-1.5">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: adjusterPinColor(adjuster) }}
            />
            <span className="text-xs text-text-muted">
              {adjuster.availability === "UNAVAILABLE"
                ? "Busy"
                : "Available"}
            </span>
          </div>
          {typeof adjuster.capacityLimit === "number" && (
            <p className="text-xs text-text-muted">
              {formatCapacitySummary(adjuster)} active claims
            </p>
          )}
          {typeof adjuster.distanceKm === "number" && (
            <p className="text-xs text-primary font-medium">
              {adjuster.distanceKm.toFixed(2)} km away
            </p>
          )}
        </div>
      </Popup>
    </Marker>
  );
}