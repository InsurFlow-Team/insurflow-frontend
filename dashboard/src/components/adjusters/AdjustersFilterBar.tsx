import { Search, RefreshCw } from "lucide-react";
import Button from "../ui/Button";
import type { Availability, UserStatus } from "../../types";
import {
  AVAILABILITY_OPTIONS,
  STATUS_OPTIONS,
  SORT_OPTIONS,
  type AdjusterSortValue,
} from "../../utils/adjusters";

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
  return (
    <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div className="grid flex-1 gap-3 md:grid-cols-[1fr_170px_150px_200px_auto] min-w-[320px]">
          <label className="relative block">
            <span className="sr-only">Search adjusters</span>
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
            />
            <input
              type="search"
              aria-label="Search adjusters"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search by name or employee code"
              className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-4 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </label>

          <select
            aria-label="Filter by availability"
            value={availabilityFilter}
            onChange={(event) =>
              onAvailabilityChange(event.target.value as Availability | "")
            }
            className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            <option value="">All Availability</option>
            {AVAILABILITY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter by status"
            value={statusFilter}
            onChange={(event) =>
              onStatusChange(event.target.value as UserStatus | "")
            }
            className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            aria-label="Sort adjusters"
            value={sort}
            onChange={(event) =>
              onSortChange(event.target.value as AdjusterSortValue)
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
            onClick={onReset}
          >
            Reset Filters
          </Button>
        </div>

        <span className="text-sm text-text-muted whitespace-nowrap">
          Showing {filteredCount} of {totalCount} Adjusters
        </span>
      </div>
    </div>
  );
}