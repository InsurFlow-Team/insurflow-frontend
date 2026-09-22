import { RefreshCw, Search } from "lucide-react";
import Button from "../ui/Button";
import {
  DATE_RANGE_OPTIONS,
  SORT_OPTIONS,
  STATUS_OPTIONS,
  type DateRangeFilter,
  type SortOption,
} from "./filterOptions";
import type { ClaimStatus } from "../../types";

interface ClaimsFiltersProps {
  search: string;
  statusFilter: "" | ClaimStatus;
  dateRange: DateRangeFilter;
  sortBy: SortOption;
  totalFiltered: number;
  totalClaims: number;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: "" | ClaimStatus) => void;
  onDateRangeChange: (value: DateRangeFilter) => void;
  onSortChange: (value: SortOption) => void;
  onRefresh: () => void;
  onReset: () => void;
}

export default function ClaimsFilters({
  search,
  statusFilter,
  dateRange,
  sortBy,
  totalFiltered,
  totalClaims,
  onSearchChange,
  onStatusChange,
  onDateRangeChange,
  onSortChange,
  onRefresh,
  onReset,
}: ClaimsFiltersProps) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div className="grid flex-1 gap-3 md:grid-cols-[1fr_200px_200px_200px_auto] min-w-[320px]">
          <label className="relative block">
            <span className="sr-only">Search claims</span>
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
            />
            <input
              type="search"
              aria-label="Search claims"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Filter by Claim ID or Customer..."
              className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-4 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </label>

          <select
            aria-label="Filter by status"
            value={statusFilter}
            onChange={(event) =>
              onStatusChange(event.target.value as "" | ClaimStatus)
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
            aria-label="Filter by date range"
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

          <select
            aria-label="Sort claims"
            value={sortBy}
            onChange={(event) =>
              onSortChange(event.target.value as SortOption)
            }
            className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <Button
            variant="secondary"
            icon={<RefreshCw size={15} />}
            onClick={onRefresh}
          >
            Refresh
          </Button>

          <Button
            variant="secondary"
            onClick={onReset}
          >
            Reset Filters
          </Button>
        </div>

        <span className="text-sm text-text-muted whitespace-nowrap">
          Showing {totalFiltered} of {totalClaims} claims
        </span>
      </div>
    </div>
  );
}