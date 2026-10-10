import { Link } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import StatusBadge from "../ui/StatusBadge";
import { useTranslation } from "../../i18n/context";
import type { Role } from "../../types";

import { ROW_TONES } from "./attention.styles";
import type { AttentionRowData } from "./attention.utils";

import AttentionRowMeta from "./AttentionRowMeta";
import AttentionRowActions from "./AttentionRowActions";

interface AttentionRowProps {
  row: AttentionRowData;
  role: Role | null;
}

export default function AttentionRow({ row, role }: AttentionRowProps) {
  const { t, tp } = useTranslation();
  const { claim, ageDays, overdue } = row;

  const tone = ROW_TONES[row.tone];
  const owner = claim.assignedTo?.name ?? t("overview.recent.unassigned");

  return (
    <li
      data-testid="attention-row"
      className={`rounded-xl border ${tone.row} p-4 transition-colors`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span
            className={`mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border ${tone.icon}`}
          >
            <row.def.icon size={15} />
          </span>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                to={`/claims/${claim.id}`}
                className="text-sm font-semibold text-text transition-colors hover:text-primary"
              >
                {claim.claimNumber}
              </Link>

              <StatusBadge
                status={claim.status}
                label={t(`claimStatus.${claim.status}`)}
              />

              {overdue && (
                <span
                  className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 text-[11px] font-semibold ${tone.chip}`}
                >
                  <AlertTriangle size={11} />
                  {tp("sla.overdue", ageDays)}
                </span>
              )}
            </div>

            <p className="mt-1 truncate text-xs text-text-muted">
              {claim.customerName} · {claim.initialPlateNumber}
            </p>

            <AttentionRowMeta row={row} owner={owner} chipClass={tone.chip} />
          </div>
        </div>

        <AttentionRowActions claim={claim} role={role} />
      </div>
    </li>
  );
}
