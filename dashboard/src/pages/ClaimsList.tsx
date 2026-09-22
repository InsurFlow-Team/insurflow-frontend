import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { createClaim, getClaims, toCreateClaimRequest } from "../api/claims.service";
import { getApiErrorMessage } from "../api/client";
import type { ClaimStatus, ClaimSummary } from "../types";
import { useAuth } from "../contexts/AuthContext";
import LoadingState from "../components/ui/LoadingState";
import ErrorState from "../components/ui/ErrorState";
import DataTable from "../components/ui/DataTable";
import Pagination from "../components/ui/Pagination";
import AddClaimModal from "../components/ui/AddClaimModal";
import AssignClaimModal from "../components/ui/AssignClaimModal";
import PolicyVerificationModal from "../components/ui/PolicyVerificationModal";
import { buildClaimColumns } from "../components/claims/claimsColumns";
import ClaimsBanners from "../components/claims/ClaimsBanners";
import ClaimsFilters from "../components/claims/ClaimsFilters";
import ClaimsPageHeader from "../components/claims/ClaimsPageHeader";
import ClaimsStats, {
  type ClaimsStats as ClaimsStatsData,
} from "../components/claims/ClaimsStats";
import {
  getDateCutoff,
  type DateRangeFilter,
  type SortOption,
} from "../components/claims/filterOptions";
import type { NewClaimData } from "../components/claim-form/claimFormConstants";

const ROWS_PER_PAGE_OPTIONS = [10, 25, 50];

export default function ClaimsList() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();  
  const { user } = useAuth();
  const canAssign =
    user?.role === "ADMIN" || user?.role === "CLAIMS_OFFICER";

  const [claims, setClaims] = useState<ClaimSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isPolicyVerificationOpen, setIsPolicyVerificationOpen] =
    useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [assignTarget, setAssignTarget] = useState<ClaimSummary | null>(null);
  const [successBanner, setSuccessBanner] = useState("");
  const [errorBanner, setErrorBanner] = useState("");

    const [search, setSearch] = useState(
    () => searchParams.get("search") ?? "",
  );

  const [statusFilter, setStatusFilter] = useState<"" | ClaimStatus>(
    () => (searchParams.get("status") as "" | ClaimStatus) ?? "",
  );

  const [dateRange, setDateRange] = useState<DateRangeFilter>(
    () => (searchParams.get("date") as DateRangeFilter) ?? "all",
  );

  const [sortBy, setSortBy] = useState<SortOption>(
    () => (searchParams.get("sort") as SortOption) ?? "newest",
  );

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);
    useEffect(() => {
    const params = new URLSearchParams();

    if (search) params.set("search", search);
    if (statusFilter) params.set("status", statusFilter);
    if (dateRange !== "all") params.set("date", dateRange);
    if (sortBy !== "newest") params.set("sort", sortBy);

    setSearchParams(params, { replace: true });
  }, [
    search,
    statusFilter,
    dateRange,
    sortBy,
    setSearchParams,
  ]);

  const claimsRef = useRef<ClaimSummary[]>([]);

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

  // Auto-dismiss the success banner after a few seconds.
  useEffect(() => {
    if (!successBanner) return;
    const timerId = window.setTimeout(() => setSuccessBanner(""), 6000);
    return () => window.clearTimeout(timerId);
  }, [successBanner]);

  async function handleCreate(claimData: NewClaimData): Promise<ClaimSummary> {
    const created = await createClaim(toCreateClaimRequest(claimData));
    setSuccessBanner(`${created.claimNumber} created successfully`);
    await loadClaims();
    return created;
  }

  function openAssign(claim: ClaimSummary) {
    setAssignTarget(claim);
  }

  function closeAssign() {
    setAssignTarget(null);
  }

  // Claim intake is gated by policy verification: "Add Claim" opens the
  // verification step first, and the intake form is reachable only after a
  // successful check (PolicyVerificationModal → onContinue).
  function openPolicyVerification() {
    setSuccessBanner("");
    setErrorBanner("");
    setIsPolicyVerificationOpen(true);
  }

  function handlePolicyVerified() {
    setIsPolicyVerificationOpen(false);
    setIsCreateModalOpen(true);
  }

  async function handleAssigned() {
    setErrorBanner("");
    if (assignTarget) {
      setSuccessBanner(`${assignTarget.claimNumber} assigned successfully`);
    }
    await loadClaims();
    closeAssign();
  }

  const columns = buildClaimColumns({ canAssign, onAssign: openAssign });

  const stats: ClaimsStatsData = useMemo(() => {
    const newClaims = claims.filter((c) => c.status === "NEW").length;
    const awaitingReply = claims.filter(
      (c) => c.status === "PENDING_ACCEPTANCE",
    ).length;
    const submittedClaims = claims.filter((c) => c.status === "SUBMITTED")
      .length;
    const pendingReview = claims.filter((c) => c.status === "UNDER_REVIEW")
      .length;
    const inProgress = claims.filter((c) => c.status === "IN_PROGRESS").length;

    return {
      totalClaims: claims.length,
      newClaims,
      awaitingReply,
      submittedClaims,
      pendingReview,
      inProgress,
    };
  }, [claims]);

  const filteredClaims = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const dateCutoff = getDateCutoff(dateRange);

    return claims.filter((claim) => {
    const matchesSearch =
  !normalizedSearch ||
  claim.claimNumber.toLowerCase().includes(normalizedSearch) ||
  claim.customerName.toLowerCase().includes(normalizedSearch) ||
  claim.initialPlateNumber.toLowerCase().includes(normalizedSearch);

      const matchesStatus = !statusFilter || claim.status === statusFilter;

      const matchesDate =
        !dateCutoff || new Date(claim.createdAt) >= dateCutoff;

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [claims, search, statusFilter, dateRange]);

  const totalPages = Math.max(1, Math.ceil(filteredClaims.length / rowsPerPage));
  const sortedClaims = useMemo(() => {
  return [...filteredClaims].sort((first, second) => {
    switch (sortBy) {
      case "oldest":
        return (
          new Date(first.createdAt).getTime() -
          new Date(second.createdAt).getTime()
        );

      case "claim-asc":
        return first.claimNumber.localeCompare(second.claimNumber);

      case "customer-asc":
        return first.customerName.localeCompare(second.customerName);

      case "newest":
      default:
        return (
          new Date(second.createdAt).getTime() -
          new Date(first.createdAt).getTime()
        );
    }
  });
}, [filteredClaims, sortBy]);
  const currentPage = Math.min(page, totalPages);

  const pagedClaims = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return sortedClaims.slice(start, start + rowsPerPage);
  }, [sortedClaims, currentPage, rowsPerPage]);

  const handleResetFilters = () => {
    setSearch("");
    setStatusFilter("");
    setDateRange("all");
    setSortBy("newest");
    setPage(1);
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
      <ClaimsBanners success={successBanner} error={errorBanner} />

      <ClaimsPageHeader
        organizationName={user?.organizationName}
        onAddClaim={openPolicyVerification}
      />

      <ClaimsStats stats={stats} />

      <ClaimsFilters
        search={search}
        statusFilter={statusFilter}
        dateRange={dateRange}
        sortBy={sortBy}
        totalFiltered={filteredClaims.length}
        totalClaims={claims.length}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        onStatusChange={(value) => {
          setStatusFilter(value);
          setPage(1);
        }}
        onDateRangeChange={(value) => {
          setDateRange(value);
          setPage(1);
        }}
        onSortChange={(value) => {
          setSortBy(value);
          setPage(1);
        }}
        onRefresh={() => void loadClaims()}
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
        isOpen={isPolicyVerificationOpen}
        onClose={() => setIsPolicyVerificationOpen(false)}
        onContinue={handlePolicyVerified}
      />

      <AddClaimModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreate}
        onSuccess={(created) => navigate(`/claims/${created.id}`)}
      />

      {assignTarget && (
        <AssignClaimModal
          isOpen
          onClose={closeAssign}
          claimId={assignTarget.id}
          onAssigned={() => void handleAssigned()}
        />
      )}
    </div>
  );
}