import { Link } from "react-router-dom";
import { UserCheck, AlertTriangle, PlayCircle, Gavel } from "lucide-react";
import type { Column } from "../ui/DataTable";
import StatusBadge from "../ui/StatusBadge";
import { formatDate } from "../../utils/claims";
import { webActionsFor, CLAIM_ACTIONS } from "../../domain/actions";
import type { MessageKey } from "../../i18n/messages.en";
import type { ClaimSummary, Role } from "../../types";

interface ClaimColumnsOptions {
  // Role gate computed by the page; the per-row offer itself comes from
  // domain/actions.ts so the table can never show a button the backend would
  // reject (assign only from NEW, start review only from SUBMITTED, decide
  // only for ADMIN from UNDER_REVIEW).
  role?: Role | null;
  onAssign?: (claim: ClaimSummary) => void;
  /** Translator — keeps every header and label on the page bilingual. */
  t: (key: MessageKey, vars?: Record<string, string | number>) => string;
}

/** Row priority: the single next action, then the always-on View Claim link. */
function primaryOffer(
  claim: ClaimSummary,
  role: Role | null,
): { key: keyof typeof CLAIM_ACTIONS; href?: string; assign?: boolean } | null {
  const actions = webActionsFor({ status: claim.status, role });

  if (actions.includes("ASSIGN_ADJUSTER")) {
    return { key: "ASSIGN_ADJUSTER", assign: true };
  }
  if (actions.includes("START_REVIEW")) {
    return { key: "START_REVIEW", href: `/claims/${claim.id}` };
  }
  if (actions.includes("APPROVE_CLAIM")) {
    return { key: "APPROVE_CLAIM", href: `/claims/${claim.id}` };
  }
  return null;
}

const BUTTON_CLASSES =
  "inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs font-semibold text-text hover:bg-background transition-colors";

export function buildClaimColumns(
  options: ClaimColumnsOptions,
): Column<ClaimSummary>[] {
  const { role = null, onAssign, t } = options;

  return [
    {
      key: "claimNumber",
      header: t("claims.col.claimNumber"),
      render: (claim) => (
        <span className="font-semibold text-text">{claim.claimNumber}</span>
      ),
    },
    {
      key: "customer",
      header: t("claims.col.customer"),
      render: (claim) => (
        <div className="min-w-0">
          <p className="text-sm text-text">{claim.customerName}</p>
          <p className="text-xs text-text-muted">{t("claims.policy")}: —</p>
        </div>
      ),
    },
    {
      key: "vehicle",
      header: t("claims.col.vehicle"),
      render: (claim) => (
        <div className="min-w-0">
          <p className="text-sm text-text">
            {claim.initialPlateNumber || "—"}
          </p>
          <p className="text-xs text-text-muted">—</p>
        </div>
      ),
    },
    {
      key: "status",
      header: t("claims.col.status"),
      render: (claim) => (
        <div className="flex flex-col gap-1 items-start">
          <StatusBadge
            status={claim.status}
            label={t(`claimStatus.${claim.status}` as MessageKey)}
          />
          {claim.status === "NEW" && claim.lastDecline && (
            <span className="inline-flex items-center gap-1 rounded border border-warning-border-strong bg-warning-bg px-1.5 py-0.5 text-[10px] font-semibold text-warning-deep">
              <AlertTriangle size={10} />
              {t("claims.redispatch")}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "createdAt",
      header: t("claims.col.created"),
      render: (claim) => (
        <span className="text-sm text-text">{formatDate(claim.createdAt)}</span>
      ),
    },
    {
      key: "updatedAt",
      header: t("claims.col.updated"),
      render: (claim) => (
        <span className="text-sm text-text">
          {formatDate(claim.updatedAt || claim.createdAt)}
        </span>
      ),
    },
    {
      key: "actions",
      header: t("claims.col.actions"),
      render: (claim) => {
        const offer = primaryOffer(claim, role);

        return (
          <div className="flex items-center gap-3">
            {offer?.assign && (
              <button
                type="button"
                onClick={() => onAssign?.(claim)}
                className={BUTTON_CLASSES}
              >
                <UserCheck size={13} />
                {t(CLAIM_ACTIONS[offer.key].labelKey as MessageKey)}
              </button>
            )}
            {offer?.href && (
              <Link to={offer.href} className={BUTTON_CLASSES}>
                {offer.key === "START_REVIEW" ? (
                  <PlayCircle size={13} />
                ) : (
                  <Gavel size={13} />
                )}
                {offer.key === "APPROVE_CLAIM"
                  ? t("action.MAKE_DECISION")
                  : t(CLAIM_ACTIONS[offer.key].labelKey as MessageKey)}
              </Link>
            )}
            <Link
              to={`/claims/${claim.id}`}
              className="text-sm font-semibold text-primary hover:text-primary-dark transition-colors"
            >
              {t("action.VIEW_CLAIM")}
            </Link>
          </div>
        );
      },
    },
  ];
}
