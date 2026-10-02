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

function InfoRow({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
        {label}
      </p>

      <p className="mt-1 text-sm text-text">
        {value || "—"}
      </p>
    </div>
  );
}

export default function AdjusterDetails() {
  const { adjusterId } = useParams<{ adjusterId: string }>();

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
    return <LoadingState message="Loading adjuster details..." />;
  }

  if (error || !adjuster) {
    return (
      <ErrorState
        message={error || "Field adjuster not found."}
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
        Back to adjusters
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
              <StatusBadge status={adjuster.availability} />
              <StatusBadge status={adjuster.status} />
            </div>
          </div>
        </div>
      </div>

      <section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-text">Active workload</h2>

        <div className="mt-5 max-w-md">
          <ActiveTasksCell
            activeTasksCount={adjuster.activeTasksCount}
            capacityLimit={adjuster.capacityLimit}
          />
        </div>
      </section>

      <section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-text">
          Adjuster information
        </h2>

        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <InfoRow label="Employee ID" value={adjuster.employeeCode} />
          <InfoRow label="Role" value={adjuster.role} />
          <InfoRow label="Organization" value={adjuster.organizationName} />
          <InfoRow
            label="Active Tasks"
            value={String(adjuster.activeTasksCount)}
          />
        </div>
      </section>

      <section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-text">
          Work history
        </h2>

        <p className="mt-1 text-sm text-text-muted">
          Claims this adjuster finished, with the inspections performed and how
          long each one took.
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