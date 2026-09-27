import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("./client", () => ({
  default: {
    get: vi.fn(),
    patch: vi.fn(),
  },
}));

import apiClient from "./client";
import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationRead,
  toAppNotification,
} from "./notifications";

const mockedGet = vi.mocked(apiClient.get);
const mockedPatch = vi.mocked(apiClient.patch);

/** A record shaped exactly like the live AD-001 response. */
function backendNotification(overrides: Record<string, unknown> = {}) {
  return {
    _id: "6ab76a2dfe08268d7464b609",
    recipientId: "6ab558c8a170b120d93a5f94",
    organizationId: "6a919f45e62778a597174333",
    type: "NEW_CLAIM",
    relatedClaimId: {
      _id: "6ab76a2dfe08268d7464b608",
      claimNumber: "CLM-DEMO-INS-0054",
    },
    title: "New Claim Created",
    body: "New claim CLM-DEMO-INS-0054 has been created.",
    readAt: null,
    createdAt: "2026-09-26T06:46:05.946Z",
    __v: 0,
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("toAppNotification", () => {
  it("normalises _id to id and keeps the populated claim ref", () => {
    const result = toAppNotification(backendNotification());

    expect(result).toEqual({
      id: "6ab76a2dfe08268d7464b609",
      type: "NEW_CLAIM",
      relatedClaim: {
        id: "6ab76a2dfe08268d7464b608",
        claimNumber: "CLM-DEMO-INS-0054",
      },
      title: "New Claim Created",
      body: "New claim CLM-DEMO-INS-0054 has been created.",
      readAt: null,
      createdAt: "2026-09-26T06:46:05.946Z",
    });
  });

  it("drops a record with no id, because it cannot be marked read", () => {
    expect(toAppNotification({ type: "NEW_CLAIM" })).toBeNull();
    expect(toAppNotification(null)).toBeNull();
    expect(toAppNotification("nonsense")).toBeNull();
  });

  it("keeps an unrecognised type instead of rejecting it", () => {
    expect(toAppNotification(backendNotification({ type: "SOMETHING_NEW" }))?.type).toBe(
      "SOMETHING_NEW",
    );
  });

  it("tolerates a null relatedClaimId", () => {
    expect(toAppNotification(backendNotification({ relatedClaimId: null }))?.relatedClaim).toBeNull();
  });

  it("accepts a bare string relatedClaimId", () => {
    const result = toAppNotification(backendNotification({ relatedClaimId: "clm-9" }));
    expect(result?.relatedClaim).toEqual({ id: "clm-9", claimNumber: "" });
  });

  it("treats an invalid readAt as unread rather than crashing", () => {
    expect(toAppNotification(backendNotification({ readAt: "not-a-date" }))?.readAt).toBeNull();
  });
});

describe("getUnreadNotificationCount", () => {
  it("returns the count from data.count", async () => {
    mockedGet.mockResolvedValue({
      data: { success: true, message: "ok", data: { count: 13 } },
    });

    await expect(getUnreadNotificationCount()).resolves.toBe(13);
    expect(mockedGet).toHaveBeenCalledWith("/notifications/unread-count");
  });

  it("falls back to 0 for a missing or nonsensical count", async () => {
    mockedGet.mockResolvedValue({ data: { success: true, message: "ok" } });
    await expect(getUnreadNotificationCount()).resolves.toBe(0);

    mockedGet.mockResolvedValue({
      data: { success: true, message: "ok", data: { count: "many" } },
    });
    await expect(getUnreadNotificationCount()).resolves.toBe(0);
  });
});

describe("getNotifications", () => {
  it("reads pagination from the X- headers", async () => {
    mockedGet.mockResolvedValue({
      data: { success: true, message: "ok", data: [backendNotification()] },
      headers: {
        "x-total-count": "14",
        "x-page": "2",
        "x-total-pages": "2",
      },
    });

    const page = await getNotifications({ page: 2, limit: 10, unreadOnly: true });

    expect(page.total).toBe(14);
    expect(page.page).toBe(2);
    expect(page.totalPages).toBe(2);
    expect(page.items).toHaveLength(1);
  });

  it("sends unreadOnly explicitly, because the backend defaults it to false", async () => {
    mockedGet.mockResolvedValue({
      data: { success: true, message: "ok", data: [] },
      headers: {},
    });

    await getNotifications();

    expect(mockedGet).toHaveBeenCalledWith("/notifications", {
      params: { page: 1, limit: 10, unreadOnly: false },
    });
  });

  it("falls back to sane pagination numbers when headers are absent", async () => {
    mockedGet.mockResolvedValue({
      data: { success: true, message: "ok", data: [backendNotification()] },
    });

    const page = await getNotifications();

    expect(page.total).toBe(1);
    expect(page.page).toBe(1);
    expect(page.totalPages).toBe(1);
  });

  it("skips unusable records but still counts them in the header total", async () => {
    mockedGet.mockResolvedValue({
      data: {
        success: true,
        message: "ok",
        data: [backendNotification(), { type: "NEW_CLAIM" }, null],
      },
      headers: { "x-total-count": "14" },
    });

    const page = await getNotifications();

    expect(page.items).toHaveLength(1);
    expect(page.total).toBe(14);
  });
});

describe("markNotificationRead", () => {
  it("PATCHes the read endpoint with an empty body and returns the whole record", async () => {
    mockedPatch.mockResolvedValue({
      data: {
        success: true,
        message: "Notification marked as read",
        data: backendNotification({ readAt: "2026-09-24T12:15:30.000Z" }),
      },
    });

    const result = await markNotificationRead("6ab76a2dfe08268d7464b609");

    expect(mockedPatch).toHaveBeenCalledWith(
      "/notifications/6ab76a2dfe08268d7464b609/read",
      {},
    );
    // The backend returns the full object, not the { _id, readAt } the
    // handoff document described.
    expect(result?.readAt).toBe("2026-09-24T12:15:30.000Z");
    expect(result?.title).toBe("New Claim Created");
  });
});
