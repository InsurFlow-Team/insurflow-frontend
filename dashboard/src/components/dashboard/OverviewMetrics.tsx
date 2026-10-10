import { Link } from "react-router-dom";
import {
  AlertTriangle,
  Clock,
  FileSearch,
  Gavel,
  ListTodo,
  UserPlus,
  type LucideIcon,
} from "lucide-react";

import { useTranslation } from "../../i18n/context";
import type { MessageKey } from "../../i18n/messages.en";
import { ATTENTION_STATUSES, isOverdue } from "../../utils/attention";
import type { ClaimSummary } from "../../types";

/**
 * The command-center metric row: six questions the operator asks every
 * morning, each answered by a real count and each CLICKABLE — a metric is a
 * doorway into the filtered list where the work happens, never decoration.
 *
 * Counts come from the same GET /claims rows as everything else on the page.
 */
interface MetricDef {
  labelKey: MessageKey;
  hintKey: MessageKey;
  href: string;
  icon: LucideIcon;
  count: (claims: ClaimSummary[]) => number;
  /** Renders the value in danger red whenever it is above zero. */
  danger?: boolean;
}

const countStatus = (status: string) =>
  ((claims: ClaimSummary[]) =>
    claims.filter((claim) => claim.status === status).length);

const METRICS: readonly MetricDef[] = [
  {
    labelKey: "metric.needsAction",
    hintKey: "metric.jumpToAttention",
    href: "#needs-attention",
    icon: ListTodo,
    count: (claims) =>
      claims.filter((claim) => ATTENTION_STATUSES.includes(claim.status))
        .length,
  },
  {
    labelKey: "metric.overdue",
    hintKey: "metric.reviewOverdue",
    href: "/claims?sla=overdue",
    icon: AlertTriangle,
    danger: true,
    count: (claims) =>
      claims.filter(
        (claim) =>
          ATTENTION_STATUSES.includes(claim.status) &&
          isOverdue(claim.createdAt),
      ).length,
  },
  {
    labelKey: "metric.waitingAssignment",
    hintKey: "metric.viewClaims",
    href: "/claims?status=NEW",
    icon: UserPlus,
    count: countStatus("NEW"),
  },
  {
    labelKey: "metric.waitingAcceptance",
    hintKey: "metric.viewClaims",
    href: "/claims?status=PENDING_ACCEPTANCE",
    icon: Clock,
    count: countStatus("PENDING_ACCEPTANCE"),
  },
  {
    labelKey: "metric.reportsReady",
    hintKey: "metric.reviewReports",
    href: "/claims?status=SUBMITTED",
    icon: FileSearch,
    count: countStatus("SUBMITTED"),
  },
  {
    labelKey: "metric.readyDecision",
    hintKey: "metric.viewClaims",
    href: "/claims?status=UNDER_REVIEW",
    icon: Gavel,
    count: countStatus("UNDER_REVIEW"),
  },
];

function MetricSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-border bg-surface p-4">
      <div className="h-3 w-20 rounded bg-surface-disabled" />
      <div className="mt-3 h-7 w-10 rounded bg-surface-disabled" />
      <div className="mt-2 h-3 w-24 rounded bg-surface-sunken" />
    </div>
  );
}

interface OverviewMetricsProps {
  claims: ClaimSummary[];
  loading: boolean;
}

export default function OverviewMetrics({
  claims,
  loading,
}: OverviewMetricsProps) {
  const { t } = useTranslation();

  if (loading && claims.length === 0) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {METRICS.map((metric) => (
          <MetricSkeleton key={metric.labelKey} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-6">
      {METRICS.map((metric) => {
        const value = metric.count(claims);
        const Icon = metric.icon;
        const body = (
          <>
            <span className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-text-muted">
                {t(metric.labelKey)}
              </span>
              <Icon
                size={15}
                className="shrink-0 text-text-muted group-hover:text-primary"
              />
            </span>
            <span
              className={`text-2xl font-bold leading-none ${
                metric.danger && value > 0 ? "text-danger-text" : "text-text"
              }`}
            >
              {value}
            </span>
            <span className="text-[11px] text-text-muted">
              {t(metric.hintKey)}
            </span>
          </>
        );

        const className =
          "group flex flex-col gap-2 rounded-xl border border-border bg-surface p-4 text-start transition-colors hover:border-primary/40 hover:bg-background";

        // In-page anchor: a plain <a> so the browser jumps without a route
        // change. Everything else drills into the matching filtered list.
        return metric.href.startsWith("#") ? (
          <a key={metric.labelKey} href={metric.href} className={className}>
            {body}
          </a>
        ) : (
          <Link key={metric.labelKey} to={metric.href} className={className}>
            {body}
          </Link>
        );
      })}
    </div>
  );
}
