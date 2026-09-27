import { useMemo } from "react";
import { RefreshCw } from "lucide-react";

import { useDashboardStats } from "../hooks/useDashboardStats";
import { useDashboardTeam } from "../hooks/useDashboardTeam";
import { RECENT_CLAIMS_COUNT } from "../components/dashboard/dashboardConstants";
import ClaimStatsGrid from "../components/claims/ClaimStatsGrid";
import NeedsAttentionSection from "../components/dashboard/NeedsAttentionSection";
import RecentClaimsTable from "../components/dashboard/RecentClaimsTable";
import TeamCapacityCard from "../components/dashboard/TeamCapacityCard";
import ErrorState from "../components/ui/ErrorState";
import Button from "../components/ui/Button";

export default function Dashboard() {
  const { claims, loading, error, load } = useDashboardStats();
  const team = useDashboardTeam();

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

  if (error) {
    return <ErrorState message={error} onRetry={() => void load()} />;
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-text">
            Overview
          </h1>
          <p className="mt-1 text-sm text-text-muted max-w-2xl">
            Real-time claim statistics and recent activity from your
            organization&apos;s backend.
          </p>
        </div>

        <Button
          variant="secondary"
          icon={<RefreshCw size={15} />}
          onClick={() => void load()}
          loading={loading}
        >
          Refresh
        </Button>
      </div>

      <ClaimStatsGrid claims={claims} loading={loading} />

      <NeedsAttentionSection claims={claims} loading={loading} />

      <TeamCapacityCard
        adjusters={team.adjusters}
        claims={claims}
        loading={team.loading}
        error={team.error}
      />

      <RecentClaimsTable claims={recentClaims} loading={loading} />
    </div>
  );
}