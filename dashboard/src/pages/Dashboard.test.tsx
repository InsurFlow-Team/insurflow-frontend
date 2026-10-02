// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { screen } from "@testing-library/dom";
import { MemoryRouter } from "react-router-dom";
import { setupUserEvent } from "../test/test-utils";

vi.setConfig({ testTimeout: 20000 });

vi.mock("../api/claims.service", () => ({
  getClaims: vi.fn(),
}));

vi.mock("../api/users.service", () => ({
  getFieldAdjusters: vi.fn(),
}));

import { getClaims } from "../api/claims.service";
import { getFieldAdjusters } from "../api/users.service";
import type { ClaimSummary, FieldAdjuster } from "../types";
import Dashboard from "./Dashboard";

const NOW = "2026-09-09T10:00:00.000Z";

function makeClaim(overs: Partial<ClaimSummary> & { claimNumber: string }): ClaimSummary {
  return {
    id: `id-${overs.claimNumber}`,
    status: "NEW",
    customerName: "Ahmed Ibrahim",
    initialPlateNumber: "ABC-1234",
    createdAt: NOW,
    ...overs,
    claimNumber: overs.claimNumber,
  } as ClaimSummary;
}

function makeAdjuster(overs: Partial<FieldAdjuster> = {}): FieldAdjuster {
  return {
    id: "fa-1",
    name: "Ahmed Adjuster",
    employeeCode: "FA-001",
    role: "FIELD_ADJUSTER",
    organizationId: "org-1",
    organizationName: "Demo Ins",
    status: "ACTIVE",
    activeTasksCount: 1,
    capacityLimit: 3,
    availability: "AVAILABLE",
    ...overs,
  } as FieldAdjuster;
}

const daysAgo = (days: number) =>
  new Date(Date.now() - days * 86_400_000).toISOString();

beforeEach(() => {
  vi.mocked(getClaims).mockReset();
  vi.mocked(getFieldAdjusters).mockReset();
  vi.mocked(getFieldAdjusters).mockResolvedValue([]);
});

afterEach(() => {
  cleanup();
});

async function renderPage() {
  return render(
    <MemoryRouter>
      <Dashboard />
    </MemoryRouter>,
  );
}

describe("Dashboard", () => {
  it("loads claims from GET /claims and renders real statistics and recent claims", async () => {
    vi.mocked(getClaims).mockResolvedValue([
      makeClaim({ claimNumber: "CLM-1", status: "NEW" }),
      makeClaim({ claimNumber: "CLM-2", status: "NEW" }),
      makeClaim({ claimNumber: "CLM-3", status: "ASSIGNED" }),
      makeClaim({ claimNumber: "CLM-4", status: "SUBMITTED" }),
      makeClaim({ claimNumber: "CLM-5", status: "CLOSED" }),
    ]);

    await renderPage();

    // Real totals derived from the API response — not mock/hardcoded numbers.
    expect(await screen.findByText("Total Claims")).toBeTruthy();
    expect(screen.getByText("5")).toBeTruthy();

    // Scoped to the stat cards: the recent-claims table also renders status
    // badges with these same words.
    for (const label of ["New", "Assigned", "Submitted", "Closed"]) {
      const card = screen
        .getAllByText(label)
        .find((element) => element.closest("article"));
      expect(card, `stat card "${label}"`).toBeTruthy();
    }

    // Recent claims come from the same real response.
    for (const claimNumber of ["CLM-1", "CLM-2", "CLM-3", "CLM-4", "CLM-5"]) {
      expect(screen.getByText(claimNumber)).toBeTruthy();
    }

    // Rows link to the real claim detail page.
    expect(
      screen.getByRole("link", { name: "CLM-3" }).getAttribute("href"),
    ).toBe("/claims/id-CLM-3");

    expect(getClaims).toHaveBeenCalledTimes(1);
  });

  it("never shows 0 as a real value while the request is pending (skeleton instead)", async () => {
    let resolveClaims!: (claims: ClaimSummary[]) => void;
    vi.mocked(getClaims).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveClaims = resolve;
        }),
    );

    await renderPage();

    // Loading stage: no stats cards rendered yet (skeleton only).
    expect(screen.queryByText("Total Claims")).toBeFalsy();

    resolveClaims([
      makeClaim({ claimNumber: "CLM-A", status: "SUBMITTED" }),
    ]);

    expect(await screen.findByText("Total Claims")).toBeTruthy();
    expect(screen.getByText("CLM-A")).toBeTruthy();
  });

  it("renders a Correction Required card fed by the real status count", async () => {
    vi.mocked(getClaims).mockResolvedValue([
      makeClaim({ claimNumber: "CLM-C1", status: "NEW" }),
      makeClaim({ claimNumber: "CLM-C2", status: "CORRECTION_REQUIRED" }),
      makeClaim({ claimNumber: "CLM-C3", status: "CORRECTION_REQUIRED" }),
    ]);

    await renderPage();

    expect(await screen.findByText("Total Claims")).toBeTruthy();
    const correctionCard = screen
      .getAllByText("Correction Required")
      .find((element) => element.closest("article"));
    expect(correctionCard).toBeTruthy();
    expect(correctionCard?.closest("article")?.textContent).toContain("2");
  });

  it("shows the backend error with a retry that refetches from the API", async () => {
    const serverError = Object.assign(
      new Error("Request failed with status code 500"),
      {
        isAxiosError: true,
        response: { status: 500, data: { message: "Backend unavailable" } },
      },
    );

    vi.mocked(getClaims)
      .mockRejectedValueOnce(serverError)
      .mockResolvedValueOnce([makeClaim({ claimNumber: "CLM-R", status: "NEW" })]);

    const user = setupUserEvent();
    await renderPage();

    expect(await screen.findByText(/Backend unavailable/)).toBeTruthy();

    await user.click(screen.getByRole("button", { name: "Try Again" }));

    expect(await screen.findByText("CLM-R")).toBeTruthy();
    expect(getClaims).toHaveBeenCalledTimes(2);
  });

  it("shows an empty state when the backend returns no claims", async () => {
    vi.mocked(getClaims).mockResolvedValue([]);

    await renderPage();

    expect(await screen.findByText("Total Claims")).toBeTruthy();
    expect(screen.getByText("No claims yet.")).toBeTruthy();
  });

  it("refreshes from the backend when the Refresh button is clicked", async () => {
    vi.mocked(getClaims)
      .mockResolvedValueOnce([makeClaim({ claimNumber: "CLM-1", status: "NEW" })])
      .mockResolvedValueOnce([
        makeClaim({ claimNumber: "CLM-1", status: "NEW" }),
        makeClaim({ claimNumber: "CLM-2", status: "SUBMITTED" }),
      ]);

    const user = setupUserEvent();
    await renderPage();

    expect(await screen.findByText("CLM-1")).toBeTruthy();
    expect(screen.queryByText("CLM-2")).toBeFalsy();

    await user.click(screen.getByRole("button", { name: "Refresh" }));

    expect(await screen.findByText("CLM-2")).toBeTruthy();
    expect(getClaims).toHaveBeenCalledTimes(2);
  });

  it("sorts recent claims newest-first and shows only the latest N", async () => {
    vi.mocked(getClaims).mockResolvedValue(
      Array.from({ length: 7 }, (_, index) =>
        makeClaim({
          claimNumber: `CLM-${index + 1}`,
          status: "NEW",
          createdAt: new Date(
            new Date(NOW).getTime() + index * 60_000,
          ).toISOString(),
        }),
      ),
    );

    await renderPage();

    await screen.findByText("Total Claims");

    // Only the latest 5 of the 7 claims appear in the recent table.
    expect(screen.getByText("CLM-7")).toBeTruthy();
    expect(screen.queryByText("CLM-1")).toBeFalsy();
  });

  it("surfaces the blocked claims in an attention queue with drill-down links", async () => {
    vi.mocked(getClaims).mockResolvedValue([
      makeClaim({ claimNumber: "CLM-N1", status: "NEW", createdAt: daysAgo(6) }),
      makeClaim({ claimNumber: "CLM-N2", status: "NEW", createdAt: daysAgo(1) }),
      makeClaim({
        claimNumber: "CLM-R1",
        status: "UNDER_REVIEW",
        createdAt: daysAgo(2),
      }),
      makeClaim({
        claimNumber: "CLM-IP",
        status: "IN_PROGRESS",
        createdAt: daysAgo(1),
      }),
    ]);

    await renderPage();

    // Only the statuses that block somebody appear.
    expect(await screen.findByText("Needs Assignment")).toBeTruthy();
    expect(screen.getByText("Awaiting Decision")).toBeTruthy();
    expect(screen.queryByText("Ready for Review")).toBeNull();
    expect(screen.queryByText("Awaiting Correction")).toBeNull();

    // Age comes from the oldest claim in the group, and drives the overdue flag.
    expect(screen.getByText(/oldest 6 days/)).toBeTruthy();
    expect(screen.getByText(/Overdue — waiting 6 days/)).toBeTruthy();

    // The group label drills into the matching /claims status filter.
    expect(
      screen.getByRole("link", { name: "Needs Assignment" }).getAttribute("href"),
    ).toBe("/claims?status=NEW");
  });

  it("confirms a clear queue instead of listing empty rows", async () => {
    vi.mocked(getClaims).mockResolvedValue([
      makeClaim({ claimNumber: "CLM-OK", status: "IN_PROGRESS" }),
      makeClaim({ claimNumber: "CLM-DONE", status: "CLOSED" }),
    ]);

    await renderPage();

    expect(
      await screen.findByText(/Nothing is waiting on anyone/),
    ).toBeTruthy();
  });

  it("compares waiting claims against real adjuster capacity", async () => {
    vi.mocked(getClaims).mockResolvedValue([
      makeClaim({ claimNumber: "CLM-W1", status: "NEW" }),
    ]);
    vi.mocked(getFieldAdjusters).mockResolvedValue([
      makeAdjuster({ id: "fa-1", activeTasksCount: 1, capacityLimit: 3 }),
      makeAdjuster({ id: "fa-2", activeTasksCount: 1, capacityLimit: 3 }),
    ]);

    await renderPage();

    expect(await screen.findByText(/spare inspection slots/)).toBeTruthy();
    expect(screen.getByText("2 adjusters")).toBeTruthy();
    expect(
      screen.getByText(/Capacity covers all 1 claim waiting/),
    ).toBeTruthy();
  });

  it("keeps the rest of the dashboard usable when the roster request fails", async () => {
    vi.mocked(getClaims).mockResolvedValue([
      makeClaim({ claimNumber: "CLM-K", status: "NEW" }),
    ]);
    vi.mocked(getFieldAdjusters).mockRejectedValue(
      new Error("Roster unavailable"),
    );

    await renderPage();

    expect(await screen.findByText("CLM-K")).toBeTruthy();
    expect(screen.getByText(/Adjuster capacity is unavailable/)).toBeTruthy();
    expect(screen.getByText("Needs Assignment")).toBeTruthy();
  });

  it("shows the assigned adjuster and the claim age in the recent table", async () => {
    vi.mocked(getClaims).mockResolvedValue([
      makeClaim({
        claimNumber: "CLM-AS",
        status: "IN_PROGRESS",
        createdAt: daysAgo(4),
        assignedTo: { id: "fa-1", name: "Ahmed Adjuster", employeeCode: null },
      }),
    ]);

    await renderPage();

    expect(await screen.findByText("Assigned To")).toBeTruthy();
    expect(screen.getByText("Ahmed Adjuster")).toBeTruthy();
    expect(screen.getByText("Age")).toBeTruthy();
    expect(screen.getByText("4 days")).toBeTruthy();
  });
});