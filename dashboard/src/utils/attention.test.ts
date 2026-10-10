// @vitest-environment jsdom
import { describe, expect, it } from "vitest";

import {
  ATTENTION_GROUPS,
  STALE_AFTER_DAYS,
  buildAttentionGroups,
  claimAgeInDays,
  capacityHeadroom,
  isOverdue,
  summarizeTeamCapacity,
} from "./attention";
import type { ClaimStatus, ClaimSummary, FieldAdjuster } from "../types";

const NOW = Date.parse("2026-03-10T12:00:00.000Z");

function daysAgo(days: number): string {
  return new Date(NOW - days * 86_400_000).toISOString();
}

function claim(status: ClaimStatus, id: string, ageDays = 0): ClaimSummary {
  return {
    id,
    claimNumber: id.toUpperCase(),
    customerName: "Customer",
    initialPlateNumber: "ABC-123",
    status,
    createdAt: daysAgo(ageDays),
    updatedAt: daysAgo(ageDays),
  } as ClaimSummary;
}

function adjuster(overrides: Partial<FieldAdjuster> = {}): FieldAdjuster {
  return {
    id: overrides.id ?? "fa-1",
    name: "Ahmed",
    employeeCode: "FA-001",
    role: "FIELD_ADJUSTER",
    organizationId: "org",
    organizationName: "Org",
    status: "ACTIVE",
    activeTasksCount: 1,
    capacityLimit: 3,
    availability: "AVAILABLE",
    ...overrides,
  } as FieldAdjuster;
}

describe("claimAgeInDays", () => {
  it("floors to whole days", () => {
    expect(claimAgeInDays(daysAgo(0), NOW)).toBe(0);
    expect(claimAgeInDays(daysAgo(2), NOW)).toBe(2);
    expect(claimAgeInDays(daysAgo(9), NOW)).toBe(9);
  });

  it("never goes negative for a future date", () => {
    expect(claimAgeInDays(daysAgo(-3), NOW)).toBe(0);
  });

  it("returns 0 for an unparseable date instead of NaN", () => {
    expect(claimAgeInDays("not-a-date", NOW)).toBe(0);
  });
});

describe("isOverdue", () => {
  it(`flags a claim from ${STALE_AFTER_DAYS} days old`, () => {
    expect(isOverdue(daysAgo(STALE_AFTER_DAYS - 1), NOW)).toBe(false);
    expect(isOverdue(daysAgo(STALE_AFTER_DAYS), NOW)).toBe(true);
    expect(isOverdue(daysAgo(STALE_AFTER_DAYS + 5), NOW)).toBe(true);
  });
});

describe("buildAttentionGroups", () => {
  it("drops empty groups so the queue carries no zero rows", () => {
    const groups = buildAttentionGroups(
      [claim("NEW", "a"), claim("NEW", "b")],
      NOW,
    );

    expect(groups).toHaveLength(1);
    expect(groups[0].status).toBe("NEW");
    expect(groups[0].count).toBe(2);
  });

  it("returns an empty queue when nothing is blocking anybody", () => {
    const groups = buildAttentionGroups(
      [
        claim("IN_PROGRESS", "a"),
        claim("APPROVED", "b"),
        claim("CLOSED", "c"),
      ],
      NOW,
    );

    expect(groups).toEqual([]);
  });

  it("reports the age of the OLDEST claim, not the newest", () => {
    const groups = buildAttentionGroups(
      [claim("NEW", "fresh", 0), claim("NEW", "old", 8), claim("NEW", "mid", 4)],
      NOW,
    );

    expect(groups[0].oldestAgeDays).toBe(8);
    expect(groups[0].isOverdue).toBe(true);
  });

  it("marks a group as overdue only once the oldest claim is stale", () => {
    const [notStale] = buildAttentionGroups([claim("NEW", "a", 1)], NOW);
    expect(notStale.isOverdue).toBe(false);

    const [stale] = buildAttentionGroups(
      [claim("NEW", "a", 1), claim("NEW", "b", 6)],
      NOW,
    );
    expect(stale.isOverdue).toBe(true);
  });

  it("sorts the claims inside a group oldest first", () => {
    const [group] = buildAttentionGroups(
      [claim("NEW", "newest", 1), claim("NEW", "oldest", 7)],
      NOW,
    );

    expect(group.claims.map((c) => c.id)).toEqual(["oldest", "newest"]);
  });

  it("covers every blocking status the operator can act on", () => {
    const groups = buildAttentionGroups(
      ATTENTION_GROUPS.map((g) => claim(g.status, g.key)),
      NOW,
    );

    expect(groups).toHaveLength(ATTENTION_GROUPS.length);
    expect(groups.every((g) => g.count === 1)).toBe(true);
  });

  it("tells the operator who each group is waiting on", () => {
    const groups = buildAttentionGroups(
      ATTENTION_GROUPS.map((g) => claim(g.status, g.key)),
      NOW,
    );
    const byStatus = Object.fromEntries(groups.map((g) => [g.status, g.waitingOn]));

    expect(byStatus.NEW).toBe("officer");
    expect(byStatus.PENDING_ACCEPTANCE).toBe("adjuster");
    expect(byStatus.SUBMITTED).toBe("officer");
    expect(byStatus.CORRECTION_REQUIRED).toBe("adjuster");
    expect(byStatus.UNDER_REVIEW).toBe("admin");
  });

  it("leaves out statuses nobody is waiting on", () => {
    const statuses = ATTENTION_GROUPS.map((g) => g.status);
    expect(statuses).not.toContain("IN_PROGRESS");
    expect(statuses).not.toContain("ASSIGNED");
    expect(statuses).not.toContain("APPROVED");
    expect(statuses).not.toContain("REJECTED");
    expect(statuses).not.toContain("CLOSED");
  });
});

describe("summarizeTeamCapacity", () => {
  it("adds up spare slots across the team", () => {
    const capacity = summarizeTeamCapacity([
      adjuster({ id: "a", activeTasksCount: 1, capacityLimit: 3 }),
      adjuster({ id: "b", activeTasksCount: 1, capacityLimit: 3 }),
    ]);

    expect(capacity).toMatchObject({
      total: 2,
      availableNow: 2,
      activeTasks: 2,
      spare: 4,
      hasUncappedAdjusters: false,
    });
  });

  it("counts AVAILABLE adjusters", () => {
    const capacity = summarizeTeamCapacity([
      adjuster({ id: "a", availability: "AVAILABLE" }),
      adjuster({ id: "b", availability: "UNAVAILABLE" }),
    ]);

    expect(capacity.availableNow).toBe(1);
  });

  it("never reports negative spare when a team is overloaded", () => {
    const capacity = summarizeTeamCapacity([
      adjuster({ activeTasksCount: 7, capacityLimit: 3 }),
    ]);

    expect(capacity.spare).toBe(0);
  });

  it("ignores an adjuster with no capacity limit and flags it", () => {
    const capacity = summarizeTeamCapacity([
      adjuster({ id: "a", activeTasksCount: 1, capacityLimit: 3 }),
      adjuster({ id: "b", activeTasksCount: 0, capacityLimit: null }),
    ]);

    expect(capacity.spare).toBe(2);
    expect(capacity.hasUncappedAdjusters).toBe(true);
  });

  it("handles an empty roster without dividing or crashing", () => {
    expect(summarizeTeamCapacity([])).toMatchObject({
      total: 0,
      spare: 0,
      hasUncappedAdjusters: false,
    });
  });
});

describe("capacityHeadroom", () => {
  const capacity = summarizeTeamCapacity([
    adjuster({ id: "a", activeTasksCount: 1, capacityLimit: 3 }),
  ]);

  it("warns when more claims wait than there are free slots", () => {
    // capacity: 1 adjuster, 1 active task, limit 3 -> 2 spare slots.
    const headroom = capacityHeadroom(capacity, [
      claim("NEW", "a"),
      claim("NEW", "b"),
      claim("NEW", "c"),
    ]);

    expect(headroom.level).toBe("over");
    expect(headroom.shortfall).toBe(1);
    expect(headroom.message).toMatch(/1 more claim waiting than/);
  });

  it("counts every missing slot when the team is well over capacity", () => {
    const headroom = capacityHeadroom(capacity, [
      claim("NEW", "a"),
      claim("NEW", "b"),
      claim("NEW", "c"),
      claim("NEW", "d"),
    ]);

    expect(headroom.shortfall).toBe(2);
  });

  it("says capacity is tight but sufficient", () => {
    const headroom = capacityHeadroom(capacity, [claim("NEW", "a")]);

    expect(headroom.level).toBe("tight");
    expect(headroom.shortfall).toBe(0);
    expect(headroom.message).toMatch(/Capacity covers all 1 claim/);
  });

  it("is calm when nothing is waiting", () => {
    const headroom = capacityHeadroom(capacity, [claim("IN_PROGRESS", "a")]);

    expect(headroom.level).toBe("ok");
    expect(headroom.message).toBe("No claims are waiting to be assigned.");
  });

  it("does not count a claim that already has an adjuster", () => {
    const headroom = capacityHeadroom(capacity, [
      claim("IN_PROGRESS", "a"),
      claim("UNDER_REVIEW", "b"),
      claim("CLOSED", "c"),
    ]);

    expect(headroom.awaitingAssignment).toBe(0);
    expect(headroom.level).toBe("ok");
  });
});
