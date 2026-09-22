import StatusChip from "./StatusChip";
import type { ClaimSummary } from "../../types";

interface SelectedClaimHeaderProps {
  claim: ClaimSummary;
}

export default function SelectedClaimHeader({
  claim,
}: SelectedClaimHeaderProps) {
  return (
    <div className="p-3.5 border-b border-border bg-primary-light flex items-center justify-between">
      <div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
          Selected Claim
        </span>
        <h3 className="font-bold text-text text-base">{claim.claimNumber}</h3>
      </div>
      <StatusChip status={claim.status} />
    </div>
  );
}