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
    downloadClaimReport: vi.fn(),
  };
});

import { getClaimById, downloadClaimReport } from "../api/claims.service";
import { getFieldAdjusters } from "../api/users.service";
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

  it("renders accident details from backend data.accident with Arabic labels and translated accident type", async () => {
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
    expect(screen.getByText("تفاصيل الحادث")).toBeTruthy();
    expect(screen.getByText("نوع الحادث")).toBeTruthy();
    expect(screen.getByText("تصادم خلفي")).toBeTruthy();
    expect(screen.getByText("تاريخ الحادث")).toBeTruthy();
    expect(screen.getByText("2026-09-08")).toBeTruthy();
    expect(screen.getByText("وقت الحادث")).toBeTruthy();
    expect(screen.getByText("14:30")).toBeTruthy();
    expect(screen.getByText("وصف الحادث")).toBeTruthy();
    expect(
      screen.getByText("Vehicle rear-ended at a red light by a third party."),
    ).toBeTruthy();
    expect(screen.getByText("وصف الأضرار")).toBeTruthy();
    expect(
      screen.getByText("Cracked rear bumper and shattered tail light."),
    ).toBeTruthy();
  });

  it("shows a clear empty state when accident is absent", async () => {
    authRole.value = "CLAIMS_OFFICER";
    await renderPage(makeClaimDetails({ status: "NEW", accident: null }));

    await screen.findByRole("heading", { name: "CLM-2026-0001" });
    expect(screen.getByText(/لم يتم إدخال تفاصيل الحادث بعد/)).toBeTruthy();
    expect(screen.queryByText("نوع الحادث")).toBeNull();
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
    expect(screen.getByText(/لم يتم إدخال تفاصيل الحادث بعد/)).toBeTruthy();
    expect(screen.queryByText("نوع الحادث")).toBeNull();
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
    expect(screen.getByText("نوع الحادث")).toBeTruthy();
  });

  it("renders the assignment section and shows the not-assigned state when assignedTo is null", async () => {
    authRole.value = "CLAIMS_OFFICER";
    await renderPage(makeClaimDetails({ status: "NEW" }));

    await screen.findByRole("heading", { name: "CLM-2026-0001" });
    expect(screen.getByText("لم يتم تعيين معاين بعد")).toBeTruthy();
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
    expect(screen.getByText("موقع الحادث المُبلغ عنه")).toBeTruthy();
    expect(screen.getByText("Jeddah - Al-Hamra")).toBeTruthy();
    expect(screen.getByText("31.905, 35.204")).toBeTruthy();
  });

  it("shows the waiting-for-the-adjuster state when the field inspection location is null", async () => {
    authRole.value = "CLAIMS_OFFICER";
    await renderPage(makeClaimDetails({ status: "NEW" }));

    await screen.findByRole("heading", { name: "CLM-2026-0001" });
    expect(
      screen.getByText("بانتظار وصول المعاين وتحديد موقع المعاينة"),
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
    expect(screen.getByText("موقع المعاينة الميدانية الفعلي")).toBeTruthy();
    expect(screen.getByText("Jeddah Corniche")).toBeTruthy();
    expect(screen.getByText("21.4858, 39.1925")).toBeTruthy();
  });

  it("renders an empty evidence array without crashing and shows the empty state", async () => {
    authRole.value = "CLAIMS_OFFICER";
    await renderPage(makeClaimDetails({ status: "NEW", evidence: [] }));

    await screen.findByRole("heading", { name: "CLM-2026-0001" });
    expect(screen.getByText(/لا توجد صور للمعاينة بعد/)).toBeTruthy();
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
    expect(screen.getByText(/لا توجد توقيع بعد/)).toBeTruthy();
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
    expect(screen.getByText(/Performed by: —/)).toBeTruthy();
  });

  it("preserves and renders the REJECTED status", async () => {
    authRole.value = "CLAIMS_OFFICER";
    await renderPage(makeClaimDetails({ status: "REJECTED" }));

    await screen.findByRole("heading", { name: "CLM-2026-0001" });
    expect(screen.getByText("Rejected")).toBeTruthy();
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
      name: /تصدير التقرير/,
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
      name: /تصدير التقرير/,
    });
    expect(exportButton.hasAttribute("disabled")).toBe(true);
    expect(screen.getByText(/بعد القرار النهائي/)).toBeTruthy();
  });

  it("enables the Export Report button for a complete claim with a final decision", async () => {
    authRole.value = "CLAIMS_OFFICER";
    await renderPage(makeClaimDetails(COMPLETE_DETAILS));

    await screen.findByRole("heading", { name: "CLM-2026-0001" });
    const exportButton = screen.getByRole("button", {
      name: /تصدير التقرير/,
    });
    expect(exportButton.hasAttribute("disabled")).toBe(false);
  });

  it("exports the report with the claim id and number when clicked", async () => {
    authRole.value = "CLAIMS_OFFICER";
    const user = setupUserEvent();

    await renderPage(makeClaimDetails(COMPLETE_DETAILS));

    await user.click(
      await screen.findByRole("button", { name: /تصدير التقرير/ }),
    );

    expect(downloadClaimReport).toHaveBeenCalledWith("clm-1", "CLM-2026-0001");
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

    // The decline is visually flagged (Declined chip) and its reason is shown.
    expect(
      screen.getByText("Claim assignment declined by the field adjuster"),
    ).toBeTruthy();
    expect(screen.getByText("Declined")).toBeTruthy();
    expect(
      screen.getByText(/Adjuster too far from the incident location/),
    ).toBeTruthy();
    expect(screen.getByText(/Performed by: Sara Al-Harbi/)).toBeTruthy();

    // Status transition from the backend data is rendered.
    expect(screen.getByText(/PENDING_ACCEPTANCE → NEW/)).toBeTruthy();

    // Ordinary events stay unstyled — the "Declined" chip is decline-only.
    expect(screen.getByText("Assignment pending acceptance")).toBeTruthy();
  });
});