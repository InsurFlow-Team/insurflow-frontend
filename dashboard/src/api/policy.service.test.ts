import { describe, expect, it } from "vitest";
import { verifyPolicy } from "./policy.service";

describe("verifyPolicy (development mock)", () => {
  it("resolves with an ACTIVE policy for a normal policy number", async () => {
    const policy = await verifyPolicy("POL-1000203");
    expect(policy).toMatchObject({
      policyNumber: "POL-1000203",
      status: "ACTIVE",
    });
  });

  it("trims whitespace and echoes the clean number into the result", async () => {
    const policy = await verifyPolicy("  POL-504  ");
    expect(policy.policyNumber).toBe("POL-504");
    expect(policy.status).toBe("ACTIVE");
  });

  it("rejects with an axios-shaped 404 for the reserved failure number", async () => {
    await expect(verifyPolicy("00000000")).rejects.toMatchObject({
      isAxiosError: true,
      response: { status: 404 },
    });
  });
});