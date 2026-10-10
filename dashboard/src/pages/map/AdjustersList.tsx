import { Users } from "lucide-react";
import { formatCapacitySummary } from "../../utils/adjusters";
import { useTranslation } from "../../i18n/context";
import type { FieldAdjuster } from "../../types";

interface AdjustersListProps {
  adjusters: FieldAdjuster[];
  loading: boolean;
  // DEMO mode: distances/ordering come from simulated data.
  demo?: boolean;
}

function AdjusterRow({
  adjuster,
  demo,
}: {
  adjuster: FieldAdjuster;
  demo?: boolean;
}) {
  const { t } = useTranslation();
  const busy = adjuster.availability === "UNAVAILABLE";

  return (
    <div className="p-2.5 rounded-lg border border-border bg-background text-xs space-y-1">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-text">
          {adjuster.name} ({adjuster.employeeCode})
        </span>
        <span
          className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
            busy
              ? "bg-danger-bg text-danger border border-danger/20"
              : "bg-success-bg text-success-text border border-success-border"
          }`}
        >
          {busy ? t("map.busy") : t("map.available")}
        </span>
      </div>

      <div className="flex items-center justify-between text-text-muted text-[11px]">
        <span>
          {t("map.tasks")}: {formatCapacitySummary(adjuster) ?? "0"}
        </span>
        {typeof adjuster.distanceKm === "number" ? (
          <span className={`font-medium ${adjuster.locationStale ? "text-warning" : "text-primary"}`}>
            {adjuster.distanceKm.toFixed(2)} km
            {adjuster.locationStale ? ` · ${t("map.staleLocation")}` : ""}
            {demo ? " · DEMO" : ""}
          </span>
        ) : (
          <span className="text-text-muted">{t("map.noLocation")}</span>
        )}
      </div>
    </div>
  );
}

export default function AdjustersList({
  adjusters,
  loading,
  demo,
}: AdjustersListProps) {
  const { t } = useTranslation();

  // Nearest first where a distance exists (real or DEMO); adjusters without a
  // distance are kept after them, in their original order.
  const sortedAdjusters = [...adjusters].sort((a, b) => {
    const distanceA = typeof a.distanceKm === "number" ? a.distanceKm : Infinity;
    const distanceB = typeof b.distanceKm === "number" ? b.distanceKm : Infinity;
    return distanceA - distanceB;
  });

  return (
    <div className="pt-2 border-t border-border">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold text-text flex items-center gap-1">
          <Users size={14} className="text-primary" />
          {`${t("map.adjustersTitle")} (${adjusters.length})`}
        </p>
        {loading ? (
          <span className="text-[10px] text-text-muted animate-pulse">
            {t("map.sortingByProximity")}
          </span>
        ) : demo ? (
          <span className="rounded border border-warning-border bg-accent-light px-1.5 py-0.5 text-[10px] font-bold text-warning-deep">
            DEMO
          </span>
        ) : null}
      </div>

      <div className="max-h-48 overflow-y-auto space-y-2 pe-1">
        {sortedAdjusters.length === 0 ? (
          <p className="text-xs text-text-muted italic">
            {t("map.noAdjusters")}
          </p>
        ) : (
          sortedAdjusters.map((adj) => (
            <AdjusterRow key={adj.id} adjuster={adj} demo={demo} />
          ))
        )}
      </div>
    </div>
  );
}