import { useCallback, useEffect, useState } from "react";
import type { FieldAdjuster } from "../types";
import { getFieldAdjusters } from "../api/users.service";
import { getApiErrorMessage } from "../api/client";

export function useFieldAdjusters() {
  const [adjusters, setAdjusters] = useState<FieldAdjuster[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      setAdjusters(await getFieldAdjusters());
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { adjusters, loading, error, reload: load };
}