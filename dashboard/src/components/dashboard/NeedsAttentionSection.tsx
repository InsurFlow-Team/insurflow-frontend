import { Link } from "react-router-dom";
import { AlertTriangle, ArrowRight, CheckCircle2 } from "lucide-react";

import {
  STALE_AFTER_DAYS,
  buildAttentionGroups,
  type AttentionGroup,
} from "../../utils/attention";
import type { ClaimStatus, ClaimSummary } from "../../types";

function ageLabel(days: number): string {
  if (days === 0) return "today";
  if (days === 1) return "1 day";
  return `${days} days`;
}

/** The drill-down: /claims already filters by status, so link straight into it. */
function claimsFilterHref(status: ClaimStatus): string {
  return `/claims?status=${status}`;
}

function AttentionRow({ group }: { group: AttentionGroup }) {
  const Icon = group.icon;
  const tone = group.isOverdue
    ? "border-warning-border-strong bg-warning-bg/60"
    : "border-border bg-surface";
  const countTone = group.isOverdue
    ? "text-warning-text"
    : group.waitingOn === "you"
      ? "text-primary"
      : "text-text";

  return (
    <li className={`rounded-xl border ${tone} p-3.5`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <span
            className={`mt-0.5 shrink-0 ${group.isOverdue ? "text-warning" : "text-text-muted"}`}
          >
            <Icon size={16} />
          </span>
          <div className="min-w-0">
            <Link
              to={claimsFilterHref(group.status)}
              className="text-sm font-semibold text-text hover:text-primary transition-colors"
            >
              {group.label}
            </Link>
            <p className="mt-0.5 text-xs text-text-muted">{group.caption}</p>
          </div>
        </div>

        <div className="shrink-0 text-right">
          <p className={`text-xl font-bold leading-none ${countTone}`}>
            {group.count}
          </p>
          <p className="mt-1 text-[11px] text-text-muted">
            oldest {ageLabel(group.oldestAgeDays)}
          </p>
        </div>
      </div>

      {group.isOverdue && (
        <p className="mt-2.5 inline-flex items-center gap-1.5 rounded border border-warning-border-strong bg-white px-2 py-1 text-[11px] font-semibold text-warning-deep">
          <AlertTriangle size={11} />
          Overdue — waiting {ageLabel(group.oldestAgeDays)} (threshold{" "}
          {STALE_AFTER_DAYS} days)
        </p>
      )}
    </li>
  );
}

interface NeedsAttentionSectionProps {
  claims: ClaimSummary[];
  loading: boolean;
}

export default function NeedsAttentionSection({
  claims,
  loading,
}: NeedsAttentionSectionProps) {
  const groups = buildAttentionGroups(claims);

  return (
    <section className="space-y-3">
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-text">Needs Your Attention</h2>
          <p className="mt-0.5 text-xs text-text-muted">
            Claims currently blocked, and who they are waiting on.
          </p>
        </div>
        {groups.length > 0 && (
          <Link
            to="/claims"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-dark transition-colors"
          >
            View all claims
            <ArrowRight size={14} />
          </Link>
        )}
      </div>

      {loading && groups.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface px-4 py-6 text-center text-sm text-text-muted">
          Checking for blocked claims…
        </div>
      ) : groups.length === 0 ? (
        <div className="flex items-center gap-2.5 rounded-xl border border-success-border bg-success-bg/60 px-4 py-3.5">
          <CheckCircle2 size={17} className="shrink-0 text-success-strong" />
          <p className="text-sm font-medium text-success-deep">
            Nothing is waiting on anyone. Every claim is moving.
          </p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {groups.map((group) => (
            <AttentionRow key={group.key} group={group} />
          ))}
        </ul>
      )}
    </section>
  );
}
