import { useCallback, useEffect, useRef, useState } from "react";
import { getFieldAdjusters } from "../api/users.service";
import { getApiErrorMessage } from "../api/client";
import type { FieldAdjuster } from "../types";

/**
 * Field adjuster roster for the dashboard's team-capacity card. Deliberately
 * separate from useDashboardStats so /adjusters does not fetch the roster twice
 * for pages that only need claim counts.
 *
 * A roster failure is surfaced as `error` but never blocks the page: the claim
 * statistics and attention queue come from a different endpoint, and losing the
 * capacity card must not take the whole dashboard down.
 */
export function useDashboardTeam() {
  const [adjusters, setAdjusters] = useState<FieldAdjuster[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const inFlight = useRef(false);

  const load = useCallback(async () => {
    if (inFlight.current) return;

    inFlight.current = true;
    setLoading(true);
    setError("");

    try {
      setAdjusters(await getFieldAdjusters());
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      inFlight.current = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { adjusters, loading, error, load };
}
