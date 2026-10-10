import { Link } from "react-router-dom";

import { useTranslation } from "../../i18n/context";

import type { ClaimSummary, Role } from "../../types";

import { primaryActionFor } from "./attention.utils";

interface AttentionRowActionsProps {
  claim: ClaimSummary;
  role: Role | null;
}

export default function AttentionRowActions({
  claim,
  role,
}: AttentionRowActionsProps) {
  const { t } = useTranslation();

  const viewClaim = {
    labelKey: "action.VIEW_CLAIM" as const,
    to: `/claims/${claim.id}`,
  };

  const primary = primaryActionFor(claim, role) ?? viewClaim;

  const linkClasses =
    "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors";

  const primaryClasses = `${linkClasses} bg-primary text-white hover:bg-primary-dark`;

  const viewClasses = `${linkClasses} border border-border bg-surface text-text hover:bg-background`;

  return (
    <div className="flex shrink-0 items-center gap-2">
      <Link to={primary.to} className={primaryClasses}>
        {t(primary.labelKey)}
      </Link>

      {primary.labelKey !== viewClaim.labelKey && (
        <Link to={viewClaim.to} className={viewClasses}>
          {t("action.VIEW_CLAIM")}
        </Link>
      )}
    </div>
  );
}
