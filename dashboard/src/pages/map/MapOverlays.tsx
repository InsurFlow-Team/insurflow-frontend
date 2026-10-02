import { MapPin, Users } from "lucide-react";
import type { MapLegendItem } from "../../utils/map";

interface MapOverlaysProps {
  loading: boolean;
  hasPins: boolean;
  claimLegendItems: MapLegendItem[];
  adjusterLegendItems: MapLegendItem[];
}

export default function MapOverlays({
  loading,
  hasPins,
  claimLegendItems,
  adjusterLegendItems,
}: MapOverlaysProps) {
  return (
    <>
      {!loading && !hasPins && (
        <div className="pointer-events-none absolute inset-0 z-[500] flex items-center justify-center p-6">
          <div className="rounded-xl border border-border bg-surface/95 p-5 text-center shadow-sm max-w-sm">
            <MapPin size={22} className="mx-auto text-text-muted" />
            <p className="mt-2 text-sm font-semibold text-text">
              No location data yet
            </p>
            <p className="mt-1 text-xs text-text-muted">
              Claims and adjusters will appear here as soon as location data is
              available.
            </p>
          </div>
        </div>
      )}

      {hasPins &&
        (claimLegendItems.length > 0 || adjusterLegendItems.length > 0) && (
          <div
            data-testid="map-legend"
            className="absolute bottom-3 left-3 z-[500] rounded-lg border border-border bg-surface/95 p-3 shadow-sm space-y-2"
          >
            {claimLegendItems.length > 0 && (
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">
                  Claims
                </p>
                <div className="mt-1 space-y-1">
                  {claimLegendItems.map((item) => (
                    <span
                      key={item.key}
                      className="flex items-center gap-1.5 text-[11px] text-text"
                    >
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      {item.label}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {adjusterLegendItems.length > 0 && (
              <div>
                <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-text-muted">
                  <Users size={11} /> Adjusters
                </p>
                <div className="mt-1 space-y-1">
                  {adjusterLegendItems.map((item) => (
                    <span
                      key={item.key}
                      className="flex items-center gap-1.5 text-[11px] text-text"
                    >
                      <span
                        className="h-2 w-2 rounded-[2px]"
                        style={{ backgroundColor: item.color }}
                      />
                      {item.label}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
    </>
  );
}