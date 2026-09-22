import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MapContainer, TileLayer } from "react-leaflet";
import { ChevronRight, RefreshCw, UserCheck } from "lucide-react";
import "leaflet/dist/leaflet.css";

import { getClaims } from "../api/claims.service";
import { getFieldAdjusters } from "../api/users.service";
import { getApiErrorMessage } from "../api/client";
import { useAuth } from "../contexts/AuthContext";
import type { ClaimSummary, FieldAdjuster } from "../types";
import {
  adjusterLegend,
  adjustersWithCoordinates,
  claimCoordinates,
  claimLegend,
  claimsWithCoordinates,
} from "../utils/map";
import AssignClaimModal from "../components/ui/AssignClaimModal";
import Button from "../components/ui/Button";
import ErrorState from "../components/ui/ErrorState";
import AdjusterPin from "./map/AdjusterPin";
import ClaimPin from "./map/ClaimPin";
import ClaimsQueuePanel from "./map/ClaimsQueuePanel";
import DispatchPanel from "./map/DispatchPanel";
import FitBounds from "./map/FitBounds";
import MapOverlays from "./map/MapOverlays";

const DEFAULT_CENTER: [number, number] = [24.7136, 46.6753]; // Riyadh

export default function MapPage() {
  const { user } = useAuth();
  const canAssign = user?.role === "ADMIN" || user?.role === "CLAIMS_OFFICER";

  const [claims, setClaims] = useState<ClaimSummary[]>([]);
  const [adjusters, setAdjusters] = useState<FieldAdjuster[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedClaim, setSelectedClaim] = useState<ClaimSummary | null>(null);
  const [claimAdjusters, setClaimAdjusters] = useState<FieldAdjuster[]>([]);
  const [claimAdjustersLoading, setClaimAdjustersLoading] = useState(false);
  const [assignTarget, setAssignTarget] = useState<ClaimSummary | null>(null);

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

  // When a claim is selected, fetch proximity-sorted adjusters for that claim
  useEffect(() => {
    if (selectedClaim?.id) {
      setClaimAdjustersLoading(true);
      getFieldAdjusters(selectedClaim.id)
        .then((data) => setClaimAdjusters(data))
        .catch(() => setClaimAdjusters(adjusters))
        .finally(() => setClaimAdjustersLoading(false));
    } else {
      setClaimAdjusters(adjusters);
    }
  }, [selectedClaim, adjusters]);

  // Filter to show only NEW claims for dispatch
  const newClaims = claims.filter((claim) => claim.status === "NEW");
  const claimPins = claimsWithCoordinates(newClaims);

  // Filter adjusters to ACTIVE only
  const activeAdjusters = adjusters.filter((adj) => adj.status === "ACTIVE");
  const adjusterPins = adjustersWithCoordinates(activeAdjusters);

  const hasPins = claimPins.length > 0 || adjusterPins.length > 0;

  // Get center for selected claim
  const selectedClaimCenter: [number, number] | undefined = selectedClaim
    ? (() => {
        const coords = claimCoordinates(selectedClaim);
        return coords ? [coords.latitude, coords.longitude] : undefined;
      })()
    : undefined;

  const claimStatuses = [...new Set(claimPins.map((pin) => pin.claim.status))];
  const claimLegendItems = claimLegend(claimStatuses);
  const adjusterLegendItems = adjusterLegend(
    adjusterPins.map((pin) => ({
      status: pin.adjuster.status,
      availability: pin.adjuster.availability,
    })),
  );

  const handleClaimSelect = (claim: ClaimSummary) => {
    setSelectedClaim(claim);
  };

  const handleAssignClick = (claim: ClaimSummary) => {
    setAssignTarget(claim);
  };

  const handleAssigned = () => {
    setAssignTarget(null);
    setSelectedClaim(null);
    void load();
  };

  const displayAdjusters = selectedClaim ? claimAdjusters : adjusters;
  const activeDisplayAdjusters = displayAdjusters.filter(
    (adj) => adj.status === "ACTIVE",
  );

  return (
    <div className="space-y-4">
      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-1.5 text-sm text-text-muted"
      >
        <Link
          to="/dashboard"
          className="text-primary hover:text-primary-dark transition-colors"
        >
          Operations
        </Link>
        <ChevronRight size={14} className="text-text-muted" />
        <span className="font-medium text-primary">Map Dispatch</span>
      </nav>

      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">Map Dispatch</h1>
          <p className="mt-1 text-sm text-text-muted max-w-2xl">
            Select a NEW claim to locate its incident and assign a field
            adjuster.
          </p>
        </div>

        <Button
          variant="secondary"
          icon={<RefreshCw size={15} />}
          onClick={() => void load()}
          loading={loading}
        >
          Refresh
        </Button>
      </div>

      {error ? (
        <ErrorState message={error} onRetry={() => void load()} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-4">
          {/* Claims & Dispatch sidebar */}
          <div className="flex flex-col gap-4">
            <ClaimsQueuePanel
              claims={newClaims}
              selectedId={selectedClaim?.id}
              onSelect={handleClaimSelect}
            />

            {selectedClaim ? (
              <DispatchPanel
                claim={selectedClaim}
                adjusters={activeDisplayAdjusters}
                adjustersLoading={claimAdjustersLoading}
                canAssign={canAssign}
                onAssign={handleAssignClick}
              />
            ) : (
              <div className="rounded-xl border border-dashed border-border bg-surface-soft p-6 text-center text-text-muted">
                <UserCheck size={24} className="mx-auto text-text-muted mb-2" />
                <p className="text-xs font-medium">
                  Select a claim from the queue above to open dispatch panel
                </p>
              </div>
            )}
          </div>

          {/* Map */}
          <div className="relative z-0 h-[calc(100vh-11rem)] min-h-[480px] overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
            <MapContainer
              center={DEFAULT_CENTER}
              zoom={11}
              scrollWheelZoom
              className="h-full w-full"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <FitBounds center={selectedClaimCenter} zoom={14} />

              {claimPins.map(({ claim, coordinates }) => (
                <ClaimPin
                  key={`claim-${claim.id}`}
                  claim={claim}
                  coordinates={coordinates}
                  isSelected={selectedClaim?.id === claim.id}
                  canAssign={canAssign}
                  onSelect={handleClaimSelect}
                  onAssign={handleAssignClick}
                />
              ))}

              {adjusterPins.map(({ adjuster, coordinates }) => (
                <AdjusterPin
                  key={`adjuster-${adjuster.id}`}
                  adjuster={adjuster}
                  coordinates={coordinates}
                />
              ))}
            </MapContainer>

            <MapOverlays
              loading={loading}
              hasPins={hasPins}
              claimLegendItems={claimLegendItems}
              adjusterLegendItems={adjusterLegendItems}
            />
          </div>
        </div>
      )}

      {assignTarget && (
        <AssignClaimModal
          isOpen
          onClose={() => setAssignTarget(null)}
          claimId={assignTarget.id}
          onAssigned={handleAssigned}
        />
      )}
    </div>
  );
}