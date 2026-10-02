// Notification Center.
//
// Verified live against the backend (2026-09-27) for ADMIN (AD-001) and
// CLAIMS_OFFICER (CO-001):
//   GET   /notifications/unread-count -> { success, message, data: { count } }
//   GET   /notifications              -> { success, message, data: AppNotification[] }
//                                        headers: X-Total-Count, X-Page, X-Total-Pages
//   PATCH /notifications/:id/read     -> { success, message, data: AppNotification }
//
// Two deviations from the handoff document, both verified:
//   1. The mark-as-read response returns the WHOLE notification, not just
//      `{ _id, readAt }`.
//   2. `unreadOnly` defaults to false, so an unfiltered GET returns read items
//      too. Callers must send `unreadOnly: true` explicitly.
// A missing token is a 401.

/**
 * Types the backend documents. Only these four occur in the live data
 * (NEW_CLAIM, INSPECTION_COMPLETED, ASSIGNMENT_DECLINED, ASSIGNED); the rest
 * are declared but not yet emitted. `AppNotification.type` stays a plain
 * `string` so a new backend type renders as a neutral item instead of a
 * component crash.
 */
export type NotificationType =
  | "NEW_CLAIM"
  | "ASSIGNMENT_DECLINED"
  | "INSPECTION_COMPLETED"
  | "PENDING_ACCEPTANCE"
  | "ASSIGNED"
  | "CORRECTION_REQUIRED"
  | "APPROVED"
  | "REJECTED";

/** The populated claim reference the backend sends inside `relatedClaimId`. */
export interface NotificationClaimRef {
  id: string;
  claimNumber: string;
}

export interface AppNotification {
  /** Normalised from the backend's `_id`. */
  id: string;
  /** Raw `type`, unvalidated on purpose - see `NOTIFICATION_TYPES`. */
  type: string;
  relatedClaim: NotificationClaimRef | null;
  title: string;
  body: string;
  /** `null` means unread. */
  readAt: string | null;
  createdAt: string;
}

export interface NotificationPage {
  items: AppNotification[];
  total: number;
  page: number;
  totalPages: number;
}
