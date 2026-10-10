import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import { getFieldAdjusterById } from "../api/users.service";
import { getAdjusterWorkHistory } from "../api/claims.service";
import { getApiErrorMessage } from "../api/client";
import type { AdjusterWorkHistory, FieldAdjuster } from "../types";
import StatusBadge from "../components/ui/StatusBadge";
import LoadingState from "../components/ui/LoadingState";
import ErrorState from "../components/ui/ErrorState";
import ActiveTasksCell from "../components/adjusters/ActiveTasksCell";
import WorkHistorySection from "../components/adjusters/WorkHistorySection";
import { avatarClasses, userInitials } from "../utils/user";
import { useTranslation } from "../i18n/context";

function InfoRow({
  label,
  value,
  roleLabel,
}: {
  label: string;
  value?: string | null;
  roleLabel?: string;
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
        {label}
      </p>

      <p className="mt-1 text-sm text-text">
        {roleLabel ?? (value || "—")}
      </p>
    </div>
  );
}

export default function AdjusterDetails() {
  const { adjusterId } = useParams<{ adjusterId: string }>();
  const { t } = useTranslation();

  const [adjuster, setAdjuster] = useState<FieldAdjuster | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [history, setHistory] = useState<AdjusterWorkHistory | null>(null);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState("");

  const loadAdjuster = useCallback(async () => {
    if (!adjusterId) return;

    setLoading(true);
    setError("");

    try {
      const data = await getFieldAdjusterById(adjusterId);
      setAdjuster(data);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, [adjusterId]);

  // The work history is derived client-side from the claim list, so it loads
  // independently of the profile: a failure here must not blank the page.
  const loadHistory = useCallback(async () => {
    if (!adjusterId) return;

    setHistoryLoading(true);
    setHistoryError("");

    try {
      setHistory(await getAdjusterWorkHistory(adjusterId));
    } catch (requestError) {
      setHistoryError(getApiErrorMessage(requestError));
    } finally {
      setHistoryLoading(false);
    }
  }, [adjusterId]);

  useEffect(() => {
    void loadAdjuster();
    void loadHistory();
  }, [loadAdjuster, loadHistory]);

  if (loading) {
    return <LoadingState message={t("adjuster.loading")} />;
  }

  if (error || !adjuster) {
    return (
      <ErrorState
        message={error || t("adjuster.notFound")}
        onRetry={() => void loadAdjuster()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <Link
        to="/adjusters"
        className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-dark"
      >
        <ArrowLeft size={16} />
        {t("adjuster.backToList")}
      </Link>

      <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <span
            className={`w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold shrink-0 ${avatarClasses(adjuster.name)}`}
          >
            {userInitials(adjuster.name)}
          </span>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-text">{adjuster.name}</h1>
              <span className="inline-block rounded-md bg-surface-sunken px-2 py-0.5 text-xs font-medium text-text-soft">
                {adjuster.employeeCode}
              </span>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-2">
              <StatusBadge
                status={adjuster.availability}
                label={t(
                  adjuster.availability === "AVAILABLE"
                    ? "adjusters.availability.available"
                    : "adjusters.availability.unavailable",
                )}
              />
              <StatusBadge
                status={adjuster.status}
                label={t(
                  adjuster.status === "ACTIVE"
                    ? "adjusters.status.active"
                    : "adjusters.status.inactive",
                )}
              />
            </div>
          </div>
        </div>
      </div>

      <section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-text">
          {t("adjuster.section.workload.title")}
        </h2>

        <div className="mt-5 max-w-md">
          <ActiveTasksCell
            activeTasksCount={adjuster.activeTasksCount}
            capacityLimit={adjuster.capacityLimit}
          />
        </div>
      </section>

      <section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-text">
          {t("adjuster.section.info.title")}
        </h2>

        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <InfoRow label={t("adjuster.field.employeeId")} value={adjuster.employeeCode} />
          <InfoRow
            label={t("adjuster.field.role")}
            value={adjuster.role}
            roleLabel={t("role.fieldAdjuster")}
          />
          <InfoRow label={t("adjuster.field.organization")} value={adjuster.organizationName} />
          <InfoRow
            label={t("adjuster.field.activeTasks")}
            value={String(adjuster.activeTasksCount)}
          />
        </div>
      </section>

      <section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-text">
          {t("adjuster.section.history.title")}
        </h2>

        <p className="mt-1 text-sm text-text-muted">
          {t("adjuster.section.history.subtitle")}
        </p>

        <div className="mt-5">
          <WorkHistorySection
            history={history}
            loading={historyLoading}
            error={historyError}
            onRetry={() => void loadHistory()}
          />
        </div>
      </section>
    </div>
  );
}