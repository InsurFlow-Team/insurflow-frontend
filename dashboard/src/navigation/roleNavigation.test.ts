import { describe, expect, it } from "vitest";

import {
  ROLE_NAVIGATION,
  isKnownPath,
  navigationForRole,
  pendingNavigationItems,
} from "./roleNavigation";

const liveKeys = (role: Parameters<typeof navigationForRole>[0]) =>
  navigationForRole(role).map((item) => item.key);

describe("roleNavigation", () => {
  it("returns only live items with a real path", () => {
    const admin = navigationForRole("ADMIN");

    expect(admin.map((item) => item.key)).toEqual([
      "overview",
      "claims",
      "field-adjusters",
      "map",
      "users",
      "settings",
      "profile",
    ]);
    for (const item of admin) {
      expect(item.status).toBe("live");
      expect(item.path).toBeTruthy();
    }
  });

  it("hides administration from CLAIMS_OFFICER", () => {
    expect(liveKeys("CLAIMS_OFFICER")).toEqual([
      "overview",
      "claims",
      "field-adjusters",
      "map",
      "profile",
    ]);
    expect(liveKeys("FIELD_ADJUSTER")).toEqual([]);
    expect(liveKeys(null)).toEqual([]);
    expect(liveKeys(undefined)).toEqual([]);
  });

  it("never returns pending items by default — no nav entry without a route", () => {
    for (const role of ["ADMIN", "CLAIMS_OFFICER", "FIELD_ADJUSTER"] as const) {
      for (const item of navigationForRole(role)) {
        expect(item.status).toBe("live");
        expect(item.path).not.toBeNull();
      }
    }

    const pending = pendingNavigationItems();
    expect(pending.map((item) => item.key)).toContain("assignments");
    expect(pending.map((item) => item.key)).toContain("reports");
    for (const item of pending) {
      expect(item.path).toBeNull();
      expect(item.pendingReason).toBeTruthy();
    }
  });

  it("records the adjuster column as pending, not as reachable navigation", () => {
    const adjusterPending = pendingNavigationItems("FIELD_ADJUSTER");
    expect(adjusterPending.map((item) => item.key)).toEqual([
      "adjuster-overview",
      "adjuster-my-assignments",
      "adjuster-map",
      "adjuster-my-reports",
    ]);
    for (const item of adjusterPending) {
      expect(item.pendingReason).toContain("FIELD_ADJUSTER");
    }
    expect(navigationForRole("FIELD_ADJUSTER", { includePending: true })).toHaveLength(4);
  });

  it("can filter by group", () => {
    expect(
      navigationForRole("ADMIN", { group: "administration" }).map((i) => i.key),
    ).toEqual(["users", "settings"]);
    expect(
      navigationForRole("CLAIMS_OFFICER", { group: "account" }).map((i) => i.key),
    ).toEqual(["profile"]);
  });

  it("knows every path the approved IA claims to support", () => {
    expect(isKnownPath("/dashboard")).toBe(true);
    expect(isKnownPath("/claims")).toBe(true);
    expect(isKnownPath("/map")).toBe(true);
    expect(isKnownPath("/settings/users")).toBe(true);
    expect(isKnownPath("/assignments")).toBe(false);
    expect(isKnownPath("/reports")).toBe(false);

    // Every live path must be a route App.tsx actually declares.
    const livePaths = ROLE_NAVIGATION.filter((i) => i.status === "live").map(
      (i) => i.path,
    );
    expect(new Set(livePaths).size).toBe(livePaths.length);
  });
});
