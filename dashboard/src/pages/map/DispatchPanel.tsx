import { UserCheck } from "lucide-react";
import { claimCoordinates } from "../../utils/map";
import type { ClaimSummary, FieldAdjuster } from "../../types";
import Button from "../../components/ui/Button";
import SelectedClaimHeader from "./SelectedClaimHeader";
import DeclineBanner from "./DeclineBanner";
import AdjustersList from "./AdjustersList";

interface DispatchPanelProps {
  claim: ClaimSummary;
  adjusters: FieldAdjuster[];
  adjustersLoading: boolean;
  canAssign: boolean;
  onAssign: (claim: ClaimSummary) => void;
  // The descriptive incident location text (GET /claims/:id). The list
  // endpoint has no such field, so the page fetches it on selection.
  incidentLocation?: string;
  detailsLoading?: boolean;
  // DEMO mode: distances/client-nearest come from simulated data.
  demo?: boolean;
}

export default function DispatchPanel({
  claim,
  adjusters,
  adjustersLoading,
  canAssign,
  onAssign,
  incidentLocation,
  detailsLoading,
  demo,
}: DispatchPanelProps) {
  const coords = claimCoordinates(claim);

  // Nearest adjuster by distance — real (backend) in normal mode, simulated
  // in DEMO mode. Only adjusters that actually carry a distance participate.
  const nearest =
    adjusters
      .filter((adjuster) => typeof adjuster.distanceKm === "number")
      .sort(
        (a, b) => (a.distanceKm as number) - (b.distanceKm as number),
      )[0] ?? null;

  return (
    <div className="rounded-xl border border-border bg-surface shadow-sm overflow-hidden flex flex-col">
      <SelectedClaimHeader claim={claim} />

      <div className="p-4 space-y-3">
        {claim.lastDecline && <DeclineBanner decline={claim.lastDecline} />}

        <div className="text-xs space-y-1 text-text">
          <p>
            <span className="text-text-muted">Customer:</span>{" "}
            <span className="font-medium">{claim.customerName}</span>
          </p>
          <p>
            <span className="text-text-muted">Vehicle Plate:</span>{" "}
            <span className="font-medium">
              {claim.initialPlateNumber || "N/A"}
            </span>
          </p>
          <p>
            <span className="text-text-muted">Incident Location:</span>{" "}
            {coords ? (
              <span className="font-medium text-emerald-600">📍 Pin on map</span>
            ) : (
              <span className="font-medium text-amber-600">
                ⚠ Incident coordinates unavailable
              </span>
            )}
          </p>

          {incidentLocation ? (
            <p className="text-xs text-text">
              <span className="text-text-muted">
                Reported location (موقع الحادث):
              </span>{" "}
              <span className="font-medium">{incidentLocation}</span>
            </p>
          ) : !coords && detailsLoading ? (
            <p className="text-[11px] text-text-muted animate-pulse">
              Loading incident details...
            </p>
          ) : null}
        </div>

        {nearest && (
          <div className="flex items-center justify-between gap-2 rounded-lg border border-primary/20 bg-primary/5 px-2.5 py-1.5">
            <p className="text-xs text-text">
              <span className="text-text-muted">
                Nearest Adjuster (أقرب معاين):
              </span>{" "}
              <span className="font-semibold text-primary">
                {nearest.name} ({nearest.employeeCode}) ·{" "}
                {Number(nearest.distanceKm).toFixed(2)} km
              </span>
            </p>
            {demo && (
              <span className="shrink-0 rounded border border-amber-200 bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800">
                DEMO
              </span>
            )}
          </div>
        )}

        <AdjustersList
          adjusters={adjusters}
          loading={adjustersLoading}
          demo={demo}
        />

        {canAssign && claim.status === "NEW" && (
          <Button
            variant="primary"
            className="w-full mt-2"
            icon={<UserCheck size={16} />}
            onClick={() => onAssign(claim)}
          >
            Assign Field Adjuster
          </Button>
        )}
      </div>
    </div>
  );
}