/**
 * SAWN Design System — public API
 *
 * Import everything from this barrel instead of individual files:
 *
 *   import { Button, StatusBadge, SlaIndicator } from "@/components/ui";
 *
 * Every export here is stable. Internal helpers (e.g. toneStyles, statusStyles)
 * live in src/utils/ and are not re-exported — they are implementation detail.
 *
 * ─── Groups ──────────────────────────────────────────────────────────────────
 *
 *  ACTIONS      Button · IconButton
 *  STATUS       StatusBadge · RoleBadge · SlaIndicator
 *  FEEDBACK     AlertCard · SuccessBanner · LoadingState · EmptyState · ErrorState
 *  CARDS        StatCard · StatCardSkeleton · SummaryCard
 *  DATA         DataTable · Pagination
 *  FORMS        FormField · Input · Select · Textarea · InlineError
 *  OVERLAYS     Modal · Drawer · ConfirmDialog
 *  LAYOUT       (nothing exported here — layout lives in src/layouts/)
 */

// ─── Actions ──────────────────────────────────────────────────────────────────

export { default as Button } from "./Button";
export type { ButtonProps, ButtonVariant, ButtonSize } from "./Button";

export { IconButton } from "./Button";
export type { } from "./Button"; // IconButton props are inferred at call-site

// ─── Status ───────────────────────────────────────────────────────────────────

export { default as StatusBadge } from "./StatusBadge";

export { default as RoleBadge } from "./RoleBadge";

export { default as SlaIndicator } from "./SlaIndicator";
export {
  deriveState as deriveSlaState,
  formatDuration as formatSlaDuration,
  minutesUntilDeadline,
} from "./SlaIndicator";
export type { SlaIndicatorProps, SlaState } from "./SlaIndicator";

// ─── Feedback ─────────────────────────────────────────────────────────────────

export { default as AlertCard } from "./AlertCard";
export type { AlertCardProps, AlertVariant } from "./AlertCard";

export { default as SuccessBanner } from "./SuccessBanner";

export { default as LoadingState } from "./LoadingState";

export { default as EmptyState } from "./EmptyState";

export { default as ErrorState } from "./ErrorState";

// ─── Cards ────────────────────────────────────────────────────────────────────

export { default as StatCard, StatCardSkeleton, SummaryCard } from "./StatCard";
export type { StatCardProps, StatCardTrend } from "./StatCard";

// ─── Data ─────────────────────────────────────────────────────────────────────

export { default as DataTable } from "./DataTable";
export type { DataTableProps, Column } from "./DataTable";

export { default as Pagination } from "./Pagination";

// ─── Forms ────────────────────────────────────────────────────────────────────

export { default as FormField } from "./FormField";
export type { FormFieldProps } from "./FormField";

export { default as Input } from "./Input";
export type { InputProps } from "./Input";

export { default as Select } from "./Select";
export type { SelectProps, SelectOption } from "./Select";

export { default as Textarea } from "./Textarea";
export type { TextareaProps } from "./Textarea";

export { default as InlineError } from "./InlineError";

// ─── Overlays ─────────────────────────────────────────────────────────────────

export { default as Modal } from "./Modal";
export { Drawer } from "./Modal";
export type { ModalProps, DrawerProps, ModalSize, DrawerSide } from "./Modal";

export { default as ConfirmDialog } from "./ConfirmDialog";

// ─── Toaster (notification system) ───────────────────────────────────────────

export { default as Toaster } from "./Toaster";
