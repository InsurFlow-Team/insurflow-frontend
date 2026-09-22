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
}

export default function DispatchPanel({
  claim,
  adjusters,
  adjustersLoading,
  canAssign,
  onAssign,
}: DispatchPanelProps) {
  const coords = claimCoordinates(claim);

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
                ⚠ Location unavailable
              </span>
            )}
          </p>
        </div>

        <AdjustersList adjusters={adjusters} loading={adjustersLoading} />

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