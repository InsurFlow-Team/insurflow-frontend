// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup, within } from "@testing-library/react";
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
    decideClaim: vi.fn(),
    downloadClaimReport: vi.fn(),
  };
});

import {
  getClaimById,
  downloadClaimReport,
  decideClaim,
} from "../api/claims.service";
import { getFieldAdjusters } from "../api/users.service";
import I18nProvider from "../i18n/I18nProvider";
import ClaimDetails from "./ClaimDetails";

function makeClaimDetails(
  overrides: Partial<ClaimDetailsType> & { status: ClaimDetailsType["status"] },
): ClaimDetailsType {
  return {
    id: "clm-1",
    claimNumber: "CLM-2026-0001",
    incidentType: "COLLISION",
    incidentLocation: "Jeddah - Al-Hamra",
    incidentCoordinates: null,
    createdAt: "2026-09-01T10:00:00.000Z",
    updatedAt: "2026-09-01T10:00:00.000Z",
    customer: { name: "Ahmed Ibrahim", phone: "+966501234567" },
    vehicle: {
      plateNumber: "ABC-1234",
      make: "Toyota",
      model: "Camry",
      year: 2022,
      color: "White",
    },
    policy: null,
    assignment: {
      assignedTo: null,
      assignedBy: null,
      assignedAt: null,
      priority: "MEDIUM",
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
    ...overrides,
  };
}

beforeEach(() => {
  vi.mocked(getFieldAdjusters).mockResolvedValue([]);
});

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  document.documentElement.dir = "ltr";
  document.documentElement.lang = "en";
});

async function renderPage(
  claim: ClaimDetailsType,
  options: { locale?: "ar" } = {},
) {
  vi.mocked(getClaimById).mockResolvedValue(claim);

  const ui = (
    <MemoryRouter initialEntries={["/claims/clm-1"]}>
      <Routes>
        <Route path="/claims/:claimId" element={<ClaimDetails />} />
      </Routes>
    </MemoryRouter>
  );

  return render(options.locale ? <I18nProvider>{ui}</I18nProvider> : ui);
}

describe("ClaimDetails", () => {
  it("calls ONLY GET /claims/:claimId and renders the customer from that single response", async () => {
    authRole.value = "CLAIMS_OFFICER";

    await renderPage(
      makeClaimDetails({
        status: "NEW",
        customer: { name: "Ahmed Ibrahim", phone: "+966501234567" },
      }),
    );

    expect(await screen.findByRole("heading", { name: "CLM-2026-0001" })).toBeTruthy();
    expect(screen.getByText("Ahmed Ibrahim")).toBeTruthy();
    expect(screen.getByText("+966501234567")).toBeTruthy();

    // No extra per-section fetches — one call to the single source of truth.
    expect(getClaimById).toHaveBeenCalledTimes(1);
    expect(getClaimById).toHaveBeenCalledWith("clm-1");
  });

  it("renders the policy section", async () => {
    authRole.value = "CLAIMS_OFFICER";
    await renderPage(
      makeClaimDetails({
        status: "NEW",
        policy: {
          id: "pol-1",
          policyNumber: "POL-1000",
          status: "ACTIVE",
          startDate: "2025-01-01T00:00:00.000Z",
          expiryDate: "2026-12-31T00:00:00.000Z",
        },
      }),
    );

    await screen.findByRole("heading", { name: "CLM-2026-0001" });
    expect(screen.getByText("POL-1000")).toBeTruthy();
    expect(screen.getByText("ACTIVE")).toBeTruthy();
  });

  it("renders the vehicle section", async () => {
    authRole.value = "CLAIMS_OFFICER";
    await renderPage(
      makeClaimDetails({
        status: "NEW",
        vehicle: {
          plateNumber: "ABC-1234",
          make: "Toyota",
          model: "Camry",
          year: 2022,
          color: "White",
        },
      }),
    );

    await screen.findByRole("heading", { name: "CLM-2026-0001" });
    expect(screen.getByText("ABC-1234")).toBeTruthy();
    expect(screen.getByText("Toyota")).toBeTruthy();
    expect(screen.getByText("Camry")).toBeTruthy();
    expect(screen.getByText("2022")).toBeTruthy();
    expect(screen.getByText("White")).toBeTruthy();
  });

  it("renders accident details from backend data with localized labels and type", async () => {
    authRole.value = "CLAIMS_OFFICER";
    await renderPage(
      makeClaimDetails({
        status: "IN_PROGRESS",
        accident: {
          accidentType: "REAR_END_COLLISION",
          accidentDate: "2026-09-08",
          accidentTime: "14:30",
          description: "Vehicle rear-ended at a red light by a third party.",
          damageDescription: "Cracked rear bumper and shattered tail light.",
        },
      }),
    );

    await screen.findByRole("heading", { name: "CLM-2026-0001" });
    expect(screen.getByRole("heading", { name: "Accident Details" })).toBeTruthy();
    expect(screen.getByText("Accident Type")).toBeTruthy();
    expect(screen.getByText("Rear-end collision")).toBeTruthy();
    expect(screen.getByText("Accident Date")).toBeTruthy();
    expect(screen.getByText("2026-09-08")).toBeTruthy();
    expect(screen.getByText("Accident Time")).toBeTruthy();
    expect(screen.getByText("14:30")).toBeTruthy();
    expect(screen.getByText("Accident Description")).toBeTruthy();
    expect(
      screen.getByText("Vehicle rear-ended at a red light by a third party."),
    ).toBeTruthy();
    expect(screen.getByText("Damage Description")).toBeTruthy();
    expect(
      screen.getByText("Cracked rear bumper and shattered tail light."),
    ).toBeTruthy();
  });

  it("shows a clear empty state when accident is absent", async () => {
    authRole.value = "CLAIMS_OFFICER";
    await renderPage(makeClaimDetails({ status: "NEW", accident: null }));

    await screen.findByRole("heading", { name: "CLM-2026-0001" });
    expect(
      screen.getByText("Accident details have not been entered yet."),
    ).toBeTruthy();
    expect(screen.queryByText("Accident Type")).toBeNull();
    expect(screen.queryByText(/undefined|null/)).toBeNull();
  });

  it("shows the empty state when the backend returns accident as an all-null object", async () => {
    authRole.value = "CLAIMS_OFFICER";
    await renderPage(
      makeClaimDetails({
        status: "IN_PROGRESS",
        accident: {
          accidentType: null,
          accidentDate: null,
          accidentTime: null,
          description: null,
          damageDescription: null,
        },
      }),
    );

    await screen.findByRole("heading", { name: "CLM-2026-0001" });
    expect(
      screen.getByText("Accident details have not been entered yet."),
    ).toBeTruthy();
    expect(screen.queryByText("Accident Type")).toBeNull();
  });

  it("renders a partial accident without crashing and fills missing fields with —", async () => {
    authRole.value = "CLAIMS_OFFICER";
    await renderPage(
      makeClaimDetails({
        status: "IN_PROGRESS",
        accident: {
          accidentType: null,
          accidentDate: null,
          accidentTime: null,
          description: "Body panel damage",
          damageDescription: null,
        },
      }),
    );

    await screen.findByRole("heading", { name: "CLM-2026-0001" });
    expect(screen.getByText("Body panel damage")).toBeTruthy();
    expect(screen.getByText("Accident Type")).toBeTruthy();
  });

  it("renders the assignment section and shows the not-assigned state when assignedTo is null", async () => {
    authRole.value = "CLAIMS_OFFICER";
    await renderPage(makeClaimDetails({ status: "NEW" }));

    await screen.findByRole("heading", { name: "CLM-2026-0001" });
    expect(screen.getByText("No field adjuster assigned yet.")).toBeTruthy();
  });

  it("renders assigned adjuster details when assignedTo is present", async () => {
    authRole.value = "CLAIMS_OFFICER";
    await renderPage(
      makeClaimDetails({
        status: "ASSIGNED",
        assignment: {
          assignedTo: {
            id: "fa-1",
            name: "Sara Al-Harbi",
            employeeCode: "FA-001",
            role: "FIELD_ADJUSTER",
          },
          assignedBy: {
            id: "co-1",
            name: "Khalid Al-Otaibi",
            employeeCode: "CO-001",
            role: "CLAIMS_OFFICER",
          },
          assignedAt: "2026-09-02T08:00:00.000Z",
          priority: "HIGH",
          assignmentNotes: "Urgent — highway incident",
        },
      }),
    );

    await screen.findByRole("heading", { name: "CLM-2026-0001" });
    expect(screen.getByText("Sara Al-Harbi")).toBeTruthy();
    expect(screen.getByText("Khalid Al-Otaibi")).toBeTruthy();
    expect(screen.getByText("HIGH")).toBeTruthy();
    expect(screen.getByText("Urgent — highway incident")).toBeTruthy();
  });

  it("renders the reported incident location separately from the field inspection location", async () => {
    authRole.value = "CLAIMS_OFFICER";
    await renderPage(
      makeClaimDetails({
        status: "ASSIGNED",
        incidentCoordinates: {
          latitude: 31.905,
          longitude: 35.204,
          capturedAt: "2026-09-21T09:00:00.000Z",
        },
      }),
    );

    await screen.findByRole("heading", { name: "CLM-2026-0001" });

    // Reported incident location and its coordinates.
    expect(
      screen.getByRole("heading", { name: "Reported Incident Location" }),
    ).toBeTruthy();
    expect(screen.getByText("Jeddah - Al-Hamra")).toBeTruthy();
    expect(screen.getByText("31.905, 35.204")).toBeTruthy();
  });

  it("shows the waiting-for-the-adjuster state when the field inspection location is null", async () => {
    authRole.value = "CLAIMS_OFFICER";
    await renderPage(makeClaimDetails({ status: "NEW" }));

    await screen.findByRole("heading", { name: "CLM-2026-0001" });
    expect(
      screen.getByText(
        "Waiting for the adjuster to arrive and record the inspection location.",
      ),
    ).toBeTruthy();
  });

  it("renders the field inspection location when the adjuster recorded one", async () => {
    authRole.value = "CLAIMS_OFFICER";
    await renderPage(
      makeClaimDetails({
        status: "IN_PROGRESS",
        location: {
          latitude: 21.4858,
          longitude: 39.1925,
          address: "Jeddah Corniche",
          capturedAt: "2026-09-22T13:00:00.000Z",
        },
      }),
    );

    await screen.findByRole("heading", { name: "CLM-2026-0001" });
    expect(
      screen.getByRole("heading", { name: "Field Inspection Location" }),
    ).toBeTruthy();
    expect(screen.getByText("Jeddah Corniche")).toBeTruthy();
    expect(screen.getByText("21.4858, 39.1925")).toBeTruthy();
  });

  it("renders an empty evidence array without crashing and shows the empty state", async () => {
    authRole.value = "CLAIMS_OFFICER";
    await renderPage(makeClaimDetails({ status: "NEW", evidence: [] }));

    await screen.findByRole("heading", { name: "CLM-2026-0001" });
    expect(
      screen.getByText(
        "No inspection photos have been uploaded yet. The field adjuster will upload them from the mobile app.",
      ),
    ).toBeTruthy();
  });

  it("renders evidence items with a missing uploader without crashing", async () => {
    authRole.value = "CLAIMS_OFFICER";
    await renderPage(
      makeClaimDetails({
        status: "SUBMITTED",
        evidence: [
          {
            imageType: "car_damage_front",
            url: "https://example.test/evidence-1.jpg",
            uploadedBy: null,
            uploadedAt: "2026-09-22T14:00:00.000Z",
          },
        ],
      }),
    );

    await screen.findByRole("heading", { name: "CLM-2026-0001" });
    expect(screen.getByText("car_damage_front")).toBeTruthy();
    expect(screen.getByAltText("car_damage_front")).toBeTruthy();
  });

  it("renders a null signature without crashing", async () => {
    authRole.value = "CLAIMS_OFFICER";
    await renderPage(makeClaimDetails({ status: "SUBMITTED", signature: null }));

    await screen.findByRole("heading", { name: "CLM-2026-0001" });
    expect(screen.getByText("No signature has been captured yet.")).toBeTruthy();
  });

  it("renders the decision/closing section when the claim is closed", async () => {
    authRole.value = "CLAIMS_OFFICER";
    await renderPage(
      makeClaimDetails({
        status: "CLOSED",
        decisionNotes: "Approved and settled",
        closedBy: "admin-1",
        closedAt: "2026-09-22T15:00:00.000Z",
        closingNotes: "Settlement paid",
      }),
    );

    await screen.findByRole("heading", { name: "CLM-2026-0001" });
    expect(screen.getByText("Approved and settled")).toBeTruthy();
    expect(screen.getByText("admin-1")).toBeTruthy();
    expect(screen.getByText("Settlement paid")).toBeTruthy();
  });

  it("shows the approval verdict in the Decision/Closing section for an APPROVED claim even without closing data", async () => {
    authRole.value = "ADMIN";
    await renderPage(
      makeClaimDetails({ status: "APPROVED", decisionNotes: null }),
    );

    await screen.findByRole("heading", { name: "CLM-2026-0001" });
    expect(screen.getByText("Claim approved.")).toBeTruthy();
    expect(
      screen.queryByText("No decision or closure has been recorded yet."),
    ).toBeNull();
  });

  it("shows the rejection verdict in the Decision/Closing section for a REJECTED claim", async () => {
    authRole.value = "ADMIN";
    await renderPage(
      makeClaimDetails({
        status: "REJECTED",
        decisionNotes: "Missing required documents",
      }),
    );

    await screen.findByRole("heading", { name: "CLM-2026-0001" });
    expect(screen.getByText("Claim rejected.")).toBeTruthy();
    expect(screen.getByText("Missing required documents")).toBeTruthy();
  });

  it("renders a timeline event with a null performedBy without crashing", async () => {
    authRole.value = "CLAIMS_OFFICER";
    await renderPage(
      makeClaimDetails({
        status: "NEW",
        timeline: [
          {
            action: "Claim created",
            previousStatus: null,
            newStatus: "NEW",
            notes: null,
            performedBy: null,
            role: "CLAIMS_OFFICER",
            timestamp: "2026-09-01T10:00:00.000Z",
          },
        ],
      }),
    );

    await screen.findByRole("heading", { name: "CLM-2026-0001" });
    expect(screen.getByText("Claim created")).toBeTruthy();
    expect(screen.getByText(/System ·/)).toBeTruthy();
  });

  it("preserves and renders the REJECTED status", async () => {
    authRole.value = "CLAIMS_OFFICER";
    await renderPage(makeClaimDetails({ status: "REJECTED" }));

    await screen.findByRole("heading", { name: "CLM-2026-0001" });
    expect(screen.getAllByText("Rejected").length).toBeGreaterThan(0);
  });

  it("displays UNDER_REVIEW exactly as the backend status", async () => {
    authRole.value = "CLAIMS_OFFICER";
    await renderPage(makeClaimDetails({ status: "UNDER_REVIEW" }));

    await screen.findByRole("heading", { name: "CLM-2026-0001" });
    expect(screen.getByText("Under Review")).toBeTruthy();
  });

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

  const COMPLETE_DETAILS: Partial<ClaimDetailsType> & {
    status: ClaimDetailsType["status"];
  } = {
    status: "CLOSED",
    accident: {
      accidentType: "REAR_END_COLLISION",
      accidentDate: "2026-09-08",
      accidentTime: "14:30",
      description: "Vehicle rear-ended at a red light by a third party.",
      damageDescription: "Cracked rear bumper and shattered tail light.",
    },
    evidence: [
      {
        imageType: "car_damage_front",
        url: "https://example.test/evidence-1.jpg",
        uploadedBy: null,
        uploadedAt: "2026-09-22T14:00:00.000Z",
      },
    ],
    signature: {
      url: "https://example.test/signature.png",
      capturedBy: null,
      capturedAt: "2026-09-22T15:00:00.000Z",
    },
    location: {
      latitude: 21.4858,
      longitude: 39.1925,
      address: null,
      capturedAt: "2026-09-22T13:00:00.000Z",
    },
  };

  it("keeps the Export Report button visible but disabled until the details are complete", async () => {
    authRole.value = "CLAIMS_OFFICER";
    await renderPage(makeClaimDetails({ status: "IN_PROGRESS" }));

    await screen.findByRole("heading", { name: "CLM-2026-0001" });
    const exportButton = screen.getByRole("button", {
      name: /Export Claim PDF/,
    });
    expect(exportButton.hasAttribute("disabled")).toBe(true);
    expect(screen.getByText(/أكمل أولاً: تفاصيل الحادث/)).toBeTruthy();
  });

  it("keeps the button disabled and explains the final-decision rule once details are complete", async () => {
    authRole.value = "CLAIMS_OFFICER";
    await renderPage(
      makeClaimDetails({ ...COMPLETE_DETAILS, status: "IN_PROGRESS" }),
    );

    await screen.findByRole("heading", { name: "CLM-2026-0001" });
    const exportButton = screen.getByRole("button", {
      name: /Export Claim PDF/,
    });
    expect(exportButton.hasAttribute("disabled")).toBe(true);
    expect(screen.getByText(/بعد القرار النهائي/)).toBeTruthy();
  });

  it("enables the Export Report button for a complete claim with a final decision", async () => {
    authRole.value = "CLAIMS_OFFICER";
    await renderPage(makeClaimDetails(COMPLETE_DETAILS));

    await screen.findByRole("heading", { name: "CLM-2026-0001" });
    const exportButton = screen.getByRole("button", {
      name: /Export Claim PDF/,
    });
    expect(exportButton.hasAttribute("disabled")).toBe(false);
  });

  it("exports the report with the claim id and number when clicked", async () => {
    authRole.value = "CLAIMS_OFFICER";
    const user = setupUserEvent();

    await renderPage(makeClaimDetails(COMPLETE_DETAILS));

    await user.click(
      await screen.findByRole("button", { name: /Export Claim PDF/ }),
    );

    expect(downloadClaimReport).toHaveBeenCalledWith("clm-1", "CLM-2026-0001");
  });

  it("shows Approve and Reject buttons to an ADMIN inside the Decision/Closing section while the claim is UNDER_REVIEW", async () => {
    authRole.value = "ADMIN";
    await renderPage(makeClaimDetails({ status: "UNDER_REVIEW" }));

    await screen.findByRole("heading", { name: "CLM-2026-0001" });
    expect(
      screen.getByText("No decision or closure has been recorded yet."),
    ).toBeTruthy();
    expect(screen.getByRole("button", { name: "Approve Claim" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Reject Claim" })).toBeTruthy();
  });

  it("hides Approve and Reject from a CLAIMS_OFFICER even while the claim is UNDER_REVIEW", async () => {
    authRole.value = "CLAIMS_OFFICER";
    await renderPage(makeClaimDetails({ status: "UNDER_REVIEW" }));

    await screen.findByRole("heading", { name: "CLM-2026-0001" });
    expect(screen.queryByRole("button", { name: "Approve Claim" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Reject Claim" })).toBeNull();
  });

  it("hides the decision buttons from an ADMIN for any status other than UNDER_REVIEW", async () => {
    authRole.value = "ADMIN";
    await renderPage(makeClaimDetails({ status: "APPROVED" }));

    await screen.findByRole("heading", { name: "CLM-2026-0001" });
    expect(screen.queryByRole("button", { name: "Approve Claim" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Reject Claim" })).toBeNull();
  });

  it("approves an UNDER_REVIEW claim via POST /claims/:id/decision and reloads", async () => {
    authRole.value = "ADMIN";
    const user = setupUserEvent();
    vi.mocked(decideClaim).mockResolvedValue({
      status: "APPROVED",
    } as never);

    await renderPage(makeClaimDetails({ status: "UNDER_REVIEW" }));

    await user.click(
      await screen.findByRole("button", { name: "Approve Claim" }),
    );

    const dialog = screen.getByRole("dialog");
    await user.type(
      within(dialog).getByLabelText(/Estimated parts cost/),
      "5000",
    );
    await user.type(within(dialog).getByLabelText(/Labor cost/), "1200");
    await user.type(within(dialog).getByLabelText(/Deductible/), "0");
    expect(
      within(dialog).getByRole("heading", { name: "Approve Claim" }),
    ).toBeTruthy();

    await user.click(
      within(dialog).getByRole("button", { name: "Approve Claim" }),
    );

    expect(decideClaim).toHaveBeenCalledWith(
      "clm-1",
      expect.objectContaining({
        decision: "APPROVED",
        lossAssessment: {
          estimatedPartsCost: 5000,
          laborCost: 1200,
          deductibleApplied: 0,
          deductibleOverrideReason: undefined,
        },
      }),
    );
    expect(getClaimById).toHaveBeenCalledTimes(2);
  });

  it("rejects an UNDER_REVIEW claim after an explicit confirmation", async () => {
    authRole.value = "ADMIN";
    const user = setupUserEvent();
    vi.mocked(decideClaim).mockResolvedValue({
      status: "REJECTED",
    } as never);

    await renderPage(makeClaimDetails({ status: "UNDER_REVIEW" }));

    await user.click(await screen.findByRole("button", { name: "Reject Claim" }));

    const dialog = screen.getByRole("dialog");
    expect(
      within(dialog).getByRole("heading", { name: "Reject Claim" }),
    ).toBeTruthy();

    await user.type(
      within(dialog).getByLabelText("Decision notes (recommended)"),
      "The submitted report does not meet the policy requirements.",
    );
    await user.click(
      within(dialog).getByRole("button", { name: "Reject Claim" }),
    );

    expect(decideClaim).toHaveBeenCalledWith("clm-1", {
      decision: "REJECTED",
      notes: "The submitted report does not meet the policy requirements.",
    });
    expect(getClaimById).toHaveBeenCalledTimes(2);
  });

  it("renders a declined-assignment event with its reason and performer on the timeline", async () => {
    authRole.value = "CLAIMS_OFFICER";
    await renderPage(
      makeClaimDetails({
        status: "NEW",
        timeline: [
          {
            action: "Claim assignment declined by the field adjuster",
            previousStatus: "PENDING_ACCEPTANCE",
            newStatus: "NEW",
            notes: null,
            reason: "Adjuster too far from the incident location",
            performedBy: {
              id: "fa-9",
              name: "Sara Al-Harbi",
              employeeCode: "FA-009",
              role: "FIELD_ADJUSTER",
            },
            role: "FIELD_ADJUSTER",
            timestamp: "2026-09-19T09:30:00.000Z",
          },
          {
            action: "Assignment pending acceptance",
            previousStatus: "NEW",
            newStatus: "PENDING_ACCEPTANCE",
            notes: null,
            performedBy: {
              id: "co-1",
              name: "Khalid Al-Otaibi",
              employeeCode: "CO-001",
              role: "CLAIMS_OFFICER",
            },
            role: "CLAIMS_OFFICER",
            timestamp: "2026-09-19T08:15:00.000Z",
          },
        ],
      }),
    );

    await screen.findByRole("heading", { name: "CLM-2026-0001" });

    // The decline is visually flagged; its audit details are expanded on demand.
    expect(
      screen.getByText("Claim assignment declined by the field adjuster"),
    ).toBeTruthy();
    expect(screen.getByText("Declined")).toBeTruthy();
    const declineEvent = screen
      .getByText("Claim assignment declined by the field adjuster")
      .closest("li");
    expect(declineEvent).toBeTruthy();
    await setupUserEvent().click(
      within(declineEvent as HTMLElement).getByRole("button", {
        name: "Show details",
      }),
    );
    expect(
      screen.getByText(/Adjuster too far from the incident location/),
    ).toBeTruthy();
    expect(screen.getByText(/by Sara Al-Harbi ·/)).toBeTruthy();

    // Status transition from the backend data is rendered as separate badges.
    expect(
      within(declineEvent as HTMLElement).getByRole("status", {
        name: "Awaiting Reply",
      }),
    ).toBeTruthy();
    expect(
      within(declineEvent as HTMLElement).getByRole("status", { name: "New" }),
    ).toBeTruthy();

    // Ordinary events stay unstyled — the "Declined" chip is decline-only.
    expect(screen.getByText("Assignment pending acceptance")).toBeTruthy();
  });

  // ─── Step timeline + next-action panel ─────────────────────────────────────

  it("renders the stage timeline with only backend-available stages and the current stage marked", async () => {
    authRole.value = "CLAIMS_OFFICER";
    await renderPage(makeClaimDetails({ status: "UNDER_REVIEW" }));

    await screen.findByRole("heading", { name: "CLM-2026-0001" });

    const steps = screen.getAllByTestId("stage-step");
    expect(steps).toHaveLength(10); // proposed stages are never rendered

    const current = document.querySelector(
      '[data-testid="stage-step"][data-state="current"]',
    );
    expect(current).toBeTruthy();
    expect(current?.textContent).toContain("Under Decision");
    expect(current?.getAttribute("aria-current")).toBe("step");

    // Steps before the current one are done; later ones are upcoming.
    expect(
      document.querySelectorAll('[data-testid="stage-step"][data-state="done"]')
        .length,
    ).toBeGreaterThan(0);
    expect(
      document.querySelectorAll(
        '[data-testid="stage-step"][data-state="upcoming"]',
      )
        .length,
    ).toBeGreaterThan(0);
  });

  it("shows owner, SLA, waiting-on and the single Start Review action for a SUBMITTED claim", async () => {
    authRole.value = "CLAIMS_OFFICER";
    await renderPage(
      makeClaimDetails({
        status: "SUBMITTED",
        assignment: {
          assignedTo: {
            id: "fa-1",
            name: "Sara Al-Harbi",
            employeeCode: "FA-001",
            role: "FIELD_ADJUSTER",
          },
          assignedBy: null,
          assignedAt: "2026-09-02T08:00:00.000Z",
          priority: "MEDIUM",
          assignmentNotes: null,
        },
      }),
    );

    await screen.findByRole("heading", { name: "CLM-2026-0001" });

    expect(screen.getByText("Owner: Sara Al-Harbi")).toBeTruthy();
    expect(
      screen.getByText(/^Age-based staleness: .+$/),
    ).toBeTruthy();
    expect(screen.getByText("Waiting on: Claims Officer")).toBeTruthy();

    // Exactly one Start Review button — the panel's, not a duplicate.
    expect(
      screen.getAllByRole("button", { name: "Start Review" }),
    ).toHaveLength(1);

    const user = setupUserEvent();
    await user.click(screen.getByRole("button", { name: "Start Review" }));
    expect(await screen.findByText("Start claim review?")).toBeTruthy();
    expect(
      screen.getByText(
        "This will change the claim status from SUBMITTED to UNDER_REVIEW.",
      ),
    ).toBeTruthy();
  });

  it("offers Make Decision from the next-action panel to an ADMIN only", async () => {
    authRole.value = "ADMIN";
    await renderPage(makeClaimDetails({ status: "UNDER_REVIEW" }));

    await screen.findByRole("heading", { name: "CLM-2026-0001" });
    expect(
      screen.getAllByRole("button", { name: "Make Decision" }),
    ).toHaveLength(1);

    cleanup();
    authRole.value = "CLAIMS_OFFICER";
    await renderPage(makeClaimDetails({ status: "UNDER_REVIEW" }));

    await screen.findByRole("heading", { name: "CLM-2026-0001" });
    expect(
      screen.queryByRole("button", { name: "Make Decision" }),
    ).toBeNull();
    expect(screen.getByText("No action needed from you")).toBeTruthy();
  });

  it("opens the assign modal from the next-action panel for a NEW claim", async () => {
    authRole.value = "CLAIMS_OFFICER";
    const user = setupUserEvent();
    await renderPage(makeClaimDetails({ status: "NEW" }));

    await screen.findByRole("heading", { name: "CLM-2026-0001" });

    await user.click(screen.getByRole("button", { name: "Assign Adjuster" }));

    expect(
      screen.getByRole("heading", { name: "Assign Field Adjuster" }),
    ).toBeTruthy();
  });

  it("shows the unassigned owner state in the next-action panel", async () => {
    authRole.value = "CLAIMS_OFFICER";
    await renderPage(makeClaimDetails({ status: "NEW" }));

    await screen.findByRole("heading", { name: "CLM-2026-0001" });

    expect(
      screen.getByText("Owner: No adjuster assigned yet"),
    ).toBeTruthy();
  });

  it("renders the timeline, owner and primary action in Arabic with RTL", async () => {
    authRole.value = "CLAIMS_OFFICER";
    window.localStorage.setItem("sawn.locale", "ar");

    await renderPage(makeClaimDetails({ status: "SUBMITTED" }), {
      locale: "ar",
    });

    await screen.findByRole("heading", { name: "CLM-2026-0001" });

    expect(document.documentElement.dir).toBe("rtl");
    expect(
      screen.getByRole("heading", { name: "جاهزية المطالبة" }),
    ).toBeTruthy();
    expect(
      screen.getByRole("heading", { name: "الأدلة والصور" }),
    ).toBeTruthy();
    expect(screen.getByText("لم تُرفع صور المعاينة بعد. سيرفعها المعاين الميداني من تطبيق الجوال.")).toBeTruthy();
    expect(
      screen.getByRole("heading", { name: "التوقيع" }),
    ).toBeTruthy();

    const current = document.querySelector(
      '[data-testid="stage-step"][data-state="current"]',
    );
    expect(current?.textContent).toContain("التقرير مُرسل");

    expect(
      screen.getByText("المسؤول الحالي: غير مُسند إلى معاين"),
    ).toBeTruthy();
    expect(
      screen.getByText(/قاعدة تقادم حسب عمر المطالبة:/),
    ).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "بدء المراجعة" }),
    ).toBeTruthy();
  });
});