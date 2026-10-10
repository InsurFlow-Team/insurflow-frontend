import {
  getWorkloadPercent,
  getWorkloadTier,
  WORKLOAD_TIER_META,
} from "../../utils/adjusters";
import { useTranslation } from "../../i18n/context";

export default function ActiveTasksCell({
  activeTasksCount,
  capacityLimit,
}: {
  activeTasksCount: number;
  capacityLimit: number | null | undefined;
}) {
  const { t } = useTranslation();

  if (capacityLimit === null || capacityLimit === undefined) {
    return (
      <span className="text-sm font-medium text-text">{activeTasksCount}</span>
    );
  }

  const tier = getWorkloadTier(activeTasksCount, capacityLimit);
  const meta = WORKLOAD_TIER_META[tier];
  const workloadLabel = t(
    tier === "OK"
      ? "adjusters.workload.healthy"
      : tier === "HIGH"
        ? "adjusters.workload.nearCapacity"
        : "adjusters.workload.full",
  );
  const percent = getWorkloadPercent(activeTasksCount, capacityLimit);

  return (
    <div className="min-w-[150px]">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-text">
          {activeTasksCount}
          <span className="text-text-muted"> / {capacityLimit}</span>
        </span>
        {tier !== "OK" && (
          <span
            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${meta.chipClass}`}
          >
            {workloadLabel}
          </span>
        )}
      </div>
      <div
        className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-surface-sunken"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={t("adjusters.workload.ariaLabel")}
      >
        <div
          className={`h-full rounded-full ${meta.barClass}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}