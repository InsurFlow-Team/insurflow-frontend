import { describe, expect, it } from "vitest";

import {
  ALL_CLAIM_STATUSES,
  countClaimsByStatus,
  emptyClaimStatusCounts,
  sumClaimStatusCounts,
} from "./claims";
import { CLAIM_STATUS_CARDS } from "../components/ui/claimStatCards";
import type { ClaimStatus, ClaimSummary } from "../types";

function claim(status: ClaimStatus, id = "x"): ClaimSummary {
  return {
    id,
    claimNumber: `CLM-${id}`,
    status,
    customerName: "John Doe",
    initialPlateNumber: "ABC-1234",
    createdAt: "2026-09-20T10:00:00.000Z",
  };
}

describe("countClaimsByStatus", () => {
  it("starts every status at zero instead of leaving gaps", () => {
    const counts = emptyClaimStatusCounts();

    for (const status of ALL_CLAIM_STATUSES) {
      expect(counts[status]).toBe(0);
    }
  });

  it("buckets each claim under its own status", () => {
    const claims = [
      claim("NEW", "a"),
      claim("NEW", "b"),
      claim("IN_PROGRESS", "c"),
      claim("CLOSED", "d"),
    ];

    const counts = countClaimsByStatus(claims);

    expect(counts.NEW).toBe(2);
    expect(counts.IN_PROGRESS).toBe(1);
    expect(counts.CLOSED).toBe(1);
    expect(counts.APPROVED).toBe(0);
  });

  it("returns all zeros for an empty portfolio", () => {
    expect(sumClaimStatusCounts(countClaimsByStatus([]))).toBe(0);
  });

  it("ignores a status this build does not know about", () => {
    const counts = countClaimsByStatus([
      { ...claim("NEW", "a"), status: "SOMETHING_NEW" as ClaimStatus },
    ]);

    expect(counts.NEW).toBe(0);
    expect(sumClaimStatusCounts(counts)).toBe(0);
  });
});

describe("the stat cards cover every claim status", () => {
  it("has exactly one card per status, so the cards add up to the total", () => {
    const cardStatuses = CLAIM_STATUS_CARDS.map((card) => card.key);

    expect(cardStatuses).toHaveLength(ALL_CLAIM_STATUSES.length);
    expect([...cardStatuses].sort()).toEqual([...ALL_CLAIM_STATUSES].sort());
  });

  it("never repeats a status", () => {
    const cardStatuses = CLAIM_STATUS_CARDS.map((card) => card.key);

    expect(new Set(cardStatuses).size).toBe(cardStatuses.length);
  });

  it("gives every card a label and a caption", () => {
    for (const card of CLAIM_STATUS_CARDS) {
      expect(card.label).not.toBe("");
      expect(card.secondary).not.toBe("");
    }
  });

  it("sums to the real claim count for a full portfolio", () => {
    const claims = ALL_CLAIM_STATUSES.map((status) => claim(status));

    expect(sumClaimStatusCounts(countClaimsByStatus(claims))).toBe(
      claims.length,
    );
  });
});
