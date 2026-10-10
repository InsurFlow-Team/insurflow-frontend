import { Link } from "react-router-dom";

import { CheckCircle2 } from "lucide-react";

import { useTranslation } from "../../i18n/context";

import { MAX_VISIBLE_ROWS, buildAttentionRows } from "./attention.utils";

import AttentionRow from "./AttentionRow";

import type { ClaimSummary, Role } from "../../types";

interface NeedsAttentionSectionProps {
  claims: ClaimSummary[];
  loading: boolean;
  role?: Role | null;
}

export default function NeedsAttentionSection({
  claims,
  loading,
  role = null,
}: NeedsAttentionSectionProps) {
  const { t } = useTranslation();

  const rows = buildAttentionRows(claims);

  const visibleRows = rows.slice(0, MAX_VISIBLE_ROWS);

  return (
    <section id="needs-attention" className="space-y-3">
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-text">
            {t("attention.heading")}
          </h2>

          <p className="mt-0.5 text-xs text-text-muted">
            {t("attention.subtitle")}
          </p>
        </div>

        {rows.length > 0 && (
          <Link
            to="/claims"
            className="text-sm font-medium text-primary transition-colors hover:text-primary-dark"
          >
            {t("attention.viewAll")}
          </Link>
        )}
      </div>

      {loading && rows.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface px-4 py-6 text-center text-sm text-text-muted">
          {t("attention.loading")}
        </div>
      ) : rows.length === 0 ? (
        <div className="flex items-center gap-2.5 rounded-xl border border-success-border bg-success-bg/60 px-4 py-3.5">
          <CheckCircle2 size={17} className="shrink-0 text-success-strong" />

          <div>
            <p className="text-sm font-medium text-success-deep">
              {t("attention.empty.title")}
            </p>

            <p className="text-xs text-success-deep/80">
              {t("attention.empty.body")}
            </p>
          </div>
        </div>
      ) : (
        <ul className="space-y-3">
          {visibleRows.map((row) => (
            <AttentionRow key={row.claim.id} row={row} role={role} />
          ))}
        </ul>
      )}
    </section>
  );
}
