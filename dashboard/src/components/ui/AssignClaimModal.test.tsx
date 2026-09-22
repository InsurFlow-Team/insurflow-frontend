// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { screen } from "@testing-library/dom";
import { MemoryRouter } from "react-router-dom";
import { setupUserEvent } from "../../test/test-utils";

vi.setConfig({ testTimeout: 20000 });

vi.mock("../../api/claims.service", () => ({
  assignClaim: vi.fn(),
}));

vi.mock("../../api/users.service", () => ({
  getFieldAdjusters: vi.fn(),
}));

import { assignClaim } from "../../api/claims.service";
import { getFieldAdjusters } from "../../api/users.service";
import AssignClaimModal from "./AssignClaimModal";

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
  capacityLimit: 3,
} as const;

function backendError(status: number, code: string, message: string) {
  return Object.assign(new Error(`Request failed with status code ${status}`), {
    isAxiosError: true,
    response: {
      status,
      data: { success: false, message, errors: [{ code }] },
    },
  });
}

beforeEach(() => {
  vi.mocked(assignClaim).mockReset();
  vi.mocked(getFieldAdjusters).mockResolvedValue([ADJUSTER]);
});

afterEach(() => {
  cleanup();
});

async function renderModal() {
  const onClose = vi.fn();
  const onAssigned = vi.fn();

  render(
    <MemoryRouter>
      <AssignClaimModal
        isOpen
        onClose={onClose}
        claimId="clm-1"
        onAssigned={onAssigned}
      />
    </MemoryRouter>,
  );

  return { onClose, onAssigned };
}

async function selectAdjuster(user: ReturnType<typeof setupUserEvent>) {
  await user.selectOptions(
    await screen.findByDisplayValue("Select field adjuster"),
    ADJUSTER.id,
  );
}

describe("AssignClaimModal capacity override", () => {
  it("sends the assignment without overrideCapacity on first success", async () => {
    const user = setupUserEvent();
    const { onAssigned, onClose } = await renderModal();

    vi.mocked(assignClaim).mockResolvedValue({
      id: "clm-1",
      claimNumber: "CLM-2026-0001",
      status: "PENDING_ACCEPTANCE",
      priority: "MEDIUM",
      assignedTo: ADJUSTER.id,
      assignedBy: "co-1",
      assignedAt: "2026-09-19T10:00:00.000Z",
    });

    await selectAdjuster(user);
    await user.click(screen.getByRole("button", { name: "Save Assignment" }));

    expect(assignClaim).toHaveBeenCalledWith("clm-1", {
      adjusterId: ADJUSTER.id,
      priority: "MEDIUM",
      notes: "",
    });
    expect(onAssigned).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("shows the override confirmation on ADJUSTER_UNAVAILABLE and retries with overrideCapacity", async () => {
    const user = setupUserEvent();
    const { onAssigned, onClose } = await renderModal();

    vi.mocked(assignClaim)
      .mockRejectedValueOnce(
        backendError(
          409,
          "ADJUSTER_UNAVAILABLE",
          "Adjuster is currently unavailable",
        ),
      )
      .mockResolvedValueOnce({
        id: "clm-1",
        claimNumber: "CLM-2026-0001",
        status: "PENDING_ACCEPTANCE",
        priority: "MEDIUM",
        assignedTo: ADJUSTER.id,
        assignedBy: "co-1",
        assignedAt: "2026-09-19T10:00:00.000Z",
      });

    await selectAdjuster(user);
    await user.click(screen.getByRole("button", { name: "Save Assignment" }));

    // Capacity override confirmation replaces the inline error.
    expect(
      await screen.findByRole("heading", { name: "Capacity Override" }),
    ).toBeTruthy();

    // The dialog states the real load so the answer is never a surprise.
    expect(
      screen.getByText(/المعاين لديه أكثر من الحد المسموح/),
    ).toBeTruthy();

    await user.click(screen.getByRole("button", { name: "Override Capacity" }));

    expect(assignClaim).toHaveBeenNthCalledWith(1, "clm-1", {
      adjusterId: ADJUSTER.id,
      priority: "MEDIUM",
      notes: "",
    });
    expect(assignClaim).toHaveBeenNthCalledWith(2, "clm-1", {
      adjusterId: ADJUSTER.id,
      priority: "MEDIUM",
      notes: "",
      overrideCapacity: true,
    });
    expect(onAssigned).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not assign when the override is declined and shows the availability error", async () => {
    const user = setupUserEvent();
    const { onAssigned, onClose } = await renderModal();

    vi.mocked(assignClaim).mockRejectedValue(
      backendError(409, "ADJUSTER_UNAVAILABLE", "Adjuster is currently unavailable"),
    );

    await selectAdjuster(user);
    await user.click(screen.getByRole("button", { name: "Save Assignment" }));

    await screen.findByRole("heading", { name: "Capacity Override" });
    await user.click(screen.getByRole("button", { name: "Pick Another" }));

    expect(assignClaim).toHaveBeenCalledTimes(1);
    expect(onAssigned).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();

    // The inline error returns with clear guidance after declining.
    expect(
      await screen.findByText(/Please pick another adjuster/i),
    ).toBeTruthy();
  });

  it("shows the inline error (no override offered) for non-capacity rejections", async () => {
    const user = setupUserEvent();
    const { onAssigned } = await renderModal();

    vi.mocked(assignClaim).mockRejectedValue(
      backendError(
        409,
        "INVALID_STATUS_TRANSITION",
        "Claim is not in NEW state",
      ),
    );

    await selectAdjuster(user);
    await user.click(screen.getByRole("button", { name: "Save Assignment" }));

    expect(
      await screen.findByText(/no longer assignable/i),
    ).toBeTruthy();
    expect(
      screen.queryByRole("heading", { name: "Capacity Override" }),
    ).toBeNull();
    expect(onAssigned).not.toHaveBeenCalled();
  });

  it("shows the inline error and NO override dialog when the adjuster no longer exists (ADJUSTER_NOT_FOUND)", async () => {
    const user = setupUserEvent();
    const { onAssigned, onClose } = await renderModal();

    vi.mocked(assignClaim).mockRejectedValue(
      backendError(
        404,
        "ADJUSTER_NOT_FOUND",
        "Adjuster not found",
      ),
    );

    await selectAdjuster(user);
    await user.click(screen.getByRole("button", { name: "Save Assignment" }));

    // Contract: not-found means the adjuster is deactivated (backend assigns
    // ACTIVE only), not capacity — the override dialog must never appear.
    expect(
      await screen.findByText(/field adjuster is no longer active/i),
    ).toBeTruthy();
    expect(
      screen.queryByRole("heading", { name: "Capacity Override" }),
    ).toBeNull();
    expect(onAssigned).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it("never offers an INACTIVE (deactivated) adjuster in the dropdown", async () => {
    vi.mocked(getFieldAdjusters).mockResolvedValue([
      ADJUSTER,
      {
        id: "inactive-1",
        name: "Mona",
        employeeCode: "FA-009",
        role: "FIELD_ADJUSTER",
        organizationId: "org-1",
        organizationName: "InsurFlow",
        status: "INACTIVE",
        availability: "UNAVAILABLE",
        activeTasksCount: 4,
        capacityLimit: 3,
      },
    ]);

    await renderModal();

    expect(
      await screen.findByDisplayValue("Select field adjuster"),
    ).toBeTruthy();
    expect(screen.getByRole("option", { name: /Aya/ })).toBeTruthy();
    expect(screen.queryByRole("option", { name: /Mona/ })).toBeNull();
  });
});