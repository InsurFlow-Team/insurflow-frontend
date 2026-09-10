import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Archive,
  CheckCircle2,
  ClipboardCheck,
  FilePlus2,
  FileText,
  RefreshCw,
  ScanSearch,
  Send,
} from "lucide-react";

import { useDashboardStats } from "../hooks/useDashboardStats";
import type { ClaimSummary } from "../types";
import { formatDate } from "../utils/claims";
import StatCard from "../components/ui/StatCard";
import DataTable, { type Column } from "../components/ui/DataTable";
import StatusBadge from "../components/ui/StatusBadge";
import ErrorState from "../components/ui/ErrorState";
import Button from "../components/ui/Button";

const RECENT_CLAIMS_COUNT = 5;

const STATUS_CARDS = [
  {
    key: "NEW",
    label: "New Claims",
    secondary: "Awaiting assignment",
    icon: FilePlus2,
    iconClass: "text-gray-500",
  },
  {
    key: "ASSIGNED",
    label: "Assigned Claims",
    secondary: "With a field adjuster",
    icon: ClipboardCheck,
    iconClass: "text-purple-600",
  },
  {
    key: "SUBMITTED",
    label: "Submitted Claims",
    secondary: "Ready for initial review",
    icon: Send,
    iconClass: "text-info",
  },
  {
    key: "UNDER_REVIEW",
    label: "Under Review Claims",
    secondary: "Requires inspection or sign-off",
    icon: ScanSearch,
    iconClass: "text-accent",
  },
  {
    key: "APPROVED",
    label: "Approved Claims",
    secondary: "Approved for settlement",
    icon: CheckCircle2,
    iconClass: "text-emerald-600",
  },
  {
    key: "CLOSED",
    label: "Closed Claims",
    secondary: "Lifecycle completed",
    icon: Archive,
    iconClass: "text-gray-500",
  },
] as const;

function StatCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-surface p-5 shadow-sm animate-pulse">
      <div className="h-3 w-24 bg-gray-200 rounded" />
      <div className="mt-3 h-8 w-12 bg-gray-200 rounded" />
      <div className="mt-2 h-3 w-32 bg-gray-100 rounded" />
    </div>
  );
}

export default function Dashboard() {
  const { claims, loading, error, load } = useDashboardStats();

  const counts = useMemo(() => {
    const total = claims.length;
    const byStatus = claims.reduce<Record<string, number>>((acc, claim) => {
      acc[claim.status] = (acc[claim.status] ?? 0) + 1;
      return acc;
    }, {});

    return { total, ...byStatus } as Record<string, number>;
  }, [claims]);

  const recentClaims = useMemo(
    () =>
      [...claims]
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        .slice(0, RECENT_CLAIMS_COUNT),
    [claims],
  );

  const recentClaimColumns: Column<ClaimSummary>[] = [
    {
      key: "claimNumber",
      header: "Claim Number",
      render: (claim) => (
        <Link
          to={`/claims/${claim.id}`}
          className="text-sm font-semibold text-primary hover:text-primary-dark transition-colors"
        >
          {claim.claimNumber}
        </Link>
      ),
    },
    {
      key: "customer",
      header: "Customer",
      render: (claim) => <span className="text-sm text-text">{claim.customerName}</span>,
    },
    {
      key: "plate",
      header: "Vehicle",
      render: (claim) => (
        <span className="text-sm text-text">{claim.initialPlateNumber || "—"}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (claim) => <StatusBadge status={claim.status} />,
    },
    {
      key: "createdAt",
      header: "Created Date",
      render: (claim) => (
        <span className="text-sm text-text">{formatDate(claim.createdAt)}</span>
      ),
    },
  ];

  const isLoading = loading;

  if (error) {
    return (
      <ErrorState
        message={error}
        onRetry={() => void load()}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-text">Overview</h1>
          <p className="mt-1 text-sm text-text-muted max-w-2xl">
            Real-time claim statistics and recent activity from your
            organization&apos;s backend.
          </p>
        </div>

        <Button
          variant="secondary"
          icon={<RefreshCw size={15} />}
          onClick={() => void load()}
          loading={isLoading}
        >
          Refresh
        </Button>
      </div>

      {/* Statistics */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(7)].map((_, index) => (
            <StatCardSkeleton key={index} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            label="Total Claims"
            value={counts.total}
            secondary="Claims in your organization"
            icon={FileText}
            iconClass="text-primary"
          />
          {STATUS_CARDS.map((stat) => (
            <StatCard
              key={stat.key}
              label={stat.label}
              value={counts[stat.key] ?? 0}
              secondary={stat.secondary}
              icon={stat.icon}
              iconClass={stat.iconClass}
            />
          ))}
        </div>
      )}

      {/* Recent claims */}
      <section className="space-y-3">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="text-base font-semibold text-text">Recent Claims</h2>
          <Link
            to="/claims"
            className="text-sm font-medium text-primary hover:text-primary-dark transition-colors"
          >
            View all claims
          </Link>
        </div>

        <DataTable
          columns={recentClaimColumns}
          data={recentClaims}
          loading={isLoading}
          emptyMessage="No claims yet."
          keyExtractor={(claim) => claim.id}
        />
      </section>
    </div>
  );
}