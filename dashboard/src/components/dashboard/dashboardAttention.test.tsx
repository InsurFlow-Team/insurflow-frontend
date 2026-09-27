// @vitest-environment jsdom
import { describe, expect, it, afterEach } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import NeedsAttentionSection from "./NeedsAttentionSection";
import TeamCapacityCard from "./TeamCapacityCard";
import type { ClaimStatus, ClaimSummary, FieldAdjuster } from "../../types";

const NOW = Date.now();
const daysAgo = (days: number) =>
  new Date(NOW - days * 86_400_000).toISOString();

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
    id: "fa-1",
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

const renderInRouter = (ui: React.ReactElement) =>
  render(<MemoryRouter>{ui}</MemoryRouter>);

afterEach(cleanup);

describe("NeedsAttentionSection", () => {
  it("says nothing is waiting when every claim is moving", () => {
    renderInRouter(
      <NeedsAttentionSection
        claims={[claim("IN_PROGRESS", "a"), claim("APPROVED", "b")]}
        loading={false}
      />,
    );

    expect(screen.getByText(/Nothing is waiting on anyone/)).toBeTruthy();
    expect(screen.queryByText("Needs Assignment")).toBeNull();
  });

  it("lists only the statuses that are actually blocked", () => {
    renderInRouter(
      <NeedsAttentionSection
        claims={[
          claim("NEW", "a"),
          claim("NEW", "b"),
          claim("UNDER_REVIEW", "c"),
          claim("IN_PROGRESS", "d"),
          claim("CLOSED", "e"),
        ]}
        loading={false}
      />,
    );

    expect(screen.getByText("Needs Assignment")).toBeTruthy();
    expect(screen.getByText("Awaiting Decision")).toBeTruthy();
    expect(screen.queryByText("Ready for Review")).toBeNull();
    expect(screen.queryByText("Awaiting Correction")).toBeNull();
  });

  it("tells the operator who each group is waiting on", () => {
    renderInRouter(
      <NeedsAttentionSection
        claims={[claim("PENDING_ACCEPTANCE", "a"), claim("NEW", "b")]}
        loading={false}
      />,
    );

    expect(
      screen.getByText("Offered, no response from the adjuster yet"),
    ).toBeTruthy();
    expect(
      screen.getByText("Waiting to be assigned to an adjuster"),
    ).toBeTruthy();
  });

  it("links each group into the matching /claims status filter", () => {
    renderInRouter(
      <NeedsAttentionSection
        claims={[claim("NEW", "a"), claim("UNDER_REVIEW", "b")]}
        loading={false}
      />,
    );

    expect(screen.getByRole("link", { name: "Needs Assignment" }).getAttribute("href")).toBe(
      "/claims?status=NEW",
    );
    expect(
      screen.getByRole("link", { name: "Awaiting Decision" }).getAttribute("href"),
    ).toBe("/claims?status=UNDER_REVIEW");
  });

  it("shows the count per group", () => {
    renderInRouter(
      <NeedsAttentionSection
        claims={[claim("NEW", "a"), claim("NEW", "b"), claim("NEW", "c")]}
        loading={false}
      />,
    );

    const item = screen.getByRole("link", { name: "Needs Assignment" }).closest("li");
    expect(within(item!).getByText("3")).toBeTruthy();
  });

  it("warns when the oldest claim passed the 3-day threshold", () => {
    renderInRouter(
      <NeedsAttentionSection
        claims={[claim("NEW", "fresh", 0), claim("NEW", "stale", 7)]}
        loading={false}
      />,
    );

    expect(screen.getByText(/Overdue — waiting 7 days \(threshold 3 days\)/)).toBeTruthy();
    expect(screen.getByText(/oldest 7 days/)).toBeTruthy();
  });

  it("does not warn about a claim that is still fresh", () => {
    renderInRouter(
      <NeedsAttentionSection claims={[claim("NEW", "fresh", 1)]} loading={false} />,
    );

    expect(screen.queryByText(/Overdue/)).toBeNull();
    expect(screen.getByText(/oldest 1 day$/)).toBeTruthy();
  });

  it("reports the age of the oldest claim, not the newest", () => {
    renderInRouter(
      <NeedsAttentionSection
        claims={[claim("NEW", "newest", 0), claim("NEW", "oldest", 6)]}
        loading={false}
      />,
    );

    expect(screen.getByText(/oldest 6 days/)).toBeTruthy();
    expect(screen.queryByText(/oldest 0 days/)).toBeNull();
  });

  it("shows a loading line before any claim data arrives", () => {
    renderInRouter(<NeedsAttentionSection claims={[]} loading />);

    expect(screen.getByText(/Checking for blocked claims/)).toBeTruthy();
  });
});

describe("TeamCapacityCard", () => {
  it("shows spare slots and the team breakdown", () => {
    renderInRouter(
      <TeamCapacityCard
        adjusters={[
          adjuster({ id: "a" }),
          adjuster({ id: "b", activeTasksCount: 1 }),
        ]}
        claims={[claim("NEW", "x")]}
        loading={false}
      />,
    );

    // Scoped to the headline so it cannot collide with the breakdown numbers.
    const headline = screen.getByText(/spare inspection slots/).parentElement!;
    expect(within(headline).getByText("4")).toBeTruthy();
    expect(screen.getByText("2 adjusters")).toBeTruthy();
    expect(screen.getByText("Available now").parentElement).toBeTruthy();
  });

  it("confirms capacity covers the claims waiting", () => {
    renderInRouter(
      <TeamCapacityCard
        adjusters={[adjuster()]}
        claims={[claim("NEW", "x")]}
        loading={false}
      />,
    );

    expect(
      screen.getByText(/Capacity covers all 1 claim waiting, with only 2 slots to spare/),
    ).toBeTruthy();
  });

  it("warns when claims outnumber the free slots", () => {
    renderInRouter(
      <TeamCapacityCard
        adjusters={[adjuster()]}
        claims={[claim("NEW", "a"), claim("NEW", "b"), claim("NEW", "c")]}
        loading={false}
      />,
    );

    expect(
      screen.getByText(/1 more claim waiting than there are free inspection slots/),
    ).toBeTruthy();
    expect(
      screen.getByRole("link", { name: /Assign the waiting claims/ }).getAttribute("href"),
    ).toBe("/claims?status=NEW");
  });

  it("says no claims are waiting when nothing needs assigning", () => {
    renderInRouter(
      <TeamCapacityCard
        adjusters={[adjuster()]}
        claims={[claim("IN_PROGRESS", "a")]}
        loading={false}
      />,
    );

    expect(screen.getByText("No claims are waiting to be assigned.")).toBeTruthy();
    expect(
      screen.queryByRole("link", { name: /Assign the waiting claims/ }),
    ).toBeNull();
  });

  it("discloses that uncapped adjusters are excluded from the spare count", () => {
    renderInRouter(
      <TeamCapacityCard
        adjusters={[adjuster(), adjuster({ id: "b", capacityLimit: null })]}
        claims={[]}
        loading={false}
      />,
    );

    expect(screen.getByText(/no capacity limit set/)).toBeTruthy();
  });

  it("degrades quietly when the roster request fails", () => {
    renderInRouter(
      <TeamCapacityCard
        adjusters={[]}
        claims={[claim("NEW", "a")]}
        loading={false}
        error="Forbidden"
      />,
    );

    expect(screen.getByText(/capacity is unavailable right now/)).toBeTruthy();
    expect(screen.queryByText(/spare inspection/)).toBeNull();
  });
});
