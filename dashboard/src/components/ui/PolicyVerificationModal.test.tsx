// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup, waitFor } from "@testing-library/react";
import { screen } from "@testing-library/dom";
import { setupUserEvent } from "../../test/test-utils";
import type { PolicyVerificationResponse } from "../../types";

vi.mock("../../api/policy.service", () => ({
  verifyPolicy: vi.fn(),
}));

import { verifyPolicy } from "../../api/policy.service";
import PolicyVerificationModal from "./PolicyVerificationModal";

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
const onVerified = vi.fn();

beforeEach(() => {
  vi.mocked(verifyPolicy).mockReset();
  onClose.mockReset();
  onVerified.mockReset();
});

afterEach(() => {
  cleanup();
});

describe("PolicyVerificationModal", () => {
  it("renders the verification step and keeps the continue action hidden until success", () => {
    render(
      <PolicyVerificationModal isOpen onClose={onClose} onVerified={onVerified} />,
    );

    expect(
      screen.getByPlaceholderText("POL-1234567"),
    ).toBeTruthy();
    expect(screen.getByRole("button", { name: /التحقق من البوليصة/i })).toBeTruthy();
    expect(
      (
        screen.getByRole("button", {
          name: /التحقق من البوليصة/i,
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true);
    expect(screen.queryByRole("button", { name: /المتابعة لإنشاء المطالبة/i })).toBeNull();
  });

  it("verifies a policy and unlocks the claim-intake continue button only after success", async () => {
    vi.mocked(verifyPolicy).mockResolvedValue(VERIFIED_POLICY);

    const user = setupUserEvent();
    render(
      <PolicyVerificationModal isOpen onClose={onClose} onVerified={onVerified} />,
    );

    const policyInput = screen.getByPlaceholderText("POL-1234567");
    await user.type(policyInput, "POL-1000203");

    const plateInput = screen.getByPlaceholderText("ABC-1234");
    await user.type(plateInput, "ABC-1234");

    await user.click(screen.getByRole("button", { name: /التحقق من البوليصة/i }));

    expect(verifyPolicy).toHaveBeenCalledWith({
      policyNumber: "POL-1000203",
      plateNumber: "ABC-1234",
      incidentDate: undefined,
    });

    expect(await screen.findByText(/تم التحقق بنجاح/i)).toBeTruthy();
    expect(screen.getByText("POL-1000203")).toBeTruthy();

    await user.click(
      screen.getByRole("button", { name: /المتابعة لإنشاء المطالبة/i }),
    );
    expect(onVerified).toHaveBeenCalledTimes(1);
    expect(onVerified).toHaveBeenCalledWith(VERIFIED_POLICY);
    // The verification step must close before the intake form opens.
    expect(onClose).toHaveBeenCalledTimes(0);
  });

  it("shows the error state when verification fails and does not offer continue", async () => {
    vi.mocked(verifyPolicy).mockRejectedValue(
      mockAxiosError("Policy POL-00000000 was not found. Check the number and try again."),
    );

    const user = setupUserEvent();
    render(
      <PolicyVerificationModal isOpen onClose={onClose} onVerified={onVerified} />,
    );

    await user.type(
      screen.getByPlaceholderText("POL-1234567"),
      "00000000",
    );
    await user.type(
      screen.getByPlaceholderText("ABC-1234"),
      "ABC-1234",
    );
    await user.click(screen.getByRole("button", { name: /التحقق من البوليصة/i }));

    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toMatch(/was not found/);
    expect(screen.queryByRole("button", { name: /المتابعة لإنشاء المطالبة/i })).toBeNull();
    expect(onVerified).not.toHaveBeenCalled();
  });

  it("disables the verify action while a verification is pending", async () => {
    let resolveVerify!: (response: PolicyVerificationResponse) => void;
    vi.mocked(verifyPolicy).mockImplementation(
      () =>
        new Promise<PolicyVerificationResponse>((resolve) => {
          resolveVerify = resolve;
        }),
    );

    const user = setupUserEvent();
    render(
      <PolicyVerificationModal isOpen onClose={onClose} onVerified={onVerified} />,
    );

    await user.type(
      screen.getByPlaceholderText("POL-1234567"),
      "POL-1000203",
    );
    await user.type(
      screen.getByPlaceholderText("ABC-1234"),
      "ABC-1234",
    );

    const verifyButton = screen.getByRole("button", {
      name: /التحقق من البوليصة/i,
    }) as HTMLButtonElement;

    await user.click(verifyButton);
    expect(verifyButton.disabled).toBe(true);

    resolveVerify(VERIFIED_POLICY);
    expect(
      await screen.findByText(/تم التحقق بنجاح/i),
    ).toBeTruthy();
  });

  it("resets all step state when the modal closes and reopens", async () => {
    vi.mocked(verifyPolicy).mockResolvedValue(VERIFIED_POLICY);

    const user = setupUserEvent();
    const { rerender } = render(
      <PolicyVerificationModal isOpen onClose={onClose} onVerified={onVerified} />,
    );

    await user.type(
      screen.getByPlaceholderText("POL-1234567"),
      "POL-1000203",
    );
    await user.type(
      screen.getByPlaceholderText("ABC-1234"),
      "ABC-1234",
    );
    await user.click(screen.getByRole("button", { name: /التحقق من البوليصة/i }));
    expect(await screen.findByText(/تم التحقق بنجاح/i)).toBeTruthy();

    rerender(
      <PolicyVerificationModal isOpen={false} onClose={onClose} onVerified={onVerified} />,
    );

    rerender(
      <PolicyVerificationModal isOpen onClose={onClose} onVerified={onVerified} />,
    );

    await waitFor(() => {
      expect(
        (
          screen.getByPlaceholderText("POL-1234567") as HTMLInputElement
        ).value,
      ).toBe("");
    });
    expect(screen.queryByText(/تم التحقق بنجاح/i)).toBeNull();
  });
});