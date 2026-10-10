import { RefreshCw, Search, Timer } from "lucide-react";
import Button from "../ui/Button";
import {
  DATE_RANGE_OPTIONS,
  STATUS_OPTIONS,
  type DateRangeFilter,
} from "./filterOptions";
import { useTranslation } from "../../i18n/context";
import type { MessageKey } from "../../i18n/messages.en";
import type { ClaimStatus } from "../../types";

interface ClaimsFiltersProps {
  search: string;
  statusFilter: "" | ClaimStatus;
  dateRange: DateRangeFilter;
  /** True when ?sla=overdue is narrowing the list. */
  overdueOnly: boolean;
  totalFiltered: number;
  totalClaims: number;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: "" | ClaimStatus) => void;
  onDateRangeChange: (value: DateRangeFilter) => void;
  onOverdueToggle: (active: boolean) => void;
  onReset: () => void;
}

export default function ClaimsFilters({
  search,
  statusFilter,
  dateRange,
  overdueOnly,
  totalFiltered,
  totalClaims,
  onSearchChange,
  onStatusChange,
  onDateRangeChange,
  onOverdueToggle,
  onReset,
}: ClaimsFiltersProps) {
  const { t } = useTranslation();

  const statusLabel = (value: "" | ClaimStatus): string =>
    value ? t(`claimStatus.${value}` as MessageKey) : t("claims.allStatuses");

  return (
    <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div className="grid flex-1 gap-3 md:grid-cols-[minmax(200px,1fr)_180px_170px_auto_auto] min-w-0">
          <label className="relative block">
            <span className="sr-only">{t("claims.searchAria")}</span>
            <Search
              size={16}
              className="absolute start-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
            />
            <input
              type="search"
              aria-label={t("claims.searchAria")}
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder={t("claims.searchPlaceholder")}
              className="w-full rounded-lg border border-border bg-background py-2.5 ps-10 pe-4 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </label>

          <select
            aria-label={t("claims.statusAria")}
            value={statusFilter}
            onChange={(event) =>
              onStatusChange(event.target.value as "" | ClaimStatus)
            }
            className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value || "all"} value={option.value}>
                {statusLabel(option.value)}
              </option>
            ))}
          </select>

          <select
            aria-label={t("claims.dateAria")}
            value={dateRange}
            onChange={(event) =>
              onDateRangeChange(event.target.value as DateRangeFilter)
            }
            className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            {DATE_RANGE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {t(`claims.date.${option.value}` as MessageKey)}
              </option>
            ))}
          </select>

          {/* The overdue drill-down from the Overview metric keeps its state
              in ?sla=overdue, so this chip mirrors the URL, not local state. */}
          <button
            type="button"
            aria-pressed={overdueOnly}
            onClick={() => onOverdueToggle(!overdueOnly)}
            className={`inline-flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors cursor-pointer ${
              overdueOnly
                ? "border-danger-border bg-danger-bg text-danger-text"
                : "border-border bg-background text-text-muted hover:text-text"
            }`}
          >
            <Timer size={15} />
            {t("claims.overdueOnly")}
          </button>

          <Button
            variant="secondary"
            icon={<RefreshCw size={15} />}
            onClick={onReset}
          >
            {t("claims.reset")}
          </Button>
        </div>

        <span className="text-sm text-text-muted whitespace-nowrap">
          {t("claims.showing", {
            filtered: totalFiltered,
            total: totalClaims,
          })}
        </span>
      </div>
    </div>
  );
}
