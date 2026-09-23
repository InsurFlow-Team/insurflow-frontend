// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PolicyVerificationResponse } from "../types";

const mocks = vi.hoisted(() => ({ post: vi.fn() }));

vi.mock("./client", () => ({
  default: { post: mocks.post },
}));

import { verifyPolicy } from "./policy.service";

const VERIFIED_RESPONSE: PolicyVerificationResponse = {
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

describe("verifyPolicy", () => {
  beforeEach(() => {
    mocks.post.mockReset();
  });

  it("resolves with verification response including policy, vehicle, and customer data", async () => {
    mocks.post.mockResolvedValue({ data: { data: VERIFIED_RESPONSE } });

    const request = {
      policyNumber: "POL-1000203",
      plateNumber: "ABC-1234",
      incidentDate: "2026-09-20",
    };

    const response = await verifyPolicy(request);

    expect(mocks.post).toHaveBeenCalledWith("/policies/verify", request);
    expect(response.isEligible).toBe(true);
    expect(response.policy).toMatchObject({
      policyNumber: "POL-1000203",
      status: "ACTIVE",
    });
    expect(response.vehicle).toMatchObject({
      plateNumber: "ABC-1234",
    });
    expect(response.customer).toHaveProperty("fullName");
    expect(response.customer).toHaveProperty("phone");
  });

  it("forwards the (trimmed) policy and plate numbers in the verify request", async () => {
    const request = {
      policyNumber: "POL-504",
      plateNumber: "XYZ-789",
      incidentDate: "2026-09-20",
    };

    mocks.post.mockResolvedValue({
      data: {
        data: {
          ...VERIFIED_RESPONSE,
          policy: { ...VERIFIED_RESPONSE.policy, policyNumber: "POL-504" },
          vehicle: { ...VERIFIED_RESPONSE.vehicle, plateNumber: "XYZ-789" },
        },
      },
    });

    const response = await verifyPolicy(request);

    expect(mocks.post).toHaveBeenCalledWith("/policies/verify", request);
    expect(response.policy.policyNumber).toBe("POL-504");
    expect(response.vehicle.plateNumber).toBe("XYZ-789");
  });

  it("rejects with an axios-shaped 404 for non-existent policy", async () => {
    mocks.post.mockRejectedValue(
      Object.assign(new Error("Request failed with status code 404"), {
        isAxiosError: true,
        response: { status: 404 },
      }),
    );

    const request = {
      policyNumber: "00000000",
      plateNumber: "ABC-1234",
      incidentDate: "2026-09-20",
    };

    await expect(verifyPolicy(request)).rejects.toMatchObject({
      isAxiosError: true,
      response: { status: 404 },
    });
  });
});