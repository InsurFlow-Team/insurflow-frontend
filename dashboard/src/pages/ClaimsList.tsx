import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, RefreshCw } from "lucide-react";

import { getClaims } from "../api/claims.service";
import { getApiErrorMessage } from "../api/client";
import type { ClaimStatus, ClaimSummary } from "../types";
import StatusBadge from "../components/ui/StatusBadge";
import LoadingState from "../components/ui/LoadingState";
import ErrorState from "../components/ui/ErrorState";
import EmptyState from "../components/ui/EmptyState";

const statusOptions: Array<{ label: string; value: "" | ClaimStatus }> = [
  { label: "All statuses", value: "" },
  { label: "New", value: "NEW" },
  { label: "Submitted", value: "SUBMITTED" },
  { label: "Under review", value: "UNDER_REVIEW" },
  { label: "Approved", value: "APPROVED" },
  { label: "Closed", value: "CLOSED" },
];

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
  }).format(new Date(date));
}

export default function ClaimsList() {
  const [claims, setClaims] = useState<ClaimSummary[]>([]);
  const [status, setStatus] = useState<"" | ClaimStatus>("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadClaims = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getClaims(status || undefined);
      setClaims(data);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    void loadClaims();
  }, [loadClaims]);

  const filteredClaims = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return claims;
    }

    return claims.filter((claim) =>
      [
        claim.claimNumber,
        claim.customerName,
        claim.initialPlateNumber,
        claim.status,
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch),
    );
  }, [claims, search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Claims</h1>
          <p className="mt-1 text-sm text-text-muted">
            Review and manage submitted claims.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadClaims()}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-text transition hover:bg-background"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-[1fr_220px]">
          <label className="relative block">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search claim, customer, or plate..."
              className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-4 text-sm text-text outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </label>

          <select
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as "" | ClaimStatus)
            }
            className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            {statusOptions.map((option) => (
              <option key={option.label} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
        {loading ? (
          <LoadingState message="Loading claims..." />
        ) : error ? (
          <ErrorState message={error} onRetry={() => void loadClaims()} />
        ) : filteredClaims.length === 0 ? (
          <EmptyState message="No claims found." />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-background">
                <tr>
                  {["Claim", "Customer", "Plate", "Status", "Created", ""].map(
                    (heading) => (
                      <th
                        key={heading}
                        className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-text-muted"
                      >
                        {heading}
                      </th>
                    ),
                  )}
                </tr>
              </thead>

              <tbody className="divide-y divide-border">
                {filteredClaims.map((claim) => (
                  <tr key={claim.id} className="transition hover:bg-background">
                    <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-text">
                      {claim.claimNumber}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-sm text-text-muted">
                      {claim.customerName}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-sm text-text-muted">
                      {claim.initialPlateNumber}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      <StatusBadge status={claim.status} />
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-sm text-text-muted">
                      {formatDate(claim.createdAt)}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-right">
                      <Link
                        to={`/claims/${claim.id}`}
                        className="text-sm font-semibold text-primary hover:text-primary-dark"
                      >
                        View details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}