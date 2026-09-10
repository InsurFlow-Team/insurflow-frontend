import { Search, RefreshCw } from "lucide-react";
import Button from "../ui/Button";
import { ROLE_OPTIONS, STATUS_OPTIONS } from "../../utils/user";
import type { Role, UserStatus } from "../../types";

interface UserFilterBarProps {
  search: string;
  roleFilter: Role | "";
  statusFilter: UserStatus | "";
  filteredCount: number;
  totalCount: number;
  onSearchChange: (value: string) => void;
  onRoleChange: (value: Role | "") => void;
  onStatusChange: (value: UserStatus | "") => void;
  onReset: () => void;
}

export default function UserFilterBar({
  search,
  roleFilter,
  statusFilter,
  filteredCount,
  totalCount,
  onSearchChange,
  onRoleChange,
  onStatusChange,
  onReset,
}: UserFilterBarProps) {
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
              placeholder="Search by user name or employee code"
              className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-4 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </label>

          <select
            value={roleFilter}
            onChange={(event) => onRoleChange(event.target.value as Role | "")}
            className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            <option value="">All Roles</option>
            {ROLE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
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

          <Button variant="secondary" icon={<RefreshCw size={15} />} onClick={onReset}>
            Reset Filters
          </Button>
        </div>

        <span className="text-sm text-text-muted whitespace-nowrap">
          Showing {filteredCount} of {totalCount} Users
        </span>
      </div>
    </div>
  );
}