// @vitest-environment jsdom
import { describe, expect, it, afterEach } from "vitest";
import { render, screen, cleanup, within } from "@testing-library/react";

import ClaimStatsGrid from "./ClaimStatsGrid";
import { ALL_CLAIM_STATUSES } from "../../utils/claims";
import { CLAIM_STATUS_CARDS } from "../ui/claimStatCards";
import type { ClaimStatus, ClaimSummary } from "../../types";

function claim(status: ClaimStatus, id: string): ClaimSummary {
  return {
    id,
    claimNumber: `CLM-${id}`,
    status,
    customerName: "John Doe",
    initialPlateNumber: "ABC-1234",
    createdAt: "2026-09-20T10:00:00.000Z",
  };
}

function cardFor(label: string): HTMLElement {
  const labelNode = screen
    .getAllByText(label)
    .find((element) => element.closest("article"));

  if (!labelNode) throw new Error(`No stat card labelled "${label}"`);

  return labelNode.closest("article") as HTMLElement;
}

describe("ClaimStatsGrid", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders one card per status plus the total", () => {
    render(<ClaimStatsGrid claims={[]} />);

    expect(screen.getByText("Total Claims")).toBeTruthy();
    for (const card of CLAIM_STATUS_CARDS) {
      expect(screen.getByText(card.label)).toBeTruthy();
    }
  });

  it("adds up to the total for a real portfolio", () => {
    const claims = [
      claim("NEW", "a"),
      claim("NEW", "b"),
      claim("PENDING_ACCEPTANCE", "c"),
      claim("IN_PROGRESS", "d"),
      claim("IN_PROGRESS", "e"),
      claim("IN_PROGRESS", "f"),
      claim("IN_PROGRESS", "g"),
      claim("UNDER_REVIEW", "h"),
      claim("APPROVED", "i"),
      claim("APPROVED", "j"),
      claim("CLOSED", "k"),
      claim("CLOSED", "l"),
    ];

    render(<ClaimStatsGrid claims={claims} />);

    expect(within(cardFor("Total Claims")).getByText("12")).toBeTruthy();
    expect(within(cardFor("New")).getByText("2")).toBeTruthy();
    expect(within(cardFor("Awaiting Reply")).getByText("1")).toBeTruthy();
    expect(within(cardFor("In Progress")).getByText("4")).toBeTruthy();
    expect(within(cardFor("Under Review")).getByText("1")).toBeTruthy();
    expect(within(cardFor("Approved")).getByText("2")).toBeTruthy();
    expect(within(cardFor("Closed")).getByText("2")).toBeTruthy();

    // Every stage the cards show is counted, so nothing is left unexplained.
    const cardTotal = CLAIM_STATUS_CARDS.reduce(
      (sum, card) => sum + Number(within(cardFor(card.label)).getByText(/^\d+$/).textContent),
      0,
    );
    expect(cardTotal).toBe(12);
  });

  it("shows a zero for a stage with no claims rather than hiding it", () => {
    render(<ClaimStatsGrid claims={[claim("NEW", "a")]} />);

    expect(within(cardFor("Submitted")).getByText("0")).toBeTruthy();
    expect(within(cardFor("Rejected")).getByText("0")).toBeTruthy();
    expect(within(cardFor("Correction Required")).getByText("0")).toBeTruthy();
  });

  it("keeps a card for every status, including the ones with no live data", () => {
    render(<ClaimStatsGrid claims={[]} />);

    for (const status of ALL_CLAIM_STATUSES) {
      const card = CLAIM_STATUS_CARDS.find((candidate) => candidate.key === status);
      expect(card).toBeTruthy();
      expect(within(cardFor(card!.label)).getByText("0")).toBeTruthy();
    }
  });

  it("describes New as awaiting assignment, not the customer", () => {
    render(<ClaimStatsGrid claims={[]} />);

    expect(within(cardFor("New")).getByText("Awaiting assignment")).toBeTruthy();
  });

  it("renders skeletons and no zeroed cards while loading", () => {
    render(<ClaimStatsGrid claims={[]} loading />);

    expect(screen.queryByText("Total Claims")).toBeNull();
  });
});
