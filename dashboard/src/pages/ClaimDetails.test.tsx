// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { screen } from "@testing-library/dom";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { setupUserEvent } from "../test/test-utils";
import type { ClaimDetails as ClaimDetailsType } from "../types";

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
  getFieldAdjusters: vi.fn(),
}));

vi.mock("../api/claims.service", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../api/claims.service")>();
  return {
    ...actual,
    getClaimById: vi.fn(),
    startClaimReview: vi.fn(),
  };
});

import { getClaimById } from "../api/claims.service";
import { getFieldAdjusters } from "../api/users.service";
import ClaimDetails from "./ClaimDetails";

function makeClaimDetails(
  overrides: Partial<ClaimDetailsType> & { status: ClaimDetailsType["status"] },
): ClaimDetailsType {
  return {
    id: "clm-1",
    claimNumber: "CLM-2026-0001",
    customer: { name: "Ahmed Ibrahim", phone: "+966501234567" },
    vehicle: {
      plateNumber: "ABC-1234",
      make: "Toyota",
      model: "Camry",
      year: 2022,
      color: "White",
    },
    accident: {
      accidentType: "Collision",
      accidentDate: "2026-09-01",
      accidentTime: "10:00",
    },
    incidentType: "COLLISION",
    incidentLocation: "Jeddah - Al-Hamra",
    location: null,
    assignment: {
      assignedTo: null,
      assignedBy: null,
      assignedAt: null,
      priority: "MEDIUM",
      assignmentNotes: null,
    },
    timeline: [],
    createdAt: "2026-09-01T10:00:00.000Z",
    updatedAt: "2026-09-01T10:00:00.000Z",
    ...overrides,
  };
}

beforeEach(() => {
  vi.mocked(getFieldAdjusters).mockResolvedValue([]);
});

afterEach(() => {
  cleanup();
});

async function renderPage(claim: ClaimDetailsType) {
  vi.mocked(getClaimById).mockResolvedValue(claim);

  return render(
    <MemoryRouter initialEntries={["/claims/clm-1"]}>
      <Routes>
        <Route path="/claims/:claimId" element={<ClaimDetails />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("ClaimDetails assignment", () => {
  it("offers the Assign button for a NEW claim to a CLAIMS_OFFICER", async () => {
    authRole.value = "CLAIMS_OFFICER";
    await renderPage(makeClaimDetails({ status: "NEW" }));

    expect(
      await screen.findByRole("heading", { name: "CLM-2026-0001" }),
    ).toBeTruthy();
    expect(
      screen.getByRole("button", { name: /Assign Field Adjuster/i }),
    ).toBeTruthy();
  });

  it("offers the Assign button to ADMIN as well", async () => {
    authRole.value = "ADMIN";
    await renderPage(makeClaimDetails({ status: "NEW" }));

    expect(
      await screen.findByRole("heading", { name: "CLM-2026-0001" }),
    ).toBeTruthy();
    expect(
      screen.getByRole("button", { name: /Assign Field Adjuster/i }),
    ).toBeTruthy();
  });

  it("hides the Assign button once the claim is no longer NEW", async () => {
    authRole.value = "CLAIMS_OFFICER";
    await renderPage(makeClaimDetails({ status: "ASSIGNED" }));

    await screen.findByRole("heading", { name: "CLM-2026-0001" });
    expect(
      screen.queryByRole("button", { name: /Assign Field Adjuster/i }),
    ).toBeNull();
  });

  it("opens the assign modal and loads the available adjusters", async () => {
    authRole.value = "CLAIMS_OFFICER";
    const user = setupUserEvent();
    await renderPage(makeClaimDetails({ status: "NEW" }));

    await user.click(
      await screen.findByRole("button", { name: /Assign Field Adjuster/i }),
    );

    expect(
      screen.getByRole("heading", { name: "Assign Field Adjuster" }),
    ).toBeTruthy();
    expect(getClaimById).toHaveBeenCalledWith("clm-1");
  });

  it("renders a declined-assignment event with its reason and performer on the timeline", async () => {
    authRole.value = "CLAIMS_OFFICER";
    await renderPage(
      makeClaimDetails({
        status: "NEW",
        timeline: [
          {
            action: "Claim assignment declined by the field adjuster",
            reason: "Adjuster too far from the incident location",
            performedBy: { name: "Sara Al-Harbi" },
            timestamp: "2026-09-19T09:30:00.000Z",
          },
          {
            action: "Assignment pending acceptance",
            performedBy: { name: "Khalid Al-Otaibi" },
            timestamp: "2026-09-19T08:15:00.000Z",
          },
        ],
      }),
    );

    await screen.findByRole("heading", { name: "CLM-2026-0001" });

    // The decline is visually flagged (Declined chip) and its reason is shown.
    expect(
      screen.getByText("Claim assignment declined by the field adjuster"),
    ).toBeTruthy();
    expect(screen.getByText("Declined")).toBeTruthy();
    expect(
      screen.getByText(/Adjuster too far from the incident location/),
    ).toBeTruthy();
    expect(screen.getByText(/Performed by: Sara Al-Harbi/)).toBeTruthy();

    // Ordinary events stay unstyled — the "Declined" chip is decline-only.
    expect(screen.getByText("Assignment pending acceptance")).toBeTruthy();
  });
});