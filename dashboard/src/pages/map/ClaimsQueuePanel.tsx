import { MapPin, AlertTriangle } from "lucide-react";
import { claimCoordinates } from "../../utils/map";
import { useTranslation } from "../../i18n/context";
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
  const { t } = useTranslation();

  return (
    <div className="rounded-xl border border-border bg-surface shadow-sm overflow-hidden flex flex-col max-h-[340px]">
      <div className="p-3.5 border-b border-border bg-surface-soft flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-text text-sm">
            {t("map.queueTitle")} ({claims.length})
          </h2>
          <p className="text-xs text-text-muted">{t("map.queueSubtitle")}</p>
        </div>
      </div>

      <div className="overflow-y-auto divide-y divide-border flex-1">
        {claims.length === 0 ? (
          <div className="p-6 text-center">
            <MapPin size={22} className="mx-auto text-text-muted mb-2" />
            <p className="text-xs font-medium text-text-muted">
              {t("map.queueEmpty")}
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
                  w-full text-start p-3.5 transition-colors flex items-start justify-between gap-2
                  ${isSelected ? "bg-primary-light border-s-4 border-s-primary" : "hover:bg-surface-soft"}
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
                    {claim.initialPlateNumber || t("map.noPlate")}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  {claim.lastDecline && (
                    <span className="inline-flex items-center gap-1 text-[10px] bg-danger-bg text-danger border border-danger/30 px-1.5 py-0.5 rounded font-bold shrink-0">
                      <AlertTriangle size={10} />
                      {t("map.declined")}
                    </span>
                  )}
                  {!coords ? (
                    <span className="text-[10px] bg-warning-bg text-warning-text border border-warning-border px-1.5 py-0.5 rounded font-medium shrink-0">
                      {t("map.noGps")}
                    </span>
                  ) : (
                    <span className="text-[10px] bg-success-bg text-success-text border border-success-border px-1.5 py-0.5 rounded font-medium shrink-0">
                      {t("map.located")}
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
