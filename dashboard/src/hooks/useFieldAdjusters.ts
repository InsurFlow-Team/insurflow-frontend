import { useCallback, useEffect, useState } from "react";
import type { FieldAdjuster } from "../types";
import { getFieldAdjusters } from "../api/users.service";
import { getApiErrorMessage } from "../api/client";

const POLL_INTERVAL_MS = 30_000;

export function useFieldAdjusters(claimId?: string) {
  const [adjusters, setAdjusters] = useState<FieldAdjuster[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pollingPaused, setPollingPaused] = useState(false);

  const fetchAdjusters = useCallback(async (silent: boolean) => {
    if (!silent) {
      setLoading(true);
      setError(null);
    }

    try {
      setAdjusters(await getFieldAdjusters(claimId));
      setError(null);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, [claimId]);

  useEffect(() => {
    void fetchAdjusters(false);
  }, [fetchAdjusters]);

  useEffect(() => {
    if (pollingPaused) return;

    const timer = window.setInterval(() => {
      void fetchAdjusters(true);
    }, POLL_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [pollingPaused, fetchAdjusters]);

  const reload = useCallback(() => fetchAdjusters(false), [fetchAdjusters]);

  return {
    adjusters,
    loading,
    error,
    reload,
    pollingPaused,
    setPollingPaused,
  };
}