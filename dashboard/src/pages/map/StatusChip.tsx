import { CLAIM_STATUS_COLORS } from "../../utils/map";
import type { ClaimSummary } from "../../types";

export interface StatusChipProps {
  status: ClaimSummary["status"];
}

export default function StatusChip({ status }: StatusChipProps) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-soft px-2 py-0.5 text-[11px] font-medium text-text">
      <span
        className="h-2 w-2 rounded-full"
        style={{ backgroundColor: CLAIM_STATUS_COLORS[status] }}
      />
      {status.replace(/_/g, " ")}
    </span>
  );
}