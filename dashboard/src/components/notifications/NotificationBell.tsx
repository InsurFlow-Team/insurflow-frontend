import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Inbox } from "lucide-react";
import { useNotifications } from "../../hooks/useNotifications";
import { notificationPresentation } from "./notificationPresentation";
import { toneClass } from "../../utils/toneStyles";
import {
  formatAbsoluteTime,
  formatRelativeTime,
} from "../../utils/relativeTime";
import type { AppNotification } from "../../types";

interface NotificationRowProps {
  notification: AppNotification;
  onOpen: (id: string) => void;
  /** Attached to the first row so focus lands inside the panel on open. */
  buttonRef?: React.Ref<HTMLButtonElement>;
}

function NotificationRow({ notification, onOpen, buttonRef }: NotificationRowProps) {
  const { icon: Icon, tone } = notificationPresentation(notification.type);
  const unread = notification.readAt === null;
  const claimNumber = notification.relatedClaim?.claimNumber;

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={() => onOpen(notification.id)}
      className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-background ${
        unread ? "bg-info-bg/50" : "bg-surface"
      }`}
    >
      <span
        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
          toneClass(tone, "bg")
        }`}
      >
        <Icon size={16} className={toneClass(tone, "text")} />
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span
            className={`truncate text-sm ${
              unread ? "font-semibold text-text" : "font-medium text-text-soft"
            }`}
          >
            {notification.title || "Notification"}
          </span>
          {unread && (
            <span
              aria-label="Unread"
              className="h-2 w-2 shrink-0 rounded-full bg-info"
            />
          )}
        </span>

        {notification.body && (
          <span className="mt-0.5 block truncate text-xs text-text-muted">
            {notification.body}
          </span>
        )}

        <span className="mt-1 flex items-center gap-2 text-xs text-text-subtle">
          <time
            dateTime={notification.createdAt}
            title={formatAbsoluteTime(notification.createdAt)}
          >
            {formatRelativeTime(notification.createdAt)}
          </time>
          {claimNumber && <span>&middot; {claimNumber}</span>}
        </span>
      </span>
    </button>
  );
}

export default function NotificationBell() {
  const { count, items, total, loadingList, clearingAll, error, open, setOpen, markRead, clearAll, refresh } =
    useNotifications();
  const containerRef = useRef<HTMLDivElement>(null);
  const firstItemRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();

  // Close on outside click and on Escape.
  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, setOpen]);

  // Move focus into the panel so keyboard users are not stranded behind it.
  useEffect(() => {
    if (open && !loadingList && items.length > 0) {
      firstItemRef.current?.focus();
    }
  }, [open, loadingList, items.length]);

  function handleOpen(id: string) {
    const target = items.find((item) => item.id === id);

    markRead(id);
    setOpen(false);

    // Every documented type links to its claim. A notification without one is
    // still marked read, but there is nowhere to navigate to.
    if (target?.relatedClaim?.id) {
      navigate(`/claims/${target.relatedClaim.id}`);
    }
  }

  const hasMore = total > items.length;
  const hasUnread = items.some((item) => item.readAt === null);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-label={count > 0 ? `Notifications, ${count} unread` : "Notifications"}
        aria-expanded={open}
        aria-haspopup="dialog"
        className="relative p-2 text-text-muted hover:text-text hover:bg-background rounded-lg transition-colors"
      >
        <Bell size={19} />
        {count > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Notifications"
          className="absolute right-0 z-50 mt-2 w-[360px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-border bg-surface shadow-lg"
        >
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h2 className="text-sm font-semibold text-text">Notifications</h2>
            <div className="flex items-center gap-2">
              {hasUnread && (
                <button
                  type="button"
                  onClick={clearAll}
                  disabled={clearingAll}
                  className="text-xs font-medium text-danger hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Mark all as read"
                >
                  {clearingAll ? "Clearing..." : "Clear All"}
                </button>
              )}
              <button
                type="button"
                onClick={refresh}
                className="text-xs font-medium text-info hover:underline"
              >
                Refresh
              </button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loadingList && (
              <p className="px-4 py-8 text-center text-sm text-text-muted">
                Loading notifications&hellip;
              </p>
            )}

            {/* An error only replaces the list when there is nothing to show:
                a failed badge poll must not blank rows that already loaded. */}
            {!loadingList && items.length === 0 && error && (
              <div className="px-4 py-6 text-center">
                <p className="text-sm text-danger-text">{error}</p>
                <button
                  type="button"
                  onClick={refresh}
                  className="mt-2 text-xs font-medium text-info hover:underline"
                >
                  Try again
                </button>
              </div>
            )}

            {!loadingList && !error && items.length === 0 && (
              <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
                <Inbox size={24} className="text-text-subtle" />
                <p className="text-sm text-text-muted">No notifications yet</p>
              </div>
            )}

            {items.map((notification, index) => (
              <div
                key={notification.id}
                className="border-b border-border last:border-b-0"
              >
                <NotificationRow
                  notification={notification}
                  onOpen={handleOpen}
                  buttonRef={index === 0 ? firstItemRef : undefined}
                />
              </div>
            ))}
          </div>

          {/* The backend exposes no full notifications page, so this is a
              plain statement of fact rather than a link to a dead route. */}
          {hasMore && (
            <p className="border-t border-border bg-surface-soft px-4 py-2 text-center text-xs text-text-muted">
              {total - items.length} older notification{total - items.length === 1 ? "" : "s"}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
