// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { screen, within } from "@testing-library/dom";
import { MemoryRouter } from "react-router-dom";
import { setupUserEvent } from "../test/test-utils";

vi.setConfig({ testTimeout: 20000 });

vi.mock("../api/claims.service", () => ({
  getClaims: vi.fn(),
}));

vi.mock("../api/users.service", () => ({
  getFieldAdjusters: vi.fn(),
}));

vi.mock("../contexts/AuthContext", () => ({
  useAuth: () => ({
    user: { name: "Sara", role: "CLAIMS_OFFICER" },
    token: "t",
    isAuthenticated: true,
    saveSession: vi.fn(),
    logout: vi.fn(),
  }),
}));

import { getClaims } from "../api/claims.service";
import { getFieldAdjusters } from "../api/users.service";
import type { ClaimSummary, FieldAdjuster } from "../types";
import I18nProvider from "../i18n/I18nProvider";
import Dashboard from "./Dashboard";

const NOW = "2026-09-09T10:00:00.000Z";

// Fresh by default so age-based SLA math treats fixtures as "created today".
// Tests that need age pass createdAt explicitly.
function makeClaim(overs: Partial<ClaimSummary> & { claimNumber: string }): ClaimSummary {
  return {
    id: `id-${overs.claimNumber}`,
    status: "NEW",
    customerName: "Ahmed Ibrahim",
    initialPlateNumber: "ABC-1234",
    createdAt: new Date().toISOString(),
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
  window.localStorage.clear();
  document.documentElement.dir = "ltr";
  document.documentElement.lang = "en";
});

async function renderPage(options: { arabic?: boolean } = {}) {
  const ui = (
    <MemoryRouter>
      {options.arabic ? (
        <I18nProvider>
          <Dashboard />
        </I18nProvider>
      ) : (
        <Dashboard />
      )}
    </MemoryRouter>
  );
  return render(ui);
}

/** The action-metric card that carries `label`, as its clickable wrapper. */
function metricCard(label: string): HTMLElement {
  const card = screen.getByText(label).closest("a");
  expect(card, `metric card "${label}"`).toBeTruthy();
  return card as HTMLElement;
}

describe("Dashboard", () => {
  it("loads claims from GET /claims and renders action metrics and recent claims", async () => {
    vi.mocked(getClaims).mockResolvedValue([
      makeClaim({ claimNumber: "CLM-1", status: "NEW" }),
      makeClaim({ claimNumber: "CLM-2", status: "NEW" }),
      makeClaim({ claimNumber: "CLM-3", status: "ASSIGNED" }),
      makeClaim({ claimNumber: "CLM-4", status: "SUBMITTED" }),
      makeClaim({ claimNumber: "CLM-5", status: "CLOSED" }),
    ]);

    await renderPage();

    // Personalised header for the signed-in operator.
    expect(
      await screen.findByText(/(Good morning|Good afternoon|Good evening), Sara/),
    ).toBeTruthy();
    expect(screen.getByText("Here's what needs your attention today.")).toBeTruthy();

    // Real totals derived from the API response — never mock/hardcoded numbers.
    expect(await screen.findByText("Needs Action")).toBeTruthy();
    expect(metricCard("Needs Action").textContent).toContain("3");
    expect(metricCard("Waiting for Assignment").textContent).toContain("2");
    expect(metricCard("Waiting for Acceptance").textContent).toContain("0");
    expect(metricCard("Reports Ready for Review").textContent).toContain("1");
    expect(metricCard("Ready for Decision").textContent).toContain("0");
    expect(metricCard("Stale (3+ days old)").textContent).toContain("0");

    // Each metric is a doorway into the matching filtered operational view.
    expect(metricCard("Needs Action").getAttribute("href")).toBe(
      "#needs-attention",
    );
    expect(metricCard("Waiting for Assignment").getAttribute("href")).toBe(
      "/claims?status=NEW",
    );
    expect(metricCard("Reports Ready for Review").getAttribute("href")).toBe(
      "/claims?status=SUBMITTED",
    );

    // Recent claims come from the same real response.
    for (const claimNumber of ["CLM-1", "CLM-2", "CLM-3", "CLM-4", "CLM-5"]) {
      expect(screen.getAllByText(claimNumber).length).toBeGreaterThan(0);
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

    // Loading stage: no metric cards rendered yet (skeleton only).
    expect(screen.queryByText("Needs Action")).toBeFalsy();

    resolveClaims([
      makeClaim({ claimNumber: "CLM-A", status: "SUBMITTED" }),
    ]);

    expect(await screen.findByText("Needs Action")).toBeTruthy();
    expect(screen.getAllByText("CLM-A").length).toBeGreaterThan(0);
  });

  it("counts correction-required claims into Needs Action", async () => {
    vi.mocked(getClaims).mockResolvedValue([
      makeClaim({ claimNumber: "CLM-C1", status: "NEW" }),
      makeClaim({ claimNumber: "CLM-C2", status: "CORRECTION_REQUIRED" }),
      makeClaim({ claimNumber: "CLM-C3", status: "CORRECTION_REQUIRED" }),
    ]);

    await renderPage();

    expect(await screen.findByText("Needs Action")).toBeTruthy();
    expect(metricCard("Needs Action").textContent).toContain("3");
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

    expect((await screen.findAllByText("CLM-R")).length).toBeGreaterThan(0);
    expect(getClaims).toHaveBeenCalledTimes(2);
  });

  it("shows an empty state when the backend returns no claims", async () => {
    vi.mocked(getClaims).mockResolvedValue([]);

    await renderPage();

    expect(await screen.findByText("Needs Action")).toBeTruthy();
    expect(metricCard("Needs Action").textContent).toContain("0");
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

    expect((await screen.findAllByText("CLM-1")).length).toBeGreaterThan(0);
    expect(screen.queryByText("CLM-2")).toBeFalsy();

    await user.click(screen.getByRole("button", { name: "Refresh" }));

    expect((await screen.findAllByText("CLM-2")).length).toBeGreaterThan(0);
    expect(getClaims).toHaveBeenCalledTimes(2);
  });

  it("sorts recent claims newest-first and shows only the latest N", async () => {
    vi.mocked(getClaims).mockResolvedValue(
      Array.from({ length: 7 }, (_, index) =>
        makeClaim({
          claimNumber: `CLM-${index + 1}`,
          status: "ASSIGNED",
          createdAt: new Date(
            new Date(NOW).getTime() + index * 60_000,
          ).toISOString(),
        }),
      ),
    );

    await renderPage();

    await screen.findByText("Needs Action");

    // Only the latest 5 of the 7 claims appear in the recent table.
    expect(screen.getByText("CLM-7")).toBeTruthy();
    expect(screen.queryByText("CLM-1")).toBeFalsy();
  });

  it("surfaces blocked claims as actionable per-claim rows with drill-down links", async () => {
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

    const firstRow = (await screen.findAllByTestId("attention-row"))[0];
    const queue = firstRow.closest("#needs-attention") as HTMLElement;
    expect(queue).toBeTruthy();

    // One row per blocked claim, overdue/oldest first.
    const rows = within(queue).getAllByTestId("attention-row");
    expect(rows).toHaveLength(3);
    expect(within(rows[0]).getByText("CLM-N1")).toBeTruthy();
    expect(
      within(rows[0])
        .getByRole("link", { name: "CLM-N1" })
        .getAttribute("href"),
    ).toBe("/claims/id-CLM-N1");
    expect(within(rows[1]).getByText("CLM-R1")).toBeTruthy();
    expect(within(rows[2]).getByText("CLM-N2")).toBeTruthy();

    // Honest SLA text derived from the real 3-day threshold.
    expect(
      within(rows[0]).getByText(
        "6 days old — staleness threshold reached",
      ),
    ).toBeTruthy();
    expect(within(rows[1]).getByText("1 day to threshold")).toBeTruthy();
    expect(within(rows[2]).getByText("2 days to threshold")).toBeTruthy();

    // Who is blocking each claim.
    expect(
      within(queue).getAllByText("Waiting on claims officer").length,
    ).toBe(2);
    expect(within(queue).getByText("Waiting on administration")).toBeTruthy();

    // CO cannot make the final decision — no decision button is offered.
    expect(within(queue).queryByText("Make Decision")).toBeNull();

    // The metric above drills into the matching status filter.
    expect(metricCard("Waiting for Assignment").getAttribute("href")).toBe(
      "/claims?status=NEW",
    );
  });

  it("confirms a clear queue instead of listing rows", async () => {
    vi.mocked(getClaims).mockResolvedValue([
      makeClaim({ claimNumber: "CLM-OK", status: "IN_PROGRESS" }),
      makeClaim({ claimNumber: "CLM-DONE", status: "CLOSED" }),
    ]);

    await renderPage();

    expect(
      await screen.findByText("No claims need your attention"),
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

    expect((await screen.findAllByText("CLM-K")).length).toBeGreaterThan(0);
    expect(screen.getByText(/Adjuster capacity is unavailable/)).toBeTruthy();
    expect(screen.getByText("Needs Your Attention")).toBeTruthy();
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

  it("renders the whole overview in Arabic with RTL", async () => {
    window.localStorage.setItem("sawn.locale", "ar");
    vi.mocked(getClaims).mockResolvedValue([
      makeClaim({ claimNumber: "CLM-AR", status: "NEW", createdAt: daysAgo(7) }),
    ]);

    await renderPage({ arabic: true });

    expect(await screen.findByText("يحتاج انتباهك")).toBeTruthy();
    expect(document.documentElement.dir).toBe("rtl");
    expect(
      screen.getByText(/(صباح الخير|طاب يومك|مساء الخير)، Sara/),
    ).toBeTruthy();
    expect(screen.getByText("هذه أشياء تحتاج انتباهك اليوم.")).toBeTruthy();
    expect(screen.getByText("المطالبات الأخيرة")).toBeTruthy();
    expect(screen.getByText("طاقة المعاينين")).toBeTruthy();
    expect(metricCard("تحتاج إجراء").textContent).toContain("1");
    expect(metricCard("تحتاج إجراء").getAttribute("href")).toBe(
      "#needs-attention",
    );
  });
});
