import { useState, useEffect, useCallback } from "react";
import { getClaimByToken, isValidTrackingToken } from "../api/publicTracking.service";
import { getApiErrorMessage } from "../api/client";
import type { PublicClaimDetails } from "../types/publicTracking";

const AUTO_REFRESH_INTERVAL = 45000; // 45 seconds (between 30-60s as specified)

interface UsePublicTrackingResult {
  claim: PublicClaimDetails | null;
  loading: boolean;
  error: string;
  lastUpdated: Date | null;
  refresh: () => Promise<void>;
}

export function usePublicTracking(token: string): UsePublicTrackingResult {
  const [claim, setClaim] = useState<PublicClaimDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadClaim = useCallback(async () => {
    if (!token) {
      setError("رابط التتبع غير صحيح");
      setLoading(false);
      return;
    }

    // Client-side validation
    if (!isValidTrackingToken(token)) {
      setError("رابط التتبع غير صالح أو منتهي الصلاحية");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await getClaimByToken(token);
      setClaim(data);
      setLastUpdated(new Date());
    } catch (requestError: any) {
      const errorMessage = getApiErrorMessage(requestError);
      
      // Handle specific error codes
      if (requestError?.response?.status === 404) {
        setError("رابط التتبع غير صالح أو منتهي الصلاحية");
      } else if (requestError?.response?.status === 429) {
        setError("تم تجاوز عدد المحاولات المسموح به. يرجى الانتظار قليلاً قبل المحاولة مرة أخرى.");
      } else {
        setError(errorMessage || "حدث خطأ أثناء تحميل المطالبة");
      }
      setClaim(null);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Initial load
  useEffect(() => {
    void loadClaim();
  }, [loadClaim]);

  // Auto-refresh every 45 seconds
  useEffect(() => {
    if (!claim || error) return;

    const intervalId = setInterval(() => {
      void loadClaim();
    }, AUTO_REFRESH_INTERVAL);

    return () => clearInterval(intervalId);
  }, [claim, error, loadClaim]);

  return {
    claim,
    loading,
    error,
    lastUpdated,
    refresh: loadClaim,
  };
}
