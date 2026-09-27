// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, within, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";

const api = vi.hoisted(() => ({
  getUnreadNotificationCount: vi.fn(),
  getNotifications: vi.fn(),
  markNotificationRead: vi.fn(),
}));

vi.mock("../../api/notifications", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../api/notifications")>();
  return { ...actual, ...api };
});

import NotificationBell from "./NotificationBell";
import { notificationPresentation } from "./notificationPresentation";
import type { AppNotification } from "../../types";

const RECENT = new Date(Date.now() - 5 * 60_000).toISOString();

function notification(overrides: Partial<AppNotification> = {}): AppNotification {
  return {
    id: "n-1",
    type: "NEW_CLAIM",
    relatedClaim: { id: "clm-1", claimNumber: "CLM-DEMO-INS-0054" },
    title: "New Claim Created",
    body: "New claim CLM-DEMO-INS-0054 has been created.",
    readAt: null,
    createdAt: RECENT,
    ...overrides,
  };
}

function page(items: AppNotification[], total = items.length) {
  return { items, total, page: 1, totalPages: 1 };
}

function LocationProbe() {
  const location = useLocation();
  return <p data-testid="pathname">{location.pathname}</p>;
}

function renderBell() {
  return render(
    <MemoryRouter initialEntries={["/dashboard"]}>
      <NotificationBell />
      <LocationProbe />
      <Routes>
        <Route path="/claims/:claimId" element={<p>claim detail</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

async function openPanel(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: /Notifications/ }));
  await screen.findByRole("dialog", { name: "Notifications" });
}

beforeEach(() => {
  vi.clearAllMocks();
  api.getUnreadNotificationCount.mockResolvedValue(0);
  api.getNotifications.mockResolvedValue(page([]));
  api.markNotificationRead.mockResolvedValue(
    notification({ readAt: new Date().toISOString() }),
  );
});

// This project does not enable vitest `globals`, so Testing Library cannot
// auto-clean between tests and a stale bell would match the same queries.
afterEach(() => {
  cleanup();
});

describe("the bell", () => {
  it("shows no badge when there is nothing unread", async () => {
    renderBell();

    await waitFor(() => expect(api.getUnreadNotificationCount).toHaveBeenCalled());
    expect(
      screen.getByRole("button", { name: "Notifications" }),
    ).toBeTruthy();
    expect(screen.queryByText("9+")).toBeNull();
  });

  it("shows the unread count on the badge and the label", async () => {
    api.getUnreadNotificationCount.mockResolvedValue(3);
    renderBell();

    expect(
      await screen.findByRole("button", { name: "Notifications, 3 unread" }),
    ).toBeTruthy();
    expect(screen.getByText("3")).toBeTruthy();
  });

  it("caps a large count at 9+", async () => {
    api.getUnreadNotificationCount.mockResolvedValue(42);
    renderBell();

    await screen.findByRole("button", { name: /42 unread/ });
    expect(screen.getByText("9+")).toBeTruthy();
  });

  it("does not request the list until the panel is opened", async () => {
    renderBell();
    await waitFor(() => expect(api.getUnreadNotificationCount).toHaveBeenCalled());
    expect(api.getNotifications).not.toHaveBeenCalled();
  });
});

describe("the dropdown", () => {
  it("renders a row per notification with its claim number and relative time", async () => {
    const user = userEvent.setup();
    api.getNotifications.mockResolvedValue(
      page([notification()], 1),
    );
    renderBell();

    await openPanel(user);

    const panel = screen.getByRole("dialog", { name: "Notifications" });
    expect(within(panel).getByText("New Claim Created")).toBeTruthy();
    expect(
      within(panel).getByText("New claim CLM-DEMO-INS-0054 has been created."),
    ).toBeTruthy();
    // The claim number also appears in the body, so assert the footer chip.
    expect(within(panel).getByText(/· CLM-DEMO-INS-0054/)).toBeTruthy();
    expect(within(panel).getByText("5m ago")).toBeTruthy();
  });

  it("marks an unread row with a dot and a read row without one", async () => {
    const user = userEvent.setup();
    api.getNotifications.mockResolvedValue(
      page([
        notification(),
        notification({
          id: "n-2",
          title: "Inspection Completed",
          readAt: "2026-09-26T09:00:00.000Z",
        }),
      ]),
    );
    renderBell();

    await openPanel(user);

    const panel = screen.getByRole("dialog", { name: "Notifications" });
    expect(within(panel).getAllByLabelText("Unread")).toHaveLength(1);
  });

  it("marks the row read and navigates to the related claim", async () => {
    const user = userEvent.setup();
    api.getUnreadNotificationCount.mockResolvedValue(1);
    api.getNotifications.mockResolvedValue(page([notification()], 1));
    renderBell();

    await openPanel(user);
    await user.click(screen.getByText("New Claim Created"));

    expect(api.markNotificationRead).toHaveBeenCalledWith("n-1");
    await waitFor(() =>
      expect(screen.getByTestId("pathname").textContent).toBe("/claims/clm-1"),
    );
    expect(screen.queryByRole("dialog", { name: "Notifications" })).toBeNull();
  });

  it("still marks the row read when there is no claim to navigate to", async () => {
    const user = userEvent.setup();
    api.getNotifications.mockResolvedValue(
      page([notification({ relatedClaim: null })], 1),
    );
    renderBell();

    await openPanel(user);
    await user.click(screen.getByText("New Claim Created"));

    expect(api.markNotificationRead).toHaveBeenCalledWith("n-1");
    expect(screen.getByTestId("pathname").textContent).toBe("/dashboard");
  });

  it("renders an unknown notification type instead of crashing", async () => {
    const user = userEvent.setup();
    api.getNotifications.mockResolvedValue(
      page([notification({ type: "SOME_FUTURE_TYPE" })], 1),
    );
    renderBell();

    await openPanel(user);

    expect(screen.getByText("New Claim Created")).toBeTruthy();
    expect(notificationPresentation("SOME_FUTURE_TYPE").tone).toBe("neutral");
  });

  it("shows an empty state", async () => {
    const user = userEvent.setup();
    renderBell();

    await openPanel(user);

    expect(screen.getByText("No notifications yet")).toBeTruthy();
  });

  it("states how many older notifications exist instead of linking nowhere", async () => {
    const user = userEvent.setup();
    api.getNotifications.mockResolvedValue(page([notification()], 14));
    renderBell();

    await openPanel(user);

    expect(screen.getByText("13 older notifications")).toBeTruthy();
    expect(screen.queryByRole("link")).toBeNull();
  });

  it("closes on Escape", async () => {
    const user = userEvent.setup();
    api.getNotifications.mockResolvedValue(page([notification()], 1));
    renderBell();

    await openPanel(user);
    await user.keyboard("{Escape}");

    await waitFor(() =>
      expect(screen.queryByRole("dialog", { name: "Notifications" })).toBeNull(),
    );
  });

  it("closes when clicking outside", async () => {
    const user = userEvent.setup();
    api.getNotifications.mockResolvedValue(page([notification()], 1));
    renderBell();

    await openPanel(user);
    await user.click(screen.getByTestId("pathname"));

    await waitFor(() =>
      expect(screen.queryByRole("dialog", { name: "Notifications" })).toBeNull(),
    );
  });

  it("surfaces a load failure with a retry that refetches", async () => {
    const user = userEvent.setup();
    // Axios-shaped, because `getApiErrorMessage` only surfaces the server's
    // message for a real API error; a bare Error would be flattened.
    api.getNotifications.mockRejectedValueOnce({
      isAxiosError: true,
      response: { status: 500, data: { success: false, message: "boom" } },
    });
    renderBell();

    await openPanel(user);

    expect(await screen.findByText("boom")).toBeTruthy();

    api.getNotifications.mockResolvedValue(page([notification()], 1));
    await user.click(screen.getByRole("button", { name: "Try again" }));

    expect(await screen.findByText("New Claim Created")).toBeTruthy();
  });
});

describe("notificationPresentation", () => {
  it("gives every documented type a real icon and a known tone", () => {
    for (const type of [
      "NEW_CLAIM",
      "ASSIGNMENT_DECLINED",
      "INSPECTION_COMPLETED",
      "PENDING_ACCEPTANCE",
      "ASSIGNED",
      "CORRECTION_REQUIRED",
      "APPROVED",
      "REJECTED",
    ]) {
      const presentation = notificationPresentation(type);
      expect(presentation.icon).toBeTruthy();
      expect(presentation.tone).not.toBe("neutral");
    }
  });

  it("falls back to a neutral presentation for an unknown type", () => {
    expect(notificationPresentation("WAT").tone).toBe("neutral");
  });
});
