import { describe, expect, it } from "vitest";

import {
  CLAIM_ACTIONS,
  CLAIM_ACTION_KEYS,
  actionDefinition,
  isActionAvailableFor,
  rolesForAction,
  webActionsFor,
} from "./actions";
import { getAvailableClaimActions } from "../utils/claimActions";
import { ALL_CLAIM_STATUSES } from "../utils/claims";
import type { Role } from "../types";

const DASHBOARD_ROLES: Role[] = ["ADMIN", "CLAIMS_OFFICER"];

describe("actions", () => {
  it("catalogues an i18n label and a status/role contract for every action", () => {
    expect(CLAIM_ACTION_KEYS).toHaveLength(11);

    for (const key of CLAIM_ACTION_KEYS) {
      const action = actionDefinition(key);
      expect(action.key).toBe(key);
      expect(action.labelKey).toBe(`action.${key}`);
      expect(action.availability).toMatch(/web|mobile-only|not-in-backend/);
      // Every status listed must be a real backend status.
      for (const status of action.requiresStatus ?? []) {
        expect(ALL_CLAIM_STATUSES).toContain(status);
      }
    }
  });

  it("matches the shipped UI matrix", () => {
    expect(webActionsFor({ status: "NEW", role: "ADMIN" })).toEqual([
      "REVIEW_CLAIM",
      "ASSIGN_ADJUSTER",
    ]);
    expect(webActionsFor({ status: "NEW", role: "CLAIMS_OFFICER" })).toEqual([
      "REVIEW_CLAIM",
      "ASSIGN_ADJUSTER",
    ]);
    expect(webActionsFor({ status: "SUBMITTED", role: "CLAIMS_OFFICER" })).toEqual([
      "REVIEW_CLAIM",
      "START_REVIEW",
    ]);
    expect(webActionsFor({ status: "UNDER_REVIEW", role: "ADMIN" })).toEqual([
      "REVIEW_CLAIM",
      "APPROVE_CLAIM",
      "REJECT_CLAIM",
    ]);
    // Claims Officer reviews but never decides (product ruling).
    expect(webActionsFor({ status: "UNDER_REVIEW", role: "CLAIMS_OFFICER" })).toEqual(
      ["REVIEW_CLAIM"],
    );
    expect(webActionsFor({ status: "APPROVED", role: "ADMIN" })).toEqual([
      "REVIEW_CLAIM",
      "EXPORT_REPORT",
    ]);
    // Assignment is only ever offered from NEW.
    expect(webActionsFor({ status: "ASSIGNED", role: "ADMIN" })).toEqual([
      "REVIEW_CLAIM",
    ]);
  });

  it("offers nothing to FIELD_ADJUSTER and no mobile-only action on the web", () => {
    for (const status of ALL_CLAIM_STATUSES) {
      expect(webActionsFor({ status, role: "FIELD_ADJUSTER" })).toEqual([]);
      expect(webActionsFor({ status, role: null })).toEqual([]);
    }

    const mobile = CLAIM_ACTION_KEYS.filter(
      (key) => CLAIM_ACTIONS[key].availability === "mobile-only",
    );
    expect(mobile).toEqual([
      "ACCEPT_ASSIGNMENT",
      "DECLINE_ASSIGNMENT",
      "START_INSPECTION",
      "SUBMIT_INSPECTION",
    ]);
    for (const key of mobile) {
      expect(isActionAvailableFor(key, { status: "PENDING_ACCEPTANCE", role: "ADMIN" })).toBe(
        false,
      );
    }

    expect(
      isActionAvailableFor("REASSIGN_ADJUSTER", {
        status: "NEW",
        role: "ADMIN",
      }),
    ).toBe(false);
  });

  it("stays in agreement with utils/claimActions", () => {
    for (const status of ALL_CLAIM_STATUSES) {
      for (const role of ["ADMIN", "CLAIMS_OFFICER", "FIELD_ADJUSTER"] as const) {
        const legacy = getAvailableClaimActions({ status, role });
        const actions = webActionsFor({ status, role });

        expect(actions.includes("ASSIGN_ADJUSTER")).toBe(
          legacy.includes("ASSIGN"),
        );
        expect(actions.includes("START_REVIEW")).toBe(
          legacy.includes("START_REVIEW"),
        );
      }
    }
  });

  it("documents who is expected to act", () => {
    expect(rolesForAction("APPROVE_CLAIM")).toEqual(["ADMIN"]);
    expect(rolesForAction("REJECT_CLAIM")).toEqual(["ADMIN"]);
    expect(rolesForAction("ASSIGN_ADJUSTER")).toEqual(DASHBOARD_ROLES);
    expect(rolesForAction("ACCEPT_ASSIGNMENT")).toEqual(["FIELD_ADJUSTER"]);
    expect(actionDefinition("ASSIGN_ADJUSTER").endpoint).toBe(
      "POST /claims/:id/assign",
    );
  });
});
