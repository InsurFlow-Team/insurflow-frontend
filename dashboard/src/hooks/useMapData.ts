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

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [claimsData, adjustersData] = await Promise.all([
        getClaims(),
        getFieldAdjusters(),
      ]);
      setClaims(claimsData);
      setAdjusters(adjustersData);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
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

  const loadClaimAdjusters = useCallback(async () => {
    setClaimAdjustersLoading(true);
    try {
      const adjustersData = await getFieldAdjusters();
      setClaimAdjusters(adjustersData);
    } catch (requestError) {
      console.error("Failed to load adjusters:", requestError);
    } finally {
      setClaimAdjustersLoading(false);
    }
  }, []);

  function selectClaim(claim: ClaimSummary | null) {
    setSelectedClaim(claim);
    if (claim) {
      void loadClaimDetails(claim.id);
      void loadClaimAdjusters();
    } else {
      setSelectedClaimDetails(null);
      setClaimAdjusters([]);
    }
  }

  function openAssignModal(claim: ClaimSummary) {
    setAssignTarget(claim);
  }

  function closeAssignModal() {
    setAssignTarget(null);
    setSelectedAdjusterId(null);
  }

  function handleAssigned() {
    closeAssignModal();
    void load();
    // Clear selection if the assigned claim was selected
    if (selectedClaim?.id === assignTarget?.id) {
      selectClaim(null);
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
