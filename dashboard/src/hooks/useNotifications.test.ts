// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";

const api = vi.hoisted(() => ({
  getUnreadNotificationCount: vi.fn(),
  getNotifications: vi.fn(),
  markNotificationRead: vi.fn(),
}));

vi.mock("../api/notifications", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../api/notifications")>();
  return { ...actual, ...api };
});

import { NOTIFICATION_POLL_MS, useNotifications } from "./useNotifications";
import type { AppNotification } from "../types";

function notification(overrides: Partial<AppNotification> = {}): AppNotification {
  return {
    id: "n-1",
    type: "NEW_CLAIM",
    relatedClaim: { id: "clm-1", claimNumber: "CLM-DEMO-INS-0054" },
    title: "New Claim Created",
    body: "New claim has been created.",
    readAt: null,
    createdAt: "2026-09-26T06:46:05.000Z",
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  api.getUnreadNotificationCount.mockResolvedValue(2);
  api.getNotifications.mockResolvedValue({
    items: [notification()],
    total: 1,
    page: 1,
    totalPages: 1,
  });
  api.markNotificationRead.mockResolvedValue(
    notification({ readAt: "2026-09-27T10:00:00.000Z" }),
  );
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useNotifications", () => {
  it("loads the badge count on mount", async () => {
    const { result } = renderHook(() => useNotifications());

    await waitFor(() => expect(result.current.count).toBe(2));
    expect(api.getUnreadNotificationCount).toHaveBeenCalledTimes(1);
  });

  it("does not fetch the list until the dropdown is opened", async () => {
    const { result } = renderHook(() => useNotifications());

    await waitFor(() => expect(result.current.count).toBe(2));
    expect(api.getNotifications).not.toHaveBeenCalled();

    act(() => result.current.setOpen(true));

    await waitFor(() => expect(result.current.items).toHaveLength(1));
    expect(api.getNotifications).toHaveBeenCalledWith({
      limit: 10,
      page: 1,
      unreadOnly: false,
    });
  });

  it("fetches the list only once across repeated opens", async () => {
    const { result } = renderHook(() => useNotifications());

    await waitFor(() => expect(result.current.count).toBe(2));

    act(() => result.current.setOpen(true));
    await waitFor(() => expect(result.current.items).toHaveLength(1));

    act(() => result.current.setOpen(false));
    act(() => result.current.setOpen(true));

    expect(api.getNotifications).toHaveBeenCalledTimes(1);
  });

  it("polls the count on the expected interval and stops on unmount", async () => {
    vi.useFakeTimers();
    api.getUnreadNotificationCount.mockResolvedValue(1);

    const { unmount } = renderHook(() => useNotifications());

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(api.getUnreadNotificationCount).toHaveBeenCalledTimes(1);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(NOTIFICATION_POLL_MS);
    });
    expect(api.getUnreadNotificationCount).toHaveBeenCalledTimes(2);

    unmount();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(NOTIFICATION_POLL_MS * 2);
    });
    expect(api.getUnreadNotificationCount).toHaveBeenCalledTimes(2);
  });

  it("optimistically marks read: badge and row update before the PATCH settles", async () => {
    let resolvePatch: (value: unknown) => void = () => {};
    api.markNotificationRead.mockImplementation(
      () => new Promise((resolve) => { resolvePatch = resolve; }),
    );

    const { result } = renderHook(() => useNotifications());
    await waitFor(() => expect(result.current.count).toBe(2));

    act(() => result.current.setOpen(true));
    await waitFor(() => expect(result.current.items).toHaveLength(1));

    act(() => result.current.markRead("n-1"));

    expect(result.current.count).toBe(1);
    expect(result.current.items[0].readAt).not.toBeNull();

    await act(async () => {
      resolvePatch(notification());
    });
  });

  it("rolls the row and the badge back when the PATCH fails", async () => {
    api.markNotificationRead.mockRejectedValue(new Error("network down"));

    const { result } = renderHook(() => useNotifications());
    await waitFor(() => expect(result.current.count).toBe(2));

    act(() => result.current.setOpen(true));
    await waitFor(() => expect(result.current.items).toHaveLength(1));

    act(() => result.current.markRead("n-1"));

    await waitFor(() =>
      expect(result.current.items[0].readAt).toBeNull(),
    );
    expect(result.current.count).toBe(2);
    expect(result.current.error).toBeTruthy();
  });

  it("ignores a second click on a row that is already being marked", async () => {
    let resolvePatch: (value: unknown) => void = () => {};
    api.markNotificationRead.mockImplementation(
      () => new Promise((resolve) => { resolvePatch = resolve; }),
    );

    const { result } = renderHook(() => useNotifications());
    await waitFor(() => expect(result.current.count).toBe(2));

    act(() => result.current.setOpen(true));
    await waitFor(() => expect(result.current.items).toHaveLength(1));

    act(() => {
      result.current.markRead("n-1");
      result.current.markRead("n-1");
    });

    expect(result.current.count).toBe(1);
    expect(api.markNotificationRead).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolvePatch(notification());
    });
  });

  it("does not decrement below zero when a row is marked read twice across renders", async () => {
    api.getNotifications.mockResolvedValue({
      items: [notification(), notification({ id: "n-2" })],
      total: 2,
      page: 1,
      totalPages: 1,
    });

    const { result } = renderHook(() => useNotifications());
    await waitFor(() => expect(result.current.count).toBe(2));

    act(() => result.current.setOpen(true));
    await waitFor(() => expect(result.current.items).toHaveLength(2));

    act(() => {
      result.current.markRead("n-1");
      result.current.markRead("n-2");
    });

    await waitFor(() => expect(result.current.count).toBe(0));

    act(() => result.current.markRead("n-1"));

    expect(result.current.count).toBe(0);
  });

  it("keeps the last known badge when a poll fails", async () => {
    api.getUnreadNotificationCount
      .mockResolvedValueOnce(5)
      .mockRejectedValue(new Error("offline"));

    const { result, rerender } = renderHook(() => useNotifications());
    await waitFor(() => expect(result.current.count).toBe(5));

    act(() => {
      result.current.refresh();
    });

    await waitFor(() => expect(result.current.error).toBeTruthy());
    expect(result.current.count).toBe(5);
    rerender();
  });
});
