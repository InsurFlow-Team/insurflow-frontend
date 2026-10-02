import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import type { FieldAdjuster } from "../types";
import { useFieldAdjusters } from "../hooks/useFieldAdjusters";
import { useDashboardStats } from "../hooks/useDashboardStats";
import { useAdjustersDirectory } from "../hooks/useAdjustersDirectory";
import AdjustersHeader from "../components/adjusters/AdjustersHeader";
import AutoRefreshToggle from "../components/adjusters/AutoRefreshToggle";
import AdjustersStats from "../components/adjusters/AdjustersStats";
import AdjustersFilterBar from "../components/adjusters/AdjustersFilterBar";
import AdjustersTable from "../components/adjusters/AdjustersTable";
import { buildAdjusterColumns } from "../components/adjusters/adjustersColumns";
import type { Column } from "../components/ui/DataTable";

export default function AdjustersDirectory() {
  const navigate = useNavigate();

  const {
    adjusters,
    loading,
    error,
    reload,
    pollingPaused,
    setPollingPaused,
  } = useFieldAdjusters();

  const { claims } = useDashboardStats();

  const pendingClaims = useMemo(
    () => claims.filter((claim) => claim.status === "NEW").length,
    [claims],
  );

  const directory = useAdjustersDirectory({ adjusters, pendingClaims });

  const columns = useMemo<Column<FieldAdjuster>[]>(
    () =>
      buildAdjusterColumns({
        onView: (adjuster) => navigate(`/adjusters/${adjuster.id}`),
      }),
    [navigate],
  );

  return (
    <div className="space-y-6">
      <AdjustersHeader pollingPaused={pollingPaused} />

      <div className="flex items-center justify-end">
        <AutoRefreshToggle
          pollingPaused={pollingPaused}
          onToggle={() => setPollingPaused((value) => !value)}
        />
      </div>

      <AdjustersStats stats={directory.stats} />

      <AdjustersFilterBar
        search={directory.search}
        availabilityFilter={directory.availabilityFilter}
        statusFilter={directory.statusFilter}
        sort={directory.sort}
        filteredCount={directory.filtered.length}
        totalCount={adjusters.length}
        onSearchChange={directory.setSearch}
        onAvailabilityChange={directory.setAvailabilityFilter}
        onStatusChange={directory.setStatusFilter}
        onSortChange={directory.setSort}
        onReset={directory.reset}
      />

      <AdjustersTable
        columns={columns}
        adjusters={directory.paged}
        loading={loading && adjusters.length === 0}
        error={error && adjusters.length === 0 ? error : undefined}
        onRetry={() => void reload()}
        emptyMessage={
          directory.hasActiveFilters
            ? "No adjusters match the current filters."
            : "No field adjusters available."
        }
        rowsPerPage={directory.rowsPerPage}
        currentPage={directory.currentPage}
        totalPages={directory.totalPages}
        onPageChange={directory.setPage}
        onRowsPerPageChange={directory.setRowsPerPage}
      />
    </div>
  );
}