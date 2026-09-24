// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { screen } from "@testing-library/dom";
import { MemoryRouter, Routes, Route, useParams, useLocation } from "react-router-dom";
import { fillClaimForm, setupUserEvent } from "../test/test-utils";

// DOM tests exercise full-form typing through React act(); give them room.
vi.setConfig({ testTimeout: 20000 });

const { authRole } = vi.hoisted(() => ({
  authRole: { value: "CLAIMS_OFFICER" as string },
}));

vi.mock("../contexts/AuthContext", () => ({
  useAuth: () => ({ user: { role: authRole.value } }),
}));

vi.mock("../contexts/ToastContext", () => ({
  toast: vi.fn(),
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

vi.mock("../api/policy.service", () => ({
  verifyPolicy: vi.fn(),
}));

import { getClaims, createClaim } from "../api/claims.service";
import { verifyPolicy } from "../api/policy.service";
import ClaimsList from "./ClaimsList";
import type { ClaimSummary, PolicyVerificationResponse } from "../types";

const VERIFIED_POLICY: PolicyVerificationResponse = {
  isEligible: true,
  policy: {
    id: "policy-uuid-123",
    policyNumber: "POL-1000203",
    status: "ACTIVE",
    startDate: "2026-01-01T00:00:00.000Z",
    expiryDate: "2026-12-31T23:59:59.000Z",
  },
  vehicle: {
    id: "vehicle-uuid-456",
    plateNumber: "ABC-1234",
    make: "Toyota",
    model: "Camry",
    year: 2022,
    color: "White",
  },
  customer: {
    id: "customer-uuid-789",
    fullName: "Ahmed Ibrahim",
    phone: "0512345678",
  },
};

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

beforeEach(() => {
  vi.mocked(getClaims).mockReset();
  vi.mocked(verifyPolicy).mockReset();
  vi.mocked(verifyPolicy).mockResolvedValue(VERIFIED_POLICY);
});

afterEach(() => {
  cleanup();
});

function DetailsStub() {
  const { claimId } = useParams<{ claimId: string }>();
  return <div>Details for {claimId}</div>;
}

// The list's Assign action deep-links to the dispatch map with ?claim=<id>;
// this stub records the target path+search instead of rendering the real map.
function MapStub() {
  const location = useLocation();
  return <div>map-stub:{location.pathname}{location.search}</div>;
}

async function renderPage() {
  const utils = render(
    <MemoryRouter initialEntries={["/claims"]}>
      <Routes>
        <Route path="/claims" element={<ClaimsList />} />
        <Route path="/claims/:claimId" element={<DetailsStub />} />
        <Route path="/map" element={<MapStub />} />
      </Routes>
    </MemoryRouter>,
  );
  return utils;
}

// The claim intake flow is gated by policy verification: Add Claim → verify a
// policy → only then does the existing intake form open.
async function openCreateModal(policyNumber = "POL-1000203", plateNumber = "ABC-1234") {
  const user = setupUserEvent();
  await user.click(await screen.findByRole("button", { name: "Add Claim" }));

  const policyInput = await screen.findByPlaceholderText("POL-1234567");
  await user.type(policyInput, policyNumber);

  const plateInput = await screen.findByPlaceholderText("ABC-1234");
  await user.type(plateInput, plateNumber);

  await user.click(screen.getByRole("button", { name: /التحقق من البوليصة/i }));

  await user.click(
    await screen.findByRole("button", { name: /المتابعة لإنشاء المطالبة/i }),
  );
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

  it("after creating a claim, navigates directly to its details page using the created id", async () => {
    vi.mocked(getClaims).mockResolvedValue([]);
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

    // The intake flow is gated: the policy was verified before the form opened.
    expect(verifyPolicy).toHaveBeenCalledWith({
      policyNumber: "POL-1000203",
      plateNumber: expect.any(String),
      incidentDate: undefined,
    });

    const user = setupUserEvent();
    await user.click(screen.getByRole("button", { name: /Create Claim/i }));

    // The user lands directly on the Claim Details page for the created claim.
    expect(await screen.findByText("Details for clm-new")).toBeTruthy();

    // POST payload contains ONLY the verified contract fields from policy verification
    // plus incident details. Incident location is text-only — no coordinates
    // (ruling 2026-09-24).
    expect(createClaim).toHaveBeenCalledWith({
      policyId: "policy-uuid-123",
      plateNumber: "ABC-1234",
      incidentType: "COLLISION",
      incidentLocation: "Riyadh - King Fahd Road",
      incidentDate: expect.any(String),
    });
    expect(createClaim).not.toHaveBeenCalledWith(
      expect.objectContaining({ latitude: expect.anything() }),
    );
    expect(createClaim).not.toHaveBeenCalledWith(
      expect.objectContaining({ longitude: expect.anything() }),
    );

    // Exactly one create request — no duplicate submission.
    expect(createClaim).toHaveBeenCalledTimes(1);
  });

  it("does not return to policy verification once the intake form is open, and verifies exactly once", async () => {
    vi.mocked(getClaims).mockResolvedValue([]);

    await renderPage();
    await openCreateModal();

    expect(screen.getByText("Create New Claim")).toBeTruthy();

    // The verification step is gone while the intake form is open — the fixed
    // regression: Continue must never bounce the user back to the verification
    // modal.
    expect(
      screen.queryByRole("button", { name: /التحقق من البوليصة/i }),
    ).toBeNull();
    expect(
      screen.queryByRole("button", { name: /المتابعة لإنشاء المطالبة/i }),
    ).toBeNull();

    // Verification ran exactly once in the whole flow.
    expect(verifyPolicy).toHaveBeenCalledTimes(1);

    // Verified customer/vehicle data is carried into the intake (read-only).
    expect(screen.getAllByText("Ahmed Ibrahim").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("ABC-1234").length).toBeGreaterThanOrEqual(1);
  });

  it("builds the create payload only from the verified policy and incident fields (never customer/vehicle form input)", async () => {
    vi.mocked(getClaims).mockResolvedValue([]);
    vi.mocked(createClaim).mockResolvedValue(CREATED_ROW);

    const { container } = await renderPage();
    await openCreateModal();
    await fillClaimForm(container);

    const user = setupUserEvent();
    await user.click(screen.getByRole("button", { name: /Create Claim/i }));

    // Success navigates straight to the claim details (id from the response).
    await screen.findByText("Details for clm-new");

    expect(createClaim).toHaveBeenCalledTimes(1);
    expect(createClaim).toHaveBeenCalledWith(
      expect.not.objectContaining({ customerName: expect.anything() }),
    );
    expect(createClaim).toHaveBeenCalledWith(
      expect.not.objectContaining({ customerPhone: expect.anything() }),
    );
    expect(createClaim).toHaveBeenCalledWith(
      expect.not.objectContaining({ initialPlateNumber: expect.anything() }),
    );
    expect(createClaim).toHaveBeenCalledWith(
      expect.not.objectContaining({ vehicleMake: expect.anything() }),
    );
    expect(createClaim).toHaveBeenCalledWith(
      expect.not.objectContaining({ vehicleModel: expect.anything() }),
    );
    expect(createClaim).toHaveBeenCalledWith(
      expect.not.objectContaining({ vehicleYear: expect.anything() }),
    );
    expect(createClaim).toHaveBeenCalledWith(
      expect.not.objectContaining({ vehicleColor: expect.anything() }),
    );
  });

  it("keeps a successful create a success when the post-create list refresh fails", async () => {
    vi.mocked(getClaims)
      .mockResolvedValueOnce([FULL_ROW])
      .mockRejectedValueOnce(
        Object.assign(new Error("Request failed with status code 500"), {
          isAxiosError: true,
          response: {
            status: 500,
            data: { success: false, message: "Server exploded" },
          },
        }),
      );
    vi.mocked(createClaim).mockResolvedValue(CREATED_ROW);

    const { container } = await renderPage();
    await openCreateModal();
    await fillClaimForm(container);

    const user = setupUserEvent();
    await user.click(screen.getByRole("button", { name: /Create Claim/i }));

    // Creation is committed: the user is taken straight to the claim details
    // even though the background list refresh failed.
    expect(await screen.findByText("Details for clm-new")).toBeTruthy();
    // …exactly one create request was made (no duplicate-creating retry)…
    expect(createClaim).toHaveBeenCalledTimes(1);
    // …and no "creation failed" message ever appears.
    expect(screen.queryByText("Create New Claim")).toBeNull();
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

  it("does not reach the claim intake form when policy verification fails", async () => {
    vi.mocked(getClaims).mockResolvedValue([]);
    vi.mocked(verifyPolicy).mockRejectedValue(
      Object.assign(new Error("Policy not found. Check the number and try again."), {
        isAxiosError: true,
        response: {
          status: 404,
          data: {
            success: false,
            message: "Policy not found. Check the number and try again.",
            errors: [
              {
                code: "POLICY_NOT_FOUND",
                details: "Policy not found. Check the number and try again.",
              },
            ],
          },
        },
      }),
    );

    const user = setupUserEvent();
    await renderPage();

    await user.click(await screen.findByRole("button", { name: "Add Claim" }));
    await user.type(
      await screen.findByPlaceholderText("POL-1234567"),
      "00000000",
    );
    await user.click(screen.getByRole("button", { name: /التحقق من البوليصة/i }));

    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toMatch(/غير موجودة/);

    // The gate holds: no continue action, no intake form, and no claim API call.
    expect(
      screen.queryByRole("button", { name: /المتابعة لإنشاء المطالبة/i }),
    ).toBeNull();
    expect(screen.queryByText("Create New Claim")).toBeNull();
    expect(createClaim).not.toHaveBeenCalled();
  });

  it("renders an empty list message when GET /claims returns no rows", async () => {
    vi.mocked(getClaims).mockResolvedValue([]);

    await renderPage();

    expect(await screen.findByText("No claims found.")).toBeTruthy();
  });

  it("deep-links a CLAIMS_OFFICER to the dispatch map when Assign is pressed", async () => {
    authRole.value = "CLAIMS_OFFICER";
    vi.mocked(getClaims).mockResolvedValue([FULL_ROW]);

    const user = setupUserEvent();
    await renderPage();

    const assignButton = await screen.findByRole("button", { name: /Assign/i });
    await user.click(assignButton);

    // Assignment happens on the Dispatch Map, taking the claim with it.
    expect(
      await screen.findByText(/map-stub:\/map\?claim=clm-1/),
    ).toBeTruthy();
    expect(screen.queryByText("Assign Field Adjuster")).toBeNull();
  });

  it("deep-links an ADMIN to the dispatch map when Assign is pressed", async () => {
    authRole.value = "ADMIN";
    vi.mocked(getClaims).mockResolvedValue([FULL_ROW]);

    const user = setupUserEvent();
    await renderPage();

    const assignButton = await screen.findByRole("button", { name: /Assign/i });
    await user.click(assignButton);

    expect(
      await screen.findByText(/map-stub:\/map\?claim=clm-1/),
    ).toBeTruthy();
    expect(screen.queryByText("Assign Field Adjuster")).toBeNull();
  });
});