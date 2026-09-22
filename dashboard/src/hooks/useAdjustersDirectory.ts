import { useEffect, useMemo, useState } from "react";
import type { Availability, FieldAdjuster, UserStatus } from "../types";
import type { AdjusterSortValue } from "../utils/adjusters";

const DEFAULT_ROWS_PER_PAGE = 10;

interface UseAdjustersDirectoryOptions {
  adjusters: FieldAdjuster[];
  pendingClaims?: number;
}

export function useAdjustersDirectory({
  adjusters,
  pendingClaims = 0,
}: UseAdjustersDirectoryOptions) {
  const [search, setSearch] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState<
    Availability | ""
  >("");
  const [statusFilter, setStatusFilter] = useState<UserStatus | "">("");
  const [sort, setSort] = useState<AdjusterSortValue>("workload-desc");
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_ROWS_PER_PAGE);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [search, availabilityFilter, statusFilter, sort]);

  const stats = useMemo(
    () => ({
      total: adjusters.length,
      available: adjusters.filter(
        (adj) => adj.availability === "AVAILABLE" && adj.status === "ACTIVE",
      ).length,
      unavailableOrOffShift: adjusters.filter(
        (adj) =>
          (adj.availability === "UNAVAILABLE" && adj.status === "ACTIVE") ||
          adj.status === "INACTIVE",
      ).length,
      pendingClaims,
    }),
    [adjusters, pendingClaims],
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    const matches = adjusters.filter((adj) => {
      const matchesSearch =
        !query ||
        `${adj.name} ${adj.employeeCode}`.toLowerCase().includes(query);
      const matchesAvailability =
        !availabilityFilter || adj.availability === availabilityFilter;
      const matchesStatus = !statusFilter || adj.status === statusFilter;
      return matchesSearch && matchesAvailability && matchesStatus;
    });

    return [...matches].sort((a, b) => {
      if (sort === "name-asc") return a.name.localeCompare(b.name);
      return sort === "workload-asc"
        ? a.activeTasksCount - b.activeTasksCount
        : b.activeTasksCount - a.activeTasksCount;
    });
  }, [adjusters, search, availabilityFilter, statusFilter, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const currentPage = Math.min(page, totalPages);

  const paged = useMemo(
    () =>
      filtered.slice(
        (currentPage - 1) * rowsPerPage,
        (currentPage - 1) * rowsPerPage + rowsPerPage,
      ),
    [filtered, currentPage, rowsPerPage],
  );

  const hasActiveFilters =
    search.trim() !== "" ||
    availabilityFilter !== "" ||
    statusFilter !== "";

  function reset() {
    setSearch("");
    setAvailabilityFilter("");
    setStatusFilter("");
    setSort("workload-desc");
    setPage(1);
  }

  return {
    search,
    setSearch,
    availabilityFilter,
    setAvailabilityFilter,
    statusFilter,
    setStatusFilter,
    sort,
    setSort,
    rowsPerPage,
    setRowsPerPage,
    page,
    setPage,
    filtered,
    paged,
    totalPages,
    currentPage,
    stats,
    hasActiveFilters,
    reset,
  };
}