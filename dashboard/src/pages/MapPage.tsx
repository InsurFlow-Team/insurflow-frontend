import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { MapContainer, TileLayer } from "react-leaflet";
import { ChevronRight, FlaskConical, RefreshCw, UserCheck } from "lucide-react";
import "leaflet/dist/leaflet.css";

import { useAuth } from "../contexts/AuthContext";
import { useMapData } from "../hooks/useMapData";
import { useDemoMode } from "../hooks/useDemoMode";
import { applyDemoLocations, DEMO_ANCHOR } from "../utils/demo";
import {
  adjusterLegend,
  adjustersWithCoordinates,
  claimCoordinates,
  claimLegend,
  claimsWithCoordinates,
} from "../utils/map";
import type { MapCoordinates } from "../utils/map";
import AssignClaimModal from "../components/ui/AssignClaimModal";
import Button from "../components/ui/Button";
import ErrorState from "../components/ui/ErrorState";
import AdjusterPin from "./map/AdjusterPin";
import ClaimPin from "./map/ClaimPin";
import ClaimsQueuePanel from "./map/ClaimsQueuePanel";
import DispatchPanel from "./map/DispatchPanel";
import FitBounds from "./map/FitBounds";
import MapOverlays from "./map/MapOverlays";

// West Bank / Palestine operational view (Ramallah-centred)
const DEFAULT_CENTER: [number, number] = [31.9, 35.3];

export default function MapPage() {
  const { user } = useAuth();
  const canAssign = user?.role === "ADMIN" || user?.role === "CLAIMS_OFFICER";

  const {
    claims,
    adjusters,
    loading,
    error,
    selectedClaim,
    selectedClaimDetails,
    detailsLoading,
    claimAdjusters,
    claimAdjustersLoading,
    assignTarget,
    selectedAdjusterId,
    setSelectedAdjusterId,
    load,
    selectClaim,
    openAssignModal,
    closeAssignModal,
    handleAssigned,
  } = useMapData();

  const { demoMode, toggleDemoMode } = useDemoMode();

  // Deep link from the Claims list Assign action (/map?claim=<id>)
  const [searchParams, setSearchParams] = useSearchParams();
  const claimIdFromUrl = searchParams.get("claim");

  useEffect(() => {
    if (!claimIdFromUrl || claims.length === 0) return;

    const target = claims.find((claim) => claim.id === claimIdFromUrl) ?? null;
    selectClaim(target);
    setSearchParams({}, { replace: true });
  }, [claimIdFromUrl, claims, setSearchParams, selectClaim]);

  // Filter to show only NEW claims for dispatch
  const newClaims = claims.filter((claim) => claim.status === "NEW");
  const claimPins = claimsWithCoordinates(newClaims);

  // Filter adjusters to ACTIVE only
  const activeAdjusters = adjusters.filter((adj) => adj.status === "ACTIVE");

  // DEMO MODE: Simulate coordinates for testing
  const demoReference: MapCoordinates | null = selectedClaim
    ? claimCoordinates(selectedClaim) ?? {
        latitude: DEMO_ANCHOR.latitude,
        longitude: DEMO_ANCHOR.longitude,
      }
    : null;

  const displayAdjusters = selectedClaim ? claimAdjusters : adjusters;
  const activeDisplayAdjusters = applyDemoLocations(
    displayAdjusters.filter((adj) => adj.status === "ACTIVE"),
    demoMode ? demoReference : null,
    demoMode,
  );

  const adjusterPins = adjustersWithCoordinates(
    selectedClaim
      ? activeDisplayAdjusters
      : applyDemoLocations(
          activeAdjusters,
          demoMode ? demoReference : null,
          demoMode,
        ),
  );

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

  const handleSelectAdjuster = (adjuster: unknown) => {
    if (!selectedClaim || !canAssign || selectedClaim.status !== "NEW") return;
    const adj = adjuster as { id: string };
    setSelectedAdjusterId(adj.id);
    openAssignModal(selectedClaim);
  };

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

        <div className="flex items-center gap-2">
          <Button
            variant={demoMode ? "primary" : "secondary"}
            icon={<FlaskConical size={15} />}
            onClick={toggleDemoMode}
            aria-pressed={demoMode}
            title="Simulated adjuster locations + distances (never sent to the backend)"
          >
            {demoMode ? "DEMO On" : "DEMO Locations"}
          </Button>

          <Button
            variant="secondary"
            icon={<RefreshCw size={15} />}
            onClick={() => void load()}
            loading={loading}
          >
            Refresh
          </Button>
        </div>
      </div>

      {demoMode && (
        <div className="flex items-start gap-2 rounded-lg border border-warning-border-strong bg-warning-bg px-3 py-2 text-xs text-warning-ink">
          <FlaskConical size={14} className="mt-0.5 shrink-0" />
          <p>
            <span className="font-bold">DEMO mode on</span> — adjuster
            locations and distances are simulated ({" "}
            <span className="italic">not real data</span>, never sent to the
            backend). Real GPS will come from the adjuster mobile app.
          </p>
        </div>
      )}

      {error ? (
        <ErrorState message={error} onRetry={() => void load()} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-4">
          {/* Claims & Dispatch sidebar */}
          <div className="flex flex-col gap-4">
            <ClaimsQueuePanel
              claims={newClaims}
              selectedId={selectedClaim?.id}
              onSelect={selectClaim}
            />

            {selectedClaim ? (
              <DispatchPanel
                claim={selectedClaim}
                adjusters={activeDisplayAdjusters}
                adjustersLoading={claimAdjustersLoading}
                canAssign={canAssign}
                onAssign={openAssignModal}
                incidentLocation={selectedClaimDetails?.incidentLocation}
                detailsLoading={detailsLoading}
                demo={demoMode}
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
              zoom={10}
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
                  incidentLocation={
                    selectedClaim?.id === claim.id
                      ? selectedClaimDetails?.incidentLocation
                      : undefined
                  }
                  isSelected={selectedClaim?.id === claim.id}
                  canAssign={canAssign}
                  onSelect={selectClaim}
                  onAssign={openAssignModal}
                />
              ))}

              {adjusterPins.map(({ adjuster, coordinates }) => (
                <AdjusterPin
                  key={`adjuster-${adjuster.id}`}
                  adjuster={adjuster}
                  coordinates={coordinates}
                  onSelectAdjuster={
                    canAssign && selectedClaim?.status === "NEW"
                      ? handleSelectAdjuster
                      : undefined
                  }
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
          onClose={closeAssignModal}
          claimId={assignTarget.id}
          initialAdjusterId={selectedAdjusterId ?? undefined}
          adjusters={activeDisplayAdjusters}
          adjustersLoading={claimAdjustersLoading}
          onAssigned={handleAssigned}
        />
      )}
    </div>
  );
}