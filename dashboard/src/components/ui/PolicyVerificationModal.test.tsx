// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup, waitFor } from "@testing-library/react";
import { screen } from "@testing-library/dom";
import { setupUserEvent } from "../../test/test-utils";
import type { PolicyInfo } from "../../types";

vi.mock("../../api/policy.service", () => ({
  verifyPolicy: vi.fn(),
}));

import { verifyPolicy } from "../../api/policy.service";
import PolicyVerificationModal from "./PolicyVerificationModal";

const ACTIVE_POLICY: PolicyInfo = {
  policyNumber: "POL-1000203",
  status: "ACTIVE",
  startDate: "2026-01-01T00:00:00.000Z",
  expiryDate: "2026-12-31T23:59:59.000Z",
};

function mockAxiosError(message: string) {
  return Object.assign(new Error(message), {
    isAxiosError: true,
    response: {
      status: 404,
      data: { success: false, message },
    },
  });
}

const onClose = vi.fn();
const onContinue = vi.fn();

beforeEach(() => {
  vi.mocked(verifyPolicy).mockReset();
  onClose.mockReset();
  onContinue.mockReset();
});

afterEach(() => {
  cleanup();
});

describe("PolicyVerificationModal", () => {
  it("renders the verification step and keeps the continue action hidden until success", () => {
    render(
      <PolicyVerificationModal isOpen onClose={onClose} onContinue={onContinue} />,
    );

    expect(
      screen.getByRole("textbox", { name: "Policy Number" }),
    ).toBeTruthy();
    expect(screen.getByRole("button", { name: /تحقق من الوثيقة/i })).toBeTruthy();
    expect(
      (
        screen.getByRole("button", {
          name: /تحقق من الوثيقة/i,
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true);
    expect(screen.queryByRole("button", { name: /متابعة تسجيل الحادث/i })).toBeNull();
  });

  it("verifies a policy and unlocks the claim-intake continue button only after success", async () => {
    vi.mocked(verifyPolicy).mockResolvedValue(ACTIVE_POLICY);

    const user = setupUserEvent();
    render(
      <PolicyVerificationModal isOpen onClose={onClose} onContinue={onContinue} />,
    );

    const input = screen.getByRole("textbox", { name: "Policy Number" });
    await user.type(input, "POL-1000203");
    await user.click(screen.getByRole("button", { name: /تحقق من الوثيقة/i }));

    expect(verifyPolicy).toHaveBeenCalledWith("POL-1000203");

    expect(await screen.findByText("Policy verified successfully.")).toBeTruthy();
    expect(screen.getByText("POL-1000203")).toBeTruthy();
    expect(screen.getByText("Active")).toBeTruthy();

    await user.click(
      screen.getByRole("button", { name: /متابعة تسجيل الحادث/i }),
    );
    expect(onContinue).toHaveBeenCalledTimes(1);
    // The verification step must close before the intake form opens.
    expect(onClose).toHaveBeenCalledTimes(0);
  });

  it("shows the error state when verification fails and does not offer continue", async () => {
    vi.mocked(verifyPolicy).mockRejectedValue(
      mockAxiosError("Policy POL-00000000 was not found. Check the number and try again."),
    );

    const user = setupUserEvent();
    render(
      <PolicyVerificationModal isOpen onClose={onClose} onContinue={onContinue} />,
    );

    await user.type(
      screen.getByRole("textbox", { name: "Policy Number" }),
      "00000000",
    );
    await user.click(screen.getByRole("button", { name: /تحقق من الوثيقة/i }));

    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toMatch(/was not found/);
    expect(screen.queryByRole("button", { name: /متابعة تسجيل الحادث/i })).toBeNull();
    expect(onContinue).not.toHaveBeenCalled();
  });

  it("disables the verify action while a verification is pending", async () => {
    let resolveVerify!: (policy: PolicyInfo) => void;
    vi.mocked(verifyPolicy).mockImplementation(
      () =>
        new Promise<PolicyInfo>((resolve) => {
          resolveVerify = resolve;
        }),
    );

    const user = setupUserEvent();
    render(
      <PolicyVerificationModal isOpen onClose={onClose} onContinue={onContinue} />,
    );

    await user.type(
      screen.getByRole("textbox", { name: "Policy Number" }),
      "POL-1000203",
    );

    const verifyButton = screen.getByRole("button", {
      name: /تحقق من الوثيقة/i,
    }) as HTMLButtonElement;

    await user.click(verifyButton);
    expect(verifyButton.disabled).toBe(true);

    resolveVerify(ACTIVE_POLICY);
    expect(
      await screen.findByText("Policy verified successfully."),
    ).toBeTruthy();
  });

  it("resets all step state when the modal closes and reopens", async () => {
    vi.mocked(verifyPolicy).mockResolvedValue(ACTIVE_POLICY);

    const user = setupUserEvent();
    const { rerender } = render(
      <PolicyVerificationModal isOpen onClose={onClose} onContinue={onContinue} />,
    );

    await user.type(
      screen.getByRole("textbox", { name: "Policy Number" }),
      "POL-1000203",
    );
    await user.click(screen.getByRole("button", { name: /تحقق من الوثيقة/i }));
    expect(await screen.findByText("Policy verified successfully.")).toBeTruthy();

    rerender(
      <PolicyVerificationModal isOpen={false} onClose={onClose} onContinue={onContinue} />,
    );

    rerender(
      <PolicyVerificationModal isOpen onClose={onClose} onContinue={onContinue} />,
    );

    await waitFor(() => {
      expect(
        (
          screen.getByRole("textbox", {
            name: "Policy Number",
          }) as HTMLInputElement
        ).value,
      ).toBe("");
    });
    expect(screen.queryByText("Policy verified successfully.")).toBeNull();
  });
});