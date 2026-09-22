import { MapPin } from "lucide-react";
import { claimCoordinates } from "../../utils/map";
import type { ClaimSummary } from "../../types";

interface ClaimsQueuePanelProps {
  claims: ClaimSummary[];
  selectedId?: string;
  onSelect: (claim: ClaimSummary) => void;
}

export default function ClaimsQueuePanel({
  claims,
  selectedId,
  onSelect,
}: ClaimsQueuePanelProps) {
  return (
    <div className="rounded-xl border border-border bg-surface shadow-sm overflow-hidden flex flex-col max-h-[340px]">
      <div className="p-3.5 border-b border-border bg-surface-soft flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-text text-sm">
            NEW Claims Queue ({claims.length})
          </h2>
          <p className="text-xs text-text-muted">
            Select a claim to begin dispatch
          </p>
        </div>
      </div>

      <div className="overflow-y-auto divide-y divide-border flex-1">
        {claims.length === 0 ? (
          <div className="p-6 text-center">
            <MapPin size={22} className="mx-auto text-text-muted mb-2" />
            <p className="text-xs font-medium text-text-muted">
              No NEW claims awaiting dispatch
            </p>
          </div>
        ) : (
          claims.map((claim) => {
            const coords = claimCoordinates(claim);
            const isSelected = selectedId === claim.id;

            return (
              <button
                key={claim.id}
                type="button"
                onClick={() => onSelect(claim)}
                className={`
                  w-full text-left p-3.5 transition-colors flex items-start justify-between gap-2
                  ${isSelected ? "bg-primary-light border-l-4 border-l-primary" : "hover:bg-surface-soft"}
                `}
              >
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-text truncate">
                    {claim.claimNumber}
                  </p>
                  <p className="text-xs text-text-muted truncate">
                    {claim.customerName}
                  </p>
                  <p className="text-xs text-text-muted">
                    {claim.initialPlateNumber || "No plate"}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  {claim.lastDecline && (
                    <span className="text-[10px] bg-red-50 text-danger border border-danger/30 px-1.5 py-0.5 rounded font-bold shrink-0">
                      ⚠️ Declined
                    </span>
                  )}
                  {!coords ? (
                    <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded font-medium shrink-0">
                      No GPS
                    </span>
                  ) : (
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded font-medium shrink-0">
                      Located
                    </span>
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}