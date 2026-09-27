// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

vi.mock("../api/users.service", () => ({
  getFieldAdjusterById: vi.fn(),
}));

vi.mock("../api/claims.service", () => ({
  getAdjusterWorkHistory: vi.fn(),
}));

import AdjusterDetails from "./AdjusterDetails";
import { getFieldAdjusterById } from "../api/users.service";
import { getAdjusterWorkHistory } from "../api/claims.service";
import type { AdjusterWorkHistory, FieldAdjuster } from "../types";

const mockedAdjuster = vi.mocked(getFieldAdjusterById);
const mockedHistory = vi.mocked(getAdjusterWorkHistory);

const ADJUSTER_ID = "adj-1";

const adjuster: FieldAdjuster = {
  id: ADJUSTER_ID,
  name: "Ahmed Adjuster",
  employeeCode: "FA-001",
  role: "FIELD_ADJUSTER",
  organizationId: "org-1",
  organizationName: "InsurFlow",
  status: "ACTIVE",
  availability: "AVAILABLE",
  activeTasksCount: 1,
  capacityLimit: 3,
};

const history: AdjusterWorkHistory = {
  entries: [
    {
      claimId: "clm-1",
      claimNumber: "CLM-DEMO-INS-0046",
      status: "CLOSED",
      customerName: "John Doe",
      plateNumber: "ABC-1234",
      inspectionCount: 2,
      evidenceCount: 1,
      completedAt: "2026-09-25T13:51:00.847Z",
      durationHours: 18,
    },
    {
      claimId: "clm-2",
      claimNumber: "CLM-DEMO-INS-0050",
      status: "APPROVED",
      customerName: "Sara Ahmed",
      plateNumber: "XYZ-9876",
      inspectionCount: 1,
      evidenceCount: 7,
      completedAt: "2026-09-20T09:00:00.000Z",
      durationHours: 6,
    },
  ],
  totalCompleted: 2,
  truncated: false,
};

function renderPage() {
  return render(
    <MemoryRouter initialEntries={[`/adjusters/${ADJUSTER_ID}`]}>
      <Routes>
        <Route path="/adjusters/:adjusterId" element={<AdjusterDetails />} />
        <Route path="/claims/:claimId" element={<div>claim details page</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("AdjusterDetails work history", () => {
  beforeEach(() => {
    mockedAdjuster.mockReset();
    mockedHistory.mockReset();
    mockedAdjuster.mockResolvedValue(adjuster);
    mockedHistory.mockResolvedValue(history);
  });

  afterEach(() => {
    cleanup();
  });

  it("asks the history for the adjuster currently in the route", async () => {
    renderPage();

    expect(await screen.findByText("Ahmed Adjuster")).toBeTruthy();
    expect(mockedHistory).toHaveBeenCalledWith(ADJUSTER_ID);
  });

  it("shows the completed count, inspection count and turnaround", async () => {
    renderPage();

    expect(await screen.findByText("Completed claims")).toBeTruthy();
    expect(screen.getByText("Total inspections")).toBeTruthy();
    expect(screen.getByText("Avg. turnaround")).toBeTruthy();
    expect(screen.getByText("Last completed")).toBeTruthy();

    // 2 completed claims, 3 inspections across them.
    const completedTile = screen
      .getByText("Completed claims")
      .closest("div")!.parentElement!;
    expect(completedTile.textContent).toContain("2");
    const inspectionTile = screen
      .getByText("Total inspections")
      .closest("div")!.parentElement!;
    expect(inspectionTile.textContent).toContain("3");
  });

  it("lists each completed claim with its outcome, inspections and completion time", async () => {
    renderPage();

    expect(await screen.findByText("CLM-DEMO-INS-0046")).toBeTruthy();
    expect(screen.getByText("CLM-DEMO-INS-0050")).toBeTruthy();
    expect(screen.getByText("Closed")).toBeTruthy();
    expect(screen.getByText("Approved")).toBeTruthy();
    expect(screen.getByText("18h")).toBeTruthy();
    expect(screen.getByText("6h")).toBeTruthy();
  });

  it("links every history row to its claim details page", async () => {
    renderPage();

    const link = await screen.findByRole("link", {
      name: "CLM-DEMO-INS-0046",
    });
    expect(link.getAttribute("href")).toBe("/claims/clm-1");
  });

  it("says so plainly when the adjuster has no completed claims", async () => {
    mockedHistory.mockResolvedValue({
      entries: [],
      totalCompleted: 0,
      truncated: false,
    });

    renderPage();

    expect(
      await screen.findByText("This adjuster has no completed claims yet."),
    ).toBeTruthy();
  });

  it("discloses that only the most recent completed claims are listed", async () => {
    mockedHistory.mockResolvedValue({ ...history, totalCompleted: 30, truncated: true });

    renderPage();

    expect(await screen.findByText(/Showing the 2 most recent/)).toBeTruthy();
  });

  it("keeps the profile usable when the history request fails", async () => {
    mockedHistory.mockRejectedValue(new Error("History unavailable"));

    renderPage();

    expect(await screen.findByText("Ahmed Adjuster")).toBeTruthy();
    expect(screen.getByRole("alert")).toBeTruthy();
    expect(screen.queryByText("Completed claims")).toBeNull();
  });
});
