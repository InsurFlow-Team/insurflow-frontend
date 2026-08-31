import { useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle,
  FileText,
  RefreshCw,
} from "lucide-react";

import ErrorState from "../components/ui/ErrorState";
import EmptyState from "../components/ui/EmptyState";
import LoadingState from "../components/ui/LoadingState";

interface ClaimStats {
  total: number;
  submitted: number;
  underReview: number;
}

const mockStats: ClaimStats = {
  total: 12,
  submitted: 5,
  underReview: 7,
};

const statisticCards = [
  {
    key: "total",
    label: "Total Claims",
    icon: FileText,
    color: "border-primary bg-primary-light text-primary-dark",
    iconColor: "text-primary",
  },
  {
    key: "submitted",
    label: "Submitted Claims",
    icon: CheckCircle,
    color: "border-info bg-blue-50 text-info",
    iconColor: "text-info",
  },
  {
    key: "underReview",
    label: "Under Review Claims",
    icon: AlertCircle,
    color: "border-warning bg-accent-light text-accent",
    iconColor: "text-accent",
  },
] as const;

export default function Dashboard() {
  const [stats, setStats] = useState<ClaimStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  function loadStats() {
    setLoading(true);
    setError("");

    // Temporary mock response.
    // Replace this block with GET /claims/stats when the API is ready.
    window.setTimeout(() => {
      setStats(mockStats);
      setLoading(false);
    }, 300);
  }

  useEffect(() => {
    loadStats();
  }, []);

  if (loading) {
    return <LoadingState message="Loading dashboard statistics..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadStats} />;
  }

  if (!stats) {
    return <EmptyState message="No claim statistics available." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Dashboard</h1>
          <p className="mt-1 text-sm text-text-muted">
            Overview of the organization&apos;s insurance claims.
          </p>
        </div>

        <button
          type="button"
          onClick={loadStats}
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-text hover:bg-background"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {statisticCards.map((stat) => {
          const Icon = stat.icon;

          return (
            <article
              key={stat.key}
              className={`rounded-xl border border-l-4 bg-surface p-5 shadow-sm ${stat.color}`}
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-medium">{stat.label}</span>
                <Icon size={20} className={stat.iconColor} />
              </div>

              <strong className="block text-3xl font-bold">
                {stats[stat.key]}
              </strong>
            </article>
          );
        })}
      </div>

      <section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
        <h2 className="mb-4 text-base font-semibold text-text">
          Recent Claims
        </h2>
        <EmptyState message="No recent claims available." />
      </section>
    </div>
  );
}