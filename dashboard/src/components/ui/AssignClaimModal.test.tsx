// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { screen, waitFor } from "@testing-library/dom";
import type { FieldAdjuster } from "../../types";
import { setupUserEvent } from "../../test/test-utils";

// DOM tests run full React act() cycles; give them room.
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
import AssignClaimModal from "./AssignClaimModal";

const ADJUSTER: FieldAdjuster = {
  id: "651a1f8b7f1d2c001f8d4e92",
  name: "Aya",
  employeeCode: "FT-001",
  role: "FIELD_ADJUSTER",
  organizationId: "org-1",
  organizationName: "InsurFlow",
  status: "ACTIVE",
  availability: "AVAILABLE",
  activeTasksCount: 1,
};

function renderModal() {
  const onAssigned = vi.fn();
  const onClose = vi.fn();

  const view = render(
    <AssignClaimModal
      isOpen
      onClose={onClose}
      claimId="clm-1"
      onAssigned={onAssigned}
    />,
  );

  return { onAssigned, onClose, ...view };
}

function conflict(code: string) {
  return Object.assign(new Error("Request failed with status code 409"), {
    isAxiosError: true,
    response: {
      status: 409,
      data: {
        success: false,
        message: `conflict: ${code}`,
        errors: [{ code, details: "" }],
      },
    },
  });
}

describe("AssignClaimModal", () => {
  beforeEach(() => {
    vi.mocked(getFieldAdjusters).mockReset();
    vi.mocked(assignClaim).mockReset();
    vi.mocked(assignClaim).mockResolvedValue({
      id: "clm-1",
      claimNumber: "CLM-2026-0001",
      status: "ASSIGNED",
      priority: "MEDIUM",
      assignedTo: ADJUSTER.id,
      assignedBy: "co-1",
      assignedAt: "2026-09-09T11:50:00.000Z",
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("shows a clear empty state instead of demo users when no adjusters are available", async () => {
    vi.mocked(getFieldAdjusters).mockResolvedValue([]);

    renderModal();

    expect(
      await screen.findByText(/No available field adjusters/i),
    ).toBeTruthy();
    expect(screen.queryByText(/Ruba/i)).toBeFalsy();
  });

  it("shows the GET error with a Retry that reloads real adjusters", async () => {
    vi.mocked(getFieldAdjusters)
      .mockRejectedValueOnce(new Error("Request failed with status code 500"))
      .mockResolvedValueOnce([ADJUSTER]);

    const user = setupUserEvent();
    renderModal();

    expect(
      await screen.findByRole("button", { name: "Retry" }),
    ).toBeTruthy();

    await user.click(screen.getByRole("button", { name: "Retry" }));

    expect(
      await screen.findByText(new RegExp(ADJUSTER.employeeCode)),
    ).toBeTruthy();

    expect(getFieldAdjusters).toHaveBeenCalledTimes(2);
  });

  it("submits { adjusterId, priority: MEDIUM default, notes } and reports success", async () => {
    vi.mocked(getFieldAdjusters).mockResolvedValue([ADJUSTER]);

    const user = setupUserEvent();
    const { onAssigned, onClose } = renderModal();

    await user.selectOptions(
      await screen.findByDisplayValue("Select field adjuster"),
      ADJUSTER.id,
    );
    await user.type(
      screen.getByPlaceholderText(/Please inspect this as soon as possible/),
      "please inspect",
    );
    await user.click(screen.getByRole("button", { name: "Save Assignment" }));

    await waitFor(() => {
      expect(onAssigned).toHaveBeenCalledTimes(1);
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    // Priority defaults to MEDIUM (backend default) instead of an empty value.
    expect(assignClaim).toHaveBeenCalledWith("clm-1", {
      adjusterId: ADJUSTER.id,
      priority: "MEDIUM",
      notes: "please inspect",
    });
  });

  it("explains ADJUSTER_UNAVAILABLE and refreshes the adjuster list", async () => {
    vi.mocked(getFieldAdjusters).mockResolvedValue([ADJUSTER]);
    vi.mocked(assignClaim).mockRejectedValue(conflict("ADJUSTER_UNAVAILABLE"));

    const user = setupUserEvent();
    renderModal();

    await user.selectOptions(
      await screen.findByDisplayValue("Select field adjuster"),
      ADJUSTER.id,
    );
    await user.click(screen.getByRole("button", { name: "Save Assignment" }));

    expect(
      await screen.findByText(/no longer available. Please pick another/i),
    ).toBeTruthy();

    // The stale adjuster list is refreshed so the list reflects what the
    // backend decided.
    await waitFor(() => {
      expect(getFieldAdjusters).toHaveBeenCalledTimes(2);
    });
  });

  it("explains INVALID_STATUS_TRANSITION when the claim left NEW", async () => {
    vi.mocked(getFieldAdjusters).mockResolvedValue([ADJUSTER]);
    vi.mocked(assignClaim).mockRejectedValue(
      conflict("INVALID_STATUS_TRANSITION"),
    );

    const user = setupUserEvent();
    renderModal();

    await user.selectOptions(
      await screen.findByDisplayValue("Select field adjuster"),
      ADJUSTER.id,
    );
    await user.click(screen.getByRole("button", { name: "Save Assignment" }));

    expect(
      await screen.findByText(/no longer assignable/i),
    ).toBeTruthy();
  });
});