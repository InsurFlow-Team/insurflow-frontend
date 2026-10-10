import { CLAIM_STATUS_COLORS } from "../../utils/map";
import type { ClaimStatus, ClaimSummary } from "../../types";
import { useTranslation } from "../../i18n/context";
import type { MessageKey } from "../../i18n/messages.en";

const STATUS_LABEL_KEYS: Record<ClaimStatus, MessageKey> = {
  NEW: "claimStatus.NEW",
  PENDING_ACCEPTANCE: "claimStatus.PENDING_ACCEPTANCE",
  ASSIGNED: "claimStatus.ASSIGNED",
  IN_PROGRESS: "claimStatus.IN_PROGRESS",
  SUBMITTED: "claimStatus.SUBMITTED",
  UNDER_REVIEW: "claimStatus.UNDER_REVIEW",
  CORRECTION_REQUIRED: "claimStatus.CORRECTION_REQUIRED",
  APPROVED: "claimStatus.APPROVED",
  REJECTED: "claimStatus.REJECTED",
  CLOSED: "claimStatus.CLOSED",
};

export interface StatusChipProps {
  status: ClaimSummary["status"];
}

export default function StatusChip({ status }: StatusChipProps) {
  const { t } = useTranslation();

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-soft px-2 py-0.5 text-[11px] font-medium text-text">
      <span
        className="h-2 w-2 rounded-full"
        style={{ backgroundColor: CLAIM_STATUS_COLORS[status] }}
      />
      {t(STATUS_LABEL_KEYS[status])}
    </span>
  );
}