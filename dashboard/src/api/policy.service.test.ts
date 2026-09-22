import { describe, expect, it } from "vitest";
import { verifyPolicy } from "./policy.service";

describe("verifyPolicy", () => {
  it("resolves with verification response including policy, vehicle, and customer data", async () => {
    const request = {
      policyNumber: "POL-1000203",
      plateNumber: "ABC-1234",
      incidentDate: "2026-09-20",
    };
    
    const response = await verifyPolicy(request);
    
    expect(response.isEligible).toBe(true);
    expect(response.policy).toMatchObject({
      policyNumber: "POL-1000203",
      status: "ACTIVE",
    });
    expect(response.vehicle).toMatchObject({
      plateNumber: "ABC-1234",
    });
    expect(response.customer).toHaveProperty("name");
    expect(response.customer).toHaveProperty("phone");
  });

  it("trims whitespace from policy number and plate number", async () => {
    const request = {
      policyNumber: "  POL-504  ",
      plateNumber: "  XYZ-789  ",
      incidentDate: "2026-09-20",
    };
    
    const response = await verifyPolicy(request);
    
    expect(response.policy.policyNumber).toBe("POL-504");
    expect(response.vehicle.plateNumber).toBe("XYZ-789");
  });

  it("rejects with an axios-shaped 404 for non-existent policy", async () => {
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