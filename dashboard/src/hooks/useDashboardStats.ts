import { useCallback, useEffect, useRef, useState } from "react";
import { getClaims } from "../api/claims.service";
import { getApiErrorMessage } from "../api/client";
import type { ClaimSummary } from "../types";

// Real dashboard data. There is no dedicated /claims/stats endpoint, so the
// statistics are derived from the org-scoped claim list the backend actually
// returns via GET /claims — never from mock/hardcoded numbers.
export function useDashboardStats() {
  const [claims, setClaims] = useState<ClaimSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const inFlight = useRef(false);

  const load = useCallback(async () => {
    if (inFlight.current) return;

    inFlight.current = true;
    setLoading(true);
    setError("");

    try {
      const data = await getClaims();
      setClaims(data);
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

  return { claims, loading, error, load };
}