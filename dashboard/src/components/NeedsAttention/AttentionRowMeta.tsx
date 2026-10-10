import { useTranslation } from "../../i18n/context";
import { STALE_AFTER_DAYS } from "../../utils/attention";

import {
  WAITING_LABEL,
  type AttentionRowData,
} from "./attention.utils";

interface AttentionRowMetaProps {
  row: AttentionRowData;
  owner: string;
  chipClass: string;
}

export default function AttentionRowMeta({
  row,
  owner,
  chipClass,
}: AttentionRowMetaProps) {
  const { t, tp } = useTranslation();

  const { def, overdue, remainingDays } = row;

  return (
    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px]">
      <span
        className={`inline-flex items-center rounded border px-2 py-0.5 font-semibold ${chipClass}`}
      >
        {t(WAITING_LABEL[def.waitingOn])}
      </span>

      <span className="text-text-muted">
        {t("attention.owner")}: {owner}
      </span>

      {!overdue && (
        <span className="text-text-muted">
          <span>{tp("sla.remaining", remainingDays)}</span>{" "}
          <span>
            {t("sla.untilOverdue", { days: STALE_AFTER_DAYS })}
          </span>
        </span>
      )}
    </div>
  );
}