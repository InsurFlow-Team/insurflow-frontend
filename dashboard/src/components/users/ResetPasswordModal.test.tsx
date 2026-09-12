// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
} from "@testing-library/react";
import ResetPasswordModal from "./ResetPasswordModal";
import type { User } from "../../types";

const USER: User = {
  id: "user-1",
  name: "Sara",
  employeeCode: "CO-001",
  role: "CLAIMS_OFFICER",
  organizationId: "org-1",
  organizationName: "InsurFlow",
  status: "ACTIVE",
};

function renderModal({
  onSubmit = vi.fn().mockResolvedValue(true),
  onClose = vi.fn(),
} = {}) {
  return {
    onSubmit,
    onClose,
    ...render(
      <ResetPasswordModal user={USER} onSubmit={onSubmit} onClose={onClose} />,
    ),
  };
}

function typeNewPassword(value: string) {
  fireEvent.change(screen.getByPlaceholderText("At least 8 characters"), {
    target: { value },
  });
}

function typeConfirm(value: string) {
  fireEvent.change(screen.getByPlaceholderText("Re-enter the new password"), {
    target: { value },
  });
}

describe("ResetPasswordModal", () => {
  beforeEach(() => {
    cleanup();
  });

  afterEach(() => {
    cleanup();
  });

  it("shows the target user and requires matching passwords", () => {
    renderModal();

    expect(screen.getByText(/Set a new password for/)).toBeTruthy();

    typeNewPassword("GoodPass1");
    typeConfirm("Different1");

    expect(screen.getByText("Passwords do not match")).toBeTruthy();
    expect(
      (screen.getByRole("button", { name: "Reset Password" }) as HTMLButtonElement)
        .disabled,
    ).toBe(true);
  });

  it("calls onSubmit with the user id and new password, then closes", async () => {
    const { onSubmit, onClose } = renderModal();

    typeNewPassword("GoodPass1");
    typeConfirm("GoodPass1");

    fireEvent.click(screen.getByRole("button", { name: "Reset Password" }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith("user-1", "GoodPass1");
    });
    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
  });

  it("keeps the modal open when the backend rejects the request", async () => {
    const onSubmit = vi.fn().mockResolvedValue(false);
    const onClose = vi.fn();
    renderModal({ onSubmit, onClose });

    typeNewPassword("GoodPass1");
    typeConfirm("GoodPass1");
    fireEvent.click(screen.getByRole("button", { name: "Reset Password" }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith("user-1", "GoodPass1");
    });
    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(onClose).not.toHaveBeenCalled();
  });
});