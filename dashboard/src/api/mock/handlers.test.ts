import { describe, expect, it } from "vitest";
import { activeTasksFor } from "./handlers";
import type { MockDb } from "./store";
import type { MockClaim } from "./seed";
import type { ClaimStatus } from "../../types";

function makeClaim(id: string, status: ClaimStatus, adjusterId: string | null): MockClaim {
  return {
    _id: id,
    status,
    assignedTo: adjusterId ? { _id: adjusterId } : null,
  } as unknown as MockClaim;
}

describe("activeTasksFor", () => {
  it("explicitly verifies status counting against business rules", () => {
    const db: MockDb = {
      users: [],
      claims: [
        makeClaim("1", "NEW", "adj-1"),
        makeClaim("2", "PENDING_ACCEPTANCE", "adj-1"),
        makeClaim("3", "ASSIGNED", "adj-1"),
        makeClaim("4", "IN_PROGRESS", "adj-1"),
        makeClaim("5", "SUBMITTED", "adj-1"),
        makeClaim("6", "UNDER_REVIEW", "adj-1"),
        makeClaim("7", "APPROVED", "adj-1"),
        makeClaim("8", "REJECTED", "adj-1"),
        makeClaim("9", "CLOSED", "adj-1"),
        
        // Assigned to another adjuster
        makeClaim("10", "IN_PROGRESS", "adj-2"),
      ],
    };

    // Only ASSIGNED and IN_PROGRESS should count
    expect(activeTasksFor(db, "adj-1")).toBe(2);
  });

  it("regression: when an IN_PROGRESS claim becomes SUBMITTED, activeTasksCount decreases immediately", () => {
    const claim1 = makeClaim("c1", "IN_PROGRESS", "adj-1");
    const claim2 = makeClaim("c2", "IN_PROGRESS", "adj-1");
    const claim3 = makeClaim("c3", "IN_PROGRESS", "adj-1");
    
    const db: MockDb = {
      users: [],
      claims: [claim1, claim2, claim3],
    };

    // Initially 3 active claims (e.g. 3 / 3 capacity)
    expect(activeTasksFor(db, "adj-1")).toBe(3);

    // Act: One claim becomes SUBMITTED (inspection finished)
    claim1.status = "SUBMITTED";

    // Assert: active tasks decreases (e.g. drops to 2 / 3, capacity released)
    expect(activeTasksFor(db, "adj-1")).toBe(2);
  });
});
