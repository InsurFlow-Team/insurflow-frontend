import StatCard from "../ui/StatCard";
import {
  CLAIM_STATUS_CARDS,
  TOTAL_CLAIM_CARD,
} from "../ui/claimStatCards";
import { countClaimsByStatus } from "../../utils/claims";
import type { ClaimSummary } from "../../types";

// One renderer for the Claims page and the Dashboard, so both always show the
// same statuses from the same counting rule. The total sits on its own row and
// the ten stage cards fill a 5-column grid exactly (2 clean rows), so the cards
// always add up to the total without a ragged last line.
function StatCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-surface p-5 shadow-sm animate-pulse">
      <div className="h-3 w-24 bg-surface-disabled rounded" />
      <div className="mt-3 h-8 w-12 bg-surface-disabled rounded" />
      <div className="mt-2 h-3 w-32 bg-surface-sunken rounded" />
    </div>
  );
}

interface ClaimStatsGridProps {
  claims: ClaimSummary[];
  loading?: boolean;
}

export default function ClaimStatsGrid({
  claims,
  loading = false,
}: ClaimStatsGridProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        <StatCardSkeleton />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {[...Array(CLAIM_STATUS_CARDS.length)].map((_, index) => (
            <StatCardSkeleton key={CLAIM_STATUS_CARDS[index].key} />
          ))}
        </div>
      </div>
    );
  }

  const counts = countClaimsByStatus(claims);

  return (
    <div className="space-y-4">
      <StatCard
        label={TOTAL_CLAIM_CARD.label}
        value={claims.length}
        secondary={TOTAL_CLAIM_CARD.secondary}
        icon={TOTAL_CLAIM_CARD.icon}
        iconClass={TOTAL_CLAIM_CARD.iconClass}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {CLAIM_STATUS_CARDS.map((card) => (
          <StatCard
            key={card.key}
            label={card.label}
            value={counts[card.key]}
            secondary={card.secondary}
            icon={card.icon}
            iconClass={card.iconClass}
          />
        ))}
      </div>
    </div>
  );
}
