import { describe, expect, it } from "vitest";

import { getAvailableClaimActions } from "./claimActions";

describe("getAvailableClaimActions", () => {
  it("offers ASSIGN only for NEW claims and only to CLAIMS_OFFICER", () => {
    expect(
      getAvailableClaimActions({ status: "NEW", role: "CLAIMS_OFFICER" }),
    ).toEqual(["ASSIGN"]);

    // Other roles never get ASSIGN even when status is NEW.
    expect(getAvailableClaimActions({ status: "NEW", role: "ADMIN" })).toEqual(
      [],
    );
    expect(
      getAvailableClaimActions({ status: "NEW", role: "FIELD_ADJUSTER" }),
    ).toEqual([]);
  });

  it("never offers ASSIGN once the claim left NEW (assignment only from NEW)", () => {
    const statuses = ["ASSIGNED", "SUBMITTED", "UNDER_REVIEW", "APPROVED", "CLOSED"] as const;

    for (const status of statuses) {
      expect(
        getAvailableClaimActions({ status, role: "CLAIMS_OFFICER" }),
      ).not.toContain("ASSIGN");
    }
  });

  it("offers START_REVIEW for SUBMITTED claims", () => {
    expect(
      getAvailableClaimActions({ status: "SUBMITTED", role: "CLAIMS_OFFICER" }),
    ).toEqual(["START_REVIEW"]);
  });

  it("returns no actions for statuses without an authorized action", () => {
    expect(
      getAvailableClaimActions({ status: "ASSIGNED", role: "CLAIMS_OFFICER" }),
    ).toEqual([]);
    expect(getAvailableClaimActions({ status: "NEW", role: "ADMIN" })).toEqual(
      [],
    );
  });
});