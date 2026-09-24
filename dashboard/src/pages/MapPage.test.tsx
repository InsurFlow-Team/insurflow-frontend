// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { screen } from "@testing-library/dom";
import { MemoryRouter } from "react-router-dom";
import { setupUserEvent } from "../test/test-utils";

vi.setConfig({ testTimeout: 20000 });

const { authRole, flyTo } = vi.hoisted(() => ({
  authRole: { value: "CLAIMS_OFFICER" as string },
  flyTo: vi.fn(),
}));

vi.mock("../contexts/AuthContext", () => ({
  useAuth: () => ({ user: authRole.value ? { role: authRole.value } : null }),
}));

vi.mock("../api/users.service", () => ({
  getFieldAdjusters: vi.fn(),
}));

vi.mock("../api/claims.service", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../api/claims.service")>();
  return {
    ...actual,
    getClaims: vi.fn(),
    getClaimById: vi.fn(),
    assignClaim: vi.fn(),
  };
});

vi.mock("react-leaflet", () => ({
  MapContainer: (props: {
    children: React.ReactNode;
    center?: [number, number];
    zoom?: number;
  }) => (
    <div
      data-testid="map"
      data-center={JSON.stringify(props.center)}
      data-zoom={String(props.zoom)}
    >
      {props.children}
    </div>
  ),
  Marker: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="marker">{children}</div>
  ),
  Popup: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="popup">{children}</div>
  ),
  TileLayer: () => <div data-testid="tiles" />,
  useMap: () => ({ flyTo }),
}));

vi.mock("leaflet", () => ({
  default: {
    divIcon: vi.fn(() => ({})),
  },
  divIcon: vi.fn(() => ({})),
}));

import { getClaims, getClaimById, assignClaim } from "../api/claims.service";
import { getFieldAdjusters } from "../api/users.service";
import MapPage from "./MapPage";
import type { ClaimSummary, ClaimDetails, FieldAdjuster } from "../types";

function makeClaim(
  overrides: Partial<ClaimSummary> & { claimNumber: string },
): ClaimSummary {
  return {
    id: `id-${overrides.claimNumber}`,
    status: "NEW",
    customerName: "Ahmed Ibrahim",
    initialPlateNumber: "ABC-1234",
    createdAt: "2026-09-10T10:00:00.000Z",
    ...overrides,
  };
}

const LOCATED_CLAIM = makeClaim({
  claimNumber: "CLM-PIN-1",
  status: "NEW",
  incidentCoordinates: { latitude: 21.4, longitude: 39.1 },
});

const PLAIN_CLAIM = makeClaim({
  claimNumber: "CLM-NO-PIN",
  incidentCoordinates: null,
});

const LOCATED_ADJUSTER: FieldAdjuster = {
  id: "adj-1",
  name: "Aya",
  employeeCode: "FA-001",
  role: "FIELD_ADJUSTER",
  organizationId: "org-1",
  organizationName: "InsurFlow",
  status: "ACTIVE",
  availability: "AVAILABLE",
  activeTasksCount: 0,
  capacityLimit: 3,
  location: { latitude: 21.5, longitude: 39.2 },
  distanceKm: 1.5,
};

const MOVING_ADJUSTER: FieldAdjuster = {
  id: "adj-2",
  name: "Mishaal",
  employeeCode: "FA-002",
  role: "FIELD_ADJUSTER",
  organizationId: "org-1",
  organizationName: "InsurFlow",
  status: "ACTIVE",
  availability: "UNAVAILABLE",
  activeTasksCount: 0,
  capacityLimit: 3,
  location: null,
  distanceKm: null,
};

// The claims list endpoint has no incidentLocation text; GET /claims/:id is
// the single source of truth used by the dispatch map/panel.
function makeDetails(
  claim: ClaimSummary,
  incidentLocationText = "King Fahd Road",
): ClaimDetails {
  return {
    id: claim.id,
    claimNumber: claim.claimNumber,
    status: claim.status,
    incidentType: "COLLISION",
    incidentLocation: incidentLocationText,
    incidentCoordinates: claim.incidentCoordinates
      ? {
          latitude: claim.incidentCoordinates.latitude ?? 0,
          longitude: claim.incidentCoordinates.longitude ?? 0,
          capturedAt: claim.incidentCoordinates.capturedAt ?? claim.createdAt,
        }
      : null,
    createdAt: claim.createdAt,
    updatedAt: claim.updatedAt ?? claim.createdAt,
    customer: { name: claim.customerName, phone: null },
    vehicle: { plateNumber: claim.initialPlateNumber, make: null, model: null, year: null, color: null },
    policy: null,
    assignment: {
      assignedTo: null,
      assignedBy: null,
      assignedAt: null,
      priority: null,
      assignmentNotes: null,
    },
    accident: null,
    location: null,
    evidence: [],
    signature: null,
    decisionNotes: null,
    closedBy: null,
    closedAt: null,
    closingNotes: null,
    timeline: [],
    createdBy: null,
  };
}

beforeEach(() => {
  authRole.value = "CLAIMS_OFFICER";
  window.localStorage.clear();
  vi.mocked(getClaims).mockReset();
  vi.mocked(getClaimById).mockReset();
  vi.mocked(getClaimById).mockResolvedValue(makeDetails(LOCATED_CLAIM));
  vi.mocked(assignClaim).mockReset();
  vi.mocked(getFieldAdjusters).mockReset();
  flyTo.mockClear();
});

afterEach(() => {
  cleanup();
});

async function renderPage() {
  render(
    <MemoryRouter>
      <MapPage />
    </MemoryRouter>,
  );
}

describe("MapPage", () => {
  it("renders pins only for NEW records with real coordinates", async () => {
    vi.mocked(getClaims).mockResolvedValue([LOCATED_CLAIM, PLAIN_CLAIM]);
    vi.mocked(getFieldAdjusters).mockResolvedValue([
      LOCATED_ADJUSTER,
      MOVING_ADJUSTER,
    ]);

    await renderPage();

    const claimElements = await screen.findAllByText("CLM-PIN-1");
    expect(claimElements.length).toBeGreaterThan(0);
    expect(screen.getByText("Aya")).toBeTruthy();
    expect(screen.getAllByTestId("marker")).toHaveLength(2);
  });

  it("selects a NEW claim from queue and fetches adjusters using claimId", async () => {
    vi.mocked(getClaims).mockResolvedValue([LOCATED_CLAIM]);
    vi.mocked(getFieldAdjusters).mockResolvedValue([LOCATED_ADJUSTER]);

    const user = setupUserEvent();
    await renderPage();

    const claimElements = await screen.findAllByText("CLM-PIN-1");
    await user.click(claimElements[0]);

    expect(getFieldAdjusters).toHaveBeenCalledWith(LOCATED_CLAIM.id);
    expect(await screen.findByText("Selected Claim")).toBeTruthy();
    expect(screen.getAllByText(/1.50 km/)[0]).toBeTruthy();
  });

  it("offers Assign button for selected NEW claim to CLAIMS_OFFICER", async () => {
    vi.mocked(getClaims).mockResolvedValue([LOCATED_CLAIM]);
    vi.mocked(getFieldAdjusters).mockResolvedValue([LOCATED_ADJUSTER]);

    const user = setupUserEvent();
    await renderPage();

    const claimElements = await screen.findAllByText("CLM-PIN-1");
    await user.click(claimElements[0]);

    const assignButtons = screen.getAllByRole("button", { name: /Assign Field Adjuster/i });
    expect(assignButtons.length).toBeGreaterThan(0);
  });

  it("assigns field adjuster from selected claim panel", async () => {
    vi.mocked(getClaims)
      .mockResolvedValueOnce([LOCATED_CLAIM])
      .mockResolvedValueOnce([{ ...LOCATED_CLAIM, status: "PENDING_ACCEPTANCE" }]);
    vi.mocked(getFieldAdjusters).mockResolvedValue([LOCATED_ADJUSTER]);
    vi.mocked(assignClaim).mockResolvedValue({
      id: LOCATED_CLAIM.id,
      claimNumber: "CLM-PIN-1",
      status: "PENDING_ACCEPTANCE",
      priority: "MEDIUM",
      assignedTo: LOCATED_ADJUSTER.id,
      assignedBy: "co-1",
      assignedAt: "2026-09-19T12:00:00.000Z",
    });

    const user = setupUserEvent();
    await renderPage();

    const claimElements = await screen.findAllByText("CLM-PIN-1");
    await user.click(claimElements[0]);

    const assignButtons = screen.getAllByRole("button", { name: /Assign Field Adjuster/i });
    await user.click(assignButtons[0]);

    await user.selectOptions(
      await screen.findByDisplayValue("Select field adjuster"),
      LOCATED_ADJUSTER.id,
    );
    await user.click(screen.getByRole("button", { name: "Save Assignment" }));

    expect(assignClaim).toHaveBeenCalledWith(LOCATED_CLAIM.id, {
      adjusterId: LOCATED_ADJUSTER.id,
      priority: "MEDIUM",
      notes: "",
    });

    expect(getClaims).toHaveBeenCalledTimes(2);
  });

  it("hides Assign button from FIELD_ADJUSTER viewer", async () => {
    authRole.value = "FIELD_ADJUSTER";
    vi.mocked(getClaims).mockResolvedValue([LOCATED_CLAIM]);
    vi.mocked(getFieldAdjusters).mockResolvedValue([LOCATED_ADJUSTER]);

    await renderPage();
    await screen.findAllByText("CLM-PIN-1");

    expect(
      screen.queryByRole("button", { name: /Assign Field Adjuster/i }),
    ).toBeNull();
  });

  it("shows backend error state and lets user retry", async () => {
    const backendError = Object.assign(
      new Error("Request failed with status code 500"),
      {
        isAxiosError: true,
        response: { status: 500, data: { message: "Something exploded" } },
      },
    );
    vi.mocked(getClaims).mockRejectedValue(backendError);
    vi.mocked(getFieldAdjusters).mockResolvedValue([]);

    const user = setupUserEvent();
    await renderPage();

    expect(await screen.findByText("Something exploded")).toBeTruthy();

    vi.mocked(getClaims).mockResolvedValue([LOCATED_CLAIM]);

    const retryButtons = await screen.findAllByRole("button", {
      name: /Try Again/i,
    });
    await user.click(retryButtons[0]);

    const claimElements = await screen.findAllByText("CLM-PIN-1");
    expect(claimElements.length).toBeGreaterThan(0);
  });

  it("is centred on the West Bank by default (single map, regional view)", async () => {
    vi.mocked(getClaims).mockResolvedValue([]);
    vi.mocked(getFieldAdjusters).mockResolvedValue([]);

    await renderPage();

    const map = await screen.findByTestId("map");
    expect(map.getAttribute("data-center")).toBe(JSON.stringify([31.9, 35.3]));
    expect(map.getAttribute("data-zoom")).toBe("10");
  });

  it("surfaces the reported incident text and warns for a text-only claim (no marker invented)", async () => {
    vi.mocked(getClaims).mockResolvedValue([PLAIN_CLAIM]);
    vi.mocked(getFieldAdjusters).mockResolvedValue([]);
    vi.mocked(getClaimById).mockResolvedValue(
      makeDetails(PLAIN_CLAIM, "شارع الملك فهد، رام الله"),
    );

    const user = setupUserEvent();
    await renderPage();

    const claimElements = await screen.findAllByText("CLM-NO-PIN");
    await user.click(claimElements[0]);

    // Single source of truth: GET /claims/:id supplies the incident text.
    expect(getClaimById).toHaveBeenCalledWith(PLAIN_CLAIM.id);
    expect(
      await screen.findByText("شارع الملك فهد، رام الله"),
    ).toBeTruthy();

    // No coordinates → the dispatch panel warns explicitly.
    expect(
      screen.getByText(/Incident coordinates unavailable/i),
    ).toBeTruthy();

    // Text-only claims never get an invented marker.
    expect(screen.queryAllByTestId("marker")).toHaveLength(0);
  });

  it("preselects the SAME adjuster id when choosing an adjuster from the map popup (no duplicate adjuster fetch)", async () => {
    vi.mocked(getClaims).mockResolvedValue([LOCATED_CLAIM]);
    vi.mocked(getFieldAdjusters).mockResolvedValue([LOCATED_ADJUSTER]);

    const user = setupUserEvent();
    await renderPage();

    const claimElements = await screen.findAllByText("CLM-PIN-1");
    await user.click(claimElements[0]);
    await screen.findByText("Selected Claim");

    // The adjuster popup exposes "اختيار المعاين".
    await user.click(
      screen.getAllByRole("button", { name: /اختيار المعاين/i })[0],
    );

    // The assign modal opens with that EXACT adjuster preselected.
    expect(await screen.findByDisplayValue(/Aya.*FA-001/)).toBeTruthy();

    await user.click(screen.getByRole("button", { name: "Save Assignment" }));

    expect(assignClaim).toHaveBeenCalledTimes(1);
    expect(assignClaim).toHaveBeenCalledWith(LOCATED_CLAIM.id, {
      adjusterId: LOCATED_ADJUSTER.id,
      priority: "MEDIUM",
      notes: "",
    });

    // Single dataset rule: the assignment modal used the pins' dataset — only
    // the page-load fetch + the claim-scoped fetch ever hit the endpoint.
    const claimScopedCalls = vi
      .mocked(getFieldAdjusters)
      .mock.calls.filter(([id]) => id === LOCATED_CLAIM.id);
    expect(claimScopedCalls).toHaveLength(1);
  });

  it("DEMO mode: pins adjusters whose backend location is null, clearly labelled", async () => {
    vi.mocked(getClaims).mockResolvedValue([LOCATED_CLAIM]);
    vi.mocked(getFieldAdjusters).mockResolvedValue([
      { ...LOCATED_ADJUSTER, location: null, distanceKm: null },
    ]);

    const user = setupUserEvent();
    await renderPage();

    // Default (off): the adjuster has no coordinates → no pin, only the claim.
    await screen.findAllByText("CLM-PIN-1");
    expect(screen.getAllByTestId("marker")).toHaveLength(1);

    await user.click(screen.getByRole("button", { name: /DEMO Locations/i }));

    // Demo banner + a simulated adjuster pin now appears on the map.
    expect(await screen.findByText(/DEMO mode on/i)).toBeTruthy();
    expect(screen.getAllByTestId("marker")).toHaveLength(2);
    expect(screen.getByText("Aya")).toBeTruthy();
    expect(screen.queryByText("الموقع غير متوفر")).toBeNull();
  });

  it("DEMO mode: computes claim-relative distances and surfaces the nearest adjuster", async () => {
    vi.mocked(getClaims).mockResolvedValue([LOCATED_CLAIM]);
    vi.mocked(getFieldAdjusters).mockResolvedValue([
      { ...MOVING_ADJUSTER, location: null, distanceKm: null },
      { ...LOCATED_ADJUSTER, location: null, distanceKm: null },
    ]);

    const user = setupUserEvent();
    await renderPage();

    await user.click(screen.getByRole("button", { name: /DEMO Locations/i }));
    await screen.findByText(/DEMO mode on/i);

    const claimElements = await screen.findAllByText("CLM-PIN-1");
    await user.click(claimElements[0]);

    // Nearest-adjuster summary appears once a claim is selected.
    expect(await screen.findByText(/Nearest Adjuster/)).toBeTruthy();

    // Demo rows show a computed distance with the DEMO tag.
    const demoDistances = await screen.findAllByText(/\.\d{2} km · DEMO/);
    expect(demoDistances.length).toBe(2);
    expect(screen.queryByText("الموقع غير متوفر")).toBeNull();
  });

  it("deep-link from the claims list: /map?claim=<id> selects the claim WITHOUT auto-opening the assign form", async () => {
    vi.mocked(getClaims).mockResolvedValue([LOCATED_CLAIM]);
    vi.mocked(getFieldAdjusters).mockResolvedValue([LOCATED_ADJUSTER]);

    render(
      <MemoryRouter initialEntries={["/?claim=id-CLM-PIN-1"]}>
        <MapPage />
      </MemoryRouter>,
    );

    // Claim selected directly with its claim-scoped adjusters (nearest list)…
    expect(await screen.findByText("Selected Claim")).toBeTruthy();
    expect(getFieldAdjusters).toHaveBeenCalledWith(LOCATED_CLAIM.id);

    // …and the assign modal is NOT auto-opened — the officer reviews the
    // nearest adjuster and presses Assign on the panel to open the form.
    expect(
      screen.queryByRole("heading", { name: "Assign Field Adjuster" }),
    ).toBeNull();
  });

  it("deep-link with a non-NEW claim selects it but never opens the assign modal", async () => {
    const inProgressClaim = makeClaim({
      claimNumber: "CLM-NON-NEW",
      status: "IN_PROGRESS",
      incidentCoordinates: null,
    });
    vi.mocked(getClaims).mockResolvedValue([inProgressClaim]);
    vi.mocked(getFieldAdjusters).mockResolvedValue([]);

    render(
      <MemoryRouter initialEntries={["/?claim=id-CLM-NON-NEW"]}>
        <MapPage />
      </MemoryRouter>,
    );

    expect(await screen.findByText("Selected Claim")).toBeTruthy();
    expect(
      screen.queryByRole("heading", { name: "Assign Field Adjuster" }),
    ).toBeNull();
  });
});