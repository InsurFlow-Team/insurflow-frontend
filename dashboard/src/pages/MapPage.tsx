import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { MapContainer, TileLayer } from "react-leaflet";
import { ChevronRight, FlaskConical, RefreshCw, UserCheck } from "lucide-react";
import "leaflet/dist/leaflet.css";

import { getClaims, getClaimById } from "../api/claims.service";
import { getFieldAdjusters } from "../api/users.service";
import { getApiErrorMessage } from "../api/client";
import { useAuth } from "../contexts/AuthContext";
import type { ClaimSummary, ClaimDetails, FieldAdjuster } from "../types";
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

// West Bank / Palestine operational view (Ramallah-centred). The dispatch map
// covers the whole zone; selecting a claim still flies to its marker.
const DEFAULT_CENTER: [number, number] = [31.9, 35.3];

// DEMO-mode preference (opt-in, off by default, never forced on users).
const DEMO_STORAGE_KEY = "masar.map.demo";

export default function MapPage() {
  const { user } = useAuth();
  const canAssign = user?.role === "ADMIN" || user?.role === "CLAIMS_OFFICER";

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
  const [demoMode, setDemoMode] = useState<boolean>(() => {
    try {
      return window.localStorage.getItem(DEMO_STORAGE_KEY) === "1";
    } catch {
      return false;
    }
  });

  const toggleDemoMode = () => {
    setDemoMode((previous) => {
      const next = !previous;
      try {
        window.localStorage.setItem(DEMO_STORAGE_KEY, next ? "1" : "0");
      } catch {
        // Storage unavailable (private mode etc.) — keep the in-memory toggle.
      }
      return next;
    });
  };

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

  // Deep link from the Claims list Assign action (/map?claim=<id>): select that
  // claim and show its dispatch panel (nearest adjuster + distances). The
  // officer reviews the options there and presses Assign to open the form —
  // the modal is never auto-opened. The param is consumed once so a later
  // Refresh never re-selects it.
  const [searchParams, setSearchParams] = useSearchParams();
  const claimIdFromUrl = searchParams.get("claim");

  useEffect(() => {
    if (!claimIdFromUrl || claims.length === 0) return;

    const target =
      claims.find((claim) => claim.id === claimIdFromUrl) ?? null;
    setSelectedClaim(target);
    setSelectedAdjusterId(null);
    setAssignTarget(null);
    setSearchParams({}, { replace: true });
  }, [claimIdFromUrl, claims, setSearchParams]);

  // Claim-scoped adjusters: the SAME backend dataset (GET /users/adjusters?claimId=)
  // feeds the map pins, the dispatch list AND the assignment modal — one source
  // of truth, so choosing an adjuster on the map preselects the identical id.
  const loadClaimAdjusters = useCallback(
    async (claimId: string) => {
      setClaimAdjustersLoading(true);
      try {
        setClaimAdjusters(await getFieldAdjusters(claimId));
      } catch {
        // Keep the previously known list on failure rather than emptying it.
        setClaimAdjusters(adjusters);
      } finally {
        setClaimAdjustersLoading(false);
      }
    },
    [adjusters],
  );

  useEffect(() => {
    if (selectedClaim?.id) {
      setSelectedAdjusterId(null);
      void loadClaimAdjusters(selectedClaim.id);
    } else {
      setClaimAdjusters(adjusters);
      setSelectedAdjusterId(null);
    }
  }, [selectedClaim, adjusters, loadClaimAdjusters]);

  // The claims list carries no incidentLocation text; GET /claims/:id is the
  // single source of truth for the reported incident location shown on the
  // dispatch map and panel. Text-only claims (no coordinates) rely on it.
  useEffect(() => {
    if (selectedClaim?.id) {
      setDetailsLoading(true);
      getClaimById(selectedClaim.id)
        .then(setSelectedClaimDetails)
        .catch(() => setSelectedClaimDetails(null))
        .finally(() => setDetailsLoading(false));
    } else {
      setSelectedClaimDetails(null);
      setDetailsLoading(false);
    }
  }, [selectedClaim]);

  // Filter to show only NEW claims for dispatch
  const newClaims = claims.filter((claim) => claim.status === "NEW");
  const claimPins = claimsWithCoordinates(newClaims);

  // Filter adjusters to ACTIVE only
  const activeAdjusters = adjusters.filter((adj) => adj.status === "ACTIVE");

  // DEMO MODE (off by default, clearly labelled): every adjuster the backend
  // reports WITHOUT a GPS location gets a simulated West Bank position, and
  // distances to the selected claim are computed client-side. Real locations
  // (from the adjuster mobile app later) are NEVER overwritten, and nothing is
  // sent to the backend.
  const demoReference: MapCoordinates | null = selectedClaim
    ? claimCoordinates(selectedClaim) ?? {
        latitude: DEMO_ANCHOR.latitude,
        longitude: DEMO_ANCHOR.longitude,
      }
    : null;

  // Claim-scoped dataset when a claim is selected, else the full list — the
  // SAME array feeds map pins, the dispatch list AND the assignment modal.
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

  const handleClaimSelect = (claim: ClaimSummary) => {
    setSelectedClaim(claim);
    setSelectedAdjusterId(null);
  };

  const handleAssignClick = (claim: ClaimSummary) => {
    setAssignTarget(claim);
  };

  // Choosing an adjuster on the map opens the assignment modal for the NEW
  // claim with that exact adjuster preselected (same backend id as its pin).
  const handleSelectAdjuster = (adjuster: FieldAdjuster) => {
    if (!selectedClaim || !canAssign || selectedClaim.status !== "NEW") return;

    setSelectedAdjusterId(adjuster.id);
    setAssignTarget(selectedClaim);
  };

  const handleRefetchAdjusters = () => {
    if (selectedClaim?.id) {
      void loadClaimAdjusters(selectedClaim.id);
    }
  };

  const handleAssigned = () => {
    setAssignTarget(null);
    setSelectedAdjusterId(null);
    setSelectedClaim(null);
    void load();
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
        <div className="flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900">
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
              onSelect={handleClaimSelect}
            />

            {selectedClaim ? (
              <DispatchPanel
                claim={selectedClaim}
                adjusters={activeDisplayAdjusters}
                adjustersLoading={claimAdjustersLoading}
                canAssign={canAssign}
                onAssign={handleAssignClick}
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
                  onSelect={handleClaimSelect}
                  onAssign={handleAssignClick}
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
          onClose={() => {
            setAssignTarget(null);
            setSelectedAdjusterId(null);
          }}
          claimId={assignTarget.id}
          initialAdjusterId={selectedAdjusterId ?? undefined}
          adjusters={activeDisplayAdjusters}
          adjustersLoading={claimAdjustersLoading}
          onRefetchAdjusters={handleRefetchAdjusters}
          onAssigned={handleAssigned}
        />
      )}
    </div>
  );
}