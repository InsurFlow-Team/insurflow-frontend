import { useCallback, useEffect, useRef, useState } from "react";
import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationRead,
  markMultipleNotificationsRead,
  NOTIFICATIONS_PAGE_SIZE,
} from "../api/notifications";
import { getApiErrorMessage } from "../api/client";
import type { AppNotification } from "../types";

/** Matches the 30-60s window the backend doc suggests. */
export const NOTIFICATION_POLL_MS = 60_000;

interface UseNotificationsResult {
  count: number;
  items: AppNotification[];
  /** Total notifications on the server, which exceeds `items` at limit 10. */
  total: number;
  /** True only for the first load of the list, which happens on first open. */
  loadingList: boolean;
  /** True while clearing all notifications. */
  clearingAll: boolean;
  error: string;
  open: boolean;
  setOpen: (next: boolean) => void;
  markRead: (id: string) => void;
  clearAll: () => void;
  refresh: () => void;
}

/**
 * Drives the header notification bell.
 *
 * The badge count and the list are fetched separately on purpose: the count is
 * cheap and polled, while the list is only requested once the user actually
 * opens the dropdown, so a normal page view costs one small request.
 *
 * `markRead` is optimistic. The row and the badge update immediately and the
 * PATCH follows in the background; if it fails both are rolled back and the
 * error is surfaced, because a silently un-marked row would reappear unread on
 * the next poll with no explanation.
 */
export function useNotifications(): UseNotificationsResult {
  const [count, setCount] = useState(0);
  const [items, setItems] = useState<AppNotification[]>([]);
  const [total, setTotal] = useState(0);
  const [loadingList, setLoadingList] = useState(false);
  const [clearingAll, setClearingAll] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);

  const listLoaded = useRef(false);
  const listInFlight = useRef(false);
  const countInFlight = useRef(false);
  const pendingIds = useRef(new Set<string>());

  const loadCount = useCallback(async () => {
    if (countInFlight.current) return;

    countInFlight.current = true;
    try {
      setCount(await getUnreadNotificationCount());
    } catch (requestError) {
      // A failed poll must not empty the badge the user is looking at.
      setError(getApiErrorMessage(requestError));
    } finally {
      countInFlight.current = false;
    }
  }, []);

  const loadList = useCallback(async () => {
    if (listInFlight.current) return;

    listInFlight.current = true;
    setLoadingList(true);
    setError("");

    try {
      const page = await getNotifications({
        limit: NOTIFICATIONS_PAGE_SIZE,
        page: 1,
        // Explicit: the backend defaults this to false.
        unreadOnly: false,
      });
      setItems(page.items);
      setTotal(page.total);
      listLoaded.current = true;
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      listInFlight.current = false;
      setLoadingList(false);
    }
  }, []);

  // Initial badge load, then a slow poll while the header is mounted.
  useEffect(() => {
    void loadCount();

    const timer = window.setInterval(() => {
      void loadCount();
    }, NOTIFICATION_POLL_MS);

    return () => window.clearInterval(timer);
  }, [loadCount]);

  // The list is lazy: fetched the first time the dropdown opens.
  useEffect(() => {
    if (open && !listLoaded.current) {
      void loadList();
    }
  }, [open, loadList]);

  const markRead = useCallback(
    (id: string) => {
      // Read from the closure, not from inside a state updater: an updater may
      // be deferred or replayed, so it is not a safe place to capture state.
      const target = items.find((item) => item.id === id);
      if (!target || target.readAt !== null) return;

      // A double click, or a click that lands while the PATCH is in flight,
      // must not decrement the badge twice.
      if (pendingIds.current.has(id)) return;
      pendingIds.current.add(id);

      const stampedAt = new Date().toISOString();

      setItems((current) =>
        current.map((item) => (item.id === id ? { ...item, readAt: stampedAt } : item)),
      );
      setCount((current) => (current > 0 ? current - 1 : 0));

      void (async () => {
        try {
          await markNotificationRead(id);
        } catch (requestError) {
          // Roll the row and the badge back together, or the two would disagree.
          setItems((current) =>
            current.map((item) => (item.id === id ? target : item)),
          );
          setCount((current) => current + 1);
          setError(getApiErrorMessage(requestError));
        } finally {
          pendingIds.current.delete(id);
        }
      })();
    },
    [items],
  );

  const refresh = useCallback(() => {
    void loadCount();
    if (open) void loadList();
  }, [loadCount, loadList, open]);

  const clearAll = useCallback(() => {
    const unreadItems = items.filter((item) => item.readAt === null);
    
    if (unreadItems.length === 0) return;

    const unreadIds = unreadItems.map((item) => item.id);
    const stampedAt = new Date().toISOString();

    // Optimistically mark all as read
    setItems((current) =>
      current.map((item) =>
        unreadIds.includes(item.id) ? { ...item, readAt: stampedAt } : item,
      ),
    );
    setCount(0);
    setClearingAll(true);

    void (async () => {
      try {
        const result = await markMultipleNotificationsRead(unreadIds);

        // If any failed, roll them back
        if (result.failed.length > 0) {
          setItems((current) =>
            current.map((item) => {
              if (result.failed.includes(item.id)) {
                const original = unreadItems.find((u) => u.id === item.id);
                return original ?? item;
              }
              return item;
            }),
          );
          setCount(result.failed.length);
          setError(`Failed to mark ${result.failed.length} notification(s) as read.`);
        }
      } catch (requestError) {
        // Roll back all on total failure
        setItems((current) =>
          current.map((item) => {
            const original = unreadItems.find((u) => u.id === item.id);
            return original ?? item;
          }),
        );
        setCount(unreadItems.length);
        setError(getApiErrorMessage(requestError));
      } finally {
        setClearingAll(false);
      }
    })();
  }, [items]);

  return { count, items, total, loadingList, clearingAll, error, open, setOpen, markRead, clearAll, refresh };
}
