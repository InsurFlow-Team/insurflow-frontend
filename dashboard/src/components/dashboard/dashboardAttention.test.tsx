// @vitest-environment jsdom
import { describe, expect, it, afterEach } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import I18nProvider from "../../i18n/I18nProvider";
import NeedsAttentionSection from "../NeedsAttention/NeedsAttentionSection";
import TeamCapacityCard from "./TeamCapacityCard";
import type { ClaimStatus, ClaimSummary, FieldAdjuster, Role } from "../../types";

const NOW = Date.now();
const daysAgo = (days: number) =>
  new Date(NOW - days * 86_400_000).toISOString();

function claim(
  status: ClaimStatus,
  id: string,
  ageDays = 0,
  overrides: Partial<ClaimSummary> = {},
): ClaimSummary {
  return {
    id,
    claimNumber: `CLM-${id.toUpperCase()}`,
    customerName: "Customer",
    initialPlateNumber: "ABC-123",
    status,
    createdAt: daysAgo(ageDays),
    updatedAt: daysAgo(ageDays),
    ...overrides,
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

const renderInRouter = (
  ui: React.ReactElement,
  { locale }: { locale?: "en" | "ar" } = {},
) =>
  render(
    <MemoryRouter>
      {locale ? (
        <I18nProvider>
          <div>{ui}</div>
        </I18nProvider>
      ) : (
        ui
      )}
    </MemoryRouter>,
  );

const section = (props: {
  claims: ClaimSummary[];
  loading?: boolean;
  role?: Role | null;
}) => (
  <NeedsAttentionSection
    claims={props.claims}
    loading={props.loading ?? false}
    role={props.role ?? null}
  />
);

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  document.documentElement.dir = "ltr";
  document.documentElement.lang = "en";
});

describe("NeedsAttentionSection", () => {
  it("says nothing is waiting when every claim is moving", () => {
    const { container } = renderInRouter(
      section({
        claims: [claim("IN_PROGRESS", "a"), claim("APPROVED", "b")],
      }),
    );

    expect(screen.getByText("No claims need your attention")).toBeTruthy();
    expect(screen.getByText("You're all caught up.")).toBeTruthy();
    expect(screen.queryAllByTestId("attention-row")).toHaveLength(0);
    expect(container.querySelector("#needs-attention")).toBeTruthy();
  });

  it("lists one row per blocked claim instead of a group summary", () => {
    renderInRouter(
      section({
        claims: [
          claim("NEW", "a"),
          claim("UNDER_REVIEW", "b"),
          claim("IN_PROGRESS", "c"),
        ],
      }),
    );

    const rows = screen.getAllByTestId("attention-row");
    expect(rows).toHaveLength(2);
    expect(within(rows[0]).getByText("CLM-A")).toBeTruthy();
    expect(within(rows[1]).getByText("CLM-B")).toBeTruthy();
    expect(screen.queryByText("CLM-C")).toBeNull();
    // Group vocabulary is gone — each row is a concrete claim.
    expect(screen.queryByText("Needs Assignment")).toBeNull();
  });

  it("shows who each claim is waiting on", () => {
    renderInRouter(
      section({
        claims: [
          claim("NEW", "fresh"),
          claim("PENDING_ACCEPTANCE", "offered"),
          claim("UNDER_REVIEW", "review"),
        ],
      }),
    );

    expect(screen.getByText("Waiting on claims officer")).toBeTruthy();
    expect(screen.getByText("Waiting on adjuster")).toBeTruthy();
    expect(screen.getByText("Waiting on administration")).toBeTruthy();
  });

  it("offers Assign Adjuster for a NEW claim when the role may assign", () => {
    renderInRouter(
      section({ claims: [claim("NEW", "a")], role: "CLAIMS_OFFICER" }),
    );

    expect(
      screen.getByRole("link", { name: "Assign Adjuster" }).getAttribute("href"),
    ).toBe("/map?claim=a");
    expect(
      screen.getByRole("link", { name: "View Claim" }).getAttribute("href"),
    ).toBe("/claims/a");
  });

  it("offers Start Review for a submitted report", () => {
    renderInRouter(
      section({ claims: [claim("SUBMITTED", "s")], role: "CLAIMS_OFFICER" }),
    );

    expect(
      screen.getByRole("link", { name: "Start Review" }).getAttribute("href"),
    ).toBe("/claims/s");
  });

  it("offers Make Decision only to an ADMIN", () => {
    const { unmount } = renderInRouter(
      section({ claims: [claim("UNDER_REVIEW", "u")], role: "ADMIN" }),
    );

    expect(
      screen.getByRole("link", { name: "Make Decision" }).getAttribute("href"),
    ).toBe("/claims/u");

    unmount();
    renderInRouter(
      section({ claims: [claim("UNDER_REVIEW", "u")], role: "CLAIMS_OFFICER" }),
    );

    expect(screen.queryByText("Make Decision")).toBeNull();
    expect(screen.getByRole("link", { name: "View Claim" })).toBeTruthy();
  });

  it("falls back to View Claim without a role", () => {
    renderInRouter(section({ claims: [claim("NEW", "a")], role: null }));

    expect(screen.queryByText("Assign Adjuster")).toBeNull();
    expect(
      screen.getByRole("link", { name: "View Claim" }).getAttribute("href"),
    ).toBe("/claims/a");
  });

  it("flags the overdue claim and orders it before fresh ones", () => {
    renderInRouter(
      section({
        claims: [
          claim("NEW", "fresh", 1),
          claim("NEW", "stale", 7),
          claim("NEW", "mid", 5),
        ],
      }),
    );

    const rows = screen.getAllByTestId("attention-row");
    expect(within(rows[0]).getByText("CLM-STALE")).toBeTruthy();
    expect(within(rows[1]).getByText("CLM-MID")).toBeTruthy();
    expect(within(rows[2]).getByText("CLM-FRESH")).toBeTruthy();

    expect(
      within(rows[0]).getByText("7 days old — staleness threshold reached"),
    ).toBeTruthy();
    expect(within(rows[2]).getByText("2 days to threshold")).toBeTruthy();
    expect(
      within(rows[2]).getByText("to staleness threshold (3 days)"),
    ).toBeTruthy();
  });

  it("caps the visible queue and offers the View all escape hatch", () => {
    renderInRouter(
      section({
        claims: Array.from({ length: 7 }, (_, index) =>
          claim("NEW", `n${index}`),
        ),
      }),
    );

    expect(screen.getAllByTestId("attention-row")).toHaveLength(6);
    const links = screen.getAllByRole("link", { name: "View all claims" });
    expect(links.length).toBeGreaterThan(0);
    expect(links[0].getAttribute("href")).toBe("/claims");
  });

  it("shows a loading line before any claim data arrives", () => {
    renderInRouter(section({ claims: [], loading: true }));

    expect(screen.getByText("Checking for blocked claims…")).toBeTruthy();
  });

  it("renders fully in Arabic with RTL", () => {
    window.localStorage.setItem("sawn.locale", "ar");

    renderInRouter(
      section({ claims: [claim("NEW", "stale", 7)], role: null }),
      { locale: "ar" },
    );

    expect(document.documentElement.dir).toBe("rtl");
    expect(screen.getByText("يحتاج انتباهك")).toBeTruthy();
    const row = screen.getAllByTestId("attention-row")[0];
    expect(within(row).getByText("جديدة")).toBeTruthy();
    expect(
      within(row).getByText("عمرها 7 أيام — تم بلوغ حد التقادم"),
    ).toBeTruthy();
    expect(within(row).getByText("بانتظار موظف المطالبات")).toBeTruthy();
    expect(screen.getByRole("link", { name: "عرض كل المطالبات" })).toBeTruthy();
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
