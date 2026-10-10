import { Link } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import type { Column } from "../ui/DataTable";
import DataTable from "../ui/DataTable";
import StatusBadge from "../ui/StatusBadge";
import { formatDate } from "../../utils/claims";
import { claimAgeInDays, isOverdue } from "../../utils/attention";
import { useTranslation, type PluralBaseKey } from "../../i18n/context";
import type { MessageKey } from "../../i18n/messages.en";
import type { ClaimSummary } from "../../types";

interface RecentTranslators {
  t: (key: MessageKey, vars?: Record<string, string | number>) => string;
  tp: (baseKey: PluralBaseKey, n: number) => string;
}

function buildRecentColumns({ t, tp }: RecentTranslators): Column<ClaimSummary>[] {
  const ageLabel = (days: number): string =>
    days === 0 ? t("overview.recent.today") : tp("overview.recent.ageDays", days);

  return [
    {
      key: "claimNumber",
      header: t("overview.recent.col.claimNumber"),
      render: (claim) => (
        <Link
          to={`/claims/${claim.id}`}
          className="text-sm font-semibold text-primary hover:text-primary-dark transition-colors"
        >
          {claim.claimNumber}
        </Link>
      ),
    },
    {
      key: "customer",
      header: t("overview.recent.col.customer"),
      render: (claim) => (
        <span className="text-sm text-text">{claim.customerName}</span>
      ),
    },
    {
      key: "plate",
      header: t("overview.recent.col.vehicle"),
      render: (claim) => (
        <span className="text-sm text-text">
          {claim.initialPlateNumber || "—"}
        </span>
      ),
    },
    {
      key: "status",
      header: t("overview.recent.col.status"),
      render: (claim) => (
        <div className="flex flex-col gap-1 items-start">
          <StatusBadge
            status={claim.status}
            label={t(`claimStatus.${claim.status}` as MessageKey)}
          />
          {claim.status === "NEW" && claim.lastDecline && (
            <span className="inline-flex items-center gap-1 rounded border border-warning-border-strong bg-warning-bg px-1.5 py-0.5 text-[10px] font-semibold text-warning-deep">
              <AlertTriangle size={9} />
              {t("claims.redispatch")}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "assignedTo",
      header: t("overview.recent.col.assignedTo"),
      render: (claim) => (
        <span className="text-sm text-text">
          {claim.assignedTo?.name || (
            <span className="text-warning-text">
              {t("overview.recent.unassigned")}
            </span>
          )}
        </span>
      ),
    },
    {
      key: "createdAt",
      header: t("overview.recent.col.created"),
      render: (claim) => (
        <span className="text-sm text-text">{formatDate(claim.createdAt)}</span>
      ),
    },
    {
      key: "age",
      header: t("overview.recent.col.age"),
      render: (claim) => {
        const days = claimAgeInDays(claim.createdAt);
        const overdue = isOverdue(claim.createdAt);

        return (
          <span
            className={`inline-flex items-center gap-1 text-sm font-medium ${
              overdue ? "text-warning-text" : "text-text-muted"
            }`}
          >
            {overdue && <AlertTriangle size={12} />}
            {ageLabel(days)}
          </span>
        );
      },
    },
  ];
}

interface RecentClaimsTableProps {
  claims: ClaimSummary[];
  loading: boolean;
}

export default function RecentClaimsTable({
  claims,
  loading,
}: RecentClaimsTableProps) {
  const { t, tp } = useTranslation();

  return (
    <section className="space-y-3">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-base font-semibold text-text">
          {t("overview.recent.title")}
        </h2>
        <Link
          to="/claims"
          className="text-sm font-medium text-primary hover:text-primary-dark transition-colors"
        >
          {t("overview.recent.viewAll")}
        </Link>
      </div>

      <DataTable
        columns={buildRecentColumns({ t, tp })}
        data={claims}
        loading={loading}
        emptyMessage={t("overview.recent.empty")}
        keyExtractor={(claim) => claim.id}
      />
    </section>
  );
}
