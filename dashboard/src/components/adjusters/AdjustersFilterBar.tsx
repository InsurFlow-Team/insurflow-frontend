import { Search, RefreshCw } from "lucide-react";
import Button from "../ui/Button";
import type { Availability, UserStatus } from "../../types";
import {
  AVAILABILITY_OPTIONS,
  STATUS_OPTIONS,
  SORT_OPTIONS,
  type AdjusterSortValue,
} from "../../utils/adjusters";
import { useTranslation } from "../../i18n/context";
import type { MessageKey } from "../../i18n";

const SORT_LABEL_KEYS: Record<AdjusterSortValue, MessageKey> = {
  "workload-desc": "adjusters.sort.workloadDesc",
  "workload-asc": "adjusters.sort.workloadAsc",
  "name-asc": "adjusters.sort.nameAsc",
};

interface AdjustersFilterBarProps {
  search: string;
  availabilityFilter: Availability | "";
  statusFilter: UserStatus | "";
  sort: AdjusterSortValue;
  filteredCount: number;
  totalCount: number;
  onSearchChange: (value: string) => void;
  onAvailabilityChange: (value: Availability | "") => void;
  onStatusChange: (value: UserStatus | "") => void;
  onSortChange: (value: AdjusterSortValue) => void;
  onReset: () => void;
}

export default function AdjustersFilterBar({
  search,
  availabilityFilter,
  statusFilter,
  sort,
  filteredCount,
  totalCount,
  onSearchChange,
  onAvailabilityChange,
  onStatusChange,
  onSortChange,
  onReset,
}: AdjustersFilterBarProps) {
  const { t } = useTranslation();

  return (
    <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div className="grid flex-1 gap-3 md:grid-cols-[1fr_170px_150px_200px_auto] min-w-[320px]">
          <label className="relative block">
            <span className="sr-only">{t("adjusters.filter.searchAria")}</span>
            <Search
              size={16}
              className="absolute start-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
            />
            <input
              type="search"
              aria-label={t("adjusters.filter.searchAria")}
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder={t("adjusters.filter.searchPlaceholder")}
              className="w-full rounded-lg border border-border bg-background py-2.5 ps-10 pe-4 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </label>

          <select
            aria-label={t("adjusters.filter.availabilityAria")}
            value={availabilityFilter}
            onChange={(event) =>
              onAvailabilityChange(event.target.value as Availability | "")
            }
            className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            <option value="">{t("adjusters.filter.allAvailability")}</option>
            {AVAILABILITY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.value === "AVAILABLE"
                  ? t("adjusters.availability.available")
                  : t("adjusters.availability.busy")}
              </option>
            ))}
          </select>

          <select
            aria-label={t("adjusters.filter.statusAria")}
            value={statusFilter}
            onChange={(event) =>
              onStatusChange(event.target.value as UserStatus | "")
            }
            className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            <option value="">{t("adjusters.filter.allStatuses")}</option>
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.value === "ACTIVE"
                  ? t("adjusters.status.active")
                  : t("adjusters.status.inactive")}
              </option>
            ))}
          </select>

          <select
            aria-label={t("adjusters.filter.sortAria")}
            value={sort}
            onChange={(event) =>
              onSortChange(event.target.value as AdjusterSortValue)
            }
            className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {t(SORT_LABEL_KEYS[option.value])}
              </option>
            ))}
          </select>

          <Button
            variant="secondary"
            icon={<RefreshCw size={15} />}
            onClick={onReset}
          >
            {t("adjusters.filter.reset")}
          </Button>
        </div>

        <span className="text-sm text-text-muted whitespace-nowrap">
          {t("adjusters.filter.showing", {
            filtered: filteredCount,
            total: totalCount,
          })}
        </span>
      </div>
    </div>
  );
}