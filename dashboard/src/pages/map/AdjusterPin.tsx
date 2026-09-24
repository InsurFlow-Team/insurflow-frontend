import { Marker, Popup } from "react-leaflet";
import { adjusterPinColor } from "../../utils/map";
import type { MapCoordinates } from "../../utils/map";
import { adjusterIcon } from "../../utils/leafletIcons";
import { formatCapacitySummary } from "../../utils/adjusters";
import type { FieldAdjuster } from "../../types";

interface AdjusterPinProps {
  adjuster: FieldAdjuster;
  coordinates: MapCoordinates;
  // Provided when the dispatcher can assign and a NEW claim is selected;
  // clicking "اختيار المعاين" opens the assignment modal with THIS adjuster
  // preselected (same backend id as the map marker).
  onSelectAdjuster?: (adjuster: FieldAdjuster) => void;
}

function formatLastUpdated(capturedAt: string | null | undefined): string | null {
  if (!capturedAt) return null;

  const date = new Date(capturedAt);
  if (Number.isNaN(date.getTime())) return null;

  return date.toLocaleString();
}

export default function AdjusterPin({
  adjuster,
  coordinates,
  onSelectAdjuster,
}: AdjusterPinProps) {
  const lastUpdated = formatLastUpdated(adjuster.location?.capturedAt);

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
              Active Tasks: {formatCapacitySummary(adjuster)}
            </p>
          )}
          {typeof adjuster.distanceKm === "number" && (
            <p className="text-xs text-primary font-medium">
              {adjuster.distanceKm.toFixed(2)} km away
            </p>
          )}
          {lastUpdated && (
            <p className="text-[11px] text-text-muted">
              Last location update: {lastUpdated}
            </p>
          )}
          {onSelectAdjuster && (
            <button
              type="button"
              onClick={() => onSelectAdjuster(adjuster)}
              className="mt-2 block w-full rounded-lg border border-primary/30 bg-primary/5 px-2 py-1.5 text-xs font-semibold text-primary hover:bg-primary/10 transition-colors"
            >
              اختيار المعاين (Select Adjuster)
            </button>
          )}
        </div>
      </Popup>
    </Marker>
  );
}