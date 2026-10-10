import { describe, expect, it } from "vitest";

import { getAvailableClaimActions } from "./claimActions";

describe("getAvailableClaimActions", () => {
  it("offers ASSIGN for NEW claims to both dashboard roles", () => {
    expect(
      getAvailableClaimActions({ status: "NEW", role: "CLAIMS_OFFICER" }),
    ).toEqual(["ASSIGN"]);

    // ADMIN may assign too: the App.tsx guards allow it and the backend
    // accepts it (verified live — see masar-rbac skill).
    expect(getAvailableClaimActions({ status: "NEW", role: "ADMIN" })).toEqual(
      ["ASSIGN"],
    );
  });

  it("never offers actions to FIELD_ADJUSTER (blocked from this dashboard)", () => {
    expect(
      getAvailableClaimActions({ status: "NEW", role: "FIELD_ADJUSTER" }),
    ).toEqual([]);
    expect(
      getAvailableClaimActions({ status: "SUBMITTED", role: "FIELD_ADJUSTER" }),
    ).toEqual([]);
  });

  it("never offers ASSIGN once the claim left NEW (assignment only from NEW)", () => {
    const statuses = [
      "PENDING_ACCEPTANCE",
      "ASSIGNED",
      "IN_PROGRESS",
      "SUBMITTED",
      "CORRECTION_REQUIRED",
      "UNDER_REVIEW",
      "APPROVED",
      "CLOSED",
    ] as const;

    for (const status of statuses) {
      expect(
        getAvailableClaimActions({ status, role: "CLAIMS_OFFICER" }),
      ).not.toContain("ASSIGN");
    }
  });

  it("offers START_REVIEW for SUBMITTED claims to dashboard roles", () => {
    expect(
      getAvailableClaimActions({ status: "SUBMITTED", role: "CLAIMS_OFFICER" }),
    ).toEqual(["START_REVIEW"]);
    expect(
      getAvailableClaimActions({ status: "SUBMITTED", role: "ADMIN" }),
    ).toEqual(["START_REVIEW"]);
  });

  it("returns no actions for statuses without an authorized action", () => {
    expect(
      getAvailableClaimActions({ status: "ASSIGNED", role: "CLAIMS_OFFICER" }),
    ).toEqual([]);
    expect(
      getAvailableClaimActions({ status: "UNDER_REVIEW", role: "CLAIMS_OFFICER" }),
    ).toEqual([]);
  });
});
