import { describe, expect, it } from "vitest";

import {
  DASHBOARD_ROLES,
  canAssignClaim,
  canChangeOwnPassword,
  canDecideClaim,
  canExportReport,
  canManageUsers,
  canStartReview,
  canViewOperations,
  hasDashboardAccess,
} from "./roles";
import type { Role } from "../types";

const ALL_ROLES: Role[] = ["ADMIN", "CLAIMS_OFFICER", "FIELD_ADJUSTER"];

describe("roles", () => {
  it("gives dashboard access to ADMIN and CLAIMS_OFFICER only", () => {
    expect(hasDashboardAccess("ADMIN")).toBe(true);
    expect(hasDashboardAccess("CLAIMS_OFFICER")).toBe(true);
    expect(hasDashboardAccess("FIELD_ADJUSTER")).toBe(false);
    expect(hasDashboardAccess(null)).toBe(false);
    expect(hasDashboardAccess(undefined)).toBe(false);
    expect(DASHBOARD_ROLES).toEqual(["ADMIN", "CLAIMS_OFFICER"]);
  });

  it("keeps the final decision with ADMIN alone", () => {
    expect(canDecideClaim("ADMIN")).toBe(true);
    expect(canDecideClaim("CLAIMS_OFFICER")).toBe(false);
    expect(canDecideClaim("FIELD_ADJUSTER")).toBe(false);
  });

  it("keeps user management with ADMIN alone", () => {
    expect(canManageUsers("ADMIN")).toBe(true);
    expect(canManageUsers("CLAIMS_OFFICER")).toBe(false);
  });

  it("lets both dashboard roles assign, review, export and read operations", () => {
    for (const role of ["ADMIN", "CLAIMS_OFFICER"] as const) {
      expect(canAssignClaim(role)).toBe(true);
      expect(canStartReview(role)).toBe(true);
      expect(canExportReport(role)).toBe(true);
      expect(canViewOperations(role)).toBe(true);
      expect(canChangeOwnPassword(role)).toBe(true);
    }

    for (const role of ALL_ROLES) {
      if (role === "FIELD_ADJUSTER") {
        expect(canAssignClaim(role)).toBe(false);
        expect(canStartReview(role)).toBe(false);
        expect(canExportReport(role)).toBe(false);
        expect(canViewOperations(role)).toBe(false);
        expect(canChangeOwnPassword(role)).toBe(false);
      }
    }
  });
});
