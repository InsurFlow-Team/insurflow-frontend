import { useMemo } from "react";
import { RefreshCw } from "lucide-react";

import { useAuth } from "../contexts/AuthContext";
import { useTranslation } from "../i18n/context";
import type { MessageKey } from "../i18n/messages.en";
import { useDashboardStats } from "../hooks/useDashboardStats";
import { useDashboardTeam } from "../hooks/useDashboardTeam";
import { RECENT_CLAIMS_COUNT } from "../components/dashboard/dashboardConstants";
import OverviewMetrics from "../components/dashboard/OverviewMetrics";
import NeedsAttentionSection from "../components/NeedsAttention/NeedsAttentionSection";
import RecentClaimsTable from "../components/dashboard/RecentClaimsTable";
import TeamCapacityCard from "../components/dashboard/TeamCapacityCard";
import ErrorState from "../components/ui/ErrorState";
import Button from "../components/ui/Button";

function greetingKeyFor(hour: number): MessageKey {
  if (hour < 12) return "overview.greeting.morning";
  if (hour < 17) return "overview.greeting.afternoon";
  return "overview.greeting.evening";
}

export default function Dashboard() {
  const { claims, loading, error, load } = useDashboardStats();
  const team = useDashboardTeam();
  const { user } = useAuth();
  const { t } = useTranslation();

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

  const greeting = user?.name
    ? t(greetingKeyFor(new Date().getHours()), { name: user.name })
    : t("overview.title");

  if (error) {
    return <ErrorState message={error} onRetry={() => void load()} />;
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl lg:text-3xl font-bold text-text">
            {greeting}
          </h1>
          <p className="mt-1 text-sm text-text-muted max-w-2xl">
            {t("overview.subtitle")}
          </p>
        </div>

        <Button
          variant="secondary"
          icon={<RefreshCw size={15} />}
          onClick={() => void load()}
          loading={loading}
        >
          {t("overview.refresh")}
        </Button>
      </div>

      <OverviewMetrics claims={claims} loading={loading} />

      <NeedsAttentionSection
        claims={claims}
        loading={loading}
        role={user?.role ?? null}
      />

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
