import apiClient from "./client";
import type { ApiResponse } from "./client";
import type {
  AppNotification,
  NotificationClaimRef,
  NotificationPage,
} from "../types";

/**
 * The backend has no "mark all as read" endpoint, and the handoff document
 * describes none, so the UI never offers one.
 */
export const NOTIFICATIONS_PAGE_SIZE = 10;

function toClaimRef(value: unknown): NotificationClaimRef | null {
  // Observed live: a populated `{ _id, claimNumber }`, or null. A bare id
  // string is also accepted, so an unpopulated ref degrades to a link rather
  // than losing the claim entirely.
  if (typeof value === "string" && value) {
    return { id: value, claimNumber: "" };
  }

  if (!value || typeof value !== "object") return null;

  const source = value as Record<string, unknown>;
  const id =
    typeof source._id === "string"
      ? source._id
      : typeof source.id === "string"
        ? source.id
        : "";

  if (!id) return null;

  return {
    id,
    claimNumber:
      typeof source.claimNumber === "string" ? source.claimNumber : "",
  };
}

/**
 * Defensive on purpose: a notification must never be able to crash the
 * header. Anything unrecognised falls back to an untyped, unlinked, unread
 * item rather than throwing.
 */
export function toAppNotification(record: unknown): AppNotification | null {
  if (!record || typeof record !== "object") return null;

  const source = record as Record<string, unknown>;

  const id =
    typeof source._id === "string"
      ? source._id
      : typeof source.id === "string"
        ? source.id
        : "";

  // Without an id we cannot mark it read, so the item is unusable.
  if (!id) return null;

  const createdAt =
    typeof source.createdAt === "string" &&
    !Number.isNaN(new Date(source.createdAt).getTime())
      ? source.createdAt
      : new Date(0).toISOString();

  return {
    id,
    type: typeof source.type === "string" ? source.type : "",
    relatedClaim: toClaimRef(source.relatedClaimId),
    title: typeof source.title === "string" ? source.title : "",
    body: typeof source.body === "string" ? source.body : "",
    readAt:
      typeof source.readAt === "string" &&
      !Number.isNaN(new Date(source.readAt).getTime())
        ? source.readAt
        : null,
    createdAt,
  };
}

function headerNumber(value: unknown, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? Math.trunc(parsed) : fallback;
}

export async function getUnreadNotificationCount(): Promise<number> {
  const response =
    await apiClient.get<ApiResponse<{ count: number }>>("/notifications/unread-count");

  return headerNumber(response.data?.data?.count, 0);
}

export interface GetNotificationsParams {
  page?: number;
  limit?: number;
  /**
   * Must be sent explicitly. The backend defaults this to false, which would
   * return read items too.
   */
  unreadOnly?: boolean;
}

export async function getNotifications({
  page = 1,
  limit = NOTIFICATIONS_PAGE_SIZE,
  unreadOnly = false,
}: GetNotificationsParams = {}): Promise<NotificationPage> {
  const response = await apiClient.get<ApiResponse<unknown[]>>("/notifications", {
    params: { page, limit, unreadOnly },
  });

  const items = (response.data?.data ?? [])
    .map(toAppNotification)
    .filter((item): item is AppNotification => item !== null);

  const headers = response.headers as Record<string, unknown> | undefined;

  return {
    items,
    total: headerNumber(headers?.["x-total-count"], items.length),
    page: headerNumber(headers?.["x-page"], page),
    totalPages: headerNumber(headers?.["x-total-pages"], 1),
  };
}

/**
 * The backend returns the whole notification object here, not the
 * `{ _id, readAt }` the handoff document described.
 */
export async function markNotificationRead(id: string): Promise<AppNotification | null> {
  const response = await apiClient.patch<ApiResponse<unknown>>(
    `/notifications/${id}/read`,
    {},
  );

  return toAppNotification(response.data?.data);
}

/**
 * The backend has no "mark all as read" endpoint, so this marks all provided
 * notifications as read sequentially. Used by the "Clear All" button.
 */
export async function markMultipleNotificationsRead(
  ids: string[],
): Promise<{ succeeded: string[]; failed: string[] }> {
  const succeeded: string[] = [];
  const failed: string[] = [];

  for (const id of ids) {
    try {
      await markNotificationRead(id);
      succeeded.push(id);
    } catch {
      failed.push(id);
    }
  }

  return { succeeded, failed };
}
