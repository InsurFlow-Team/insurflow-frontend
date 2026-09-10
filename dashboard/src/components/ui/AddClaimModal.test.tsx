// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import type { ClaimSummary, FieldAdjuster } from "../../types";
import { fillClaimForm, PLATE_PLACEHOLDER, setupUserEvent } from "../../test/test-utils";

// DOM tests exercise full-form typing through React act(); give them room.
vi.setConfig({ testTimeout: 20000 });

vi.mock("../../api/users.service", () => ({
  getUsers: vi.fn(),
  getFieldAdjusters: vi.fn(),
}));

vi.mock("../../api/claims.service", () => ({
  assignClaim: vi.fn(),
}));

import { getFieldAdjusters } from "../../api/users.service";
import { assignClaim } from "../../api/claims.service";
import AddClaimModal from "./AddClaimModal";

const FA_ADJUSTER: FieldAdjuster = {
  id: "adj-1",
  name: "Aya",
  employeeCode: "FT-001",
  role: "FIELD_ADJUSTER",
  organizationId: "org-1",
  organizationName: "InsurFlow",
  status: "ACTIVE",
  availability: "AVAILABLE",
  activeTasksCount: 0,
};

const CREATED_SUMMARY: ClaimSummary = {
  id: "claim-uuid",
  claimNumber: "CLM-0001",
  status: "NEW",
  customerName: "Ahmed Ibrahim",
  initialPlateNumber: "ABC-1234",
  createdAt: "2026-08-26T15:00:00.000Z",
};

const onSubmit = vi.fn();
const onClose = vi.fn();

beforeEach(() => {
  vi.mocked(getFieldAdjusters).mockResolvedValue([FA_ADJUSTER]);
  vi.mocked(assignClaim).mockRejectedValue(new Error("assign failed"));

  onSubmit.mockReset();
  onSubmit.mockResolvedValue(CREATED_SUMMARY);
  onClose.mockReset();
});

afterEach(() => {
  cleanup();
});

describe("AddClaimModal", () => {
  it("mounts while closed without an infinite update loop", () => {
    expect(() =>
      render(
        <AddClaimModal isOpen={false} onClose={onClose} onSubmit={onSubmit} />,
      ),
    ).not.toThrow();
  });

  it("opens, closes, and reopens without an infinite update loop (reset effect settles)", () => {
    const { rerender } = render(
      <AddClaimModal isOpen onClose={onClose} onSubmit={onSubmit} />,
    );
    expect(screen.getByText("Create New Claim")).toBeTruthy();

    expect(() =>
      rerender(<AddClaimModal isOpen={false} onClose={onClose} onSubmit={onSubmit} />),
    ).not.toThrow();

    expect(() =>
      rerender(<AddClaimModal isOpen onClose={onClose} onSubmit={onSubmit} />),
    ).not.toThrow();
    expect(screen.getByText("Create New Claim")).toBeTruthy();
  });

  it("License Plate input is a controlled input bound to initialPlateNumber: typing, editing, deleting, and pasting all update form state", async () => {
    const user = setupUserEvent();
    const { container } = render(
      <AddClaimModal isOpen onClose={onClose} onSubmit={onSubmit} />,
    );

    const plate = screen.getByPlaceholderText(PLATE_PLACEHOLDER) as HTMLInputElement;

    // typing with auto-uppercase
    await user.type(plate, "abc-1234");
    expect(plate.value).toBe("ABC-1234");

    // editing in the middle
    await user.clear(plate);
    await user.type(plate, "xy");
    await user.type(plate, "9");
    expect(plate.value).toBe("XY9");

    // deleting (backspace)
    await user.type(plate, "{backspace}");
    expect(plate.value).toBe("XY");

    // clearing and pasting an Arabic-Indic plate
    await user.clear(plate);
    await user.paste("lnx-٤٥٦");
    expect(plate.value).toBe("LNX-٤٥٦");

    await fillClaimForm(container, { includePlate: false });

    await user.click(screen.getByRole("button", { name: "Create Claim" }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ initialPlateNumber: "LNX-٤٥٦" }),
    );
  });

  it("submits the complete frontend form model mapped via onSubmit", async () => {
    const user = setupUserEvent();
    const { container } = render(
      <AddClaimModal isOpen onClose={onClose} onSubmit={onSubmit} />,
    );

    await fillClaimForm(container);
    await user.click(screen.getByRole("button", { name: "Create Claim" }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        customerName: "Ahmed Ibrahim",
        customerPhone: "0512345678",
        initialPlateNumber: "ABC-1234",
        incidentType: "COLLISION",
        incidentLocation: "Riyadh - King Fahd Road",
        accidentDate: "2026-09-01",
        accidentTime: "14:30",
      }),
    );
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("on assignment failure the claim stays created, is not re-created, and assignment can be retried", async () => {
    const user = setupUserEvent();
    const { container } = render(
      <AddClaimModal isOpen onClose={onClose} onSubmit={onSubmit} />,
    );

    await fillClaimForm(container);

    // expand Optional Assignment
    await user.click(
      screen.getByRole("button", { name: /Optionally Assign Field Adjuster/ }),
    );

    const adjusterSelect = await screen.findByDisplayValue("Select field adjuster");
    await user.selectOptions(adjusterSelect, "adj-1");

    await user.selectOptions(
      screen.getByDisplayValue("Medium"),
      "HIGH",
    );

    await user.click(screen.getByRole("button", { name: "Create & Assign" }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    // Clearly report: claim created, assignment failed
    expect(
      await screen.findByText(/The claim was created, but assigning the field adjuster failed/i),
    ).toBeTruthy();

    // The claim is not re-created
    expect(onSubmit).toHaveBeenCalledTimes(1);

    // Created claim state + retry affordance are shown
    expect(screen.getByText(/was created. Assignment was not saved/i)).toBeTruthy();
    expect(screen.getByRole("button", { name: "Retry Assignment" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Finish Without Assignment" })).toBeTruthy();

    // Modal is NOT closed as if everything succeeded
    expect(onClose).not.toHaveBeenCalled();
  });
});