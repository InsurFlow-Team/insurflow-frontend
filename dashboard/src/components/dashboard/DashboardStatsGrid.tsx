import StatCard from "../ui/StatCard";
import {
  STATUS_CARDS,
  TotalClaimCardConfig,
} from "./dashboardConstants";

function StatCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-surface p-5 shadow-sm animate-pulse">
      <div className="h-3 w-24 bg-gray-200 rounded" />
      <div className="mt-3 h-8 w-12 bg-gray-200 rounded" />
      <div className="mt-2 h-3 w-32 bg-gray-100 rounded" />
    </div>
  );
}

interface DashboardStatsGridProps {
  counts: Record<string, number>;
  loading: boolean;
}

export default function DashboardStatsGrid({
  counts,
  loading,
}: DashboardStatsGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(9)].map((_, index) => (
          <StatCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  const totalConfig = TotalClaimCardConfig();
  const total = counts.total ?? 0;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <StatCard
        label={totalConfig.label}
        value={total}
        secondary={totalConfig.secondary}
        icon={totalConfig.icon}
        iconClass={totalConfig.iconClass}
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
  );
}