import { Link } from "react-router-dom";
import { AlertTriangle, CheckCircle2, UserCheck, Users } from "lucide-react";

import {
  capacityHeadroom,
  summarizeTeamCapacity,
  type CapacityHeadroom,
} from "../../utils/attention";
import type { ClaimSummary, FieldAdjuster } from "../../types";

const TONE: Record<
  CapacityHeadroom["level"],
  { border: string; icon: typeof AlertTriangle; text: string }
> = {
  ok: {
    border: "border-success-border bg-success-bg/60",
    icon: CheckCircle2,
    text: "text-success-text",
  },
  tight: {
    border: "border-border bg-surface",
    icon: Users,
    text: "text-text",
  },
  over: {
    border: "border-warning-border-strong bg-warning-bg/60",
    icon: AlertTriangle,
    text: "text-warning-text",
  },
};

interface TeamCapacityCardProps {
  adjusters: FieldAdjuster[];
  claims: ClaimSummary[];
  loading: boolean;
  error?: string;
}

export default function TeamCapacityCard({
  adjusters,
  claims,
  loading,
  error = "",
}: TeamCapacityCardProps) {
  const capacity = summarizeTeamCapacity(adjusters);
  const headroom = capacityHeadroom(capacity, claims);
  const tone = TONE[headroom.level];
  const Icon = tone.icon;

  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-base font-semibold text-text">Adjuster Capacity</h2>
        <p className="mt-0.5 text-xs text-text-muted">
          Free inspection slots versus claims waiting to be assigned.
        </p>
      </div>

      <div className={`rounded-xl border p-4 ${tone.border}`}>
        {error ? (
          <p className="text-sm text-text-muted">
            Adjuster capacity is unavailable right now.
          </p>
        ) : loading ? (
          <p className="text-sm text-text-muted">Loading roster capacity…</p>
        ) : (
          <>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className={`text-3xl font-bold leading-none ${tone.text}`}>
                  {capacity.spare}
                </p>
                <p className="mt-1.5 text-xs font-medium text-text-muted">
                  spare inspection {capacity.spare === 1 ? "slot" : "slots"}
                </p>
              </div>

              <dl className="flex gap-5 text-right">
                <div>
                  <dt className="text-[11px] uppercase tracking-wide text-text-muted">
                    Team
                  </dt>
                  <dd className="mt-0.5 text-sm font-semibold text-text">
                    {capacity.total} adjuster{capacity.total === 1 ? "" : "s"}
                  </dd>
                </div>
                <div>
                  <dt className="text-[11px] uppercase tracking-wide text-text-muted">
                    Available now
                  </dt>
                  <dd className="mt-0.5 text-sm font-semibold text-text">
                    {capacity.availableNow}
                  </dd>
                </div>
                <div>
                  <dt className="text-[11px] uppercase tracking-wide text-text-muted">
                    Active tasks
                  </dt>
                  <dd className="mt-0.5 text-sm font-semibold text-text">
                    {capacity.activeTasks}
                  </dd>
                </div>
              </dl>
            </div>

            <p className="mt-3.5 flex items-start gap-2 border-t border-black/5 pt-3.5 text-sm text-text">
              <Icon size={15} className={`mt-0.5 shrink-0 ${tone.text}`} />
              <span>{headroom.message}</span>
            </p>

            {headroom.level !== "ok" && (
              <Link
                to="/claims?status=NEW"
                className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-border bg-white px-2.5 py-1.5 text-xs font-semibold text-text hover:bg-background transition-colors"
              >
                <UserCheck size={13} />
                Assign the waiting claims
              </Link>
            )}

            {capacity.hasUncappedAdjusters && (
              <p className="mt-2 text-[11px] text-text-muted">
                Some adjusters have no capacity limit set, so they are not counted
                in the spare slots.
              </p>
            )}
          </>
        )}
      </div>
    </section>
  );
}
