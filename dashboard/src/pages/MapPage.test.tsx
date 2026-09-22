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
    assignClaim: vi.fn(),
  };
});

vi.mock("react-leaflet", () => ({
  MapContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="map">{children}</div>
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

import { getClaims, assignClaim } from "../api/claims.service";
import { getFieldAdjusters } from "../api/users.service";
import MapPage from "./MapPage";
import type { ClaimSummary, FieldAdjuster } from "../types";

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

beforeEach(() => {
  authRole.value = "CLAIMS_OFFICER";
  vi.mocked(getClaims).mockReset();
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
});