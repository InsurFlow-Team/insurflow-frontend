import { Search, RefreshCw } from "lucide-react";
import Button from "../ui/Button";
import {
  STATUS_OPTIONS,
  DATE_RANGE_OPTIONS,
} from "../../utils/claims";
import type {
  ClaimStatusFilter,
  DateRangeFilter,
} from "../../utils/claims";

interface ClaimsFilterBarProps {
  search: string;
  statusFilter: ClaimStatusFilter;
  dateRange: DateRangeFilter;
  filteredCount: number;
  totalCount: number;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: ClaimStatusFilter) => void;
  onDateRangeChange: (value: DateRangeFilter) => void;
  onResetFilters: () => void;
}

export default function ClaimsFilterBar({
  search,
  statusFilter,
  dateRange,
  filteredCount,
  totalCount,
  onSearchChange,
  onStatusChange,
  onDateRangeChange,
  onResetFilters,
}: ClaimsFilterBarProps) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div className="grid flex-1 gap-3 md:grid-cols-[1fr_200px_200px_auto] min-w-[320px]">
          <label className="relative block">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
            />
            <input
              type="search"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Filter by Claim ID or Customer..."
              className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-4 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </label>

          <select
            value={statusFilter}
            onChange={(event) =>
              onStatusChange(event.target.value as ClaimStatusFilter)
            }
            className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.label} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            value={dateRange}
            onChange={(event) =>
              onDateRangeChange(event.target.value as DateRangeFilter)
            }
            className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            {DATE_RANGE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <Button
            variant="secondary"
            icon={<RefreshCw size={15} />}
            onClick={onResetFilters}
          >
            Reset Filters
          </Button>
        </div>

        <span className="text-sm text-text-muted whitespace-nowrap">
          Showing {filteredCount} of {totalCount} claims
        </span>
      </div>
    </div>
  );
}