import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  FolderOpen,
  Inbox,
  PenLine,
  Plus,
  RefreshCw,
  Search,
} from "lucide-react";
import { createClaim, getClaims, toCreateClaimRequest } from "../api/claims.service";
import { getApiErrorMessage } from "../api/client";
import type { ClaimStatus, ClaimSummary } from "../types";
import { useAuth } from "../contexts/AuthContext";
import LoadingState from "../components/ui/LoadingState";
import ErrorState from "../components/ui/ErrorState";
import DataTable from "../components/ui/DataTable";
import Pagination from "../components/ui/Pagination";
import StatCard from "../components/ui/StatCard";
import Button from "../components/ui/Button";
import AddClaimModal from "../components/ui/AddClaimModal";
import AssignClaimModal from "../components/ui/AssignClaimModal";
import { buildClaimColumns } from "../components/claims/claimsColumns";
import type { NewClaimData } from "../components/claim-form/claimFormConstants";

const ROWS_PER_PAGE_OPTIONS = [10, 25, 50];

type DateRangeFilter = "all" | "7days" | "30days" | "90days";

const STATUS_OPTIONS: Array<{
  label: string;
  value: "" | ClaimStatus;
}> = [
  { label: "All Statuses", value: "" },
  { label: "New", value: "NEW" },
  { label: "Assigned", value: "ASSIGNED" },
  { label: "Submitted", value: "SUBMITTED" },
  { label: "Under Review", value: "UNDER_REVIEW" },
  { label: "Approved", value: "APPROVED" },
  { label: "Closed", value: "CLOSED" },
];

const DATE_RANGE_OPTIONS: Array<{
  label: string;
  value: DateRangeFilter;
}> = [
  { label: "All Time", value: "all" },
  { label: "Last 7 Days", value: "7days" },
  { label: "Last 30 Days", value: "30days" },
  { label: "Last 90 Days", value: "90days" },
];

function getDateCutoff(range: DateRangeFilter): Date | null {
  if (range === "all") return null;

  const now = Date.now();
  const millisecondsPerDay = 24 * 60 * 60 * 1000;

  switch (range) {
    case "7days":
      return new Date(now - 7 * millisecondsPerDay);
    case "30days":
      return new Date(now - 30 * millisecondsPerDay);
    case "90days":
      return new Date(now - 90 * millisecondsPerDay);
    default:
      return null;
  }
}

export default function ClaimsList() {
  const { user } = useAuth();
  const canAssign = user?.role === "CLAIMS_OFFICER";

  const [claims, setClaims] = useState<ClaimSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [assignTarget, setAssignTarget] = useState<ClaimSummary | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [successBanner, setSuccessBanner] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | ClaimStatus>("");
  const [dateRange, setDateRange] = useState<DateRangeFilter>("all");

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  const loadClaims = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getClaims();
      setClaims(data);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadClaims();
  }, [loadClaims]);

  async function handleCreate(claimData: NewClaimData): Promise<ClaimSummary> {
    const created = await createClaim(toCreateClaimRequest(claimData));
    setSuccessBanner(`${created.claimNumber} created successfully`);
    await loadClaims();
    return created;
  }

  function openAssign(claim: ClaimSummary) {
    setAssignTarget(claim);
    setIsAssignModalOpen(true);
  }

  function closeAssign() {
    setIsAssignModalOpen(false);
    setAssignTarget(null);
  }

  async function handleAssigned() {
    if (assignTarget) {
      setSuccessBanner(`${assignTarget.claimNumber} assigned successfully`);
    }
    await loadClaims();
    closeAssign();
  }

  const columns = buildClaimColumns({ canAssign, onAssign: openAssign });

  const stats = useMemo(() => {
    const totalClaims = claims.length;
    const draftClaims = claims.filter((c) => c.status === "NEW").length;
    const submittedClaims = claims.filter((c) => c.status === "SUBMITTED")
      .length;
    const pendingReview = claims.filter((c) => c.status === "UNDER_REVIEW")
      .length;

    return {
      totalClaims,
      draftClaims,
      submittedClaims,
      pendingReview,
    };
  }, [claims]);

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
    setStatusFilter("");
    setDateRange("all");
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

  if (loading) {
    return <LoadingState message="Loading claims..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => void loadClaims()} />;
  }

  return (
    <div className="space-y-6">
      {successBanner && (
        <div
          role="status"
          className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
        >
          <CheckCircle2 size={16} className="flex-shrink-0" />
          <span>{successBanner}</span>
        </div>
      )}

      {/* Page header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 text-sm text-text-muted"
          >
            <Link to="/dashboard" className="text-primary hover:text-primary-dark transition-colors">
              Operations
            </Link>
            <ChevronRight size={14} className="text-text-muted" />
            <span className="font-medium text-primary">Claims Queue</span>
          </nav>

          <h1 className="mt-2 text-2xl lg:text-3xl font-bold text-text">
            Claims Triage & Directory
          </h1>

          <p className="mt-1 text-sm text-text-muted max-w-2xl">
            Review submitted claims, monitor assessment lifecycle, and assign field
            adjusters.
          </p>
        </div>

        <Button
          variant="primary"
          icon={<Plus size={15} />}
          onClick={() => setIsCreateModalOpen(true)}
        >
          Add Claim
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Claims"
          value={stats.totalClaims}
          secondary="Active portfolio records"
          icon={FolderOpen}
          iconClass="text-primary"
        />
        <StatCard
          label="Draft Claims"
          value={stats.draftClaims}
          secondary="Awaiting customer submission"
          icon={PenLine}
          iconClass="text-gray-500"
        />
        <StatCard
          label="Submitted Claims"
          value={stats.submittedClaims}
          secondary="Ready for initial review"
          icon={Inbox}
          iconClass="text-info"
        />
        <StatCard
          label="Pending Review"
          value={stats.pendingReview}
          secondary="Requires inspection or sign-off"
          icon={AlertCircle}
          iconClass="text-accent"
        />
      </div>

      {/* Filters */}
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
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Filter by Claim ID or Customer..."
                className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-4 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </label>

            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value as "" | ClaimStatus);
                setPage(1);
              }}
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
              onChange={(event) => {
                setDateRange(event.target.value as DateRangeFilter);
                setPage(1);
              }}
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
              onClick={handleResetFilters}
            >
              Reset Filters
            </Button>
          </div>

          <span className="text-sm text-text-muted whitespace-nowrap">
            Showing {filteredClaims.length} of {claims.length} claims
          </span>
        </div>
      </div>

      {/* Claims table */}
      <DataTable
        columns={columns}
        data={pagedClaims}
        emptyMessage="No claims found."
        keyExtractor={(claim) => claim.id}
        footer={tableFooter}
      />

      <AddClaimModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreate}
      />

      {assignTarget && (
        <AssignClaimModal
          isOpen={isAssignModalOpen}
          onClose={closeAssign}
          claimId={assignTarget.id}
          onAssigned={() => void handleAssigned()}
        />
      )}
    </div>
  );
}
