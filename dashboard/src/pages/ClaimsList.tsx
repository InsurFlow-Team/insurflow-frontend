import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getClaims } from "../api/claims.service";
import { getApiErrorMessage } from "../api/client";
import type { ClaimStatus, ClaimSummary } from "../types";
import { useAuth } from "../contexts/AuthContext";
import { useClaimIntake } from "../hooks/useClaimIntake";
import LoadingState from "../components/ui/LoadingState";
import ErrorState from "../components/ui/ErrorState";
import DataTable from "../components/ui/DataTable";
import Pagination from "../components/ui/Pagination";
import AddClaimModal from "../components/ui/AddClaimModal";
import PolicyVerificationModal from "../components/ui/PolicyVerificationModal";
import { buildClaimColumns } from "../components/claims/claimsColumns";
import { ALL_CLAIM_STATUSES } from "../utils/claims";
import ClaimsBanners from "../components/claims/ClaimsBanners";
import ClaimsFilters from "../components/claims/ClaimsFilters";
import ClaimsPageHeader from "../components/claims/ClaimsPageHeader";
import ClaimStatsGrid from "../components/claims/ClaimStatsGrid";
import {
  getDateCutoff,
  ROWS_PER_PAGE_OPTIONS,
  type DateRangeFilter,
} from "../components/claims/filterOptions";

/**
 * The dashboard attention queue and the capacity card deep-link into
 * /claims?status=<STATUS>, so the list has to honour the query string instead
 * of silently ignoring it. An unknown value falls back to "no filter" rather
 * than showing an empty table.
 */
function readStatusParam(value: string | null): "" | ClaimStatus {
  return value && ALL_CLAIM_STATUSES.includes(value as ClaimStatus)
    ? (value as ClaimStatus)
    : "";
}

export default function ClaimsList() {
  const { user } = useAuth();
  const canAssign =
    user?.role === "ADMIN" || user?.role === "CLAIMS_OFFICER";
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [claims, setClaims] = useState<ClaimSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [errorBanner, setErrorBanner] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | ClaimStatus>(() =>
    readStatusParam(searchParams.get("status")),
  );
  const [dateRange, setDateRange] = useState<DateRangeFilter>("all");

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  const claimsRef = useRef<ClaimSummary[]>([]);

  const intake = useClaimIntake({
    onCreated: () => void loadClaims(),
  });

  const loadClaims = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getClaims();
      claimsRef.current = data;
      setClaims(data);
    } catch (requestError) {
      const message = getApiErrorMessage(requestError);
      // A failed first load → full-page error; a failed refetch → banner so
      // the already-rendered data stays visible.
      if (claimsRef.current.length > 0) {
        setErrorBanner(message);
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadClaims();
  }, [loadClaims]);

  // Keep ?status= in the URL so a dashboard drill-down survives a refresh and
  // can be shared/bookmarked. Back/forward navigation also re-applies the filter.
  useEffect(() => {
    const fromUrl = readStatusParam(searchParams.get("status"));
    setStatusFilter(fromUrl);
  }, [searchParams]);

  const applyStatusFilter = useCallback(
    (value: "" | ClaimStatus) => {
      setStatusFilter(value);
      setPage(1);

      const next = new URLSearchParams(searchParams);
      if (value) {
        next.set("status", value);
      } else {
        next.delete("status");
      }
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  // Assigning happens on the Dispatch Map (same-backed dataset, nearest adjuster
  // + distances there) — deep-link the claim so it is selected and the assign
  // modal opens immediately.
  function openAssign(claim: ClaimSummary) {
    navigate(`/map?claim=${encodeURIComponent(claim.id)}`);
  }

  const columns = buildClaimColumns({ canAssign, onAssign: openAssign });

  const filteredClaims = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const dateCutoff = getDateCutoff(dateRange);

    return claims.filter((claim) => {
      const matchesSearch =
        !normalizedSearch ||
        claim.claimNumber.toLowerCase().includes(normalizedSearch) ||
        claim.customerName.toLowerCase().includes(normalizedSearch);

      const matchesStatus = !statusFilter || claim.status === statusFilter;

      const matchesDate =
        !dateCutoff || new Date(claim.createdAt) >= dateCutoff;

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [claims, search, statusFilter, dateRange]);

  const totalPages = Math.max(1, Math.ceil(filteredClaims.length / rowsPerPage));
  const currentPage = Math.min(page, totalPages);

  const pagedClaims = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredClaims.slice(start, start + rowsPerPage);
  }, [filteredClaims, currentPage, rowsPerPage]);

  const handleResetFilters = () => {
    setSearch("");
    setDateRange("all");
    setPage(1);
    applyStatusFilter("");
  };

  const tableFooter = (
    <Pagination
      currentPage={currentPage}
      totalPages={totalPages}
      rowsPerPage={rowsPerPage}
      rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
      onPageChange={setPage}
      onRowsPerPageChange={(rows) => {
        setRowsPerPage(rows);
        setPage(1);
      }}
    />
  );

  if (loading && claims.length === 0) {
    return <LoadingState message="Loading claims..." />;
  }

  if (error && claims.length === 0) {
    return <ErrorState message={error} onRetry={() => void loadClaims()} />;
  }

  return (
    <div className="space-y-6">
      <ClaimsBanners error={errorBanner} />

      <ClaimsPageHeader
        organizationName={user?.organizationName}
        onAddClaim={() => {
          setErrorBanner("");
          intake.openPolicyVerification();
        }}
      />

      <ClaimStatsGrid claims={claims} loading={loading} />

      <ClaimsFilters
        search={search}
        statusFilter={statusFilter}
        dateRange={dateRange}
        totalFiltered={filteredClaims.length}
        totalClaims={claims.length}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        onStatusChange={(value) => {
          applyStatusFilter(value);
        }}
        onDateRangeChange={(value) => {
          setDateRange(value);
          setPage(1);
        }}
        onReset={handleResetFilters}
      />

      <DataTable
        columns={columns}
        data={pagedClaims}
        emptyMessage="No claims found."
        keyExtractor={(claim) => claim.id}
        footer={tableFooter}
      />

      <PolicyVerificationModal
        isOpen={intake.isPolicyVerificationOpen}
        onClose={intake.closeVerification}
        onVerified={intake.handlePolicyVerified}
      />

      <AddClaimModal
        isOpen={intake.isCreateModalOpen}
        onClose={intake.closeCreate}
        onSubmit={intake.handleCreate}
        verifiedPolicy={intake.verifiedPolicy}
      />
    </div>
  );
}