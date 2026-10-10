import {
  useCallback,
  useEffect,
  useId,
  useRef,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";
import { X } from "lucide-react";

// ─── Shared focus-trap helpers ────────────────────────────────────────────────

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), ' +
  'input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

function getFocusables(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE));
}

// Module-level counter: several overlays can be stacked. Body scroll is locked
// only while the first opens and restored only when the last closes.
let openOverlayCount = 0;

function lockScroll() {
  openOverlayCount += 1;
  if (openOverlayCount === 1) {
    document.body.style.overflow = "hidden";
  }
}

function unlockScroll() {
  openOverlayCount -= 1;
  if (openOverlayCount === 0) {
    document.body.style.overflow = "";
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type ModalSize = "sm" | "md" | "lg" | "xl";
export type DrawerSide = "end" | "start";

interface OverlaySharedProps {
  isOpen: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  /**
   * Optional footer rendered in a sticky bar at the bottom of the panel.
   * Ideal for action buttons (Cancel / Confirm) — they stay visible even
   * when the body scrolls.
   */
  footer?: ReactNode;
  /** Screen-reader label for the close button */
  closeLabel?: string;
}

export interface ModalProps extends OverlaySharedProps {
  size?: ModalSize;
}

export interface DrawerProps extends OverlaySharedProps {
  size?: ModalSize;
  /** Which edge the drawer slides in from (default: "end" = right / left in RTL) */
  side?: DrawerSide;
}

// ─── Size maps ────────────────────────────────────────────────────────────────

const MODAL_SIZE: Record<ModalSize, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

const DRAWER_SIZE: Record<ModalSize, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-xl",
  xl: "max-w-2xl",
};

// ─── Shared hook: accessibility plumbing ─────────────────────────────────────

function useOverlayA11y(
  isOpen: boolean,
  onClose: () => void,
  panelRef: React.RefObject<HTMLDivElement | null>,
) {
  const previouslyFocused = useRef<HTMLElement | null>(null);

  // Escape key
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  // Focus management + scroll lock
  useEffect(() => {
    if (!isOpen) return;
    lockScroll();
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;
    if (panel) {
      const first = getFocusables(panel)[0];
      (first ?? panel).focus();
    }
    return () => {
      unlockScroll();
      previouslyFocused.current?.focus();
    };
  }, [isOpen, panelRef]);

  // Tab trap
  const handleKeyDown = useCallback(
    (e: ReactKeyboardEvent) => {
      if (e.key !== "Tab") return;
      const panel = panelRef.current;
      if (!panel) return;
      const focusables = getFocusables(panel);
      if (focusables.length === 0) { e.preventDefault(); return; }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      } else if (!panel.contains(document.activeElement)) {
        e.preventDefault(); first.focus();
      }
    },
    [panelRef],
  );

  return { handleKeyDown };
}

// ─── Shared header ────────────────────────────────────────────────────────────

function PanelHeader({
  titleId,
  title,
  onClose,
  closeLabel = "Close",
}: {
  titleId: string;
  title: ReactNode;
  onClose: () => void;
  closeLabel?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 px-6 py-4 border-b border-border shrink-0">
      <h2 id={titleId} className="text-base font-semibold text-text">
        {title}
      </h2>
      <button
        type="button"
        onClick={onClose}
        aria-label={closeLabel}
        className={[
          "p-1.5 rounded-lg text-text-muted transition-colors",
          "hover:text-text hover:bg-background",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
        ].join(" ")}
      >
        <X size={17} aria-hidden="true" />
      </button>
    </div>
  );
}

// ─── Shared footer ────────────────────────────────────────────────────────────

function PanelFooter({ children }: { children: ReactNode }) {
  return (
    <div className="px-6 py-4 border-t border-border bg-surface shrink-0">
      {children}
    </div>
  );
}

// ─── Backdrop ─────────────────────────────────────────────────────────────────

function Backdrop({ onClick }: { onClick: () => void }) {
  return (
    <div
      className="absolute inset-0 bg-black/40"
      onClick={onClick}
      aria-hidden="true"
    />
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

/**
 * Modal
 *
 * Centred dialog for focused, in-context actions.
 * Use for: Assign Adjuster, Reject Claim, Confirm Decision, Add Claim.
 *
 * - Traps focus within the panel
 * - Escape closes
 * - Backdrop click closes
 * - Restores focus to the opener on close
 * - Stacks correctly with ConfirmDialog (scroll lock counts refs)
 * - Optional `footer` slot: sticky action bar (Cancel / Confirm)
 *
 * Sizes: sm (360px) · md (448px) · lg (672px) · xl (896px)
 */
export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = "md",
  closeLabel = "Close",
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const { handleKeyDown } = useOverlayA11y(isOpen, onClose, panelRef);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <Backdrop onClick={onClose} />

      <div
        ref={panelRef}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        className={[
          "relative z-10 flex flex-col w-full bg-surface rounded-2xl border border-border shadow-xl",
          "max-h-[calc(100dvh-2rem)]",
          "focus:outline-none",
          MODAL_SIZE[size],
        ].join(" ")}
      >
        <PanelHeader
          titleId={titleId}
          title={title}
          onClose={onClose}
          closeLabel={closeLabel}
        />

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {children}
        </div>

        {footer && <PanelFooter>{footer}</PanelFooter>}
      </div>
    </div>
  );
}

// ─── Drawer ───────────────────────────────────────────────────────────────────

/**
 * Drawer
 *
 * Side-anchored panel for contextual work that does not require full-page
 * navigation. Slides in from the logical end (right in LTR, left in RTL)
 * by default; use `side="start"` for the opposite edge.
 *
 * Use for: Claim summary sidebar, filter panels, detail peek.
 * Same accessibility contract as Modal.
 *
 * Sizes: sm (360px) · md (480px) · lg (560px) · xl (672px)
 */
export function Drawer({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = "md",
  side = "end",
  closeLabel = "Close",
}: DrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const { handleKeyDown } = useOverlayA11y(isOpen, onClose, panelRef);

  if (!isOpen) return null;

  const slideFrom =
    side === "end"
      ? "inset-y-0 end-0"
      : "inset-y-0 start-0";

  return (
    <div
      className="fixed inset-0 z-50 flex"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <Backdrop onClick={onClose} />

      <div
        ref={panelRef}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        className={[
          "fixed flex flex-col bg-surface border-s border-border shadow-xl",
          "h-full w-full focus:outline-none",
          slideFrom,
          DRAWER_SIZE[size],
        ].join(" ")}
      >
        <PanelHeader
          titleId={titleId}
          title={title}
          onClose={onClose}
          closeLabel={closeLabel}
        />

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {children}
        </div>

        {footer && <PanelFooter>{footer}</PanelFooter>}
      </div>
    </div>
  );
}
