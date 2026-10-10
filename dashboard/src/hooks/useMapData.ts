import { useState, useCallback, useEffect } from "react";
import { getClaims, getClaimById } from "../api/claims.service";
import { getFieldAdjusters } from "../api/users.service";
import { getApiErrorMessage } from "../api/client";
import type { ClaimSummary, ClaimDetails, FieldAdjuster } from "../types";

export function useMapData() {
  const [claims, setClaims] = useState<ClaimSummary[]>([]);
  const [adjusters, setAdjusters] = useState<FieldAdjuster[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedClaim, setSelectedClaim] = useState<ClaimSummary | null>(null);
  const [selectedClaimDetails, setSelectedClaimDetails] =
    useState<ClaimDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const [claimAdjusters, setClaimAdjusters] = useState<FieldAdjuster[]>([]);
  const [claimAdjustersLoading, setClaimAdjustersLoading] = useState(false);

  const [assignTarget, setAssignTarget] = useState<ClaimSummary | null>(null);
  const [selectedAdjusterId, setSelectedAdjusterId] = useState<string | null>(
    null,
  );

  const load = useCallback(async (): Promise<ClaimSummary[] | null> => {
    setLoading(true);
    setError("");

    try {
      const [claimsData, adjustersData] = await Promise.all([
        getClaims(),
        getFieldAdjusters(),
      ]);
      setClaims(claimsData);
      setAdjusters(adjustersData);
      return claimsData;
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const loadClaimDetails = useCallback(
    async (claimId: string) => {
      setDetailsLoading(true);
      try {
        const details = await getClaimById(claimId);
        setSelectedClaimDetails(details);
      } catch (requestError) {
        console.error("Failed to load claim details:", requestError);
      } finally {
        setDetailsLoading(false);
      }
    },
    [],
  );

  const loadClaimAdjusters = useCallback(async (claimId: string) => {
    setClaimAdjustersLoading(true);
    try {
      const adjustersData = await getFieldAdjusters(claimId);
      setClaimAdjusters(adjustersData);
    } catch (requestError) {
      console.error("Failed to load adjusters:", requestError);
    } finally {
      setClaimAdjustersLoading(false);
    }
  }, []);

  const selectClaim = useCallback(
    (claim: ClaimSummary | null) => {
      setSelectedClaim(claim);
      if (claim) {
        void loadClaimDetails(claim.id);
        void loadClaimAdjusters(claim.id);
      } else {
        setSelectedClaimDetails(null);
        setClaimAdjusters([]);
      }
    },
    [loadClaimAdjusters, loadClaimDetails],
  );

  function openAssignModal(claim: ClaimSummary) {
    setAssignTarget(claim);
  }

  function closeAssignModal() {
    setAssignTarget(null);
    setSelectedAdjusterId(null);
  }

  async function handleAssigned() {
    const assignedClaimId = assignTarget?.id ?? selectedClaim?.id;
    closeAssignModal();

    if (!assignedClaimId) return;

    const refreshedClaims = await load();
    const refreshedClaim = refreshedClaims?.find(
      (claim) => claim.id === assignedClaimId,
    );
    if (refreshedClaim) {
      setSelectedClaim(refreshedClaim);
      void loadClaimDetails(refreshedClaim.id);
    }
  }

  return {
    // Data
    claims,
    adjusters,
    loading,
    error,

    // Selected claim
    selectedClaim,
    selectedClaimDetails,
    detailsLoading,

    // Claim adjusters
    claimAdjusters,
    claimAdjustersLoading,

    // Assignment modal
    assignTarget,
    selectedAdjusterId,
    setSelectedAdjusterId,

    // Actions
    load,
    selectClaim,
    openAssignModal,
    closeAssignModal,
    handleAssigned,
  };
}
