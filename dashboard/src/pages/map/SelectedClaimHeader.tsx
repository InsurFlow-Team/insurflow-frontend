import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import StatusChip from "./StatusChip";
import { useTranslation } from "../../i18n/context";
import type { ClaimSummary } from "../../types";

interface SelectedClaimHeaderProps {
  claim: ClaimSummary;
}

export default function SelectedClaimHeader({
  claim,
}: SelectedClaimHeaderProps) {
  const { t } = useTranslation();

  return (
    <div className="p-3.5 border-b border-border bg-primary-light flex items-center justify-between">
      <div className="min-w-0">
        <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
          {t("map.selectedClaim")}
        </span>
        <h3 className="font-bold text-text text-base">{claim.claimNumber}</h3>
        {/* Return path: the dispatch workspace never becomes a dead end. */}
        <Link
          to={`/claims/${claim.id}`}
          className="mt-0.5 inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary-dark"
        >
          <ArrowLeft size={12} className="rtl:rotate-180" />
          {t("map.backToClaim")}
        </Link>
      </div>
      <StatusChip status={claim.status} />
    </div>
  );
}
