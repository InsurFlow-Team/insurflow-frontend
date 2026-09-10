// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { fillClaimForm, setupUserEvent } from "../test/test-utils";

// DOM tests exercise full-form typing through React act(); give them room.
vi.setConfig({ testTimeout: 20000 });

const { authRole } = vi.hoisted(() => ({
  authRole: { value: "CLAIMS_OFFICER" as string },
}));

vi.mock("../contexts/AuthContext", () => ({
  useAuth: () => ({ user: { role: authRole.value } }),
}));

vi.mock("../api/users.service", () => ({
  getUsers: vi.fn(),
  getFieldAdjusters: vi.fn(),
}));

vi.mock("../api/claims.service", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../api/claims.service")>();
  return {
    ...actual,
    getClaims: vi.fn(),
    createClaim: vi.fn(),
    assignClaim: vi.fn(),
  };
});

import { getClaims, createClaim, assignClaim } from "../api/claims.service";
import { getFieldAdjusters } from "../api/users.service";
import ClaimsList from "./ClaimsList";
import type { ClaimSummary } from "../types";

const FULL_ROW: ClaimSummary = {
  id: "clm-1",
  claimNumber: "CLM-2026-0001",
  status: "NEW",
  customerName: "Ahmed Ibrahim",
  initialPlateNumber: "ABC-1234",
  createdAt: "2026-08-26T15:00:00.000Z",
  updatedAt: "2026-08-26T16:00:00.000Z",
};

const CREATED_ROW: ClaimSummary = {
  id: "clm-new",
  claimNumber: "CLM-2026-0099",
  status: "NEW",
  customerName: "Ahmed Ibrahim",
  initialPlateNumber: "ABC-1234",
  createdAt: "2026-09-09T10:00:00.000Z",
};

const CLAIM_NUMBER_TEXT = "CLM-2026-0001";

const ADJUSTER = {
  id: "651a1f8b7f1d2c001f8d4e92",
  name: "Aya",
  employeeCode: "FA-001",
  role: "FIELD_ADJUSTER",
  organizationId: "org-1",
  organizationName: "InsurFlow",
  status: "ACTIVE",
  availability: "AVAILABLE",
  activeTasksCount: 0,
} as const;

beforeEach(() => {
  vi.mocked(getFieldAdjusters).mockResolvedValue([]);
});

afterEach(() => {
  cleanup();
});

async function renderPage() {
  const utils = render(
    <MemoryRouter>
      <ClaimsList />
    </MemoryRouter>,
  );
  return utils;
}

async function openCreateModal() {
  const user = setupUserEvent();
  await user.click(await screen.findByRole("button", { name: "Add Claim" }));
  await screen.findByText("Create New Claim");
}

describe("ClaimsList", () => {
  it("loads claims from GET /claims and renders them (no render loop)", async () => {
    vi.mocked(getClaims).mockResolvedValue([FULL_ROW]);

    await renderPage();

    expect(await screen.findByText(CLAIM_NUMBER_TEXT)).toBeTruthy();
    expect(screen.getByText("Ahmed Ibrahim")).toBeTruthy();
    expect(screen.getByText("ABC-1234")).toBeTruthy();
    expect(screen.getAllByRole("link", { name: /View Details/i }).length).toBe(1);
  });

  it("after creating a claim, refetches the list and shows exactly one row with no duplicate", async () => {
    vi.mocked(getClaims)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([CREATED_ROW]);
    vi.mocked(createClaim).mockResolvedValue({
      id: "clm-new",
      claimNumber: "CLM-2026-0099",
      status: "NEW",
      customerName: "Ahmed Ibrahim",
      initialPlateNumber: "ABC-1234",
      createdAt: "2026-09-09T10:00:00.000Z",
    });

    const { container } = await renderPage();
    await openCreateModal();
    await fillClaimForm(container);

    const user = setupUserEvent();
    await user.click(screen.getByRole("button", { name: /Create Claim/i }));

    expect(await screen.findByText("CLM-2026-0099")).toBeTruthy();

    // POST payload contains ONLY the five verified contract fields — no
    // accidentDate/accidentTime/description/damageDescription ever reach the API.
    expect(createClaim).toHaveBeenCalledWith({
      customerName: "Ahmed Ibrahim",
      customerPhone: "0512345678",
      initialPlateNumber: "ABC-1234",
      incidentType: "COLLISION",
      incidentLocation: "Riyadh - King Fahd Road",
    });

    // The list was refreshed from GET /claims (initial + post-create refresh).
    expect(getClaims).toHaveBeenCalledTimes(2);

    // Exactly one row for the created claim — no fabricated duplicate.
    expect(screen.getAllByText("CLM-2026-0099")).toHaveLength(1);

    // Success feedback is shown with the real claimNumber from the backend.
    expect(screen.getByText(/CLM-2026-0099 created successfully/)).toBeTruthy();
  });

  it("shows the backend error and keeps the modal open when POST /claims returns 400 (unsupported fields)", async () => {
    vi.mocked(getClaims).mockResolvedValue([]);
    const backendError = Object.assign(
      new Error("Request failed with status code 400"),
      {
        isAxiosError: true,
        response: {
          status: 400,
          data: {
            message:
              "Only fields [customerName, customerPhone, initialPlateNumber, incidentType, incidentLocation] are accepted",
          },
        },
      },
    );
    vi.mocked(createClaim).mockRejectedValue(backendError);

    const { container } = await renderPage();
    await openCreateModal();
    await fillClaimForm(container);

    const user = setupUserEvent();
    await user.click(screen.getByRole("button", { name: /Create Claim/i }));

    // The backend's 400 message is shown both in the page feedback banner
    // and inside the modal, keeping the reason visible.
    const errorBanners = await screen.findAllByText(
      /Only fields \[customerName, customerPhone/i,
    );
    expect(errorBanners.length).toBeGreaterThanOrEqual(1);

    // Modal must stay open so the user can correct the form.
    expect(screen.getByText("Create New Claim")).toBeTruthy();

    expect(getClaims).toHaveBeenCalledTimes(1);
  });

  it("renders gracefully when a row is malformed (missing customer/createdAt)", async () => {
    vi.mocked(getClaims).mockResolvedValue([
      { id: "clm-x", claimNumber: "CLM-X" } as unknown as ClaimSummary,
    ]);

    await renderPage();

    expect(await screen.findByText("CLM-X")).toBeTruthy();
    // Missing customer/vehicle/date render as dashes instead of crashing.
    expect(screen.getAllByText("—").length).toBeGreaterThan(0);
  });

  it("renders an empty list message when GET /claims returns no rows", async () => {
    vi.mocked(getClaims).mockResolvedValue([]);

    await renderPage();

    expect(await screen.findByText("No claims found.")).toBeTruthy();
  });

  it("lets a CLAIMS_OFFICER assign a NEW claim straight from the list row", async () => {
    authRole.value = "CLAIMS_OFFICER";
    vi.mocked(getClaims)
      .mockResolvedValueOnce([FULL_ROW])
      .mockResolvedValueOnce([{ ...FULL_ROW, status: "ASSIGNED" }]);
    vi.mocked(getFieldAdjusters).mockResolvedValue([ADJUSTER]);
    vi.mocked(assignClaim).mockResolvedValue({
      id: "clm-1",
      claimNumber: "CLM-2026-0001",
      status: "ASSIGNED",
      priority: "MEDIUM",
      assignedTo: ADJUSTER.id,
      assignedBy: "co-1",
      assignedAt: "2026-09-09T11:50:00.000Z",
    });

    const user = setupUserEvent();
    await renderPage();

    const assignButton = await screen.findByRole("button", { name: /Assign/i });
    await user.click(assignButton);

    // Real backend adjuster (real ObjectId) is loaded, never a hardcoded one.
    await user.selectOptions(
      await screen.findByDisplayValue("Select field adjuster"),
      ADJUSTER.id,
    );
    await user.click(screen.getByRole("button", { name: "Save Assignment" }));

    expect(assignClaim).toHaveBeenCalledWith("clm-1", {
      adjusterId: ADJUSTER.id,
      priority: "MEDIUM",
      notes: "",
    });

    expect(
      await screen.findByText(/CLM-2026-0001 assigned successfully/i),
    ).toBeTruthy();

    // List refreshed from GET /claims (initial + post-assign) so the row status
    // comes from the backend, not from local patching.
    expect(getClaims).toHaveBeenCalledTimes(2);
  });

  it("hides the Assign action for non-officer roles (ADMIN) even on NEW claims", async () => {
    authRole.value = "ADMIN";
    vi.mocked(getClaims).mockResolvedValue([FULL_ROW]);

    await renderPage();

    expect(await screen.findByText(CLAIM_NUMBER_TEXT)).toBeTruthy();
    expect(screen.queryByRole("button", { name: /Assign/i })).toBeFalsy();
  });
});