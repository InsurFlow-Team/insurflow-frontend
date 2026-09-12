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

import { getClaims } from "../api/claims.service";
import type { ClaimSummary } from "../types";
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

beforeEach(() => {
  vi.mocked(getClaims).mockReset();
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
    expect(screen.getByText("New Claims")).toBeTruthy();
    expect(screen.getByText("Assigned Claims")).toBeTruthy();
    expect(screen.getByText("Submitted Claims")).toBeTruthy();
    expect(screen.getByText("Closed Claims")).toBeTruthy();

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
});